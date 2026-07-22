# TEAR V2.5 — Architecture Review

**Data:** 2026-07-21
**Autor:** Auditoria de arquitetura (read-only, sem alteração de comportamento)
**Branch auditada:** `feat/ui-design-system-ela` (working tree limpo, sincronizado com `origin`)
**Escopo:** `tear-v2-app/` (Laravel 13 + Sanctum + Spatie Permission / React 19 +
TypeScript + Vite) — o sistema em preparação para produção (admin + Portal da
Influenciadora). O Portal legado GAS (`src/`) e o domínio soberano
(`CONTRATO_SOBERANO.md`) não fazem parte deste escopo: `tear-v2-app` é um
domínio próprio (Marca/Campanha/Participação), sem termos do Contrato
Soberano e sem relação de código com `src/`.

Metodologia: leitura completa de todos os Controllers (10), Policies (4),
Services (3), Models (10), FormRequests (17), Resources (9), migrations (19),
`routes/api.php`, `AppServiceProvider`, seeders, e amostragem da estrutura do
frontend. Nenhum arquivo de código foi alterado. Este documento não repete o
inventário de segurança/infra já coberto por
`docs/HANDOFF_FINAL.md` e `TEAR_V2.5_GO_LIVE_CHECKLIST.md` (auditorias
recentes, 2026-07-21, com veredito "apto para go-live com ressalvas") —
referencia esses achados quando relevante à arquitetura, sem duplicá-los.

---

# Resumo executivo

A arquitetura de `tear-v2-app` é um Laravel convencional bem aplicado:
Controller fino → FormRequest (validação) → Model (Eloquent) → Resource
(serialização), com Policies para autorização por dono de recurso e um
`Gate::before` central que dá acesso total ao papel `ADMIN`. Não há
Repository, Domain layer ou Service layer pesada — e isso é adequado ao porte
atual do sistema (10 Models, 10 Controllers), não uma lacuna.

O ponto mais relevante encontrado é uma **regra de negócio duplicada em
quatro lugares** (visibilidade de uma Influenciadora restrita à sua própria
Parceira/Participação), implementada como filtro de query ad hoc dentro de
cada Controller de listagem, em vez de centralizada em um único ponto (scope
de Model ou Policy). Hoje os quatro pontos estão consistentes entre si, mas
não há nada que force isso a continuar assim se um quinto endpoint de listagem
for adicionado. Achado ALTO, mas não bloqueante: não é um bug hoje, é uma
condição para um bug futuro de vazamento de dados entre Influenciadoras.

Um segundo achado estrutural: o padrão adotado para transições de estado
(método dedicado no Model — `Parceira::aprovar()`, `Material::aprovar()`/
`reprovar()`) foi estabelecido conscientemente (comentários no código
confirmam a intenção: "único ponto de escrita de status") mas não foi seguido
para `Pagamento`, cuja transição de status vive inline em
`PagamentoController::update()`. Inconsistência de camada, não bug.

Fora esses dois pontos, o sistema está coeso, sem código morto localizado, com
as 19 migrations todas revertíveis, testes cobrindo os fluxos principais, e
nomenclatura em português consistente com o domínio (RN-03, ESPECIFICACAO_FUNCIONAL
§6, citadas literalmente nos comentários de Policy). O sistema está em
condição estrutural saudável para Go-Live; as recomendações abaixo são
melhorias localizadas, não uma reescrita.

---

# Pontos fortes

1. **Separação de camadas consistente e homogênea.** Todo Controller segue o
   mesmo formato: `authorize()` → FormRequest injetado (regra de validação) →
   chamada de Model/relação → Resource de retorno. Nenhum Controller lido
   contém query SQL crua, lógica de View, ou acesso a `$_SERVER`/globals.

2. **Autorização com uma única fonte de bypass.**
   `AppServiceProvider::boot()` define `Gate::before` dando acesso irrestrito
   a `ADMIN`; toda Policy (`CampanhaPolicy`, `MarcaPolicy`, `ParceiraPolicy`,
   `ParticipacaoNaCampanhaPolicy`) só precisa tratar o caso não-ADMIN. Isso
   evita a duplicação clássica de "if role == ADMIN return true" espalhada
   por Policy — há um único lugar que concede o superpoder do papel
   administrativo.

3. **Transições de estado protegidas contra mass-assignment onde o padrão foi
   seguido.** `Parceira` e `Material` deixam `status`/`user_id`/campos de
   aprovação fora do `#[Fillable]` e expõem métodos dedicados (`aprovar()`,
   `reprovar()`, `vincularUsuario()`) como único caminho de escrita — com
   comentário explícito no código documentando a intenção ("único ponto de
   escrita de status"). Isso é uma prática de proteção de invariante bem
   aplicada, não trivial em Eloquent.

4. **`FormRequest::authorize()` sempre `true`, autorização real via Policy no
   Controller.** As 17 FormRequests amostradas (`StoreParceiraRequest`,
   `UpdateCampanhaRequest`, etc.) delegam autorização inteiramente a
   `$this->authorize()` no Controller — não há duas fontes de verdade sobre
   "quem pode fazer isso" competindo entre FormRequest e Controller.

5. **Degradação deliberada de integrações externas documentada em código.**
   `CepLookupService::buscar()` nunca lança exceção — falha vira `null` e é
   logada como warning, comentário explícito citando a razão ("falha de
   integração externa não pode impedir salvar o cadastro"). `GoogleDriveService`
   tem `isConfigured()` verificado antes de qualquer chamada, com falha
   fechada (503, sem fallback silencioso) em vez de aberta.

6. **Nenhum código morto ou resíduo de debug encontrado.** Varredura por
   `TODO`/`FIXME`/`dd(`/`dump(`/`var_dump` em `app/` não retornou nenhuma
   ocorrência. As 19 migrations têm `down()` implementado (confirmado por
   varredura, nenhuma sem reversão).

7. **Design tokens do frontend já alinhados ao ADR vigente.**
   `frontend/src/index.css` usa `#CD0005`/`radius: 0` conforme
   `ADR-002-frontend-foundation.md` ("Absolute Flatness") — a dívida
   registrada no `TASK_ROUTER.md` §7 é sobre `docs/design/DESIGN_SYSTEM.md`
   estar desatualizado como *documento*, não sobre a implementação real
   divergir do ADR. Vale nota porque poderia ser lido como um problema de
   código; não é.

---

# Pontos fracos

## 1. Regra de visibilidade por dono duplicada em quatro Controllers (sem Policy como fonte única)

A regra "uma Influenciadora só enxerga o que é seu" é reimplementada como
filtro de query ad hoc em quatro pontos distintos, todos com a mesma forma
(`when(!$user->hasRole('ADMIN'), fn ($q) => $q->where(...)))`):

- `ParceiraController::index` — filtra por `user_id`
- `CampanhaController::index` — filtra por `participacoes.parceira_id` + `status ATIVA`
- `CampanhaController::show` — mesma condição, reaplicada ao eager-load de `participacoes`
- `ParticipacaoController::index` — filtra por `parceira_id`

Ao mesmo tempo, **a mesma regra de negócio já existe, escrita de forma
independente, em `CampanhaPolicy::view()`** (comentário: "a influenciadora só
vê campanhas onde sua própria participação está ATIVA") — mas essa Policy só
é chamada em `CampanhaController::show`, não em `index` (que usa
`authorize('viewAny', ...)`, que sempre retorna `true`, e resolve a
restrição real via o filtro de query citado acima, não via Policy).

Ou seja: para listagens (`index`), a autorização "por linha" não passa pela
Policy — é reimplementada manualmente, quatro vezes, com a mesma forma.
Hoje as quatro implementações são consistentes entre si e corretas. O risco é
estrutural: nada impede um quinto endpoint de listagem ser adicionado sem essa
cláusula (esquecimento humano, não erro de lógica), o que vazaria dados de uma
Influenciadora para outra — motivo pelo qual este achado é classificado ALTO
apesar de não haver bug hoje.

## 2. Transição de estado do Pagamento não segue o padrão estabelecido pelo próprio código

`Parceira::aprovar()` e `Material::aprovar()`/`reprovar()` encapsulam
transição de estado como método de domínio no Model, com o campo `status`
fora do `#[Fillable]`. `Pagamento`, ao contrário, mantém `status` **dentro**
do `#[Fillable]` (`Pagamento.php`) e sua transição de estado — incluindo a
regra de negócio "não aprova se há Material não aprovado" — vive inline em
`PagamentoController::update()` (com um método privado
`existeMaterialNaoAprovado()` no próprio Controller).

Isso não é um bug — o comportamento resultante está correto e testado — mas é
uma inconsistência de camada: o mesmo tipo de decisão (transição de estado +
regra de invariante) tem dois lugares diferentes dependendo de qual Model é
tocado, o que é confuso para quem for adicionar uma nova transição no futuro
e não tiver contexto de qual dos dois padrões seguir. Reforçado pelo achado
P2 já registrado em `HANDOFF_FINAL.md` ("`Pagamento::$fillable` inclui
`status` sem necessidade") — mesma causa raiz vista por ângulo diferente.

## 3. Papel `GESTOR_MARCA` modelado sem nenhuma regra de autorização real

`RoleSeeder` cria o papel `GESTOR_MARCA` como estrutural; `DevUserSeeder`
atribui esse papel a um usuário de desenvolvimento; o frontend
(`AppShell`, conforme já registrado em `HANDOFF_FINAL.md`) roteia qualquer
papel diferente de `INFLUENCIADORA` para a área administrativa completa. Mas
nenhuma Policy do backend distingue `GESTOR_MARCA` de "autenticado sem
ADMIN" — na prática esse papel hoje se comporta como um usuário sem nenhum
acesso de leitura a Marca/Campanha (bloqueado pelo mesmo caminho que bloqueia
qualquer não-ADMIN). É um papel "pela metade": existe no schema e na seed,
mas não tem comportamento de autorização correspondente. Não é explorável
(nenhum fluxo de produção atribui esse papel a um usuário real), mas é uma
inconsistência entre três camadas (seed, frontend, Policy) que uma pessoa
lendo só uma delas não perceberia.

## 4. Duplicação pontual entre `CadastroPublicoController::store` e `ParceiraController::store`

Os dois métodos são idênticos: resolvem endereço via `CepLookupService`,
depois `Parceira::create()`. É uma duplicação de baixo risco (mesma forma,
mesmo Model, sem lógica de autorização diferente entre eles — a diferença
real está na rota, uma pública e outra atrás de `role:ADMIN`), mas é o tipo
de duplicação que tende a divergir silenciosamente se um dos dois fluxos
ganhar uma regra nova e a outra não for atualizada junto.

## 5. Ausência de camada de Repository — não é uma fraqueza, mas registro deliberado

`tear-v2-app` não tem diretório `Repositories`; Controllers falam
diretamente com Eloquent (`Campanha::with(...)->when(...)->paginate(...)`
dentro do próprio `CampanhaController::index`). Para o porte atual (10
Models, queries de filtro simples) isso é apropriado e idiomático em
Laravel — sinalizado aqui apenas para registrar que a ausência foi observada
e avaliada como não sendo dívida, não para recomendar introduzir a camada
(ver seção "O que NÃO deve ser alterado").

---

# Dívidas técnicas

| # | Item | Classificação | Motivo |
|---|---|---|---|
| 1 | Regra de visibilidade por dono duplicada em 4 Controllers, sem Policy como fonte única para listagens | **ALTO** | Hoje correto e consistente, mas é uma condição estrutural para vazamento de dados entre Influenciadoras se um endpoint futuro de listagem esquecer o filtro. Afeta isolamento de dados, o tipo de regra que deveria ter um único ponto de verdade. |
| 2 | Transição de estado de `Pagamento` inline no Controller, divergindo do padrão `Parceira`/`Material` | **MÉDIO** | Não é bug — é inconsistência de camada que aumenta custo cognitivo de manutenção e already reflected em achado P2 de `HANDOFF_FINAL.md` (`Pagamento::$fillable` inclui `status`). |
| 3 | Papel `GESTOR_MARCA` seedado e roteado no frontend sem Policy correspondente no backend | **MÉDIO** | Sem risco ativo (nenhum fluxo de produção atribui o papel), mas é inconsistência entre seed/frontend/backend que confundiria qualquer pessoa lendo só uma das três camadas. Já registrado como P2 em `HANDOFF_FINAL.md` pelo ângulo de segurança; aqui pelo ângulo de consistência arquitetural. |
| 4 | Duplicação entre `CadastroPublicoController::store` e `ParceiraController::store` | **BAIXO** | Mesma forma, mesmo Model, risco de divergência futura entre os dois fluxos de criação de Parceira — mas sem impacto funcional hoje. |
| 5 | `GET /marcas` e `GET /marcas/{marca}` sem `role:ADMIN` explícito na rota (dependem só da Policy) | **BAIXO** | Já registrado em `HANDOFF_FINAL.md`/`TEAR_V2.5_GO_LIVE_CHECKLIST.md` como P1 de hardening; incluído aqui só para não ficar ausente do inventário de consistência arquitetural (mesma família do achado #1: regra de acesso não reforçada em todas as camadas onde poderia estar). |

Nenhuma dívida CRÍTICA foi encontrada — nada que bloqueie o Go-Live do ponto
de vista arquitetural. As auditorias de segurança/infra já existentes
(`HANDOFF_FINAL.md`, veredito "apto para go-live com ressalvas") continuam
válidas e não são contradições por este documento.

---

# Riscos arquiteturais

- **Vazamento de dados entre Influenciadoras por omissão futura.** O risco
  real do achado #1: se um próximo endpoint de listagem for adicionado
  copiando um Controller existente sem copiar também o filtro `when(!
  hasRole('ADMIN'), ...)`, uma Influenciadora passaria a ver dados de outra.
  Isso já é mitigado hoje (os 4 pontos existentes estão corretos), mas o
  mecanismo de mitigação é disciplina humana repetida, não uma barreira
  estrutural (ex.: um Model scope ou trait que centralizasse a regra).

- **Deriva de regra de negócio entre Model e Controller.** Com duas
  convenções coexistindo para transição de estado (método de Model vs.
  lógica inline no Controller), a próxima entidade que precisar de uma
  transição semelhante (ex.: um quinto tipo de aprovação) tem 50% de chance
  de seguir o padrão "errado" (o que hoje só `Pagamento` usa) simplesmente
  por copiar o Controller mais próximo.

- **Papéis modelados sem autorização correspondente ficam invisíveis até
  serem ativados.** `GESTOR_MARCA` é seguro hoje só porque nada atribui esse
  papel em produção. Se o roadmap de produto (`TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md`)
  ativar esse papel sem que alguém releia este documento, o resultado visível
  será uma UI quebrada (403 constante) — não um vazamento, mas uma regressão
  funcional silenciosa até o primeiro usuário real daquele papel.

---

# Recomendações

Todas as recomendações abaixo são localizadas, não tocam contrato de API, e
preservam o comportamento atual — nenhuma delas é uma reescrita.

1. **Centralizar a regra "visível apenas para o dono" em um Model scope
   reaproveitável** (ex.: `scopeVisivelPara(Builder $query, User $user)` em
   `Campanha`, `ParticipacaoNaCampanha` e `Parceira`), chamado pelos quatro
   Controllers hoje duplicados. Não muda nenhum contrato de resposta —
   apenas move a mesma condição para um único lugar. Reduz o achado #1 de
   ALTO para BAIXO sem alterar comportamento.

2. **Padronizar a transição de `Pagamento` como método de Model**
   (`Pagamento::aprovar(User $admin)`), espelhando `Material::aprovar()`, e
   remover `status` do `#[Fillable]`. Resolve o achado #2 e o P2 já
   registrado em `HANDOFF_FINAL.md` na mesma mudança.

3. **Decidir o destino de `GESTOR_MARCA` antes da Fase de produto que o
   ativaria** (`TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md`): remover o papel do seed
   se não houver plano concreto de uso próximo, ou escrever a Policy
   correspondente se houver. Qualquer uma das duas opções elimina a
   inconsistência do achado #3 — a única opção ruim é deixá-lo como está
   indefinidamente.

4. **Unificar `CadastroPublicoController::store` e `ParceiraController::store`**
   extraindo o corpo comum (CEP lookup + `Parceira::create`) para um método
   privado compartilhado ou um terceiro Service pequeno — sem mudar rota,
   validação ou resposta de nenhum dos dois endpoints.

5. **Adicionar `role:ADMIN` explícito nas rotas de `/marcas`** (já
   recomendado em `HANDOFF_FINAL.md`), pelo mesmo princípio do achado #1:
   não depender só da Policy quando a rota pode expressar a mesma garantia
   de forma redundante e barata.

Nenhuma das recomendações acima precisa ser feita antes do Go-Live — todas
reduzem risco de manutenção futura, nenhuma corrige um problema que afete o
uso real do sistema hoje.

---

# O que NÃO deve ser alterado

- **Não introduzir camada de Repository.** O acesso direto a Eloquent nos
  Controllers é apropriado para o porte atual; adicionar essa camada agora
  seria complexidade sem benefício correspondente, na contramão do critério
  de estabilidade pré-Go-Live.
- **Não reabrir o modelo de autorização (`Gate::before` + Policies).** Está
  correto e testado; qualquer mudança aqui tem alto blast radius (afeta toda
  rota autenticada) para um ganho que nenhuma dívida encontrada justifica.
- **Não mexer no fluxo de `GoogleDriveService`/JWT manual.** Funciona,
  degrada corretamente (503) e qualquer refatoração para um SDK oficial é
  decisão de produto (custo de dependência nova), não correção de defeito.
- **Não tocar nos tokens de design (`index.css`) nem em `ADR-002`.** Já estão
  alinhados; o documento desatualizado é `docs/design/DESIGN_SYSTEM.md`
  (dívida de documentação, não de código, já registrada em
  `TASK_ROUTER.md` §7 — fora do escopo desta revisão de arquitetura).
- **Não implementar nenhuma das Recomendações acima nesta sessão** — por
  mandato explícito deste review (auditoria, não execução). Ficam
  registradas para uma unidade de trabalho futura e isolada.

---

# Prioridade das melhorias

1. Achado #1 (regra de visibilidade duplicada) — candidato a primeira
   unidade de trabalho pós-Go-Live: risco ALTO, correção de baixíssimo blast
   radius (scope de Model, sem mudar contrato).
2. Achado #2 (transição de `Pagamento` inline) — resolve simultaneamente um
   P2 já registrado; boa segunda unidade de trabalho, mesmo padrão de risco
   baixo.
3. Achado #5 (`role:ADMIN` explícito em `/marcas`) — trivial, pode entrar
   junto com qualquer uma das duas acima.
4. Achado #4 (duplicação `CadastroPublicoController`/`ParceiraController`) —
   cosmético, sem urgência.
5. Achado #3 (`GESTOR_MARCA` órfão) — não é urgente enquanto nenhum fluxo de
   produção atribuir o papel; decidir quando o roadmap de produto chegar
   nessa fase, não antes.

Nenhum item desta lista bloqueia o Go-Live atual do ponto de vista
arquitetural.

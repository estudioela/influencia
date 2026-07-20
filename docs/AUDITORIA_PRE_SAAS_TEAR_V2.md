# TEAR V2 — Auditoria de Preparação SaaS

Data: 2026-07-20
Papel do autor: Product Architect (agente), a pedido do responsável do
projeto.
Status: **auditoria/análise. Nenhum código foi escrito, nenhuma migration
criada, nenhuma tela alterada para produzir este documento.**

**Escopo:** exclusivamente `tear-v2-app/` (Laravel 13 + React/Vite). Não
avalia o Portal legado GAS (`src/`) nem seu domínio soberano
(`CONTRATO_SOBERANO.md`) — trilhas de decisão separadas, fora do escopo
desta pergunta.

**Pergunta que este documento responde:** o quanto o TEAR está pronto
para evoluir de sistema interno (uso exclusivo da operação da Elã) para
produto SaaS (múltiplas organizações-clientes na mesma instância)?

## 0. Fontes analisadas

1. `docs/HANDOFF_PRODUCTIZACAO_TEAR_V2.md` — estado técnico do MVP e
   prioridades de transição.
2. `docs/ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md` — especificação de produto
   campo a campo, com priorização P0/P1/P2 própria.
3. `docs/PLANO_IMPLEMENTACAO_TEAR_V2.5.md` — plano de execução em 5
   sprints, riscos e decisões pendentes de aprovação.
4. `docs/RELATORIO_SPRINT_1_FUNDACAO_DADOS.md` — relatório de entrega da
   Sprint 1 (já concluída e commitada).
5. `TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md` (raiz do repo) — plano estratégico
   com lente SaaS explícita (Fases 1–4), decisões arquiteturais e lista
   "o que não fazer". Lido como complemento porque é a fonte primária da
   dimensão SaaS que os quatro documentos acima citam repetidamente sem
   repetir o conteúdo.
6. `docs/DIAGNOSTICO_AUTENTICACAO_TEAR_V2.md` — checado como contexto de
   estado atual (não é fonte de decisão de produto): confirma que a
   Sprint 2 (login da influenciadora) está em execução nesta mesma
   sessão de trabalho, com um bloqueador identificado (rota
   `/definir-senha` inexistente) e correção em andamento.

**Não usado como fonte de regra de negócio:** `docs/PRD.md`,
`CONTRATO_SOBERANO.md`, `docs/_workspace/TASK_ROUTER.md` — governam o
domínio soberano do Portal GAS legado, sistema separado.

---

## Resumo executivo

O TEAR está no meio da fase de **produtização** (Sprint 1 de 5 concluída;
Sprint 2 em execução) — a fase que precede, por decisão arquitetural já
registrada, a fase de **preparação SaaS**. Isso não é um atraso: é a
ordem correta segundo os próprios documentos-fonte, que são unânimes em
dizer que multi-tenant sobre um modelo de negócio ainda mudando de forma
gera retrabalho caro.

**Veredito de prontidão: baixo/prematuro para vender como SaaS hoje —
e por desenho, não por falha.** Nenhuma tabela tem `organization_id`, o
Portal da Influenciadora (pré-requisito de produto) ainda não está no ar,
e duas decisões de segurança (RBAC de escrita, consentimento LGPD antes
de expor edição de dado pessoal) ainda estão abertas. A arquitetura já
decidida (schema único + `organization_id` + Laravel global scopes) é
sólida e de baixo custo de implementação **quando chegar a hora** — o
risco real não é a decisão técnica, é a tentação de adiantá-la antes da
operação estar madura, ou de adiá-la além do ponto em que já deveria ter
sido decidida.

Não há necessidade de refazer nada do que já existe. O caminho para SaaS
passa por completar o que já está planejado (Sprints 2–4), não por
desviar dele.

---

## 1. Multi-tenant

### Estado atual

Nenhuma tabela do `tear-v2-app` tem `organization_id` ou equivalente. O
sistema assume implicitamente **uma única operação dona de tudo** — a da
Elã. `Marca` já existe como entidade (CRUD simples, `nome` obrigatório),
mas representa um cliente da Elã (uma marca de moda que contrata
influenciadoras), **não** um tenant SaaS. Confundir os dois conceitos é o
erro de modelagem mais provável nesta transição: `Marca` continua
existindo dentro de uma organização; `organization_id` é uma dimensão
nova, acima de `Marca`, não uma renomeação dela.

### Isolamento de dados

Inexistente hoje, porque não há o que isolar — só existe uma organização
implícita. O isolamento que existe hoje é por **papel** (RBAC, corrigido
na Sprint 1) e por **dono do registro** (ex.: uma influenciadora só lê a
própria `Parceira`), não por organização. Essas duas camadas continuam
necessárias no futuro SaaS — organização não substitui RBAC por
papel/dono, **compõe** com ele.

### Decisão arquitetural já registrada (não implementada)

`TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md` §5 fecha a recomendação: **schema
único compartilhado, com `organization_id` em toda tabela de negócio**
(não schema-per-tenant, não banco-per-tenant), aplicado via Laravel
global scopes em **toda** query por padrão, nunca opt-in por controller.
Justificativa registrada: menor complexidade operacional (uma migration,
um backup, um deploy) para o perfil de cliente esperado (agências
pequenas/médias); reavaliar para isolamento físico só se um cliente
concreto exigir por contrato ou regulação.

Esta análise concorda com a recomendação registrada — é o padrão de menor
custo/risco para o estágio atual do produto, e evita a armadilha mais
comum de implementações prematuras de multi-tenant (over-engineering
antes de haver um segundo cliente real para validar a suposição de
isolamento).

### Gargalo real para iniciar esta fase

Não é técnico — é de **sequenciamento e disciplina de decisão**. Os três
documentos-fonte (Handoff, Roadmap de Produtização, Plano de
Implementação) concordam: nenhuma migration de `organization_id` deve ser
escrita antes de:

1. As Fases/Sprints 1–3 (fundação de dados, Portal da Influenciadora,
   operação interna) estarem maduras em uso real — não apenas
   implementadas, **operando** com dado real por tempo suficiente para
   validar que o modelo de negócio parou de mudar de forma.
2. A estrutura multiempresa (§5 do roadmap) estar confirmada **por
   escrito** pelo responsável do projeto — a recomendação técnica já
   existe, mas confirmação formal ainda é uma pendência aberta (ver
   Riscos, item R-6).

### Risco de maior custo se ignorado

Vazamento de dado entre organizações é classificado, nos três
documentos, como o **maior risco técnico de todo o roadmap** — falha de
segurança grave, não apenas de produto, e a mais cara de corrigir depois
de já existirem clientes reais no sistema. A mitigação já desenhada
(global scope automático, nunca opt-in; teste de isolamento obrigatório
antes de considerar a fase concluída) é adequada, mas ainda não existe
código para validá-la — é decisão de arquitetura, não implementação.

---

## 2. Usuários

### Papéis hoje

| Papel | Estado real |
|---|---|
| `ADMIN` | Único papel efetivamente em uso em produção — equipe interna da Elã |
| `GESTOR_MARCA` | Seedado via Spatie, **sem nenhuma rota, tela ou fluxo que o use**. "Portal da Marca" não tem fase própria definida em nenhum dos quatro roadmaps |
| `INFLUENCIADORA` | Mecanismo de autenticação já funciona no backend (confirmado por teste direto: login com sucesso via `Auth::attempt`) — mas o caminho de produção está bloqueado: o convite por e-mail aponta para uma rota `/definir-senha` que não existe em nenhuma camada (nem frontend, nem endpoint de backend). Esta é a frente de trabalho em execução nesta mesma sessão (Sprint 2) |
| Assessoria | Não existe como conceito de cadastro em nenhuma camada. Duas arquiteturas avaliadas na especificação funcional (campo simples vs. entidade própria com portal futuro) — decisão pendente de dado operacional real (quantas influenciadoras hoje têm assessoria, se compartilham a mesma) |

### Implicação para SaaS

Um produto SaaS multiempresa precisa, no mínimo, de dois níveis de
usuário compostos: **papel** (o que a pessoa pode fazer) × **organização**
(de qual cliente é o dado que ela vê). Hoje só a primeira dimensão está
em construção (RBAC de leitura entregue na Sprint 1; RBAC de escrita
ainda com lacuna registrada — ver Riscos, item R-1). A segunda dimensão
(organização) não existe em nenhuma tabela. Isso não é um problema agora
— é esperado nesta fase — mas significa que **nenhum papel deve ser
oferecido a um cliente externo (fora da operação da Elã) antes da Fase
SaaS estar implementada**, mesmo que o RBAC por papel já esteja
tecnicamente correto.

Um ponto de atenção específico para SaaS: `GESTOR_MARCA` hoje é
ambíguo. Numa leitura interna (estado atual), seria "alguém da equipe
Elã com visão restrita a uma marca". Numa leitura SaaS futura, poderia
significar "usuário de uma organização-cliente com papel de gestor" —
são conceitos de acesso diferentes que hoje colidem no mesmo nome de
papel. Recomenda-se resolver essa ambiguidade **antes** de desenhar o
RBAC composto da Fase SaaS, não durante.

### Assessoria como sintoma

A pergunta em aberto sobre Assessoria (§14 da especificação funcional) é
um exemplo pequeno do mesmo problema estrutural maior: toda decisão de
"esta entidade pode logar sozinha algum dia?" muda o desenho de dado
necessário hoje. O modelo recomendado (entidade própria, não campo solto)
está correto pela mesma razão que `organization_id` como coluna futura
está correto — mas nenhum dos dois deve ser implementado antes do dado
operacional real confirmar a necessidade.

---

## 3. Dados

### Entidades atuais (funcionais, validadas)

Parceira (influenciadora), Marca, Campanha, Participação, Briefing
(reorganizado 1:N por tipo de conteúdo na Sprint 1), Material, Pagamento,
User — núcleo operacional completo, testado ponta a ponta em produção
interna (99 testes automatizados de backend após a Sprint 1, todos
verdes).

### Gargalos identificados

1. **SQLite em desenvolvimento, sem plano de migração para produção
   ainda executado.** Risco concreto e datado: concorrência de escrita
   aparece "exatamente quando duas influenciadoras enviam material ao
   mesmo tempo" — ou seja, no momento em que o Portal (Sprint 2) for a
   usuário real, não antes. Migrar para Postgres está recomendado **antes**
   dessa exposição, não depois de aparecer em produção. Isso é
   independente de SaaS — é um limite de produto interno já datado para
   os próximos sprints.
2. **Armazenamento de mídia sem credencial real configurada.** Google
   Drive está implementado em código, mas `GOOGLE_DRIVE_CLIENT_EMAIL`/
   `GOOGLE_DRIVE_PRIVATE_KEY` estão vazios — fallback em disco local ativo.
   Para SaaS, isso é um gargalo duplo: (a) Drive real usa uma única
   credencial de service account com pasta compartilhada, sem isolamento
   nativo de acesso por cliente; (b) disco local não escala para múltiplas
   organizações em uma mesma instância. A decisão já registrada (migrar
   para S3/R2 com prefixo por organização) é a correta, mas
   deliberadamente adiada para "quando a Fase SaaS estiver próxima" — não
   é dívida hoje, seria dívida se a Fase SaaS começasse sem essa migração.
3. **Cadastro ainda com enriquecimento parcial.** Sprint 1 entregou CEP
   automático, validação de CNPJ e telefone, medidas versionadas e
   consentimento LGPD com histórico por campo — mas as máscaras/preview no
   **frontend** de cadastro público ainda não foram implementadas (a
   validação real já está no backend, que é a fonte de verdade, mas a
   experiência de preenchimento ainda não reflete isso). Débito técnico já
   registrado para a Sprint 2/3, não bloqueador de SaaS, mas relevante
   para qualidade de onboarding autosserviço futuro.
4. **`Parceira.store`/`update` sem checagem de posse.** Qualquer usuário
   autenticado ainda pode criar/editar qualquer `Parceira` — só a leitura
   foi travada na Sprint 1, por decisão de escopo explícita daquela
   sprint. Hoje mitigado porque não existe login real de `INFLUENCIADORA`
   em produção; deixa de estar mitigado no momento em que a Sprint 2
   (em execução) destravar o login. Ver Riscos, item R-1 — é o item de
   maior urgência de todo este documento, mais urgente que qualquer
   decisão de SaaS.

### Decisões futuras de dado (já mapeadas, não fechadas)

- Migração do histórico legado (Google Sheets): recomendada como
  somente-leitura (`origem: legado`), independente da direção SaaS —
  não decidir escopo exato (quais abas, quais campos) por omissão.
  Risco de divergência de chave (`INFLU_KEY` do legado vs. `nome` como
  chave única de `Parceira` hoje) já identificado, exige revisão manual.
- Produto/variante/estoque: schema físico já desenhado em
  `docs/ROADMAP_MESTRE_TEAR_V2.md` Parte 2, Fase 3 — não redesenhado
  aqui, mas ainda não implementado. É pré-requisito de Logística,
  Permutas e parte de Contratos.
- Estrutura multiempresa (`organization_id` em cascata): ver §1. É a
  decisão de dado mais cara de reverter de toda a lista, por isso é a
  única com exigência explícita de aprovação por escrito antes da
  primeira migration.

---

## 4. Operação

| Frente | Estado | Leitura SaaS |
|---|---|---|
| **Briefing** | Reorganizado de 1:1 para 1:N por tipo de conteúdo (Feed/Reels/Stories/TikTok/UGC) na Sprint 1 — corrige regressão em relação à V1 legada. Funcional, testado, com débito de UI (mínima, não polida) e uma assunção não confirmada com a operação (mapeamento `FEED` ↔ `carrossel_qtd`) | Modelo de dado já compatível com múltiplas organizações sem redesenho — a granularidade por tipo de conteúdo não depende de tenant |
| **Pagamentos** | Máquina de estados `PENDENTE → APROVADO → PAGO` testada ponta a ponta. **Atenção de nomenclatura:** este módulo paga a influenciadora (fornecedora de conteúdo), não é billing/cobrança de cliente SaaS — são dois conceitos de "pagamento" completamente distintos que vão coexistir na Fase SaaS (pagar influenciadoras de uma organização-cliente **e** cobrar a própria organização-cliente pelo uso do TEAR) | Billing (cobrança recorrente por plano, limite de uso, bloqueio por inadimplência) não existe em nenhuma camada — é item de Fase SaaS, não de produtização, corretamente classificado como P2 em todos os documentos |
| **Logística** | Placeholder honesto (sem fluxo real). Desenho físico de tabelas (`products`, `product_variants`, `stock`, `shipments`, `shipment_items`) já existe em `docs/ROADMAP_MESTRE_TEAR_V2.md` Parte 2, Fase 3 — não implementado ainda | Sem gargalo específico de SaaS além do geral (`organization_id` em cascata quando implementado) |
| **Contratos** | Não existe em nenhuma camada. Modelo proposto (template editável sem deploy, placeholders, geração de PDF, envio para assinatura externa) está especificado, não implementado. Duas decisões pendentes do responsável do projeto: provedor de assinatura digital (Clicksign/D4Sign/DocuSign/ZapSign) e regras contratuais em si (cláusulas obrigatórias, prazo de vigência, política de rescisão) | Risco legal explícito nos documentos: revisão jurídica das cláusulas é pré-requisito de conclusão desta frente, independente de SaaS. Se o TEAR for vendido como produto para outras operações, o modelo de contrato precisa suportar cláusulas diferentes por organização-cliente — isso ainda não está desenhado porque a frente de Contratos em si ainda não começou |

### Leitura geral da operação

O núcleo que já opera (Cadastro → Aprovação → Campanha → Briefing →
Material → Pagamento) está sólido e não é o gargalo. As frentes que
faltam (Logística, Contratos) têm desenho conceitual pronto mas zero
implementação — não é possível avaliar seu comportamento sob
multi-tenant real porque elas ainda não existem para uma única
organização. Auditar "operação pronta para SaaS" antes dessas frentes
existirem para um único cliente seria antecipar uma resposta sem dado.

---

## 5. Riscos

Consolidado e priorizado — riscos que bloqueiam qualquer avanço vêm
primeiro, riscos que só importam quando a Fase SaaS realmente começar
vêm por último.

### Bloqueadores imediatos (independentes de SaaS, mas pré-requisito de tudo que segue)

- **R-1 — `Parceira.store`/`update` sem checagem de posse.** Já descrito
  em §3, item 4. É o risco de maior urgência deste documento: a Sprint 2
  (em execução nesta mesma sessão) está prestes a destravar o login real
  da influenciadora; se o portal permitir edição de perfil antes desta
  lacuna fechar, qualquer influenciadora autenticada pode escrever sobre
  o cadastro de outra. Precisa fechar antes do Portal permitir qualquer
  tela de edição, não depois.
- **R-2 — Consentimento LGPD como pré-condição de exposição de dado
  pessoal.** A infraestrutura já foi entregue na Sprint 1 (registro de
  consentimento + histórico por campo). O risco remanescente é de
  processo, não de código: garantir que nenhuma tela do Portal (Sprint 2)
  permita edição de dado pessoal sem passar pelo fluxo de consentimento já
  construído. Mesma classe de risco jurídico que R-1.
- **R-3 — Bloqueador de login da influenciadora (rota `/definir-senha`
  morta).** Diagnosticado nesta mesma sessão (`docs/DIAGNOSTICO_AUTENTICACAO_TEAR_V2.md`):
  o convite é gerado corretamente, mas o link não tem para onde levar —
  nenhuma influenciadora real completa o primeiro login hoje. Correção já
  em andamento no momento desta auditoria (endpoint de reset de senha).
  Não é risco de SaaS, é o pré-requisito imediato de todo o resto do
  roadmap: sem Portal funcionando para um usuário real, não há como
  validar a Fase 1 antes de sequer cogitar a Fase SaaS.

### Riscos estruturais (relevantes para amadurecer antes da Fase SaaS)

- **R-4 — SQLite sob concorrência real.** Ver §3, item 1. Datado para o
  momento em que o Portal for a usuário real (Sprint 2) — não é risco
  distante.
- **R-5 — Armazenamento sem isolamento por cliente.** Ver §3, item 2.
  Não bloqueia a operação atual (um único cliente implícito), mas precisa
  estar resolvido **antes** de organização virar dimensão real de dado —
  senão a Fase SaaS herda um ponto único de acesso a arquivos de todas as
  organizações.
- **R-6 — Estrutura multiempresa ainda não confirmada por escrito.** A
  recomendação técnica existe e está bem fundamentada (schema único +
  `organization_id` + global scopes), mas nenhum dos documentos-fonte
  registra uma confirmação formal do responsável do projeto — é
  recomendação de arquiteto, não decisão de negócio fechada. Sem essa
  confirmação, qualquer início de implementação da Fase SaaS estaria
  decidindo por omissão, o que os próprios documentos proíbem
  explicitamente.
- **R-7 — Ambiguidade de papel `GESTOR_MARCA`.** Ver §2. Pequeno hoje
  (papel sem nenhuma rota real), mas cresce de custo quanto mais tarde for
  resolvido, porque o RBAC composto (papel × organização) da Fase SaaS
  vai precisar de uma definição única e sem ambiguidade para cada papel
  existente.
- **R-8 — Replicar o legado célula-a-célula em vez de reinterpretar como
  fluxo de negócio.** Risco citado nos próprios documentos-fonte para a
  frente de Logística/Contratos — mencionado aqui porque decisões de
  modelagem malfeitas nesta fase (produtização) se tornam mais caras de
  corrigir depois que `organization_id` estiver em cascata sobre elas.

### Riscos específicos da Fase SaaS (só materializam quando essa fase começar)

- **R-9 — Vazamento de dado entre organizações.** Já descrito em §1 como
  o maior risco técnico de todo o roadmap. Mitigação desenhada (global
  scope automático, nunca opt-in; teste de isolamento obrigatório) é
  adequada, mas só terá valor real no momento da implementação — hoje é
  intenção documentada, não controle técnico existente.
  a maior classe de dano se ignorado: exposição de dado de um cliente
  pagante para outro é o tipo de incidente que destrói confiança no
  produto de forma irreversível, não só um bug a corrigir.
- **R-10 — Billing e cobrança recorrente inexistentes.** Sem gargalo
  técnico conhecido (é integração nova, não modificação de algo
  existente), mas é trabalho não iniciado e não estimado em nenhum
  documento-fonte — decisão de fornecedor (ex. Stripe) ainda nem foi
  levantada como pauta.
- **R-11 — Onboarding autosserviço inexistente.** Hoje toda criação de
  dado é feita pela equipe via painel administrativo. Onboarding sem
  intervenção humana é um fluxo inteiramente novo (cadastro de
  organização → provisionamento → primeiro usuário admin daquela
  organização) sem nenhum precedente no código atual.

### Dependências externas (bloqueiam datas, não arquitetura)

- Provedor de assinatura digital para Contratos — decisão do
  responsável do projeto/jurídico, fora do controle técnico.
- Serviço de CEP (ViaCEP/BrasilAPI) — já em uso, com falha não
  bloqueante corretamente desenhada (RNF herdada da V1).
- Futuro provedor de cobrança recorrente (Fase SaaS) — nem contratado
  nem avaliado ainda.

### Decisões de produto pendentes que afetam diretamente a prontidão SaaS

Consolidado dos itens já listados como pendência aberta nos quatro
documentos-fonte, filtrado para os que têm impacto direto na pergunta
desta auditoria:

1. Confirmação por escrito da estrutura multiempresa (R-6) — é o único
   item desta lista que é, ele mesmo, o critério de saída da fase atual
   para a Fase SaaS.
2. Escopo do papel `GESTOR_MARCA`/Portal da Marca — hoje sem fase própria
   definida; precisa de decisão antes do RBAC composto de organização
   ser desenhado.
3. Modelo de Assessoria (campo vs. entidade) — pequeno isoladamente, mas
   é o tipo de decisão que fica ordens de grandeza mais cara depois que
   `organization_id` estiver em cascata sobre o schema.
4. Se consentimento LGPD é P0 ou P1 — já recomendado como P0 pela
   especificação funcional, ainda sem confirmação jurídica registrada.

---

## 6. Conclusão

O TEAR não está pronto para ser vendido como SaaS hoje, e os próprios
documentos de planejamento do projeto já sabem disso e já sequenciaram o
trabalho corretamente em função disso — não há necessidade de mudar de
direção, só de continuar executando a ordem já decidida (Sprint 2 → 3 →
4 → 5) sem pular etapas.

**O que precisa estar resolvido antes de vender como SaaS**, em ordem de
urgência:

1. Fechar R-1 (posse de `Parceira`) e R-3 (login da influenciadora) —
   condição para o Portal (Sprint 2) ser considerado concluído com
   segurança.
2. Amadurecer Sprints 2–4 (Portal, Operação interna, Inteligência) em
   uso real — não apenas implementadas, mas operando tempo suficiente
   para provar que o modelo de negócio parou de mudar de forma. Este é o
   critério que os documentos-fonte usam para definir "maduro", e é o
   critério correto: multi-tenant é caro de desfazer, mudança de regra de
   negócio não é.
3. Confirmar por escrito a estrutura multiempresa (R-6) — pré-requisito
   formal antes de qualquer migration de `organization_id`.
4. Resolver a ambiguidade de `GESTOR_MARCA`/Portal da Marca (R-7) e o
   modelo de Assessoria — para não desenhar RBAC composto sobre papéis
   ainda ambíguos.
5. Migrar SQLite → Postgres (R-4) e desenhar isolamento de armazenamento
   por organização (R-5) — infraestrutura, não arquitetura de aplicação,
   mas precisa estar pronta antes da Fase SaaS, não durante.
6. Só então: `organizations`, `organization_id` em cascata, global
   scopes, billing, onboarding autosserviço (Fase 5/Fase 4, conforme o
   documento) — nesta ordem, com teste de isolamento entre duas
   organizações como critério de conclusão obrigatório, não opcional.

Nenhuma dessas etapas exige refazer o que já existe. O núcleo operacional
validado (Cadastro → Campanha → Briefing → Material → Pagamento) é a
base correta para crescer sobre ela — o trabalho que falta é de
sequenciamento disciplinado, não de arquitetura a redesenhar.

---

Nenhum código foi escrito, nenhuma migration criada e nenhuma tela
alterada para produzir este documento. Esta auditoria é insumo de
decisão para o responsável do projeto — não substitui, e não reabre,
nenhuma das decisões já registradas em
`TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md`, `docs/ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md`
ou `docs/PLANO_IMPLEMENTACAO_TEAR_V2.5.md`.

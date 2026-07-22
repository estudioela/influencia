# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `209bf32` — commitado, **pushado ao final desta sessão**
  (`origin/feat/ui-design-system-ela` estava 6 commits atrás antes do
  push: 3 de sessão(ões) anterior(es) não refletidos em documentação
  — `aea82d6`, `9824b7b`, `a241186` — + 3 desta sessão — `fabd5c1`,
  `7d85989`, `209bf32`). Working tree com 3 arquivos não rastreados
  (`??`), mantidos assim por instrução explícita do responsável do
  projeto em sessões anteriores: `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`.
- **Branch:** `feat/ui-design-system-ela`.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — execução do
  backlog de certificação funcional do MVP aberto na sessão anterior
  (`TASK_ROUTER.md` §29), **encerrado nesta sessão**.
- **Testes:** backend 198/198 verdes (Pint limpo); frontend `tsc -b`/
  `oxlint`/`vite build` limpos — medido nesta sessão, após as alterações
  de código.

## 2. Última sessão concluída — Backlog funcional executado + reconciliação da especificação (2026-07-22)

Continuação direta da sessão anterior (auditoria funcional do MVP,
`TASK_ROUTER.md` §29), com plano aprovado pelo responsável do projeto:
entrega incremental, uma frente por vez, commits pequenos, evitar
investigações longas em itens que dependem de decisão de negócio.

**Achado de abertura — drift de documentação, corrigido antes de agir:**
entre o fim da sessão anterior (HEAD `c7f753e` documentado) e o início
desta, 3 commits já haviam resolvido parte do backlog sem atualização de
`ESTADO_SESSAO.md`/`TASK_ROUTER.md`: `aea82d6` (menu de Logística
destravado), `9824b7b` (dedup de nome de Parceira), `a241186` (histórico
de alteração exposto para admin). Verificado por `git log --stat` antes
de reportar qualquer coisa como concluída — detalhe completo em
`TASK_ROUTER.md` §30.

**Execução do backlog, nesta ordem:**

1. **RBAC de leitura granular (P0) — verificado, nenhuma correção
   necessária.** Todos os controllers administrativos (`ParceiraController`,
   `MedidaController`, `HistoricoAlteracaoController`, `MarcaController`,
   `CampanhaController`, `ParticipacaoController`, `BriefingController`,
   `MaterialController`, `PagamentoController`, `EnvioController`,
   `MeParticipacaoController`) chamam `$this->authorize(...)` contra
   Policies reais, com `Gate::before` liberando ADMIN e as Policies
   restringindo os demais papéis por posse — coberto por teste
   (`RbacIsolamentoTest`, `PortalIsolamentoTest`). O spec de 07-20 estava
   desatualizado nesse ponto.
2. **Comprovante de pagamento (P1) — implementado** (commit `fabd5c1`):
   `POST /pagamentos/{pagamento}/comprovante` (role:ADMIN), reaproveitando
   `GoogleDriveService` (mesma abstração de Materiais); `PagamentoResource`
   expõe `comprovante_url`; UI de upload/link no admin (`PagamentoPage`) e
   link somente leitura no Portal (`PortalParticipacaoPage`). 2 testes
   novos.
3. **Residuais de Cadastro:** dedup de nome já resolvida (commit anterior
   à sessão); `authorize()` "ausente" em `POST /parceiras/cadastro`
   administrativo confirmado como **falso positivo** (rota já tem
   `role:ADMIN` + `$this->authorize('create', ...)` + teste verde);
   validação de formato do Instagram **não implementada** — decisão de
   produto sem formato definido em nenhuma fonte, documentada, não
   resolvida (instrução explícita de não investir em itens de decisão de
   negócio nesta sessão).
4. **Reconciliação da especificação funcional** — produzido
   `docs/reports/RECONCILIACAO_ESPECIFICACAO_FUNCIONAL_MVP.md` (commit
   `209bf32`, formato tabela, só divergências, sem reescrever o documento
   original): 11 divergências encontradas entre
   `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` (2026-07-20) e o código
   real — quase todas a favor do sistema (spec desatualizada): Portal
   completo da Influenciadora, envio de material pelo próprio portal,
   congelamento de participação, vínculo Material↔Briefing, RBAC
   granular, comprovante de pagamento, locale `pt_BR`, dedup de nome,
   `authorize()` administrativo (falso positivo). 2 divergências
   classificadas **Parcial**: bloqueio de edição pós-congelamento e
   `FEED = carrossel_qtd` já foram decididos *de fato* pelo código, mas
   nunca ratificados como decisão consciente de produto.

**Validação:** backend 198/198 verde, Pint limpo; frontend `tsc -b`/
`oxlint`/`vite build` limpos — checado a cada unidade de trabalho, antes
de cada commit.

**Commits desta sessão (3, todos pequenos, uma frente por vez):**
`fabd5c1` (comprovante de pagamento), `7d85989` (docs: registra execução
do backlog), `209bf32` (docs: reconciliação da especificação).

**Backlog de `AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md` — encerrado**
nesta sessão. O que resta não é código, é decisão de produto (ver §4).

## 3. Próxima tarefa recomendada

**Levar ao responsável do projeto as 2 decisões de produto que hoje são
o único bloqueador real de certificação funcional do MVP** (não código):

1. **Recorrência/parcelamento de pagamento por Participação** — maior
   alavancagem pendente; determina se o `Pagamento` continua 1:1 com
   Participação ou vira uma mudança estrutural (nova tabela,
   `HasOne`→`HasMany`, rota, frontend, testes).
2. **Validação de formato do Instagram** — menor impacto, mas também sem
   definição em nenhuma fonte.
3. **Ratificar (ou reverter)** as 2 decisões já tomadas *de fato* pelo
   código, sem decisão formal registrada: bloqueio total de edição de
   Participação após congelamento (sem trilha de auditoria); `FEED`
   reaproveitando `carrossel_qtd` (sem coluna própria).

**Só depois dessas decisões (ou em paralelo, se o responsável preferir
não bloquear)**, retomar a Frente B (Go-Live) — `TASK_ROUTER.md` §27
(PostgreSQL indisponível no plano Locaweb, ainda bloqueante) e §29
(reconciliação pendente do PR #62, incompatibilidade de autenticação SSH
no pipeline de deploy, `restore-db.sh` ainda com Docker) — nenhum desses
achados foi corrigido em nenhuma sessão até aqui, só documentado.

Nenhuma outra fila de trabalho de código está aberta — o próximo passo
de implementação depende das decisões acima ou da retomada do Go-Live.

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Decisão de recorrência de pagamento por Participação** — segue sem
  resposta, maior alavancagem do que restou do backlog funcional.
- **Validação de formato do Instagram** — novo item explícito, achado
  nesta sessão (já estava implícito no spec, agora isolado como decisão
  própria).
- **Ratificação das 2 decisões já implementadas de fato** (bloqueio de
  edição pós-congelamento; `FEED = carrossel_qtd`) — não bloqueiam nada
  hoje, mas ficam sem dono formal enquanto não confirmadas.
- Definir estratégia de infraestrutura do PostgreSQL — bloqueante para a
  Etapa 3 do Go-Live (inalterado, frente pausada há 2 sessões).
- Decisão real de autenticação de deploy (chave vs. senha vs. híbrido) —
  `ADR-016` não resolveu essa incompatibilidade (achado de sessão
  anterior, ainda não corrigido).
- Reconciliar PR #62 (conflitante) e a branch `worktree-agente-b-deploy-infra`
  não mesclada (inalterado).
- Promover `docs/design/stitch-export/DESIGN.md` a fonte oficial de
  tokens (ADR-002) — inalterado, frente de simplificação documental
  pausada há 2 sessões.
- Seguir ou não com as Fases 2-4 da simplificação documental — inalterado.
- Preço do piloto externo; separação marca produto/agência antes do
  INPI; credenciais reais de produção; branch remota
  `worktree-spec-mvp-completa` — inalterados.

## 5. Riscos ativos

1. **Recorrência de pagamento indecidida** — enquanto pendente, qualquer
   implementação no entorno de Participação/Pagamento corre risco real
   de retrabalho (inalterado da sessão anterior).
2. **2 decisões já tomadas pelo código sem ratificação formal**
   (congelamento, `FEED`) — risco baixo hoje (comportamento já em
   produção-equivalente e testado), mas sem dono de decisão registrado;
   se revertidas depois, afeta dado já persistido (novo, desta sessão).
3. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma do Go-Live (inalterado).
4. Pipeline de deploy com incompatibilidade de autenticação não resolvida
   (achado de sessão anterior, `TASK_ROUTER.md` §29) — Go-Live falharia
   na primeira execução real se retomado sem correção.
5. Validação comercial concentrada em piloto único ainda não confirmado;
   bus factor 1; migração de infra prevista para novembro coincide com
   pico sazonal Jescri em dezembro (inalterados).

**Risco encerrado nesta sessão:** RBAC de leitura granular administrativo
— era listado como risco de segurança latente; verificado e confirmado
corretamente implementado, não é mais risco ativo.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais. Para o estado da
certificação funcional do MVP, ver
`docs/reports/RECONCILIACAO_ESPECIFICACAO_FUNCIONAL_MVP.md` (divergências
spec×código) e `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`
(backlog original, agora encerrado). Para retomar o Go-Live, ver
`docs/deployment/AUDITORIA_LOCAWEB.md`,
`docs/adrs/ADR-016-composer-no-ci-deploy-manual.md`, e `TASK_ROUTER.md`
§29 para o achado de incompatibilidade de autenticação não resolvida por
`ADR-016`.

## 7. IA recomendada para a próxima tarefa

- **Decisões de produto pendentes (recorrência de pagamento, formato do
  Instagram, ratificação das 2 decisões já implementadas):** responsável
  do projeto — não é tarefa de IA.
- **Retomada do Go-Live (engenharia/infra), se decidido antes das
  decisões acima:** **ChatGPT**, por padrão, pela integração com
  terminal — salvo instrução em contrário.
- **Implementação decorrente de qualquer decisão de produto tomada
  (ex.: mudança de schema de Pagamento para recorrência):** **ChatGPT**,
  mesmo motivo.
- **Nova auditoria/planejamento/reconciliação de documentos:**
  **Claude**, mesmo motivo das sessões anteriores.

## 8. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §30/§31 para a execução do
backlog funcional e a reconciliação da especificação desta sessão, §27
para o bloqueio de PostgreSQL no Go-Live, ainda pausado, §29 para os
achados de deploy não resolvidos).

Estado: o backlog de certificação funcional do MVP (aberto na sessão
anterior, docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md) foi
encerrado nesta sessão. RBAC de leitura granular verificado sem
necessidade de correção; comprovante de pagamento implementado; residuais
de Cadastro fechados (dedup já feita, authorize() confirmado como falso
positivo); validação de formato do Instagram documentada como decisão de
produto pendente, não implementada. Produzida reconciliação objetiva
entre a especificação funcional e o código real
(docs/reports/RECONCILIACAO_ESPECIFICACAO_FUNCIONAL_MVP.md, 11
divergências, quase todas a favor do sistema — spec desatualizada, não
bug). O núcleo operacional do MVP, incluindo o Portal completo da
Influenciadora, está funcionalmente conforme e testado.

Tarefa desta sessão: o que resta para "certificar" o MVP não é código, é
decisão de produto — 2 decisões sem resposta (recorrência/parcelamento de
pagamento; formato do Instagram) e 2 decisões já tomadas de fato pelo
código sem ratificação formal (bloqueio de edição pós-congelamento; FEED
= carrossel_qtd). Leve essas decisões ao responsável do projeto antes de
qualquer novo código no entorno de Pagamento/Participação/Cadastro. Sem
decisão nova, a próxima frente de trabalho é retomar o Go-Live (§27/§29
do TASK_ROUTER.md) — PostgreSQL, incompatibilidade de autenticação SSH no
deploy, restore-db.sh com Docker, reconciliação do PR #62.

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit; TDD para
qualquer correção de código (ver superpowers:test-driven-development).
```

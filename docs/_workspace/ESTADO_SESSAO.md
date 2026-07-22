# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `e9574ed` — commitado. **Não verificado se já foi pushado**
  nesta sessão (não houve `git push` explícito registrado). Working tree
  com 2 arquivos não rastreados (`??`), não commitados por não ter sido
  pedido: `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md` e
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`.
- **Branch:** `feat/ui-design-system-ela`.
- **Sistema em foco nesta sessão:** documentação do projeto como um todo
  (não código) — missão de simplificação documental, instruída pelo
  responsável do projeto. **A frente de Go-Live/infraestrutura
  (PostgreSQL, SSH Locaweb) não foi tocada nesta sessão** — segue
  exatamente como estava no fim da sessão anterior (ver §27 do
  `TASK_ROUTER.md`), ainda bloqueante para a Etapa 3 do
  `PLANO_DE_IMPLANTACAO.md`.
- **Testes:** sem alteração de código nesta sessão (só documentação) —
  última medição conhecida (sessões anteriores): backend 192/192 verdes,
  Pint limpo, `tsc -b`/`oxlint`/`vite build` do frontend limpos.

## 2. Última sessão concluída — auditoria documental completa + Fase 1 (parcial) de simplificação (2026-07-22)

Sessão iniciada com briefing padrão (`/comecar`): estado do repositório
conferido contra `ESTADO_SESSAO.md` (bateu, com uma divergência trivial e
esperada — o `HEAD` registrado era um commit anterior ao próprio commit
que fechou a sessão anterior, o que é normal já que aquele commit não
pode se autorreferenciar pelo hash).

**Missão executada, em 3 etapas sucessivas por instrução do responsável
do projeto:**

1. **Auditoria completa (read-only):** os 102 arquivos `.md` do projeto
   (98 em `docs/` + 4 na raiz) foram classificados em MANTER (47) /
   CONSOLIDAR (5) / ARQUIVAR (48) / REMOVER (2), com método estrutural
   (nomes, pastas, cabeçalhos, primeiro parágrafo, cross-reference — sem
   ler o conteúdo integral, por instrução explícita). Resultado gravado em
   `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`. Achado central:
   um cluster de 8 arquivos (`DATA_MODEL.md`, `DATABASE_MODEL.md`,
   `DOMAIN.md`, `TEAR.md`, `MIGRATION.md`, `SCREEN_MAP.md`,
   `STITCH_PROTOTYPE.md`, `UX_FLOW.md`, juntos ~32.318 linhas) é ensaio de
   planejamento gerado por IA **antes** de qualquer código existir,
   descrevendo um domínio teórico ("Competência"/"Colaboração_Mensal")
   sem correspondência em nenhum sistema real.

2. **Plano executivo (read-only):** a partir da auditoria, foi produzido
   `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md` — priorização
   por risco/esforço/ganho, definição explícita de fonte de verdade por
   caso de duplicação, estimativa de impacto agregado, e um roadmap em 4
   fases. A validação de conteúdo (não só estrutural) dos 10 arquivos
   envolvidos em CONSOLIDAR/REMOVER, cruzada contra o código real, **corrigiu
   3 das 5 classificações originais de CONSOLIDAR** — o achado mais
   relevante: comparação de cores contra `tear-v2-app/frontend/src/index.css`
   confirmou que `docs/design/stitch-export/DESIGN.md` (não
   `docs/design/DESIGN_SYSTEM.md`) é a fonte real de tokens de design já
   implementada. Ver detalhe completo no §28 do `TASK_ROUTER.md` e na
   íntegra do plano executivo.

3. **Fase 1 executada, com escopo restrito pelo responsável do projeto**
   ao cluster de 8 arquivos já validado (não aos outros itens de Fase 1
   do plano):
   - Duas rodadas de validação adicional confirmaram confiança alta e
     ausência de informação exclusiva nos 8 arquivos (incluindo os
     módulos ainda não implementados no sistema real — Logística,
     Contratos, Histórico — cujo conteúdo se mostrou igualmente genérico).
   - `git mv` dos 8 arquivos para `docs/archive/planejamento-pre-codigo/`
     (histórico preservado, commit `08366b4`) + atualização de
     `docs/archive/README.md` com a nova seção.
   - Correção, em commit isolado (`e9574ed`), de uma referência obsoleta
     encontrada no `README.md` (raiz) que recomendava 2 desses arquivos
     como leitura de arquitetura — removida, não redirecionada ao
     archive.
   - Verificação final (grep no repositório inteiro) confirmou zero
     referências remanescentes fora de `docs/archive/` e dos próprios
     relatórios de auditoria/plano.

**Nenhum código de `tear-v2-app/` ou `src/` foi alterado.** Nenhuma
decisão de arquitetura foi tomada ou reaberta.

## 3. Próxima tarefa recomendada

Há duas frentes em aberto, de naturezas diferentes — a escolha de qual
priorizar é do responsável do projeto (por regra do próprio `CLAUDE.md`,
"não trabalhar em múltiplas frentes" ao mesmo tempo):

**A. Continuar a simplificação documental** (Fases 2-4 do plano
executivo, `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`):
1. Fase 2 — 3 remoções diretas já validadas, baixo risco:
   `docs/reports/STATUS_MVP_OPERACIONAL_TEAR_V2.md`,
   `docs/reports/RELATORIO_SPRINT_ESTABILIZACAO_TEAR_V2.md`,
   `docs/design/DESIGN_SYSTEM.md`.
2. Fase 1 (restante) — arquivar 3 roadmaps superados +
   `REPOSITORY_GOVERNANCE_AUDIT.md` + `RELATORIO_CONSOLIDACAO_AUDITORIAS.md`
   (raiz). `PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` precisa de um ADR
   novo (decisão P0-2) antes de arquivar.
3. Fase 3 — decisão humana pendente: promover
   `docs/design/stitch-export/DESIGN.md` a fonte oficial de tokens
   (atualizar status do ADR-002, hoje "Proposed"); depois, consolidar
   `UI_RULES.md` no ADR-002 e `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`
   no `BACKLOG_FUNCIONAL_V2_6.md` (com extração prévia da seção de
   recorrência de pagamento, ainda ausente do backlog).
4. Decidir se commita os 2 relatórios de auditoria/plano ainda não
   rastreados.

**B. Retomar a frente de Go-Live** (§27 do `TASK_ROUTER.md`, inalterada
nesta sessão): decidir a estratégia de infraestrutura do PostgreSQL
(upgrade Hospedagem II/III da Locaweb vs. PostgreSQL externo) — bloqueia
a Etapa 3 do `PLANO_DE_IMPLANTACAO.md`. Em paralelo, habilitar SSH no
painel Locaweb para levantar IP/CIDR do proxy reverso e host/porta do
SMTP (Etapa 2, checklist em `AUDITORIA_LOCAWEB.md` §2.1).

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Definir estratégia de infraestrutura do PostgreSQL** — bloqueante
  para a Etapa 3 do Go-Live (inalterado desde a sessão anterior).
- Habilitar SSH no painel Locaweb (Etapa 2 do Go-Live, inalterado).
- Apontar o DNS de `estudioela.com` para a Locaweb (Etapa 4, depende da
  Etapa 2).
- **Nova, desta sessão:** promover `docs/design/stitch-export/DESIGN.md`
  a fonte oficial de tokens de design (atualizar status do ADR-002) —
  evidência técnica já reunida (bate com o CSS real), mas é decisão de
  marca/produto, não técnica.
- **Nova, desta sessão:** decidir se/quando prosseguir com as Fases 2-4
  da simplificação documental (ver §3-A acima), e se commita os 2
  relatórios ainda não rastreados.
- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no
  INPI.
- Credenciais reais de produção (Google Drive, SMTP) — ainda não
  preenchidas.
- Decisão do que fazer com a branch remota `worktree-spec-mvp-completa`
  (arquivar/apagar) — já integrada via merge, sem urgência técnica.

## 5. Riscos ativos

1. **PostgreSQL confirmado indisponível** no plano Hospedagem I da
   Locaweb — decisão de estratégia de infraestrutura ainda pendente,
   pode impactar custo e cronograma do Go-Live (inalterado).
2. Validação comercial concentrada em um único piloto ainda não
   confirmado.
3. Bus factor 1 — fundador único operando agência, produto e suporte.
4. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.
5. **Novo, de baixo impacto:** os relatórios de auditoria/plano desta
   sessão seguem sem commit — se uma sessão futura rodar `git status`
   sem ler este arquivo primeiro, pode confundi-los com trabalho
   incompleto; não são.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais. Para continuar a
simplificação documental, ver também
`docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md` e
`docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md` (ainda não
rastreados pelo git, mas presentes no working tree). Para retomar a
Etapa 2/3 do Go-Live, ver `docs/deployment/AUDITORIA_LOCAWEB.md` e
`docs/adrs/ADR-016-composer-no-ci-deploy-manual.md`.

## 7. IA recomendada para a próxima tarefa

- **Continuação da simplificação documental (Fases 2-4):** **Claude**,
  pelo mesmo motivo desta sessão — exige leitura comparativa de conteúdo,
  julgamento sobre perda de conhecimento, e redação de relatório.
- **Execução de engenharia/terminal** (deploy, scripts, provisionamento de
  infra do Go-Live): **ChatGPT**, por padrão, pela integração com
  terminal — salvo instrução em contrário do responsável do projeto.
- **Design visual/UX:** sem recomendação padrão registrada ainda.

## 8. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §28 para a missão de
simplificação documental desta sessão, §27 para o bloqueio de PostgreSQL
no Go-Live). Leitura obrigatória antes de alterar código: ver CLAUDE.md
§Documentos oficiais.

Estado: sessão anterior foi inteiramente sobre documentação (auditoria dos
102 .md do projeto + plano executivo + Fase 1 parcial: 8 arquivos de
planejamento pré-código arquivados em docs/archive/planejamento-pre-codigo/,
commits 08366b4 e e9574ed). Nenhum código foi tocado. A frente de Go-Live
(PostgreSQL indisponível na Locaweb, SSH pendente) segue exatamente como
estava, sem novidade.

Tarefa desta sessão: decidir entre (A) continuar a simplificação
documental — Fase 2 (3 remoções já validadas, baixo risco), Fase 1 restante
(mais 5 arquivamentos), ou Fase 3 (2 consolidações, uma delas com decisão
pendente sobre promover docs/design/stitch-export/DESIGN.md a fonte oficial
de tokens) — ver docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md;
ou (B) retomar o Go-Live: definir estratégia de infraestrutura do
PostgreSQL e/ou habilitar SSH na Locaweb (AUDITORIA_LOCAWEB.md §2.1).

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit; ao arquivar ou
remover documentação, seguir o mesmo rigor desta sessão (validar ausência
de informação exclusiva antes de agir, nunca reduzir só por volume).
```

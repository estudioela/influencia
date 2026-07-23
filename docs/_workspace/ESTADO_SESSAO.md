# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-23
- **HEAD de `feat/ui-design-system-ela`:** `c23c59b`, pushado e sincronizado
  com `origin/feat/ui-design-system-ela`.
- **Branch:** `feat/ui-design-system-ela`.
- **Working tree:** sujo — 6 arquivos `??`, todos intocados por decisão
  explícita de escopo (destino não decidido, ver §4):
  `docs/deployment/CHECKLIST_GO_LIVE.md`,
  `docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md`,
  `docs/release/GATE_FINAL_GO_LIVE.md`,
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`,
  `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`.
- **Sistema em foco:** documentação do repositório (nenhum código tocado
  nesta sessão). `tear-v2-app/` (Laravel 13 + React) segue em fase de
  Homologação Funcional/Go-Live em paralelo, numa trilha distinta.
- **Esta sessão (papel Curador do Repositório — Agente C, missão
  encerrada):** 2 commits documentais, direto em
  `feat/ui-design-system-ela`, já pushados:
  - `ae6f079` — `git mv` de `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`
    para `docs/archive/pagamento-snapshot/`.
  - `c23c59b` — `docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md`
    (nova) + atualização de referências cruzadas (`docs/archive/README.md`,
    `PLANO_MESTRE_ELA_INFLUENCIA.md`, `TASK_ROUTER.md` §28/§39).

## 2. Última sessão concluída — Curadoria documental: decisão P0-2 extraída para ADR-018, plano de congelamento arquivado; missão do Agente C encerrada (2026-07-23)

Continuação de sessão anterior interrompida por limite de contexto, no
papel de Curador do Repositório (Agente C — documentação apenas, sem tocar
`tear-v2-app/` nem `src/`).

1. **Divergência de estado encontrada e registrada** (não corrigida além
   do registro factual, por estar fora do escopo documental desta sessão):
   `ESTADO_SESSAO.md`/`TASK_ROUTER.md` §38 afirmavam PR #66 "ainda não
   mergeado" — `git log` mostrou que já estava mergeado (`99b5f6a`) e havia
   mais um commit à frente (`955bb83`, RF-028 "Histórico da
   Influenciadora") não documentado em nenhuma seção. Correção factual
   anexada ao final de `TASK_ROUTER.md` §38.
2. **Item pendente da Fase 1 do plano de simplificação documental (§28)
   concluído:** `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`
   (decisão de arquitetura P0-2, "congelamento de Participação") tinha um
   pré-requisito não cumprido — extrair a decisão para ADR antes de
   arquivar.
3. **Leitura direta do código** (`ParticipacaoNaCampanha.php`,
   `ParticipacaoController.php`, `routes/api.php`, migration
   `2026_07_20_180000_...`) revelou que a implementação real é **muito
   mais estreita** que o plano propunha: só `congelado_em` + trava de
   edição de 4 campos comerciais. Não existem `congelado_por`,
   `dados_congelados` (cópia do cadastro da Parceira) nem
   `historico_alteracoes_participacao` — o núcleo do problema que o plano
   original resolvia (histórico não deve vazar alteração posterior do
   cadastro vivo da Parceira) **não está coberto** hoje. Achado
   consistente com `docs/reports/RECONCILIACAO_ESPECIFICACAO_FUNCIONAL_MVP.md`
   e com a pendência Categoria C já registrada abaixo (§4).
4. **`ADR-018` criada** documentando o que foi de fato implementado, o gap
   consciente em relação ao plano original, e mantendo o plano completo
   como referência arquivada (útil se o Sprint 3/Contratos precisar da
   garantia de integridade histórica completa).
5. **Arquivamento:** `git mv` do plano para
   `docs/archive/pagamento-snapshot/` (mesmo cluster temático de suas
   próprias fontes) + atualização de todas as referências cruzadas
   mantidas ativas. Verificado por grep: nenhuma referência quebrada
   restante fora de documentos históricos (que não são reescritos por
   convenção).
6. **Explicitamente não executado nesta sessão** (aguardando decisão do
   responsável do projeto — ver §4): os demais itens de Fase 1 (2
   roadmaps superados, `REPOSITORY_GOVERNANCE_AUDIT.md`,
   `RELATORIO_CONSOLIDACAO_AUDITORIAS.md`), Fase 2 (3 remoções diretas já
   validadas), Fase 3 (2 consolidações) e Fase 4 (arquivamento pós-Go-Live)
   do plano executivo de simplificação documental — nenhum tinha
   autorização explícita de execução no escopo desta sessão de
   continuação.
7. **Missão do Agente C encerrada** por instrução explícita do
   responsável do projeto ao final desta sessão — não há mais uma frente
   dedicada de "Curador do Repositório" ativa; qualquer curadoria futura
   deve ser reaberta explicitamente, não retomada por omissão.

## 3. Próxima tarefa recomendada

Não há uma frente de curadoria documental em andamento — a missão do
Agente C foi encerrada nesta sessão (ver §2.7). A próxima sessão deve
retomar a frente de maior prioridade real do projeto, que **não** é
documental:

1. **Reconciliar o estado real da trilha de QA/Homologação** (achado da
   divergência em §2.1): confirmar o que o commit `955bb83` (RF-028
   Histórico da Influenciadora) e o merge do PR #66 mudam no checklist de
   Go-Live, e atualizar `TASK_ROUTER.md`/`ESTADO_SESSAO.md` de fato (não
   só o registro factual feito aqui) — provavelmente retomando de onde a
   sessão de QA (`TASK_ROUTER.md` §37/§38) parou.
2. Decidir com o responsável do projeto o destino dos 6 arquivos `??`
   listados em §1/§4 (3 relatórios de sessões anteriores + 3 documentos
   novos de deployment/release cuja origem não foi rastreada nesta
   sessão, documental).
3. Se/quando a curadoria documental for reaberta: os itens não executados
   de §2.6 (Fases 2/3/4 do plano de simplificação, `TASK_ROUTER.md` §28)
   seguem descritos e prontos para execução, dado autorização explícita.

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Estado desatualizado na trilha de QA/Homologação** (não é bloqueio
  documental, é a pendência mais urgente): confirmar se o PR #66 e o
  commit `955bb83` fecham ou alteram os itens abertos de
  `TASK_ROUTER.md` §37/§38.
- **Destino de 6 arquivos `??` não decidido:**
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`,
  `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md` (herdados de
  sessões anteriores) e `docs/deployment/CHECKLIST_GO_LIVE.md`,
  `docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md`,
  `docs/release/GATE_FINAL_GO_LIVE.md` (apareceram nesta sessão, origem
  não investigada — fora do escopo documental desta continuação).
- **Fases 2/3/4 do plano de simplificação documental** (`TASK_ROUTER.md`
  §28) seguem sem autorização de execução — 2 roadmaps superados,
  `REPOSITORY_GOVERNANCE_AUDIT.md`, `RELATORIO_CONSOLIDACAO_AUDITORIAS.md`
  (Fase 1 restante); 3 remoções diretas (Fase 2); 2 consolidações,
  incluindo decisão sobre fonte oficial de tokens de design (Fase 3);
  arquivamento pós-Go-Live de deployment/release (Fase 4).
- **Congelamento de Participação incompleto frente ao gap real**
  (registrado agora formalmente em `ADR-018`): se algum fluxo do produto
  precisar da garantia de que dado histórico não muda quando o cadastro
  vivo da Parceira muda, isso não está implementado hoje — só descoberto
  e documentado, não corrigido (fora de escopo de uma sessão documental).
- Itens Categoria B/C herdados de `TASK_ROUTER.md` §37/§38 (robustez,
  concorrência, mensagens de erro) — inalterados, não bloqueiam validar o
  produto.
- Itens de infraestrutura/deploy inalterados desde sessões anteriores:
  PostgreSQL indisponível no plano Locaweb, autenticação de deploy
  (ADR-016), DNS de `influencia.estudioela.com`, SPF/DKIM/DMARC não
  verificados, `docs/deployment/GOOGLE_DRIVE_RECOVERY.md` não iniciado.

## 5. Riscos ativos

1. **Descompasso entre a documentação de estado e a realidade do
   repositório** (achado desta sessão) — se sessões futuras confiarem em
   `ESTADO_SESSAO.md`/`TASK_ROUTER.md` sem checar `git log`, podem tomar
   decisões sobre uma premissa errada (ex.: achar que o PR #66 ainda
   precisa ser mergeado). Mitigado parcialmente por esta reescrita, mas a
   causa raiz (sessões paralelas não sincronizando o cockpit) continua.
2. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma (inalterado).
3. Pipeline de deploy com incompatibilidade de autenticação não resolvida
   (inalterado).
4. DNS de `influencia.estudioela.com` não apontado (inalterado).
5. Validação comercial concentrada em piloto único ainda não confirmado;
   bus factor 1 (inalterado).
6. SPF/DKIM/DMARC não verificados no domínio de envio (inalterado, baixo
   risco imediato).

## 6. IA recomendada para a próxima tarefa

- **Reconciliar o estado real da trilha de QA/Homologação (§3.1):**
  **Claude**, mesmo motivo de sempre nesta fase — precisa cruzar
  `git log`, `TASK_ROUTER.md` §37/§38 e o código de `tear-v2-app/` para
  entender o que o commit RF-028 e o merge do PR #66 realmente mudam.
- **Decisão sobre destino dos 6 arquivos `??` (§3.2):** decisão do
  responsável do projeto, não requer IA.
- **Retomada de curadoria documental (se reaberta):** qualquer IA — o
  plano já está descrito em detalhe em `TASK_ROUTER.md` §28 e nos 2
  relatórios `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`/
  `PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`.
- Toda sessão nesta fase de Go-Live segue reportando ao final: Concluído
  / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima prioridade /
  Checklist de Go-Live (convenção registrada em sessões anteriores).

## 7. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel 13+React), fase
de Homologação Funcional/Go-Live, branch feat/ui-design-system-ela. Estado
completo em docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e
docs/_workspace/TASK_ROUTER.md §39 (esta sessão de curadoria), §38/§37
(trilha de QA/Homologação, provavelmente desatualizada).

Estado: feat/ui-design-system-ela em c23c59b, pushado. Sessão anterior foi
de curadoria documental pura (Agente C, missão agora encerrada): extraiu a
decisão de arquitetura do congelamento de Participação (P0-2) para
docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md e arquivou
docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md em
docs/archive/pagamento-snapshot/. Achado importante da ADR: a implementação
real do congelamento é muito mais estreita que o plano original propunha —
só trava de edição via congelado_em, sem cópia de dados da Parceira nem
auditoria. Achado separado, não relacionado à curadoria: PR #66
(fix/pagamento-gate-pago) já estava mergeado (commit 99b5f6a) e há um
commit adicional não documentado (955bb83, RF-028 "Histórico da
Influenciadora") — TASK_ROUTER.md §38 tinha uma correção factual anexada
nesta sessão, mas o conteúdo funcional (o que esses commits realmente
significam para o checklist de Go-Live) não foi investigado.

Tarefa desta sessão: (1) reconciliar o estado real da trilha de
QA/Homologação — o que muda no checklist de Go-Live com PR #66 mergeado e
RF-028 implementado; (2) decidir com o responsável do projeto o destino
dos 6 arquivos `??` (3 relatórios antigos + 3 novos de deployment/release
de origem não rastreada).

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit; reportar ao
final: Concluído / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima
prioridade / Checklist de Go-Live.
```

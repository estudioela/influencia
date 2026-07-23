# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-23
- **HEAD de `feat/ui-design-system-ela`:** `c17b775`, pushado e
  sincronizado com `origin/feat/ui-design-system-ela`.
- **Branch:** `feat/ui-design-system-ela`.
- **Working tree:** limpo, exceto 3 arquivos `??` herdados de sessões
  anteriores de curadoria, destino ainda não decidido (ver §4):
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`,
  `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`.
- **Sistema em foco:** `tear-v2-app/` (Laravel 13 + React) — MVP
  certificado funcionalmente, documentação de Go-Live e curadoria do
  repositório em dia.
- **PR #66 (`fix/pagamento-gate-pago` → `feat/ui-design-system-ela`):
  MERGEADO** (merge commit `99b5f6a`, CI verde) — a correção do único bug
  Categoria A conhecido (gate de material aprovado em Pagamentos, commit
  `4138c04`) está em vigor na branch principal.
- **Suíte revalidada (mais recente, `TASK_ROUTER.md` §41):** backend
  `php artisan test` 208/208 verde, `vendor/bin/pint --test` limpo,
  `tsc -b` (frontend) sem erros, `oxlint` só com aviso pré-existente não
  relacionado (`src/lib/auth.tsx`).
- **Go-Live de produção: NÃO AUTORIZADO**, pendente só de infraestrutura
  externa ao código (ver `docs/release/GATE_FINAL_GO_LIVE.md`).

## 2. Última sessão concluída — Três frentes paralelas fecharam no mesmo ciclo: certificação do MVP, curadoria documental e documentos de Go-Live (2026-07-23)

Três sessões rodaram em paralelo na mesma branch, cada uma retomando um
fio interrompido por limite de uso/contexto, e todas encerraram suas
missões neste ciclo. Histórico completo em `TASK_ROUTER.md` §39 (Agente
C), §40 (Agente B), §41 (Agente A) — aqui só o resumo operacional.

1. **Agente B — QA/Certificação (`TASK_ROUTER.md` §40):** confirmou que o
   PR #66 já estava mergeado (`99b5f6a`) e que a branch tinha avançado
   mais dois commits não documentados (`bb44d20`, consentimento LGPD;
   `955bb83`, Histórico do Portal RF-028). Suíte revalidada sem
   regressão. Produziu `docs/reports/CERTIFICACAO_MVP.md`: **MVP
   funcionalmente certificado** para demonstração a cliente (nenhum
   bloqueador Categoria A em aberto) — distinto da autorização de Go-Live
   de produção. Missão de QA/Homologação/Certificação encerrada.
2. **Agente C — Curadoria documental (`TASK_ROUTER.md` §39):** concluiu o
   único item pendente da Fase 1 do plano de simplificação documental
   (§28) — `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`
   (decisão de arquitetura P0-2) tinha um pré-requisito não cumprido.
   Leitura direta do código revelou que a implementação real do
   congelamento é **bem mais estreita** do que o plano propunha: só
   `congelado_em` + trava de edição de 4 campos comerciais, sem cópia de
   dados da Parceira (`dados_congelados`) nem trilha de auditoria
   (`historico_alteracoes_participacao`) — o gap real ficou documentado
   em `docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md`,
   e o plano original foi arquivado em
   `docs/archive/pagamento-snapshot/`. Referências cruzadas atualizadas
   (`docs/archive/README.md`, `PLANO_MESTRE_ELA_INFLUENCIA.md`). Missão
   do Curador do Repositório encerrada por instrução explícita do
   responsável do projeto.
3. **Agente A — Documentos de Go-Live (`TASK_ROUTER.md` §41):**
   encontrou que `docs/deployment/CHECKLIST_GO_LIVE.md`,
   `docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md` e
   `docs/release/GATE_FINAL_GO_LIVE.md` — já referenciados por §40 e por
   este arquivo como se fizessem parte do repositório — existiam só no
   working tree local, sem nenhum commit no histórico Git. Conteúdo
   revisado sem alteração de mérito e commitado, fechando a lacuna. Gate
   formal registra **GO LIVE: NÃO AUTORIZADO**, pendente só de
   infraestrutura real externa ao código. Missão encerrada.
4. **Reconciliação de merges concorrentes:** as três sessões reescreveram
   `ESTADO_SESSAO.md` de forma independente ao fechar; cada push
   subsequente colidiu com o anterior e precisou de merge manual — esta
   é a versão final consolidada, sem nenhuma das três conclusões
   perdida.

## 3. Próxima tarefa recomendada

Nenhuma das três frentes que fecharam neste ciclo (Certificação,
Curadoria documental, Go-Live docs) tem trabalho pendente por conta
própria. Decisão do responsável do projeto entre:

1. **Autorizar a preparação de infraestrutura de produção** (Locaweb
   real, PostgreSQL, DNS/TLS, `.env` de produção, SMTP em ambiente real)
   — único bloqueio real para o Go-Live, seguindo
   `docs/release/GATE_FINAL_GO_LIVE.md`/`docs/deployment/
   CHECKLIST_GO_LIVE.md`/`docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md`.
   Nenhum bloqueador de código.
2. **Ampliar a auditoria funcional a fluxos secundários** ainda não
   cobertos (Marcas, Medidas) antes de avançar ao Go-Live.
3. Reproduzir manualmente o fluxo de **Login** isolado no navegador
   (baixa prioridade, não bloqueia — auditorias de código não encontraram
   bug).
4. Decidir o destino dos 3 relatórios `docs/reports/*.md` (`??`, ver §4).
5. Se/quando a curadoria documental for reaberta: itens não executados
   do plano de simplificação (`TASK_ROUTER.md` §28, Fases 1 restante/2/3/4)
   seguem prontos para execução, dado autorização explícita.

Ver `docs/reports/CERTIFICACAO_MVP.md`,
`docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md`,
`docs/release/GATE_FINAL_GO_LIVE.md`, `docs/_workspace/TASK_ROUTER.md`
§39-§41 (este ciclo) e §38/§37/§32 (origem).

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Nenhum bloqueador funcional (Categoria A) em aberto** — o único
  identificado (gate de Pagamento) foi corrigido e mergeado.
- **Destino de 3 relatórios `??` não decidido:**
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`,
  `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md` — pendência
  herdada de múltiplas sessões.
- **Fases 1 (restante)/2/3/4 do plano de simplificação documental**
  (`TASK_ROUTER.md` §28) seguem sem autorização de execução: 2 roadmaps
  superados, `REPOSITORY_GOVERNANCE_AUDIT.md`,
  `RELATORIO_CONSOLIDACAO_AUDITORIAS.md` (Fase 1); 3 remoções diretas
  (Fase 2); 2 consolidações, incluindo decisão sobre fonte oficial de
  tokens de design (Fase 3); arquivamento pós-Go-Live de
  deployment/release (Fase 4).
- **Congelamento de Participação incompleto frente ao gap real**
  (formalizado em `ADR-018`): se algum fluxo do produto precisar da
  garantia de que dado histórico não muda quando o cadastro vivo da
  Parceira muda, isso não está implementado hoje.
- **Categoria B (compromete robustez/segurança/concorrência/manutenção,
  não bloqueia a certificação funcional):**
  - `Pagamento.valor` editável mesmo com `status=PAGO`, sem trava nem
    auditoria de quem alterou.
  - Pagamento e cancelamento de Participação não se checam mutuamente.
  - Campanha `ENCERRADA`/`CANCELADA` continua 100% editável.
  - Participação pode ser criada numa Campanha já `ENCERRADA`/`CANCELADA`.
  - `PagamentoController` sem `DB::transaction`/lock (mesma classe de
    race condition já corrigida em `ParceiraController::aprovar`).
  - `StoreParceiraRequest`/`UpdateParceiraRequest` sem unicidade de
    e-mail entre Parceiras.
  - Mensagens de erro genéricas no frontend de Login (429/5xx vs.
    credenciais inválidas).
  - `/login` sem rate-limit por e-mail (só por IP).
  - `CadastroPublicoController::store()` não trata `QueryException` de
    nome duplicado concorrente (TOCTOU).
  - Usuário sem role recebe `AppShell` administrativo completo (sem fluxo
    de produto que crie esse estado hoje).
  - `email` não normalizado (trim) em `StoreParceiraRequest`.
- **Categoria C (pode esperar):**
  - `reenviarConvite` não distingue parceira já ativa de uma que nunca
    definiu senha.
  - Item "Logística" no `AppShell.tsx` é `<PlaceholderPage>` desabilitado
    (Envio só por drill-down de Campanha — funcional, rótulo enganoso).
  - `GESTOR_MARCA` não funcional, validação de Instagram, rótulo "(em
    breve)" na sidebar.
- Validação ponta a ponta dos 2 fluxos de e-mail (convite, reset) com
  SMTP real — não executada.
- SPF/DKIM/DMARC do domínio `elafashionmkt.com.br` não verificados.
- Limite diário de envio do plano Locaweb não levantado.
- `MAIL_FROM_NAME=TEAR` diverge da marca usada no corpo dos e-mails —
  deliberado, não alterar sem decisão do responsável do projeto.
- Recorrência/parcelamento de pagamento não implementado — limitação de
  escopo conhecida, não bug.
- `tear-v2-app/docs/CONFIGURACAO_PRODUCAO.md` linha ~164 — referência a
  "TVs and Limited Input devices" (Google Drive, abandonado) não
  confirmada como corrigida.
- Estrutura fixa vs. dinâmica de pastas do Google Drive — decisão de
  produto pendente.
- `docs/deployment/GOOGLE_DRIVE_RECOVERY.md` — não iniciado.
- Dois OAuth Clients "Web application" órfãos no Cloud Console
  (cosmético).
- Estratégia de infraestrutura do PostgreSQL, autenticação de deploy
  (ADR-016), DNS de `influencia.estudioela.com`, PR #62 vs.
  `worktree-agente-b-deploy-infra` — inalterados (ver
  `docs/release/GATE_FINAL_GO_LIVE.md`/`docs/deployment/
  CHECKLIST_GO_LIVE.md` para o gate completo de infra).

## 5. Riscos ativos

1. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma (inalterado).
2. Pipeline de deploy com incompatibilidade de autenticação não resolvida
   (inalterado).
3. DNS de `influencia.estudioela.com` não apontado (inalterado).
4. Validação comercial concentrada em piloto único ainda não confirmado;
   bus factor 1 (inalterado).
5. SPF/DKIM/DMARC não verificados no domínio de envio (inalterado, baixo
   risco imediato).
6. **Mitigado:** gate de material aprovado em Pagamentos (`P0-1`)
   corrigido (`4138c04`) e confirmado em vigor na branch principal
   (merge `99b5f6a`).
7. **Descompasso entre cockpit e realidade do repositório** — três
   sessões neste ciclo só descobriram parte do estado real (PR mergeado,
   commits novos, docs não commitados) por checagem direta de `git
   log`/`git status`, não pelo que este arquivo registrava, e colidiram
   entre si ao reescrevê-lo em paralelo. Mitigado por esta reescrita
   final consolidada; causa raiz (sessões paralelas na mesma branch sem
   sincronizar o cockpit em tempo real) permanece — considerar evitar
   sessões simultâneas na mesma branch, ou reservar explicitamente a
   atualização do cockpit para uma única sessão por vez.

## 6. IA recomendada para a próxima tarefa

- **Decisão de autorizar infraestrutura/Go-Live ou ampliar auditoria:**
  decisão do responsável do projeto, não requer IA.
- **Reprodução manual do fluxo de Login no navegador:** qualquer IA com
  acesso a ferramenta de browser.
- **Continuação da frente de infraestrutura/Go-Live (se autorizado):**
  Claude, mesmo agente que já mantém `docs/deployment/` e
  `docs/release/GATE_FINAL_GO_LIVE.md`.
- **Auditoria de fluxos secundários (Marcas, Medidas), se decidido:**
  Claude, mesmo motivo de sempre (volume de fluxos, cruzamento com
  `docs/specs/`/`docs/PRD.md`).
- **Retomada de curadoria documental (se reaberta):** qualquer IA — plano
  já descrito em `TASK_ROUTER.md` §28 e nos relatórios
  `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`/
  `PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`.
- Toda sessão nesta fase de Go-Live segue reportando ao final: Concluído
  / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima prioridade /
  Checklist de Go-Live.

## 7. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel 13+React), branch
feat/ui-design-system-ela, HEAD c17b775. Estado completo em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e docs/_workspace/
TASK_ROUTER.md §39-§41 (ciclo de fechamento mais recente), §38/§37
(auditorias de origem), §32 (mandato de Certificação do MVP).

Estado: três frentes fecharam em paralelo neste ciclo. (1) QA/Certificação:
PR #66 (gate de Pagamento, bug Categoria A) confirmado mergeado (99b5f6a);
suíte verde (208/208 backend, pint, tsc, oxlint); MVP funcionalmente
certificado para demonstração a cliente em docs/reports/CERTIFICACAO_MVP.md.
(2) Curadoria documental: decisão de arquitetura do congelamento de
Participação (P0-2) extraída para
docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md; plano
original arquivado em docs/archive/pagamento-snapshot/. Achado importante:
a implementação real do congelamento é bem mais estreita que o plano
propunha (só trava de edição, sem cópia de dados da Parceira nem
auditoria). (3) Documentos de Go-Live: CHECKLIST_GO_LIVE.md,
RUNBOOK_DEPLOY_E_ROLLBACK.md e GATE_FINAL_GO_LIVE.md, que existiam só
localmente, foram commitados — gate formal registra GO LIVE: NÃO
AUTORIZADO, pendente só de infraestrutura externa ao código. As três
missões (Agentes A, B, C) encerraram nesta rodada.

Tarefa desta sessão: nenhuma pendente pelas três frentes acima. Próxima
sessão recebe decisão do responsável do projeto entre (1) autorizar
preparação de infraestrutura de produção, (2) ampliar auditoria a fluxos
secundários (Marcas, Medidas), (3) reproduzir manualmente o fluxo de
Login (baixa prioridade), ou (4) decidir destino dos 3 relatórios `??`
pendentes.

Regras: não alterar arquitetura sem ADR; não criar documentação
duplicada; uma frente por vez; validar (testes/lint) antes de commit;
reportar ao final: Concluído / Bloqueadores (Crítico/Alto/Médio/Baixo) /
Próxima prioridade / Checklist de Go-Live.
```

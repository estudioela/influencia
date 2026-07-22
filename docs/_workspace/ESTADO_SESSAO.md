# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.
>
> **Auditorias completas desta sessão:** `docs/reports/AUDITORIA_FINAL_MVP.md`
> (prontidão de MVP — produto vs. implantação, separadas) e
> `docs/reports/GO_LIVE_STATUS.md` (sessão anterior, deploy/infra/segurança,
> ainda válida e referenciada pela primeira). Este arquivo é só o snapshot
> rápido.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `908733a` — commitado e **já pushado** para
  `origin/worktree-agente-b-deploy-infra`. Refletido no PR #65 (aberto,
  base `feat/ui-design-system-ela`). Nesta sessão: nenhum código alterado
  — apenas `CLAUDE.md` (1 commit) e `docs/reports/AUDITORIA_FINAL_MVP.md`
  (criado + 1 revisão, 2 commits).
- **Branch:** `worktree-agente-b-deploy-infra`.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — Go-Live interno,
  seguindo `docs/deployment/PLANO_DE_IMPLANTACAO.md`. Nenhuma etapa do
  plano de implantação avançou nesta sessão (missão era auditoria de
  produto, não deployment).
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — inalterada
  desde a sessão anterior. Bloqueador #4 (banco de dados de produção
  indefinido) segue **aberto**, sem decisão nesta sessão (fora de escopo:
  esta sessão auditou prontidão de produto/MVP, não infraestrutura).
- **Testes:** sem alteração de código nesta sessão, mas **re-executados
  e verificados de forma independente** (não só citados de sessão
  anterior): backend 192/192 verdes, Pint limpo, `tsc -b`/`vite build`
  do frontend limpos, `oxlint` limpo (1 warning não-bloqueante em
  `src/lib/auth.tsx:80`). Confirma que a medição da sessão anterior segue
  válida hoje.

## 2. Última sessão concluída — consolidação de princípios de engenharia + auditoria final de MVP (2026-07-22)

**Parte 1 — Consolidação de guia externo de "vibe coding" em `CLAUDE.md`.**
Recebido um manual externo de diretrizes de engenharia (KISS/DRY/YAGNI,
Separation of Concerns, Feature-Based Folder, fluxo Auditoria→Plano→
Execução→Validação→Commit, regra de melhoria contínua por arquivo) com
pedido explícito de criar uma árvore `docs/ai/00_MANIFESTO.md`…
`08_DECISION_MATRIX.md`. Auditoria prévia mostrou que quase todo o
conteúdo já existia (fluxo e "uma frente por vez" em `CLAUDE.md`/
`PROJECT_GOVERNANCE.md`; Feature-Based Folder já coberto pela ADR-014,
fatias verticais por módulo). Decisão: **não criar a árvore `docs/ai/`**
(evitar duplicar `PROJECT_GOVERNANCE.md` como fonte de governança) e, em
vez disso, consolidar só o que era genuinamente novo direto em
`CLAUDE.md` §Regras de execução — KISS/DRY/YAGNI nomeados explicitamente
e a regra de melhoria contínua ("ao abrir um arquivo, corrigir
inconsistências pequenas nele, sem expandir para refatoração/arquitetura/
regra de negócio"). Commit único `b0112f2`.

**Parte 2 — Auditoria Final de Prontidão do MVP (nova missão dedicada, Agente B).**
Objetivo: responder, de forma tecnicamente imparcial, "o TEAR está
realmente pronto para ser um MVP?" — cobrindo inventário funcional, fluxo
de negócio ponta a ponta, riscos, dívida técnica, MVP score e veredito
GO/NO GO. Método: síntese cruzada de auditorias já existentes
(`GO_LIVE_STATUS.md` 55/100, `AUDITORIA_QUALIDADE_INTERNA_2_ANOS.md`
72/100, `RELATORIO_QA_FUNCIONAL_MVP_TEAR_V2.md`, `ARCHITECTURE_REVIEW_V2_5.md`,
`TASK_ROUTER.md`) **mais verificação independente ao vivo** (reinstalação
de dependências e reexecução da suíte de testes/lint/build do zero nesta
sessão, não só citação da sessão anterior). Nenhuma alteração de código
ou de documentação existente — só o relatório novo.

Achados principais (`docs/reports/AUDITORIA_FINAL_MVP.md`):
- **Escopo esclarecido:** existem dois sistemas no repositório — o
  legado GAS (`src/`, já em produção, 15 SPECs concluídas) e o
  `tear-v2-app` (objeto real desta pergunta de MVP, conforme foco atual
  do projeto).
- **Divergência encontrada e resolvida:** `RELATORIO_QA_FUNCIONAL_MVP_TEAR_V2.md`
  (2026-07-20) registrava 9 de 12 itens do menu lateral como
  `<PlaceholderPage>`. Leitura direta de `App.tsx` nesta sessão confirma
  que isso mudou: hoje só **Logística, Documentos, Histórico e Perfil
  (admin)** continuam como placeholder genuíno — os outros 5 já
  redirecionam para `/campanhas`.
- **Lacuna de fluxo de negócio real:** Histórico (última etapa do fluxo
  Cadastro→…→Histórico) tem 0% de implementação em `tear-v2-app`;
  Documentos (admin) também não foi portado do sistema legado.
- **MVP Score: 6,0/10** (Deploy 4, UX 5, Manutenibilidade 5, Segurança 6,
  Funcionalidade 6, Engenharia 7, Estabilidade 7, Documentação 8).
- **Veredito, refinado a pedido do responsável do projeto em dois eixos
  separados** (sem alterar nenhuma nota): **Prontidão do Produto: GO COM
  RESSALVAS** (núcleo comercial ponta a ponta testado; ressalvas de
  escopo/débito conhecidas e aceitáveis item a item) × **Prontidão de
  Implantação: NO GO** (banco de dados de produção indefinido + 3
  bloqueadores técnicos de deploy — impossibilidade técnica objetiva, não
  risco aceitável). **Veredito combinado para entrega em produção: NO GO**,
  explicitamente por motivo de infraestrutura, não de maturidade de
  produto — nenhum trabalho adicional de feature é necessário para
  destravar o eixo de produto.
- Commits: `01c608b` (relatório inicial) e `908733a` (refinamento dos
  dois eixos), ambos pushados, refletidos no PR #65.

## 3. Próxima tarefa recomendada

1. **Decidir a infraestrutura de banco de dados de produção** (Bloqueador
   #4, inalterado desde a sessão anterior): upgrade do plano Locaweb,
   PostgreSQL externo/gerenciado, ou outro SGBD — decisão do responsável
   do projeto, condiciona todo o eixo de Implantação.
2. Resolver os 3 bloqueadores técnicos de deploy (`GO_LIVE_STATUS.md`
   §4/§7 e `AUDITORIA_FINAL_MVP.md` ETAPA 3, itens Críticos #2–#4):
   reescrever `restore-db.sh` sem Docker; decidir estratégia de
   autenticação SSH; documentar e validar o apontamento do domínio para
   `current/public`.
3. **Decisão de escopo do responsável do projeto, nova nesta sessão:**
   Histórico e Documentos (admin) entram no recorte de MVP ou ficam para
   pós-MVP? Isso muda a leitura do eixo de Prontidão do Produto
   (`AUDITORIA_FINAL_MVP.md` ETAPA 1/2/6.1).
4. Concluir a validação local do Agente A (pré-requisito de deploy já
   registrado, ainda não investigado por nenhuma auditoria).
5. Só então: aprovação final para Go-Live e execução do primeiro deploy,
   seguindo o checklist de `GO_LIVE_STATUS.md` §8.
6. Item novo, baixa prioridade: `docs/reports/AUDITORIA_QUALIDADE_INTERNA_2_ANOS.md`
   segue **não commitado** (arquivo já existia untracked antes desta
   sessão; não foi alterado nem commitado por este agente, fora do escopo
   da missão de auditoria de MVP) — usado como fonte no novo relatório;
   próxima sessão decide se commita.

## 4. Pendências / bloqueios (decisão do responsável do projeto)

- **Definição do banco de dados de produção** (Bloqueador #4) — plano
  Locaweb I não oferece PostgreSQL. Inalterado desde a sessão anterior.
- Decidir a estratégia de autenticação SSH para deploy (chave vs. senha
  vs. modelo híbrido FTP+SSH) — recomendação já documentada em
  `AUDITORIA_LOCAWEB.md` §5.1.
- Habilitar SSH no painel Locaweb para fechar a validação técnica da
  Etapa 2 do plano de implantação.
- Validar/documentar explicitamente o apontamento do domínio para
  `current/public` no painel Locaweb (Bloqueador #3).
- Conclusão da validação local pelo Agente A (pré-requisito de deploy,
  ainda não investigado por nenhuma auditoria).
- **Novo nesta sessão:** decisão de escopo sobre Histórico e Documentos
  (admin) — entram no MVP ou ficam pós-MVP? (`AUDITORIA_FINAL_MVP.md`
  ETAPA 1/2).
- `docs/reports/AUDITORIA_QUALIDADE_INTERNA_2_ANOS.md` segue untracked,
  aguardando decisão de commit (não é trabalho desta sessão).
- Confirmar host/porta do relay SMTP incluso no plano Locaweb.
- Ok para arquivar `docs/architecture/DATABASE_MODEL.md` e
  `docs/domain/TEAR.md`, e/ou remover os 4 worktrees obsoletos em
  `.claude/worktrees/`? (baixa prioridade, não bloqueia o Go-Live)
- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro
  no INPI.
- Credenciais reais de produção (Google Drive, SMTP) — ainda não
  preenchidas.
- Decisão do que fazer com a branch remota `worktree-spec-mvp-completa`
  (arquivar/apagar) — já integrada via merge, sem urgência técnica.
- Itens "recomendados"/"pós-MVP" das auditorias (`GO_LIVE_STATUS.md`
  §5/§6, `AUDITORIA_FINAL_MVP.md` ETAPA 3/4) aguardam decisão explícita
  item a item (aceitar risco ou corrigir) — não bloqueiam o deploy, mas
  não devem ficar em silêncio.

## 5. Riscos ativos

1. **Banco de dados de produção sem infraestrutura definida** (Bloqueador
   #4) — risco mais fundamental hoje: nenhum item do eixo de Implantação
   é validável de ponta a ponta sem isso.
2. Script de restauração de backup (`restore-db.sh`) quebrado para o
   ambiente real (assume Docker inexistente) — sem disaster recovery
   funcional até corrigido.
3. Estratégia de deploy planejada esbarra na limitação real do painel
   Locaweb (SSH temporário/por senha) — mitigação já documentada,
   aguardando decisão.
4. **Zero testes automatizados no frontend** (confirmado nesta sessão,
   0 arquivos `*.test.*`/`*.spec.*`) — regras de negócio de UI sem rede
   de segurança contra regressão silenciosa.
5. Autorização duplicada em duas estratégias (middleware de rota vs.
   Policy) sem convenção documentada — próxima regra de acesso granular
   exigirá tocar dois lugares sem critério escrito.
6. Validação comercial concentrada em um único piloto ainda não
   confirmado.
7. Bus factor 1 — fundador único operando agência, produto e suporte.
8. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais, mais
`docs/reports/AUDITORIA_FINAL_MVP.md` (novo — veredito de Prontidão do
Produto vs. Prontidão de Implantação) e `docs/reports/GO_LIVE_STATUS.md`
(achados de deploy/infra/segurança, ainda a referência principal desse
eixo) antes de retomar o Bloqueador #4 ou avançar para as Etapas 9–11 do
`PLANO_DE_IMPLANTACAO.md`.

## 7. IA recomendada para a próxima tarefa

- **Execução de engenharia/terminal** (deploy, scripts, provisionamento de
  infra): **ChatGPT**, por padrão, pela integração com terminal — salvo
  instrução em contrário do responsável do projeto.
- **Reconciliação de documentos/planejamento/auditoria:** **Claude**.
- **Design visual/UX:** sem recomendação padrão registrada ainda.

## 8. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md e docs/reports/AUDITORIA_FINAL_MVP.md
(leia primeiro — veredito de Prontidão do Produto vs. Prontidão de
Implantação) e docs/reports/GO_LIVE_STATUS.md (achados de deploy/infra).
Para histórico/decisões de SPEC, docs/_workspace/TASK_ROUTER.md (ver §28
para esta sessão). Leitura obrigatória antes de alterar código: ver
CLAUDE.md §Documentos oficiais.

Tarefa desta sessão: resolver o Bloqueador #4 (definição do banco de dados
de produção — plano Locaweb I não oferece PostgreSQL, decisão de
infraestrutura pendente do responsável do projeto) e os 3 bloqueadores
técnicos de deploy já documentados (restore-db.sh sem Docker; estratégia
de autenticação SSH; apontamento do domínio para current/public).
Adicionalmente, decisão de escopo pendente: Histórico e Documentos (admin)
entram no recorte de MVP ou ficam pós-MVP? Deploy NÃO está autorizado até
os itens de infraestrutura + validação local do Agente A + aprovação
final para Go-Live.

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit; KISS/DRY/YAGNI
nomeados em CLAUDE.md §Regras de execução.
```

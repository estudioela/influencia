# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.
>
> **Auditoria completa desta sessão:** `docs/reports/GO_LIVE_STATUS.md` —
> leia lá o detalhe de achados, evidências (arquivo:linha) e checklist de
> autorização de deploy; este arquivo é só o snapshot rápido.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `73963aa` — commitado e **já pushado** para
  `origin/worktree-agente-b-deploy-infra`. Refletido no PR #65 (aberto,
  base `feat/ui-design-system-ela`). Nenhum arquivo de código foi
  alterado nesta sessão — apenas `docs/reports/GO_LIVE_STATUS.md`
  (criado e depois revisado, 1 commit).
- **Branch:** `worktree-agente-b-deploy-infra`.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — Go-Live interno,
  seguindo `docs/deployment/PLANO_DE_IMPLANTACAO.md`.
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — Etapa 1
  concluída (domínio definitivo travado); Etapa 2 segue **parcialmente
  validada** (auditoria de painel feita; validação via SSH ainda
  pendente). Nesta sessão, uma auditoria independente (Agente B) elevou o
  nível de detalhe sobre os bloqueadores restantes e revelou um novo:
  o plano de hospedagem contratado ("Locaweb I") **não oferece
  PostgreSQL**, confirmado pelo suporte técnico — a decisão de
  infraestrutura de banco de dados de produção está reaberta.
- **Testes:** sem alteração de código nesta sessão (só documentação) —
  última medição conhecida (sessão anterior): backend 192/192 verdes,
  Pint limpo, `tsc -b`/`oxlint`/`vite build` do frontend limpos.

## 2. Última sessão concluída — auditoria de go-live + reconciliação de infraestrutura de banco (2026-07-22)

**Parte 1 — Auditoria completa de prontidão para produção (Agente B, missão dedicada).**
Cinco investigações read-only em paralelo (Laravel core, frontend/build,
API/segurança backend, banco de dados + secrets, deploy + observabilidade),
consolidadas em relatório único. Nenhuma alteração de código em nenhum
momento — auditoria explicitamente read-only, sem implementação.

Achados principais (detalhe completo, com arquivo:linha, em
`docs/reports/GO_LIVE_STATUS.md`):
- **3 bloqueadores técnicos de deploy:**
  1. `tear-v2-app/scripts/restore-db.sh` assume Docker via `docker compose
     exec`, mas a hospedagem Locaweb real não tem Docker — o script de
     restauração falharia justamente durante um incidente real.
  2. Workflow de deploy usa `SSH_PRIVATE_KEY`, mas a Locaweb só autentica
     por senha (achado já conhecido de sessões anteriores, confirmado
     ainda presente no código atual) — decisão de modelo de autenticação
     segue pendente do responsável do projeto.
  3. Nenhum documento de deployment especifica explicitamente apontar o
     domínio no painel Locaweb para `current/public` (e não `current`) —
     se malfeito, expõe `.env`/`vendor`/`storage` publicamente.
- Achados adicionais classificados como **recomendados** (não bloqueiam,
  mas valem correção antes/perto do go-live): `SESSION_SECURE_COOKIE`
  sem default seguro em `config/session.php:172`; ausência de rate
  limiting padrão na API autenticada (Laravel 11+ não aplica
  `throttleApi()` por padrão); ausência de backup imediatamente antes de
  `migrate --force`; ausência de healthcheck pós-deploy/rollback
  automático; ausência de soft deletes em tabelas de negócio (decisão de
  produto pendente); entre outros — lista completa no relatório.
- Diversos achados classificados como **pós-MVP** (fila sem uso real,
  headers de cache ausentes, FKs sem índice explícito, etc.) — também
  no relatório.
- Nota de prontidão inicial: 63/100.

**Parte 2 — Reconciliação de infraestrutura de banco de dados (mesma sessão, a pedido do responsável do projeto).**
Após a auditoria, o suporte técnico da Locaweb confirmou que o plano
contratado ("Hospedagem I") **não oferece PostgreSQL** — informação que
substitui a hipótese anterior (baseada em evidência de painel,
registrada em `docs/deployment/AUDITORIA_LOCAWEB.md`, que indicava
"PostgreSQL disponível, 0/10 usados"). Por instrução explícita do
responsável do projeto:
- Adicionada seção "Estado Atual" no topo de `GO_LIVE_STATUS.md`,
  reconciliando a divergência.
- Adicionado **Bloqueador #4 — banco de dados de produção indefinido**,
  classificado como *infraestrutura externa* (decisão comercial/
  contratual de hospedagem), distinto dos 3 bloqueadores técnicos de
  pipeline/deploy.
- Nota de prontidão revisada: 63 → **55/100** (queda por ser o
  bloqueador mais fundamental — nenhum outro item é validável de ponta
  a ponta sem um banco de produção definido).
- Checklist final de autorização de deploy atualizado para exigir a
  resolução do Bloqueador #4 como pré-requisito.
- Documento revisado por completo para consistência, commitado em
  commit único (`73963aa`, só esse arquivo) e pushado.

**Decisão explícita registrada nesta sessão: deploy NÃO autorizado.**
Uma mensagem do responsável do projeto pediu deploy após o commit; a
resposta anterior, mais específica e detalhada do mesmo responsável, já
condicionava o deploy a três pré-requisitos ainda não atendidos:
(1) definição do banco de produção (Bloqueador #4, ainda aberto),
(2) conclusão da validação local pelo Agente A, (3) aprovação final para
Go-Live. O agente seguiu a instrução mais específica e não executou
nenhum deploy — sinalizou o conflito e pediu confirmação explícita antes
de agir, dado que é uma ação de produção difícil de reverter.

## 3. Próxima tarefa recomendada

1. **Decidir a infraestrutura de banco de dados de produção** (Bloqueador #4):
   upgrade do plano Locaweb, PostgreSQL externo/gerenciado, ou outro
   SGBD — decisão do responsável do projeto, condiciona todo o resto.
2. Resolver os 3 bloqueadores técnicos de deploy (`GO_LIVE_STATUS.md`
   §4/§7): reescrever `restore-db.sh` sem Docker; decidir estratégia de
   autenticação SSH (chave vs. senha vs. híbrido FTP+SSH); documentar e
   validar o apontamento do domínio para `current/public`.
3. Concluir a validação local do Agente A (mencionada como pré-requisito
   de deploy nesta sessão, mas fora do escopo desta auditoria — não
   investigado por este agente).
4. Só então: aprovação final para Go-Live e execução do primeiro deploy,
   seguindo o checklist de `GO_LIVE_STATUS.md` §8.
5. Decisões de baixa prioridade já registradas em sessões anteriores
   (docs órfãos, worktrees obsoletos) seguem sem bloquear o Go-Live.

## 4. Pendências / bloqueios (decisão do responsável do projeto)

- **Definição do banco de dados de produção** (Bloqueador #4, novo nesta
  sessão) — plano Locaweb I não oferece PostgreSQL.
- Decidir a estratégia de autenticação SSH para deploy (chave vs. senha
  vs. modelo híbrido FTP+SSH) — recomendação já documentada em
  `AUDITORIA_LOCAWEB.md` §5.1.
- Habilitar SSH no painel Locaweb para fechar a validação técnica da
  Etapa 2 (php -v, composer, crontab, extensões PHP, conexão ao banco
  que for definido, IP/CIDR do proxy reverso).
- Validar/documentar explicitamente o apontamento do domínio para
  `current/public` no painel Locaweb (Bloqueador #3).
- Conclusão da validação local pelo Agente A (mencionada como
  pré-requisito de deploy; não investigado por esta sessão).
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
- 8 itens "recomendados" e 13 "pós-MVP" da auditoria (`GO_LIVE_STATUS.md`
  §5/§6) aguardam decisão explícita item a item (aceitar risco ou
  corrigir) — não precisam bloquear o deploy, mas não devem ficar em
  silêncio.

## 5. Riscos ativos

1. **Banco de dados de produção sem infraestrutura definida** (novo,
   Bloqueador #4) — risco mais fundamental hoje: nenhum outro
   bloqueador ou item recomendado é validável de ponta a ponta sem isso.
2. Estratégia de deploy planejada (`ARQUITETURA_PRODUCAO.md` §3, symlink
   swap via SSH automatizado) esbarra na limitação real do painel
   Locaweb (SSH temporário/por senha) — recomendação de mitigação já
   documentada (`AUDITORIA_LOCAWEB.md` §5.1), aguardando decisão.
3. Script de restauração de backup (`restore-db.sh`) está quebrado para
   o ambiente real (assume Docker inexistente) — sem disaster recovery
   funcional até corrigido.
4. Validação comercial concentrada em um único piloto ainda não
   confirmado.
5. Bus factor 1 — fundador único operando agência, produto e suporte.
6. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais, mais
`docs/reports/GO_LIVE_STATUS.md` (novo — auditoria completa, achados,
evidências e checklist de deploy) antes de retomar a Etapa 2 ou avançar
para as Etapas 9–11 do `PLANO_DE_IMPLANTACAO.md`.

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
docs/_workspace/ESTADO_SESSAO.md e docs/reports/GO_LIVE_STATUS.md (leia
primeiro) e, para histórico/decisões de SPEC, docs/_workspace/TASK_ROUTER.md
(ver §27 para esta sessão de auditoria). Leitura obrigatória antes de
alterar código: ver CLAUDE.md §Documentos oficiais.

Tarefa desta sessão: resolver o Bloqueador #4 (definição do banco de dados
de produção — plano Locaweb I não oferece PostgreSQL, decisão de
infraestrutura pendente do responsável do projeto) e os 3 bloqueadores
técnicos de deploy já documentados em GO_LIVE_STATUS.md §4/§7 (restore-db.sh
sem Docker; estratégia de autenticação SSH; apontamento do domínio para
current/public). Deploy NÃO está autorizado até esses itens + validação
local do Agente A + aprovação final para Go-Live.

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit.
```

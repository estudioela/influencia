# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `feab0b7` — commitado e já pushado para
  `origin/feat/ui-design-system-ela`. **Nada pendente de commit**: `git
  status`/`git diff` limpos ao final desta sessão.
- **Branch:** `feat/ui-design-system-ela`.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — Go-Live interno,
  seguindo `docs/deployment/PLANO_DE_IMPLANTACAO.md`.
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — Etapa 1
  concluída (domínio `influencia.estudioela.com` travado). Etapa 2: SSH e
  Composer já auditados/resolvidos no host (ver `AUDITORIA_LOCAWEB.md`
  §4.3 e `ADR-016`); resta levantar IP/CIDR do proxy reverso e host/porta
  do SMTP (pendências, §4 abaixo). **Confirmação oficial do suporte
  Locaweb: o plano Hospedagem I não oferece PostgreSQL** — nova pendência
  bloqueante para a Etapa 3 é decidir a estratégia de infraestrutura (§4).
  Ambiente de desenvolvimento local segue validado ponta a ponta (sessão
  anterior) — o que falta para o Go-Live é só infraestrutura remota, não
  código.
- **Testes:** sem alteração de código nesta sessão (só documentação) —
  última medição conhecida (sessão anterior): backend 192/192 verdes,
  Pint limpo, `tsc -b`/`oxlint`/`vite build` do frontend limpos.

## 2. Última sessão concluída — correção da pendência de PostgreSQL na Locaweb (2026-07-22)

Sessão iniciada com briefing padrão (`/comecar`): estado do repositório
conferido contra `ESTADO_SESSAO.md` (bateu — `HEAD` era `9ecaded`, sem
divergência), com uma observação secundária: o próprio `ESTADO_SESSAO.md`
estava `M` (modificado, não commitado) desde uma sessão anterior — o
conteúdo já era a versão mais atual (documentava a validação completa do
ambiente local), só não tinha sido commitado ainda.

**Instrução do responsável do projeto:** confirmação oficial do suporte
Locaweb de que **o plano Hospedagem I não oferece PostgreSQL** — isso
encerra a divergência que estava registrada como pendência de
"reconciliar" entre `AUDITORIA_LOCAWEB.md` (que afirmava Postgres
disponível, 0/10 bancos) e um relato de bloqueio não investigado a fundo.
A pendência foi substituída por: **definir a estratégia de
infraestrutura** (upgrade para Hospedagem II/III ou PostgreSQL externo).

**Trabalho realizado, em dois commits separados** (por instrução
explícita — "commit exclusivo dessa correção"):
1. `076d7f4` — commitada a reescrita de `ESTADO_SESSAO.md` que já estava
   pendente de uma sessão anterior (documentação da validação completa do
   ambiente local: backend/frontend local rodando, 7 migrations pendentes
   corrigidas, fluxo E2E via Playwright sem bug novo — detalhe já estava
   no arquivo, só não commitado). Isolada num commit próprio para não se
   misturar com a correção do Postgres.
2. `feab0b7` — commit exclusivo da correção da pendência de PostgreSQL:
   atualizado `ESTADO_SESSAO.md` §1, §3, §4, §5, §6 e o prompt de handoff
   (§8) para refletir a indisponibilidade confirmada e a nova pendência de
   decisão de estratégia de infraestrutura.

Ambos os commits pushados para `origin/feat/ui-design-system-ela`.
Registrada também uma entrada correspondente em `TASK_ROUTER.md` §27
(mudança de estado relevante para o histórico de longo prazo: invalida a
premissa de "Postgres confirmado disponível" da auditoria anterior).

**Nenhum código alterado nesta sessão** — só documentação
(`ESTADO_SESSAO.md`, `TASK_ROUTER.md`).

## 3. Próxima tarefa recomendada

1. **Definir a estratégia de infraestrutura para o PostgreSQL** —
   decisão do responsável do projeto entre upgrade para Hospedagem II/III
   da Locaweb ou contratar PostgreSQL externo (ex.: serviço gerenciado).
   Bloqueia a Etapa 3 (criar banco de produção). Ver `AUDITORIA_LOCAWEB.md`
   para os dados de contexto (specs dos planos, custos, etc., a levantar
   se ainda não estiverem lá).
2. **Fechar a validação técnica remota da Etapa 2:** habilitar SSH no
   painel da hospedagem `estudioela.com` para levantar IP/CIDR do proxy
   reverso (`TRUSTED_PROXIES`) e host/porta do relay SMTP — checklist em
   `AUDITORIA_LOCAWEB.md` §2.1 (Composer já resolvido, ver `ADR-016`).
3. Apontar o DNS de `estudioela.com` para a Locaweb (Etapa 4, depende da
   Etapa 2 fechada).
4. Enquanto a infraestrutura não fecha: o ambiente local está validado e
   pronto para qualquer trabalho de feature/bugfix que surgir — não há
   bloqueio de código para isso.

## 4. Pendências / bloqueios (decisão do responsável do projeto)

- **Definir estratégia de infraestrutura (upgrade para Hospedagem
  II/III ou PostgreSQL externo)** — bloqueante para a Etapa 3, suporte da
  Locaweb confirmou que o plano Hospedagem I não oferece PostgreSQL.
- Habilitar SSH no painel Locaweb para levantar IP/CIDR do proxy reverso
  e host/porta do SMTP (não pode ser feito pelo agente).
- Apontar o DNS de `estudioela.com` para a Locaweb (depende da Etapa 2
  fechada).
- Ok para arquivar `docs/architecture/DATABASE_MODEL.md` e
  `docs/domain/TEAR.md`, e/ou remover os 4 worktrees obsoletos em
  `.claude/worktrees/`? (baixa prioridade, não bloqueia o Go-Live)
- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no
  INPI.
- Credenciais reais de produção (Google Drive, SMTP) — ainda não
  preenchidas.
- Decisão do que fazer com a branch remota `worktree-spec-mvp-completa`
  (arquivar/apagar) — já integrada via merge, sem urgência técnica.

## 5. Riscos ativos

1. Estratégia de deploy planejada (`ARQUITETURA_PRODUCAO.md` §3) já foi
   ajustada e implementada (`ADR-016`: Composer só no CI, deploy manual
   via `workflow_dispatch`) para lidar com a limitação real de SSH
   temporário/por senha do plano Locaweb — risco tecnicamente mitigado,
   falta só concluir Etapa 2 remota (IP do proxy, SMTP).
2. **PostgreSQL confirmado indisponível** no plano Hospedagem I da
   Locaweb — decisão de estratégia de infraestrutura ainda pendente, pode
   impactar custo e cronograma do Go-Live (upgrade de plano ou serviço
   externo, ambos com custo adicional não orçado até aqui).
3. Validação comercial concentrada em um único piloto ainda não
   confirmado.
4. Bus factor 1 — fundador único operando agência, produto e suporte.
5. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais. Para retomar a Etapa 2
remota ou a decisão de estratégia de PostgreSQL, ver também
`docs/deployment/AUDITORIA_LOCAWEB.md` (§2.1, §4.3) e
`docs/adrs/ADR-016-composer-no-ci-deploy-manual.md`.

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
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §27 para a confirmação de
indisponibilidade de PostgreSQL na Locaweb). Leitura obrigatória antes de
alterar código: ver CLAUDE.md §Documentos oficiais.

Estado: ambiente de desenvolvimento local validado ponta a ponta. Deploy
depende só de infraestrutura remota, não de código. PostgreSQL confirmado
indisponível no plano Hospedagem I da Locaweb.

Tarefa desta sessão: (1) definir a estratégia de infraestrutura para o
PostgreSQL — decidir entre upgrade para Hospedagem II/III ou PostgreSQL
externo, conforme AUDITORIA_LOCAWEB.md. (2) Etapa 2 remota do
PLANO_DE_IMPLANTACAO.md: habilitar SSH para levantar IP/CIDR do proxy
reverso (TRUSTED_PROXIES) e host/porta do SMTP — checklist em
AUDITORIA_LOCAWEB.md §2.1 (Composer e SSH básico já resolvidos, ADR-016).
(3) Depois disso, apontar DNS (Etapa 4).

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit.
```

# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **⚠ Duas linhas de trabalho divergentes no momento — leia antes de
  continuar:**
  1. `feat/ui-design-system-ela` (branch principal): HEAD `93578f5`
     ("consolida documentacao pos-auditoria Locaweb"), já pushado. Working
     tree limpa na sessão que gerou esse commit.
  2. `agente-b/go-live-runbook` (esta sessão, worktree isolado): HEAD
     `4f0bdcd`, pushado, com **PR #62 aberto (draft) contra
     `feat/ui-design-system-ela`** — **`mergeStateStatus: DIRTY`,
     `mergeable: CONFLICTING`** (confirmado via `gh pr view 62`).
- **Causa:** as duas sessões partiram do mesmo commit-base
  (`8d5f316`/`960d276` em `PLANO_DE_IMPLANTACAO.md`) e, em paralelo,
  corrigiram a mesma contradição (SSH por chave presumido vs. painel
  Locaweb só oferece senha/temporário) com edições sobrepostas nas mesmas
  linhas de `PLANO_DE_IMPLANTACAO.md`, além de ambas reescreverem
  `ESTADO_SESSAO.md` e adicionarem um `TASK_ROUTER.md §25` **com o mesmo
  número, conteúdo diferente**. Nenhuma das duas sessões sabia da outra
  em tempo real.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — Go-Live interno,
  seguindo `docs/deployment/PLANO_DE_IMPLANTACAO.md` (versão de
  `feat/ui-design-system-ela`, `93578f5`, é a mais recente já no branch
  principal).
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — Etapa 1
  concluída (domínio `influencia.estudioela.com` travado); Etapa 2
  parcialmente validada (auditoria de painel feita; validação via SSH
  ainda pendente de ação do responsável do projeto).
- **Testes:** sem alteração de código em nenhuma das duas sessões — só
  documentação. Última medição de código conhecida: backend 192/192
  verdes, Pint limpo, `tsc -b`/`oxlint`/`vite build` do frontend limpos.

## 2. Última sessão concluída — preparação documental do Go-Live via PR (2026-07-22)

Sessão (Agente B, worktree isolado `agente-b/go-live-runbook`) para deixar
a documentação do Go-Live pronta "para o deploy começar imediatamente
quando a auditoria terminar", sem alterar código/arquitetura/deploy. Ver
`docs/_workspace/TASK_ROUTER.md` §26 para o detalhe completo, incluindo a
divergência com `feat/ui-design-system-ela` descrita no §1 acima.

**O que foi entregue (commit `4f0bdcd`, PR #62, ainda não mesclado):**
- Nova seção `## 3. GO/NO-GO — critérios de decisão do dia do deploy` em
  `PLANO_DE_IMPLANTACAO.md` (ANTES/DURANTE/DEPOIS + critérios de GO/ABORT
  para o dia do corte) — **conteúdo não duplicado em `93578f5`**, ainda
  vale a pena reconciliar.
- Bloqueio ⚠ nas Etapas 9/11 reconciliando-as com o achado da auditoria
  Locaweb (SSH por senha/temporário, "Git" = FTP) — **sobreposto** com
  correção equivalente já feita em `93578f5` (redação diferente, mesmo
  achado).
- 4 referências quebradas a `CONTRATO_SOBERANO.md` corrigidas (arquivo
  real está em `docs/history/`, não na raiz) — **não duplicado em
  `93578f5`**, ainda vale a pena reconciliar.
- Novo `docs/governance/INVENTARIO_DOCUMENTAL.md` — status
  ativo/legado/redundante de toda a documentação de deployment/release —
  **não duplicado em `93578f5`**, ainda vale a pena reconciliar.
- **Decisão explícita de escopo desta sessão:** não foram criados os dois
  arquivos novos originalmente pedidos (`GO_LIVE_RUNBOOK.md`/
  `GO_NO_GO_CHECKLIST.md`) — complementar o existente, não duplicar
  (mesmo princípio que a sessão paralela também seguiu).

**O que a sessão paralela em `feat/ui-design-system-ela` entregou
(commit `93578f5`, já no branch principal, não em PR) e que esta sessão
não tinha:** correção de referência de etapa errada ("Etapa 6" → "Etapas
9–11") em múltiplos documentos, placeholder de domínio desatualizado em
`IMPLEMENTACAO_TECNICA.md`, link quebrado em `MONITORING.md`, checklist
técnico Laravel/React × infra real em `AUDITORIA_LOCAWEB.md` §2.1,
recomendação de estratégia de deploy híbrida (FTP + SSH pontual) em
`AUDITORIA_LOCAWEB.md` §5.1.

## 3. Sessão anterior — auditoria do painel Locaweb (2026-07-22)

Auditoria read-only completa do painel Locaweb (Central do Cliente +
Painel de Hospedagens), gerando `docs/deployment/AUDITORIA_LOCAWEB.md`.
Achados principais (ambos ainda válidos, não alterados por nenhuma sessão
posterior): conta Locaweb com **duas hospedagens Linux ativas**
(`elafashionmkt.com.br` e `estudioela.com`, esta última é o alvo do
TEAR, mesmo plano, sem custo adicional); PHP 8.3/PostgreSQL/Crontab
confirmados disponíveis; DNS de `estudioela.com` ainda não apontado; e o
achado crítico que gerou toda a divergência do §1/§2 acima — **SSH vem
desabilitado por padrão, por senha (não por chave), sessão de 3h**, e
"Publicar via Git" do painel é só upload FTP, não deploy real. Detalhe
completo em `docs/_workspace/TASK_ROUTER.md` §24.

## 4. Próxima tarefa recomendada

**Prioridade 1 (novo, bloqueia tudo abaixo): reconciliar PR #62 com
`feat/ui-design-system-ela`.** O responsável do projeto (ou uma sessão
com plena visão das duas linhas de trabalho) precisa decidir como
proceder — não é uma decisão que este agente deve tomar sozinho, dado que
envolve escolher redação entre dois textos que descrevem o mesmo achado
de forma diferente. Opções, sem recomendação forçada:
- Rebase/merge manual do PR #62 sobre `93578f5`, mantendo só o conteúdo
  não sobreposto (GO/NO-GO, fixes de `CONTRATO_SOBERANO.md`,
  `INVENTARIO_DOCUMENTAL.md`) e descartando a parte redundante do
  bloqueio ⚠ nas Etapas 9/11 (já coberta por `93578f5`).
- Fechar o PR #62 como superado e reaplicar manualmente só as 3 peças de
  valor não duplicado diretamente em `feat/ui-design-system-ela`.
- Outra abordagem, a critério do responsável do projeto.

**Prioridade 2 (inalterada desde a sessão anterior):** fechar a validação
técnica da Etapa 2 de `PLANO_DE_IMPLANTACAO.md` — o responsável do
projeto habilita o SSH no painel da hospedagem `estudioela.com` (ação
manual, válida por 3h) para confirmar via SSH: `php -v`, `which
composer`, `crontab -l`, conexão de teste ao PostgreSQL. Em paralelo,
decidir a estratégia de deploy — a sessão paralela já deixou uma
recomendação concreta em `AUDITORIA_LOCAWEB.md` §5.1 (modelo híbrido
FTP + SSH pontual), pendente de aprovação do responsável do projeto.

## 5. Pendências / bloqueios (decisão do responsável do projeto)

- **Novo:** reconciliar PR #62 (`agente-b/go-live-runbook`) com
  `feat/ui-design-system-ela` — conflito confirmado pelo GitHub
  (`mergeStateStatus: DIRTY`), não resolvido automaticamente.
- Habilitar SSH no painel Locaweb para fechar a validação técnica da
  Etapa 2 (não pode ser feito pelo agente).
- Aprovar (ou não) a recomendação de estratégia de deploy híbrida
  (`AUDITORIA_LOCAWEB.md` §5.1) diante da limitação de SSH
  temporário/por senha e do "Git" ser só FTP.
- Apontar o DNS de `estudioela.com` para a Locaweb (Etapa 4 do plano,
  depende da Etapa 2 estar fechada).
- Levantar o IP/CIDR do proxy reverso da Locaweb para `TRUSTED_PROXIES`
  (achado novo da sessão paralela, `AUDITORIA_LOCAWEB.md` §2.1).
- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no
  INPI.
- Credenciais reais de produção (Google Drive, SMTP) — ainda não
  preenchidas.
- Decisão do que fazer com a branch remota `worktree-spec-mvp-completa`
  (arquivar/apagar) — já integrada via merge, sem urgência técnica.

## 6. Riscos ativos

1. **Novo — duas sessões trabalhando em paralelo sem coordenação
   geraram conflito de merge real em documentação canônica** (este
   registro, §1/§2). Risco de processo, não de produto: sinaliza que
   sessões simultâneas em `docs/deployment/` precisam de handoff mais
   explícito (ex.: verificar `git log origin/<branch>` antes de abrir uma
   nova frente de trabalho no mesmo branch-alvo).
2. Estratégia de deploy planejada (`ARQUITETURA_PRODUCAO.md` §3, symlink
   swap via SSH automatizado) esbarra na limitação real do painel Locaweb
   (SSH temporário/por senha) — mitigado parcialmente por uma
   recomendação concreta (`AUDITORIA_LOCAWEB.md` §5.1), ainda não
   aprovada.
3. Validação comercial concentrada em um único piloto ainda não
   confirmado.
4. Bus factor 1 — fundador único operando agência, produto e suporte.
5. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.

## 7. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais, mais:
- `docs/deployment/AUDITORIA_LOCAWEB.md` (versão `93578f5`, já com
  checklist técnico §2.1 e recomendação de estratégia §5.1).
- `docs/deployment/PLANO_DE_IMPLANTACAO.md` — **ler a versão de
  `feat/ui-design-system-ela` (`93578f5`), não a de `agente-b/go-live-runbook`**,
  até a reconciliação do PR #62 acontecer.
- `docs/governance/INVENTARIO_DOCUMENTAL.md` (só existe no PR #62 por
  enquanto — não mesclado ainda).
- `docs/_workspace/TASK_ROUTER.md` §24, §25 (versão `93578f5`) e §26
  (esta sessão, registra a divergência).

## 8. IA recomendada para a próxima tarefa

- **Execução de engenharia/terminal** (deploy, scripts, provisionamento de
  infra): **ChatGPT**, por padrão, pela integração com terminal — salvo
  instrução em contrário do responsável do projeto.
- **Reconciliação de documentos/planejamento/auditoria:** **Claude**.
- **Design visual/UX:** sem recomendação padrão registrada ainda.

## 9. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §26 para a divergência entre
o PR #62 e feat/ui-design-system-ela, §25 para a consolidação documental
que já está no branch principal, §24 para a auditoria Locaweb). Leitura
obrigatória antes de alterar código: ver CLAUDE.md §Documentos oficiais.

Tarefa desta sessão: PRIORIDADE 1 — reconciliar
https://github.com/estudioela/jescri-migracao/pull/62 (branch
agente-b/go-live-runbook) com feat/ui-design-system-ela (conflito
confirmado, mergeStateStatus DIRTY). O PR tem 3 peças de valor não
duplicadas no branch principal (seção GO/NO-GO em PLANO_DE_IMPLANTACAO.md,
correção das 4 referências a CONTRATO_SOBERANO.md,
docs/governance/INVENTARIO_DOCUMENTAL.md) e 1 peça redundante (bloqueio
nas Etapas 9/11, já coberto por 93578f5 com redação diferente). Decidir
entre rebase manual do PR ou fechar o PR e reaplicar só o conteúdo de
valor diretamente no branch principal.

PRIORIDADE 2 (inalterada): responsável do projeto habilita SSH no painel
Locaweb (hospedagem estudioela.com); validar php -v, composer, crontab -l
e conexão ao PostgreSQL. Aprovar ou ajustar a recomendação de estratégia
de deploy híbrida já deixada em docs/deployment/AUDITORIA_LOCAWEB.md §5.1.

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit; antes de abrir
uma nova frente de trabalho em docs/deployment/, conferir
git log origin/feat/ui-design-system-ela para evitar repetir esta
divergência.
```

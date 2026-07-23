# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-23.
- **`main` (remoto, `origin/main`):** inclui a limpeza estrutural de 6
  rodadas (`feat/ui-design-system-ela`, mesclada — ver `TASK_ROUTER.md`
  §42-§44). Último commit em `origin/main`: `c96d460` (inalterado nesta
  sessão).
- **`main` local segue 1 commit à frente do remoto, nunca pushado**
  (inalterado desde a sessão anterior): `8060e18 docs(governance):
  establish Phase 2 governance model`. Existe também a branch
  `docs/governance-phase2` (local e em `origin`) com o mesmo commit.
  **Não investigado nesta sessão** — fora de escopo da missão. Ver §4.
- **Três branches com PR draft aberta, pendentes de decisão de
  push/merge, sem relação entre si:**
  1. `worktree-fix-dev-env` — **PR #78** — correção do ambiente de
     desenvolvimento local (`composer dev` unificado). Commit mais
     recente `10a8298`, pushado. Nenhuma ação de código pendente, só
     decisão de merge. (Inalterado nesta sessão.)
  2. `docs/ai-constitution-notebooklm` — **PR #79** — `docs/
     AI_CONSTITUTION.md` reescrita como constituição de engenharia +
     reenvio do notebook NotebookLM. Commit mais recente `330ca33`,
     pushado. (Inalterado nesta sessão — a conversa começou nesta
     branch, mas todo trabalho novo foi feito em branch própria, `git
     checkout -b docs/locaweb-infrastructure origin/main`.)
  3. **Nova nesta sessão:** `docs/locaweb-infrastructure` — **PR #80** —
     `docs/deployment/LOCAWEB.md`, inventário de infraestrutura Locaweb
     baseado em 10 prints reais do painel. Commit mais recente
     `cec519d`, pushado.
- **⚠️ Risco novo desta sessão:** PR #79 e PR #80 partiram de bases
  diferentes de `main` e **ambas modificam `ESTADO_SESSAO.md`** (todo
  `/fim` reescreve este arquivo). Vão conflitar no merge, qualquer que
  seja a ordem — resolver mantendo o conteúdo mais recente (o desta
  sessão, que é posterior ao de PR #79) na hora do merge.
- **Working tree desta sessão:** limpo (tudo commitado e pushado).
- **Go-Live de produção: continua NÃO AUTORIZADO.** Nesta sessão ficou
  mais claro *por quê*: ver §2 e §4 — a decisão de banco de dados
  (PostgreSQL vs. MySQL) ficou em aberto com evidência nova de print.

## 2. Última sessão concluída — Auditoria de Go-Live + inventário real da
    infraestrutura Locaweb (2026-07-23)

Sessão sem alteração de código de `tear-v2-app/`. Só investigação e
documentação, em várias frentes sucessivas (mudanças de escopo pedidas
pelo responsável do projeto ao longo da sessão):

1. **Auditoria P0 de bloqueadores de Go-Live** (fork em background,
   sem código): confirmou 2 bloqueadores até então — nenhum canal de
   deploy funcional (zero GitHub Secrets cadastrados, SSH da Locaweb
   incompatível com chave) e ausência de PostgreSQL de produção
   provisionado. **Não gerou arquivo** — só relatório na conversa.
2. **Comparação de plataformas de deploy alternativas** (Railway,
   Render, Fly.io, VPS+Coolify), depois **restrita a MySQL/gratuito**, e
   por fim **descartada pelo responsável do projeto** em favor de usar a
   infraestrutura Locaweb já contratada. **Não gerou arquivo.**
3. **Verificação de ferramentas oficiais da Locaweb** (API, CLI, MCP) —
   nenhuma aplicável ao plano de hospedagem compartilhada contratado.
   **Não gerou arquivo.**
4. **Sequência mínima de deploy** extraída de
   `docs/deployment/PLANO_DE_IMPLANTACAO.md` (documento que já existia,
   17 etapas) para "URL funcional hoje" — recomendação de fazer o
   primeiro deploy manualmente (sem GitHub Actions) dentro de uma única
   janela de SSH de 3h. **Não gerou arquivo** — recomendação ficou só na
   conversa.
5. **Decisão de arquitetura testada e confirmada pelo responsável do
   projeto:** ao ser questionado sobre uma instrução para trocar o
   banco de PostgreSQL para MySQL, o agente identificou que isso
   contradizia `ARQUITETURA_PRODUCAO.md` §2 (status "Aprovada e
   definitiva") e perguntou explicitamente — **o responsável do projeto
   confirmou manter PostgreSQL**, conforme já aprovado.
6. **`docs/deployment/LOCAWEB.md` criado e depois reescrito por
   completo** (único artefato de código desta sessão, PR #80): primeira
   versão a partir de `AUDITORIA_LOCAWEB.md`/`ARQUITETURA_PRODUCAO.md`
   (sem prints); reescrita integral depois que o responsável do projeto
   forneceu 10 prints reais do painel (`docs/infrastructure/assets/`).
7. **Achado crítico dos prints, ainda sem decisão:** todos os 10 prints
   são da hospedagem `elafashionmkt.com.br` — **decisão do responsável
   do projeto (não é divergência):** `elafashionmkt.com.br` é o
   **ambiente inicial** de deploy/homologação/estabilização;
   `estudioela.com` é o **domínio canônico planejado**, migração futura
   por alias, sem mudança de infraestrutura.
8. **Divergência técnica real, registrada e não resolvida:** o wizard
   de banco de dados do painel mostra PostgreSQL como "Nenhum banco de
   dados disponível" em `elafashionmkt.com.br`, enquanto MySQL está
   disponível (0/10 usados). `ARQUITETURA_PRODUCAO.md` §2 e
   `AUDITORIA_LOCAWEB.md` diziam Postgres disponível. A conclusão do
   documento foi redigida de forma neutra a pedido do responsável do
   projeto: separa **fatos observados** (MySQL disponível; PostgreSQL
   não listado no painel desta hospedagem) de **decisão de arquitetura
   pendente** (usar PostgreSQL é escolha do projeto, não limitação
   comprovada da infraestrutura) — sem declarar o deploy "bloqueado".
9. Itens antes "pendentes de validação" que os prints resolveram:
   porta SSH (22), porta FTP (21), existência de Web FTP (gerenciador
   via navegador) e de um scheduler HTTP nativo (Netscheduler, distinto
   do crontab tradicional). Template exato do "Publicar via Git" da
   Locaweb capturado (`locaweb/ftp-deploy@1.0.0`, upload FTP, não é
   deploy real).
10. Detalhe completo: `docs/_workspace/TASK_ROUTER.md` §45.

## 3. Próxima tarefa recomendada

**Decisão do responsável do projeto, não tarefa de código:** resolver a
divergência de banco de dados em `docs/deployment/LOCAWEB.md` (seção
"Divergências encontradas" e "Conclusão desta revisão") — duas opções:

1. **Investigar com o suporte Locaweb** por que PostgreSQL não aparece
   disponível no wizard de `elafashionmkt.com.br` (pode ser só
   habilitação/contato, não impossibilidade técnica) e manter a
   arquitetura aprovada (`ARQUITETURA_PRODUCAO.md` §2).
2. **Revisar a arquitetura para MySQL** (motor já confirmado disponível
   nesta hospedagem) — exigiria novo ADR (`CLAUDE.md`: "não alterar
   arquitetura sem ADR") e ajuste de `.env.production.example`
   (`DB_CONNECTION=pgsql` → `mysql`) e checagem das 28 migrations.

Em paralelo, seguem as pendências já conhecidas de sessões anteriores
(§4): resolver o commit `8060e18` órfão, decidir merge das 3 PRs
abertas (#78, #79, #80 — lembrando do conflito esperado em
`ESTADO_SESSAO.md` entre #79 e #80), e as ~22 fontes legadas no
notebook `tear`.

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Divergência de banco de dados (PostgreSQL vs. MySQL) em
  `elafashionmkt.com.br`** — nova nesta sessão, ver §2/§3.
- **Commit `8060e18` em `main` local, nunca pushado** (`docs/
  governanca/GOVERNANCA_DO_PROJETO.md`) — não investigado nesta sessão,
  inalterado desde a sessão anterior.
- **Merge das PRs #78, #79 e #80** — três branches independentes,
  conflito esperado em `ESTADO_SESSAO.md` entre #79/#80 (ver §1).
- **~22 fontes legadas no notebook `tear`** não removidas (inalterado).
- Itens ainda pendentes de validação em `docs/deployment/LOCAWEB.md`:
  extensões PHP, limite real de bancos (total vs. por motor),
  disponibilidade de MS SQL, existência de crontab nativo (não
  capturado nesta rodada de prints), emissão efetiva de SSL, quota de
  disco/CPU, IP do proxy reverso, host/porta SMTP — todos precisam de
  SSH habilitado para confirmar.
- **12 decisões de negócio pendentes só no histórico do Git**
  (inalterado) — `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`
  §9, recuperável via `git show fe5ccf8`→`3057e79`.
- Congelamento de Participação incompleto frente ao gap real
  (`ADR-018`) — inalterado.
- Validação ponta a ponta dos 2 fluxos de e-mail (convite, reset) com
  SMTP real — não executada (inalterado).
- SPF/DKIM/DMARC do domínio `elafashionmkt.com.br` não verificados
  (inalterado — note que este domínio agora é o ambiente inicial de
  deploy, não só o site da agência, o que aumenta a relevância deste
  item).
- Recorrência/parcelamento de pagamento não implementado — limitação de
  escopo conhecida, não bug (inalterado).
- **Categoria B (não bloqueia certificação funcional, inalterado):**
  `Pagamento.valor` editável mesmo com `status=PAGO` sem auditoria;
  Pagamento e cancelamento de Participação não se checam mutuamente;
  Campanha `ENCERRADA`/`CANCELADA` continua 100% editável; Participação
  pode ser criada em Campanha já encerrada; `PagamentoController` sem
  `DB::transaction`/lock; e-mail sem unicidade entre Parceiras;
  mensagens de erro genéricas no Login; `/login` sem rate-limit por
  e-mail; `CadastroPublicoController::store()` não trata `QueryException`
  de nome duplicado concorrente; usuário sem role recebe `AppShell`
  administrativo completo; `email` não normalizado em
  `StoreParceiraRequest`.

## 5. Riscos ativos

1. **Conflito de merge em `ESTADO_SESSAO.md` entre PR #79 e PR #80**
   (novo, esta sessão) — ambas partiram de bases diferentes de `main` e
   reescreveram o arquivo independentemente. Resolver na hora do merge.
2. **Divergência de histórico entre `main` local e `origin/main`**
   (commit `8060e18` não pushado, inalterado).
3. Decisão de banco de dados em aberto (PostgreSQL vs. MySQL) pode
   atrasar o primeiro deploy se não for resolvida logo — quanto mais
   tempo sem decisão, maior o retrabalho se a resposta for "trocar para
   MySQL" depois de mais avanço em cima da arquitetura Postgres.
4. Três PRs abertas em paralelo (#78, #79, #80) sem decisão de merge —
   risco crescente de conflito com trabalho futuro (agravado pelo
   risco #1).
5. Perda de rastreabilidade de até 11 decisões de negócio pendentes
   (ver §4) — mitigável recuperando o arquivo do histórico do Git.
6. PostgreSQL indisponível no plano atual da Locaweb para
   `elafashionmkt.com.br` — a confirmar se é limitação real ou só falta
   de habilitação (inalterado quanto ao fato, mudou o contexto: antes se
   falava de `estudioela.com`, agora o achado é sobre o ambiente que
   será de fato usado primeiro).
7. DNS de `influencia.estudioela.com` (domínio canônico futuro) ainda
   não apontado — mitigado em parte pelo fato de `elafashionmkt.com.br`
   (ambiente inicial) já ter DNS resolvido, reduzindo a urgência.
8. Validação comercial concentrada em piloto único ainda não
   confirmado; bus factor 1 (inalterado).
9. SPF/DKIM/DMARC não verificados no domínio de envio — relevância maior
   agora que `elafashionmkt.com.br` é o ambiente inicial de deploy.

## 6. IA recomendada para a próxima tarefa

- **Decidir PostgreSQL vs. MySQL / investigar com suporte Locaweb:**
  decisão do responsável do projeto, não requer IA — mas se optar por
  investigar tecnicamente (habilitar SSH e testar), qualquer IA de
  terminal com acesso SSH/`gh` serve.
- **Esclarecer o commit `8060e18`/branch `docs/governance-phase2`:**
  qualquer IA de terminal com `git`/`gh` — tarefa de investigação e
  decisão, não de código.
- **Merge/push das PRs #78, #79, #80:** qualquer IA de terminal com `gh`
  autenticado — atenção ao conflito esperado em `ESTADO_SESSAO.md`.
- Toda sessão nesta fase de Go-Live segue reportando ao final:
  Concluído / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima
  prioridade / Checklist de Go-Live.

## 7. Prompt de handoff

```
Contexto: projeto ELÃ | influência / TEAR (Estúdio Elã). origin/main já
inclui a limpeza estrutural de 6 rodadas (TASK_ROUTER.md §42-§44). ATENÇÃO:
main local está 1 commit à frente de origin/main (8060e18, "Governança Fase
2", nunca pushado, inalterado) — investigar antes de mesclar qualquer PR.

Três PRs draft abertas, independentes entre si, sem código pendente, só
decisão de merge:
- PR #78 (branch worktree-fix-dev-env): composer dev unificado.
- PR #79 (branch docs/ai-constitution-notebooklm): AI_CONSTITUTION.md +
  NotebookLM.
- PR #80 (branch docs/locaweb-infrastructure, nova nesta sessão):
  docs/deployment/LOCAWEB.md, inventário real da infraestrutura Locaweb a
  partir de 10 prints do painel.
⚠️ PR #79 e #80 vão conflitar em ESTADO_SESSAO.md no merge (ambas
reescreveram o arquivo a partir de bases diferentes) — resolver mantendo o
conteúdo mais recente.

Decisão pendente mais importante para o Go-Live: banco de dados. Os prints
mostram PostgreSQL indisponível no wizard de `elafashionmkt.com.br`
(ambiente inicial de deploy, decisão do responsável do projeto — domínio
canônico futuro é estudioela.com, via alias) e MySQL disponível.
ARQUITETURA_PRODUCAO.md §2 elegeu PostgreSQL, decisão reafirmada nesta
sessão quando testada — mas a disponibilidade real na hospedagem que será
usada não está confirmada. Ver docs/deployment/LOCAWEB.md, seção
"Conclusão desta revisão", para o texto neutro já ajustado (fatos vs.
decisão de arquitetura).

Leia antes de começar: docs/_workspace/TASK_ROUTER.md §45 (esta sessão) e
§46 (sessão anterior, numeração histórica do documento).

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar antes de commit; docs/AI_CONSTITUTION.md é
congelada (não editar sem pedido explícito); reportar ao final: Concluído
/ Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima prioridade / Checklist
de Go-Live.
```

## 8. Checklist

### Inventário de infraestrutura Locaweb (esta sessão)

- [x] `docs/deployment/LOCAWEB.md` criado e reescrito com prints reais
      do painel (PR #80, commits `a54f003`/`fb59121`/`cec519d`, pushados)
- [x] Decisão de domínio documentada (elafashionmkt.com.br = inicial,
      estudioela.com = canônico futuro)
- [x] Conclusão neutralizada (fatos vs. decisão de arquitetura) a
      pedido do responsável do projeto
- [ ] Decisão sobre PostgreSQL vs. MySQL na hospedagem real
- [ ] PR #80 mergeada

### Achados de sessões anteriores (inalterados)

- [ ] Esclarecer commit `8060e18` (Governança Fase 2) órfão em `main`
      local / branch `docs/governance-phase2`
- [ ] PR #78 mergeada / commits pushados em `main`
- [ ] PR #79 mergeada
- [ ] Decisão sobre as ~22 fontes legadas remanescentes no notebook

### Fases anunciadas, não iniciadas

- [ ] Reorganização dos repositórios GitHub
- [ ] Infraestrutura de produção / Go-Live (`GATE_FINAL_GO_LIVE.md`)

# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-23.
- **`main`:** já inclui a missão de limpeza estrutural de 6 rodadas
  (`feat/ui-design-system-ela`, mesclada — ver `TASK_ROUTER.md` §42-§44).
  `docs/` tinha 50 arquivos antes desta sessão.
- **Duas branches com PR draft aberta, pendentes de decisão de
  push/merge, sem relação entre si:**
  1. `worktree-fix-dev-env` — **PR #78** — correção do ambiente de
     desenvolvimento local (`composer dev` unificado). Commit mais
     recente `10a8298`, pushado. Nenhuma ação de código pendente, só
     decisão de merge.
  2. `docs/ai-constitution-notebooklm` — **PR #79** — `docs/
     AI_CONSTITUTION.md` novo + reenvio completo do notebook do
     NotebookLM (esta sessão, ver abaixo). Commit `75d5f2e`, pushado.
  Nenhuma das duas branches depende da outra; podem ser mescladas em
  qualquer ordem.
- **Working tree desta sessão:** limpo (tudo commitado e pushado nas
  duas branches acima).
- **Go-Live de produção: continua NÃO AUTORIZADO**, pendente só de
  infraestrutura externa ao código (inalterado — ver
  `docs/release/GATE_FINAL_GO_LIVE.md`).

## 2. Última sessão concluída — Constituição das IAs + base documental no NotebookLM (2026-07-23)

Missão de encerramento de fase, sem alteração de código. Duas frentes,
a segunda mudou de escopo no meio da execução por instrução direta do
responsável do projeto:

1. **`docs/AI_CONSTITUTION.md` criado** — documento institucional
   permanente (não expira, diferente de `ESTADO_SESSAO.md`): papel de
   cada IA no projeto (Claude como execução principal; ChatGPT/Gemini/
   Codex como apoio pontual), princípios de engenharia, regras de
   alteração em código/documentação, critérios para parar e pedir
   decisão humana, como evitar regressão, como economizar tokens entre
   sessões. Complementa `CLAUDE.md` (que continua sendo a config do
   agente neste repositório), não o substitui.
2. **Curadoria do NotebookLM abandonada a meio caminho, por instrução
   explícita e mais recente do responsável do projeto:** o plano
   original previa selecionar só os documentos realmente permanentes
   (excluindo `_workspace/`, rascunhos, checklists operacionais). No
   meio da análise, o responsável do projeto informou que já havia
   apagado manualmente as fontes do notebook `tear` e pediu reenvio de
   **todos** os arquivos, priorizando velocidade sobre curadoria.
   Executado: todos os 49 `.md` de `docs/` (incluindo `_workspace/`)
   enviados em paralelo via `nlm source add`. Notebook resultante: 80
   fontes, sem títulos duplicados. ~22 fontes legadas que sobraram da
   limpeza manual do responsável do projeto não foram tocadas (decisão
   de removê-las é dele — "não apagar dados" sem autorização por item).
3. **`docs/knowledge/.notebook-index.json` reconstruído** para os 5
   arquivos de `docs/knowledge/` (única pasta que
   `scripts/sync-notebook.sh` gerencia de forma incremental), com os
   `source_id` reais pós-upload — evita duplicar essas 5 fontes numa
   próxima execução do script. As outras pastas de `docs/` ficam fora
   do alcance de `sync-notebook.sh`/`clean-notebook.sh` (não foi criada
   automação nova para cobri-las).
4. **Housekeeping da branch `worktree-fix-dev-env` (PR #78):** dois
   arquivos de snapshot de sessão anterior (`ESTADO_SESSAO.md`,
   `TASK_ROUTER.md` §47) estavam commitados no working tree dessa
   branch, documentando a própria correção do dev-env — commitados e
   pushados antes de abrir a branch nova, para não deixar PR #78 com
   mudanças pendentes.
5. Detalhe completo: `docs/_workspace/TASK_ROUTER.md` §45.

## 3. Próxima tarefa recomendada

Nenhuma pendência de código nesta sessão. Decisão do responsável do
projeto entre:

1. **Merge/push das duas PRs abertas** (#78 dev-env, #79 docs/
   NotebookLM) — independentes, sem ordem obrigatória.
2. **Confirmar se as ~22 fontes legadas remanescentes no notebook
   `tear`** (da limpeza manual do responsável do projeto) devem ser
   removidas ou mantidas.
3. **Reorganização dos repositórios GitHub** (fase anunciada em sessão
   anterior, ainda não iniciada — manter só 2 repositórios principais,
   renomear `jescri-migracao` para `portal-ela`, excluir os demais).
4. **Autorizar preparação de infraestrutura de produção** (Locaweb
   real, PostgreSQL, DNS/TLS, `.env` de produção, SMTP) — único
   bloqueio real para o Go-Live, seguindo
   `docs/release/GATE_FINAL_GO_LIVE.md`.

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Merge das PRs #78 e #79** — ver §3.1.
- **~22 fontes legadas no notebook `tear`** não removidas nesta sessão
  — ver §3.2.
- **Nenhum bloqueador funcional (Categoria A) em aberto** no código de
  `tear-v2-app` — inalterado, nenhum código tocado nesta sessão.
- **12 decisões de negócio pendentes que ficaram só no histórico do Git,
  não mais na árvore ativa** (inalterado desde a sessão de limpeza
  estrutural): `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`
  §9 tinha 12 decisões do responsável do projeto ainda em aberto
  (recorrência/parcelamento de pagamento já tem rastreamento próprio
  separado; as outras 11 só são recuperáveis via `git show` no commit
  `fe5ccf8`→`3057e79`). Se alguma for real e ainda não resolvida, vale
  recuperar antes que a memória de qual eram se perca.
- **Congelamento de Participação incompleto frente ao gap real**
  (`ADR-018`): sem cópia de dados da Parceira nem trilha de auditoria
  (inalterado).
- Validação ponta a ponta dos 2 fluxos de e-mail (convite, reset) com
  SMTP real — não executada (inalterado).
- SPF/DKIM/DMARC do domínio `elafashionmkt.com.br` não verificados
  (inalterado).
- Limite diário de envio do plano Locaweb não levantado (inalterado).
- Recorrência/parcelamento de pagamento não implementado — limitação de
  escopo conhecida, não bug (inalterado).
- Estratégia de infraestrutura do PostgreSQL, autenticação de deploy,
  DNS de `influencia.estudioela.com` — inalterados (ver
  `docs/release/GATE_FINAL_GO_LIVE.md`).
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

1. Perda de rastreabilidade de até 11 decisões de negócio pendentes
   (ver §4) — mitigável recuperando o arquivo do histórico do Git, mas
   não feito automaticamente (inalterado).
2. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma (inalterado).
3. Pipeline de deploy com incompatibilidade de autenticação não
   resolvida (inalterado).
4. DNS de `influencia.estudioela.com` não apontado (inalterado).
5. Validação comercial concentrada em piloto único ainda não
   confirmado; bus factor 1 (inalterado).
6. SPF/DKIM/DMARC não verificados no domínio de envio (inalterado,
   baixo risco imediato).
7. Duas PRs abertas em paralelo (#78, #79) sem decisão de merge —
   quanto mais tempo sem mesclar, maior o risco de conflito com
   trabalho futuro em `docs/` ou em `backend/`/`frontend/`.

## 6. IA recomendada para a próxima tarefa

- **Merge/push das PRs #78 e #79:** qualquer IA de terminal com `gh`
  autenticado.
- **Reorganização dos repositórios GitHub:** qualquer IA com escopo
  `delete_repo` no token `gh`; se faltar, entregar os comandos exatos
  em vez de travar a tarefa.
- **Decisão de autorizar infraestrutura/Go-Live:** decisão do
  responsável do projeto, não requer IA.
- Toda sessão nesta fase de Go-Live segue reportando ao final:
  Concluído / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima
  prioridade / Checklist de Go-Live.

## 7. Prompt de handoff

```
Contexto: projeto ELÃ | influência / TEAR (Estúdio Elã). main já inclui a
limpeza estrutural de 6 rodadas (TASK_ROUTER.md §42-§44). Duas PRs draft
abertas, independentes, sem código pendente, só decisão de merge:
- PR #78 (branch worktree-fix-dev-env): composer dev unificado como único
  fluxo de dev local.
- PR #79 (branch docs/ai-constitution-notebooklm): docs/AI_CONSTITUTION.md
  novo (documento institucional permanente, papel de cada IA no projeto) +
  reenvio completo de todos os docs/*.md ao notebook "tear" do NotebookLM
  (a pedido do responsável do projeto, que apagou o notebook manualmente
  no meio da sessão e pediu reenvio total em vez da curadoria seletiva
  originalmente planejada).

Leia antes de começar: docs/_workspace/TASK_ROUTER.md §45 (esta sessão) e
§42-§44 (limpeza estrutural anterior).

Tarefa desta sessão: concluída. Próxima sessão recebe decisão do
responsável do projeto entre (1) merge das duas PRs, (2) confirmar remoção
ou não das ~22 fontes legadas remanescentes no notebook tear, (3)
reorganização dos repositórios GitHub (ainda não iniciada), ou (4)
autorizar infraestrutura de produção/Go-Live.

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar antes de commit; reportar ao final: Concluído
/ Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima prioridade / Checklist
de Go-Live.
```

## 8. Checklist

### AI Constitution + NotebookLM (esta sessão)

- [x] `docs/AI_CONSTITUTION.md` criado
- [x] Todos os `docs/*.md` (49 arquivos) enviados ao notebook `tear`
- [x] `docs/knowledge/.notebook-index.json` reconciliado (5 arquivos)
- [x] PR #79 aberta em draft
- [ ] Decisão sobre as ~22 fontes legadas remanescentes no notebook

### Ambiente de desenvolvimento (sessão anterior, PR #78)

- [x] `composer dev` único comando oficial, validado por navegação real
- [ ] PR #78 mergeada / commits pushados em `main`

### Fases anunciadas, não iniciadas

- [ ] Reorganização dos repositórios GitHub
- [ ] Infraestrutura de produção / Go-Live (`GATE_FINAL_GO_LIVE.md`)

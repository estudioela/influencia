# HANDOFF — Sessão OAuth · 2026-07-18

> Registro definitivo da sessão Tech Lead de 2026-07-18 (Projeto TEAR V2,
> `~/projeto-tear`, branch `feat/adr-013-oauth-code-flow`). Documento gerado
> para memória permanente do projeto (NotebookLM). Sessão conduzida sob o
> mandato de operação autônoma (CLAUDE.md, 2026-07-16).

---

# Objetivo da sessão

Colocar o Portal TEAR totalmente funcional em produção — Prioridade 1 do
mandato. Na prática, a sessão se concentrou em: (1) auditar e corrigir a
integridade do deployment de produção; (2) fechar dívidas de segurança
(RBAC); (3) **diagnosticar e eliminar a causa raiz do erro
`You do not have permission to call UrlFetchApp.fetch` no login OAuth
(ADR-013)** — que era o último bloqueio técnico entre o sistema e usuários
reais; (4) diagnosticar (somente leitura) o fluxo de cadastro/reconhecimento
de usuários pós-login, incluindo a RN-07 (bootstrap do primeiro
Administrador).

# Situação inicial

## Sintomas

- Nenhum login jamais concluído em produção: abas `SESSOES`,
  `SIS_IDENTIDADES` e `BASE_ADMINISTRADORES` da planilha PROD com **zero
  linhas de dados** (leitura via Drive registrada no TASK_ROUTER).
- Último erro observado pela sessão anterior: `400 redirect_uri_mismatch`,
  **antes** do registro das redirect URIs na credencial; reteste pendente.
- Aba temporária `DIAG_ADR013` ainda presente na planilha PROD.

## Erros encontrados (ordem em que surgiram na sessão)

1. Drift de produção: deployment servindo a versão 15, divergente do repo.
2. `git push` rejeitado (branch remoto com commits de sessão paralela).
3. `You do not have permission to call UrlFetchApp.fetch. Required
   permissions: https://www.googleapis.com/auth/script.external_request` —
   primeiro no `/exec` (relato do operador), depois **reproduzido no editor**
   pela função-sonda.
4. `clasp push` reportando "Script is already up to date" ao remover
   arquivo (deleções não propagadas — comportamento do clasp 3.3).
5. Pós-login: "Não encontramos uma conta para elafashionmkt@gmail.com"
   (que se provou comportamento **correto**, não erro).

## Contexto

- Todas as SPECs do roadmap `[x]`; ADR-013 (OAuth 2.0 Authorization Code
  Flow server-side) implementado e revisado 2× sem bugs encontrados.
- 4 Script Properties provisionadas (com 2 erros de digitação já corrigidos
  em sessão anterior: secret na property do client_id; client_id com valor
  de exemplo).
- Redirect URIs `/exec` e `/dev` registradas na credencial OAuth
  "Portal TEAR" (projeto GCP "projeto tear"); projeto Apps Script em
  "GCP: Padrão".
- **Múltiplas sessões de agente rodando em paralelo no mesmo diretório e
  branch** — fato descoberto durante a sessão, com impacto real (ver
  Problemas).

# Linha do tempo cronológica

## Etapa 1 — Recuperação de contexto e baseline

- **Hipótese:** o TASK_ROUTER é a fonte única de estado; memória pode estar
  defasada.
- **Investigação:** leitura de TASK_ROUTER/CLAUDE.md/memórias; `git status`;
  `npm run check`.
- **Evidências:** branch `feat/adr-013-oauth-code-flow` 1 commit à frente;
  suíte 625/625 verde; lint limpo.
- **Decisão:** publicar o commit pendente e auditar produção antes de
  qualquer coisa.
- **Resultado:** push de `a5e1eb5`; baseline verde confirmado.

## Etapa 2 — Auditoria de sincronia produção × repositório (drift v15)

- **Hipótese:** produção poderia ter divergido (TASK_ROUTER falava em v13;
  `clasp deployments` mostrou @15, sem descrição).
- **Investigação:** `clasp pull --versionNumber 15` em diretório isolado +
  `diff -r` contra o repo.
- **Evidências:** v15 ainda continha a rota de diagnóstico `diag-adr013`
  (que deveria ter sido removida) e NÃO continha a guarda RBAC de
  `importarBaseLegada` (IM-03/SPEC-003) nem a ordenação F6 (SPEC-027).
- **Decisão:** ressincronizar produção a partir do HEAD; nunca criar versão
  pelo editor web (regra operacional nova).
- **Resultado:** `clasp push` → versão 16 → `clasp update-deployment` no
  MESMO deploymentId (preserva `/exec` e redirect URIs) → diff de
  verificação: **v16 idêntica ao repo**.

## Etapa 3 — Tentativa de login E2E via navegador do agente

- **Hipótese:** com navegador (Chrome DevTools MCP), o agente completaria o
  login.
- **Investigação:** abertura da URL `/exec` no navegador da sessão MCP.
- **Evidências:** perfil isolado, sem sessão Google → parede de login do
  Google (`access: ANYONE` exige conta Google).
- **Decisão:** princípio adotado (formalizado pelo responsável): **"Se
  depende de um navegador autenticado, o humano faz."** Nenhuma tentativa de
  contornar autenticação.
- **Resultado:** passo E2E delegado ao humano; sessão seguiu com o que era
  concluível por agente.

## Etapa 4 — Dívida de segurança `enviarMaterial`

- **Hipótese (registrada no TASK_ROUTER §11):** rota crua sem chamador em
  UI → candidata a remoção.
- **Investigação:** grep por `enviarMaterial` em `src/ui/`.
- **Evidências:** a premissa estava **errada/desatualizada** —
  `src/ui/entrega.html:132` chama `enviarMaterial` (tela interna de
  operação; a equipe registra material recebido fora do Portal em nome da
  Parceira), e o helper `chamar()` já injeta `dados.token`.
- **Decisão:** em vez de remover (quebraria a tela), aplicar a guarda
  `exigirPapelAdministrador(dados)` — 17ª rota administrativa protegida.
  Dívida documental registrada: a tabela §13 da SPEC-012 marca
  Administrador ❌ para envio de material e precisa de emenda do PO.
- **Resultado:** guarda aplicada + teste RBAC novo; CT-01 e seed do
  financeiro atualizados para autenticar; suíte 626/626 verde.

## Etapa 5 — Colisão com sessão paralela (git)

- **Hipótese:** nenhuma — push rejeitado inesperadamente (ahead 2/behind 2).
- **Investigação:** `git fetch` + inspeção dos commits remotos.
- **Evidências:** outra sessão trabalhava no MESMO branch e diretório:
  `84ee69a` (fix: `login.html` passa a tratar `error=` no callback OAuth) e
  `032e59a` (docs); além de `2ca1ec5` (remoção do HTML órfão
  `cadastro-parceira`) surgido no histórico local sem ser desta sessão.
- **Decisão:** integrar por `git pull --rebase`, resolvendo o conflito em
  `TASK_ROUTER.md` preservando os registros das DUAS sessões.
- **Resultado:** rebase concluído; suíte verde; a sessão paralela havia
  publicado a **versão 18** ("V 5.4"); a guarda de `enviarMaterial` foi
  publicada em seguida como **versão 19** ("V 5.5"), diff verificado.

## Etapa 6 — Dívida documental de `~/Downloads`

- **Investigação:** listagem completa do diretório + busca no repo,
  `CONHECIMENTO/` e `knowledge/`.
- **Evidências:** `WORKFLOW.md`, `DECISOES_BLOQUEANTES.md` e os docs
  03/04/06 **desapareceram** antes de consolidados; conteúdo relevante já
  absorvido pelo TASK_ROUTER (P3–P8 rastreadas por SPEC).
- **Decisão/Resultado:** dívida encerrada como perda documentada no
  TASK_ROUTER §1 (não procurar de novo; consolidar se algum backup
  reaparecer).

## Etapa 7 — Erro `UrlFetchApp.fetch` no `/exec` (missão de causa raiz)

- **Relato do operador:** login OAuth funcionando até o retorno do Google;
  erro novo: "Você não tem permissão para chamar UrlFetchApp.fetch".
- **Investigação (fatos, sem hipóteses):**
  - `appsscript.json`: **nunca declarou `oauthScopes`** (histórico git: só 2
    commits tocaram o arquivo, nenhum com escopos). Local = v19 publicada
    (diff).
  - Chamadores de `UrlFetchApp.fetch`: `AdaptadorOAuthGoogle.js:62` (troca
    do code — primeira chamada de rede do callback), 
    `ValidadorDeTokenGoogle.js:44` (tokeninfo),
    `AdaptadorDeCepBrasilApi.js:24` (perfil/CEP).
  - `UrlFetchApp` entrou no código com o ADR-013; a autorização da conta
    `USER_DEPLOYING` era da era M1 (script só de planilha).
  - Documentação oficial (verificada via fetch das páginas do Google):
    Web App como USER_DEPLOYING *"may not request authorization"* — executa
    com grant antigo e falha; escopo de UrlFetchApp =
    `https://www.googleapis.com/auth/script.external_request`;
    `SpreadsheetApp` = `https://www.googleapis.com/auth/spreadsheets`;
    `ScriptApp.getService().getUrl()` **não** exige escopo; escopos
    explícitos no manifesto são a recomendação para scripts publicados.
- **Decisão:** declarar `oauthScopes` explícitos (conjunto completo e
  mínimo, verificado por grep de todos os serviços GAS usados):
  `spreadsheets` + `script.external_request`.
- **Resultado:** commit `dd6ee1b`; **versão 20** ("V 5.6") publicada no
  mesmo deployment; diff verificado (manifesto com escopos no ar).

## Etapa 8 — Editor não pede autorização (anomalia) e função-sonda

- **Fato novo:** o operador rodou `doGet` no editor e **nenhum prompt de
  autorização apareceu** (o prompt do editor é por conjunto de escopos do
  script, não por função).
- **Decisão:** a pedido do operador, criar sonda temporária
  `TESTE_TEMPORARIO_urlfetch_login`
  (`src/entrypoint/TESTE_TEMPORARIO_AUTORIZACAO.js`) replicando EXATAMENTE
  o trecho que falha: montagem real do adapter (mesmas Script Properties,
  mesma redirect URI) + `trocarCodigoPorIdToken('codigo-falso...')`.
  Enviada **só ao HEAD** (produção intocada na v20); não commitada no git.
- **Resultado da execução (pelo operador):**
  `FALHA: You do not have permission to call UrlFetchApp.fetch. Required
  permissions: https://www.googleapis.com/auth/script.external_request` —
  **sem prompt**. Prova dupla: o runtime LÊ o manifesto (lista o escopo
  como exigido) e o grant da conta está desatualizado, com o editor
  falhando em redisparar o consentimento.

## Etapa 9 — Contraprova pedida pelo operador (remoto × local)

- **Investigação:** `clasp pull` do HEAD em diretório isolado + `diff -rq`
  completo; contagem de manifestos; verificação de scriptId.
- **Evidências:** **zero arquivos diferentes** (exit=0; 110 arquivos src +
  manifesto de cada lado); **um único** `appsscript.json` no servidor;
  scriptId `12AxJsKHEr9GV3y6t0vIgHsghoUKM1hhTEe9j_0QW3fFRzxHcLAhwrhBZ`
  provado o mesmo por 3 evidências independentes (`.clasp.json`; a sonda
  enviada por esse ID apareceu no editor do operador e foi executada por
  ele; screenshot do operador com o ID na URL).
- **Resultado:** ramo "divergência de código/manifesto/projeto" eliminado
  por evidência.

## Etapa 10 — Revogação do grant e resolução

- **Decisão:** revogar o acesso do app em
  `myaccount.google.com/connections` (zera o grant → próximo run exige
  consentimento completo) e reexecutar a sonda.
- **Resultado (operador):** consentimento apareceu, aceito; **login
  funcionou ponta a ponta no `/exec`** — o portal autenticou a conta
  `elafashionmkt@gmail.com` e entrou no fluxo de cadastro. **Incidente
  OAuth encerrado.**

## Etapa 11 — Limpeza da sonda e convergência final de produção

- **Problema:** `rm` da sonda + `clasp push` → "Script is already up to
  date": **clasp 3.3 não propaga deleções** (compara só os arquivos locais
  contra os remotos; extras remotos são ignorados). v21/v22 ainda
  continham a sonda; a numeração de versões mostrou criações intercaladas
  de outra sessão (v21 rotulada "V 5.8", não criada por esta sessão), e a
  sonda chegou a REAPARECER no HEAD entre verificações.
- **Solução:** forçar o envio do fileset completo com byte temporário
  (newline em `src/shared/Include.js` → push → revert → push; nada
  permanente).
- **Resultado:** HEAD limpo verificado → **versão 23** ("V 5.9") criada e
  publicada no deployment → diff de verificação: **v23 sem sonda e
  idêntica ao repo**. Produção convergida.

## Etapa 12 — Diagnóstico do cadastro/reconhecimento (somente leitura)

- Ver seções "Descobertas importantes" e "Estado atual". Conclusão:
  comportamento **correto** — base vazia → `ONBOARDING_REQUERIDO` é o
  desenho da SPEC-035; o destravamento é operacional (RN-07), não de
  código.

# Problemas encontrados

1. **Drift de produção (v15):** versão criada fora da esteira clasp
   (editor web, sem descrição) servindo código com rota de diagnóstico
   morta e sem correções de segurança. Corrigido (v16) + regra operacional.
2. **`enviarMaterial` sem guarda RBAC** e com registro §11 desatualizado
   ("sem chamador" — falso). Corrigido (guarda + teste, v19).
3. **Grant OAuth defasado da conta USER_DEPLOYING** + editor sem re-prompt
   → `UrlFetchApp.fetch` negado. Causa raiz do incidente (ver seção).
4. **clasp 3.3 não propaga deleções no push** ("already up to date") —
   exigiu workaround do byte temporário.
5. **Sessões paralelas no mesmo diretório/branch**: push git rejeitado,
   commits alheios no histórico local, versões Apps Script intercaladas
   (v17/v18/v21 de outra sessão), sonda reaparecendo no HEAD. Convergido
   com rebase + push forçado do fileset; requer disciplina operacional.
6. **Documentos-fonte perdidos** (`~/Downloads`): WORKFLOW,
   DECISOES_BLOQUEANTES, 03/04/06 — encerrados como perda documentada.
7. **Aba `DIAG_ADR013`** segue na planilha PROD (remoção manual pendente).

# Problemas descartados (hipóteses investigadas e eliminadas)

- **Manifesto sem o escopo após a v20** — descartado: pulls de v20/HEAD
  mostraram `script.external_request` presente, byte a byte.
- **Typo na string do escopo** — descartado: string idêntica à exigida na
  própria mensagem de erro.
- **Mais de um `appsscript.json`** — descartado: um único no servidor; a
  cópia local extra está num git worktree de outra sessão, nunca enviada.
- **clasp apontando para script errado / operador editando outro projeto**
  — descartado por 3 evidências independentes (ver Etapa 9).
- **Manifesto não enviado (falta de `clasp push`)** — descartado: o HEAD
  remoto continha o manifesto com escopos.
- **Problema específico do `/exec`** — descartado: a sonda reproduziu o
  erro DENTRO do editor.
- **Erro de client_id/redirect URI/state** — descartado: o fluxo passou por
  todo o OAuth e falhou só na troca do código (esses erros teriam abortado
  antes, na tela do Google).
- **Bug no código do ADR-013** — descartado: duas revisões completas de
  código sem achados + login funcionou sem alteração de código após o
  consentimento.
- **Hipótese de que faltaria escopo para `ScriptApp.getService().getUrl()`**
  — descartada pela referência oficial (método sem exigência de escopo);
  evitou over-declaração no manifesto.
- **`clasp run` como via de diagnóstico** — inviável nesta configuração:
  exige "Google Apps Script API" ligada em
  `script.google.com/home/usersettings` (toggle manual; sessão anterior).

# Alterações realizadas

| Arquivo | Função/trecho | Motivo | Impacto |
|---|---|---|---|
| `src/entrypoint/Portal.js` | `enviarMaterial` | Guarda `exigirPapelAdministrador(dados)` (17ª rota protegida) | Fecha rota antes aberta a qualquer conta Google sem sessão; tela `entrega.html` continua funcionando (já enviava token) |
| `test/portal-entrega.test.js` | CT-01 + teste novo RBAC | CT-01 passou a autenticar; novo teste "sem sessão ADMINISTRADOR, enviarMaterial é recusado" | Cobertura da guarda |
| `test/portal-financeiro.test.js` | seed de entregas | `enviarMaterial` do seed passou a enviar `token: ADMIN_TOKEN` | Suíte verde com a guarda |
| `appsscript.json` | manifesto | **`oauthScopes` explícitos**: `spreadsheets` + `script.external_request` | Correção estrutural do incidente OAuth; consent auditável |
| `docs/_workspace/TASK_ROUTER.md` | §1, SPEC-035, §11 | Registros: drift v15→v16, docs perdidos, correção §11, causa raiz OAuth, publicações v19/v20 | Fonte única de estado atualizada |
| `docs/_workspace/DEPLOY_CHECKLIST.md` | tabela de erros | Linha do drift + hipótese `UrlFetchApp` promovida a CONFIRMADA com causa raiz e correção | Diagnóstico futuro imediato |
| `src/entrypoint/TESTE_TEMPORARIO_AUTORIZACAO.js` | sonda temporária | Reproduzir o trecho exato que falhava | **Criada e removida na mesma sessão**; nunca commitada; ausente da v23 |
| Memória do agente (`~/.claude/.../memory/`) | `tear-sessoes-paralelas.md` (nova), `tear-status-specs...` (atualizada) | Registrar concorrência de sessões e estado real | Sessões futuras não repetem a investigação |

Commits: `908d654` (guarda + drift, rebased), `64ec67f` (v19 registrada),
`1dcad0e` (docs perdidos), `dd6ee1b` (oauthScopes) — todos com push.

# Deploys realizados

Deployment de produção (único, estável): 
`AKfycbwUhR1P7ZQlf9l_gf5PdlXrxwVU4oyefWqO...4g` — **o deploymentId nunca
mudou** (todas as atualizações via `clasp update-deployment`, preservando a
URL `/exec` e as redirect URIs).

| Versão | Rótulo | Criada por | Motivo |
|---|---|---|---|
| 15 | (sem descrição) | fora da esteira (editor web, sessão anterior) | **Drift** — continha `diag-adr013`, sem IM-03/F6 |
| 16 | V 5.3 | esta sessão | Ressincronizar produção = repo |
| 17–18 | V 5.4 (18) | sessão paralela | Fix `error=` no callback do login |
| 19 | V 5.5 | esta sessão | Guarda `enviarMaterial` |
| 20 | V 5.6 | esta sessão | **`oauthScopes` explícitos** |
| 21 | "V 5.8" | intercalada (sessão paralela) | — (continha a sonda) |
| 22 | V 5.7 | esta sessão | Tentativa de remoção da sonda (falhou pelo bug de deleção do clasp) |
| 23 | V 5.9 | esta sessão | **Estado final: limpa, sem sonda, idêntica ao repo — EM PRODUÇÃO** |

Cada deploy desta sessão terminou com o diff de verificação
(`clasp pull --versionNumber N` em diretório isolado × repo).

# Configurações alteradas

- **Manifest (`appsscript.json`):** adicionado `oauthScopes:
  ["https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/script.external_request"]`. Única
  mudança permanente de configuração da sessão.
- **Google Account (ação do operador):** revogação do acesso do app em
  `myaccount.google.com/connections` + novo consentimento completo ao
  reexecutar (os dois escopos). **Foi o que destravou o runtime.**
- **OAuth (credencial GCP):** nenhuma mudança nesta sessão (redirect URIs
  já registradas anteriormente).
- **Script Properties:** nenhuma mudança (as 4 existentes intactas:
  `SPREADSHEET_ID`, `SPREADSHEET_ID_LEGADO`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`).
- **Google Cloud / associação GCP do script:** nenhuma ("GCP: Padrão",
  irrelevante para o fluxo — só as properties são usadas).
- **Apps Script (webapp):** `executeAs: USER_DEPLOYING` / `access: ANYONE`
  inalterados.

# Descobertas importantes

1. **Web App `USER_DEPLOYING` não re-solicita autorização** quando o
   código passa a exigir escopos novos — executa com o grant antigo e
   falha na primeira chamada ao serviço não autorizado (confirmado na doc
   oficial: *"may not request authorization"*). `clasp push`/redeploy não
   repropaga consentimento.
2. **O editor também pode falhar em re-promptar** quando o script já foi
   autorizado antes com um conjunto menor de escopos — executa e nega em
   runtime (anomalia observada e reproduzida pela sonda). A saída
   determinística é **revogar o grant** e rodar de novo.
3. **A mensagem de erro é diagnóstica:** "Required permissions: X" é o
   runtime lendo o manifesto — se o escopo aparece aí, o manifesto está
   correto e o problema é o grant, não a declaração.
4. **clasp 3.3 não propaga deleções** no `push` (compara só arquivos
   locais; extras remotos sobrevivem e o push vira no-op "already up to
   date"). Workaround: alterar 1 byte de qualquer arquivo → push → reverter
   → push.
5. **Sessões paralelas no mesmo diretório/branch são reais neste projeto**
   e afetam git (rejeição/rebase) E Apps Script (versões intercaladas,
   arquivos reaparecendo). Antes de push: `git fetch`; antes de deploy:
   `clasp deployments`; depois de deploy: diff de verificação.
6. **Fluxo de reconhecimento de usuário (SPEC-035):** a chave de
   identidade é o `sub` Google (imutável), não o e-mail; o e-mail só serve
   para candidatura de vinculação de Parceira (`BASE DE DADOS`.`EMAIL`,
   normalizado trim+lowercase, com `SUB_PROVIDER` vazio). "Usuário
   existente" = linha em `SIS_IDENTIDADES` com o mesmo `sub`.
7. **RN-07 (bootstrap) é uma ausência deliberada de código:** nenhum
   caminho cria usuário `ACTIVE`; `Usuario.novo()` é sempre `PENDING`;
   `Usuario.reconstituir()` aceita estado persistido sem recomputar — é o
   que legitima a linha manual `ACTIVE` na aba. Documentação executável em
   `test/portal-usuario.test.js:164` (seed idêntico ao procedimento da
   SPEC).

# Causa raiz

**Erro:** `You do not have permission to call UrlFetchApp.fetch. Required
permissions: https://www.googleapis.com/auth/script.external_request`

**Cadeia causal completa:**

1. O manifesto **nunca declarou `oauthScopes`** — o projeto viveu de
   detecção automática desde o M1, quando só usava `SpreadsheetApp`.
2. A conta `USER_DEPLOYING` autorizou o script **nessa era** — o grant dela
   continha só o necessário de então (planilhas).
3. O ADR-013 introduziu `UrlFetchApp` (troca de código OAuth + tokeninfo).
   O conjunto de escopos exigido cresceu, **mas nada re-solicitou
   consentimento**: Web App `USER_DEPLOYING` não re-prompta (doc oficial), e
   `clasp push`/redeploy não dispara consentimento.
4. Resultado: o runtime, ao chegar em `AdaptadorOAuthGoogle.
   trocarCodigoPorIdToken` → `UrlFetchApp.fetch` (primeira chamada de rede
   do callback), negava por grant insuficiente.

**Por que a presença do scope no manifest (v20) não resolveu sozinha:** o
manifesto define o que o script **exige**; o grant define o que a conta
**concedeu**. Declarar o escopo corrigiu a exigência (e o erro passou a
listá-lo — prova de leitura do manifesto), mas o grant da conta continuou
sendo o antigo, e nem o Web App nem o editor redispararam o consentimento
(anomalia reproduzida pela sonda: execução direta + negação, sem prompt).

**Por que a revogação resolveu definitivamente:** revogar o app em
`myaccount.google.com/connections` **apaga o grant antigo**. Sem grant
nenhum, a execução seguinte no editor não tem como reutilizar autorização
velha — o consentimento completo (planilhas + serviço externo) é exibido
obrigatoriamente. Aceito o consentimento, o grant novo cobre o conjunto
inteiro de escopos declarados, e o Web App (que roda com a autorização
dessa conta) passou a executar `UrlFetchApp.fetch` — login validado ponta a
ponta em produção na sequência, **sem qualquer alteração de código**.

# Evidências

- Erro da sonda no editor (transcrição do operador):
  `FALHA: You do not have permission to call UrlFetchApp.fetch. Required
  permissions: https://www.googleapis.com/auth/script.external_request`
- Diff remoto×local no auge da dúvida: `diff -rq` → **exit=0, zero
  arquivos**; manifesto `IDÊNTICOS`; um único `appsscript.json` no servidor.
- Drift v15: diff mostrou o bloco `diag-adr013` presente e a guarda
  `exigirPapelAdministrador` de `importarBaseLegada` ausente no remoto.
- clasp deleção: `rm` + `clasp push -f` → "Script is already up to date";
  `clasp pull --versionNumber 22` ainda trazia
  `TESTE_TEMPORARIO_AUTORIZACAO.js`; após byte-trick, v23: `sonda: 0`,
  `diff -rq` limpo.
- Doc oficial (Google, verificada na sessão): USER_DEPLOYING *"may not
  request authorization"*; escopo de `UrlFetchApp` =
  `script.external_request`; `Service.getUrl()` sem escopo.
- Base vazia: leitura da planilha PROD via Drive (sessão de 2026-07-18
  anterior, registrada no TASK_ROUTER): `SESSOES`/`SIS_IDENTIDADES`/
  `BASE_ADMINISTRADORES` sem linhas de dados.
- Suíte: 625/625 no início → **626/626 ao fim** (teste RBAC novo); lint
  limpo em todos os commits.

# Estado atual do sistema

## Funciona hoje (verificado)

- **Login OAuth ponta a ponta em produção** (`/exec`): redirect, state
  anti-CSRF, troca de código, validação de token, roteamento pós-login —
  validado pelo operador com conta real.
- Produção = **versão 23 = HEAD do repositório** (`dd6ee1b`), diff
  verificado; deploymentId estável; redirect URIs válidas.
- 17 rotas administrativas com RBAC; fachadas de Portal isoladas por
  Sessão; suíte 626/626; lint limpo.
- Fluxo de reconhecimento: `ONBOARDING_REQUERIDO` correto para conta não
  cadastrada (base vazia) — comportamento de SPEC.

## Ainda falta

1. **Bootstrap RN-07 do primeiro Administrador** (ação manual do
   responsável — ver Próximos passos).
2. **Carga da base legada** (`importarBaseLegada`) — depende do admin.
3. **Remover a aba `DIAG_ADR013`** da planilha PROD (manual).
4. Emenda da tabela §13 da SPEC-012 (envio de material pela equipe) — PO.
5. Pendências de PO herdadas: Q-05, Q-06, Q-09 (LGPD).
6. Homologação funcional completa das 3 jornadas
   (`ROTEIRO_HOMOLOGACAO.md`) com usuários reais.
7. Registro final do encerramento OAuth no TASK_ROUTER (este handoff é o
   registro detalhado; o roteador tem o estado até a v20 — atualizar com
   v23/encerramento na próxima sessão de docs).

# Próximos passos

1. **Bootstrap do 1º Administrador (operador, ~2 min):** completar o
   cadastro como Administrador na tela já exibida (grava `SUB_PROVIDER`
   correto em `SIS_IDENTIDADES` + perfil em `BASE_ADMINISTRADORES`); na
   planilha PROD, mudar `ESTADO_CONTA` dessa linha `PENDING` → `ACTIVE`
   (grafia exata). Entrar de novo → painel admin.
2. Rodar `importarBaseLegada` pelo painel (com sessão admin) — popula
   `BASE DE DADOS`; Influenciadoras passam a ser candidatas a vinculação
   por e-mail.
3. Remover a aba `DIAG_ADR013` da planilha PROD.
4. Homologar as jornadas do `ROTEIRO_HOMOLOGACAO.md`.
5. Atualizar TASK_ROUTER (encerramento OAuth/v23) e emendar SPEC-012 §13
   (PO).
6. Avaliar merge do branch `feat/adr-013-oauth-code-flow` → `main` após
   homologação.

# Lições aprendidas

1. **Todo aumento de escopo exige gestão explícita de consentimento.** Ao
   introduzir um serviço GAS novo (UrlFetchApp, DriveApp etc.):
   (a) declarar o escopo no `oauthScopes` do manifesto; (b) **revogar o
   grant da conta USER_DEPLOYING e re-consentir** (não confiar no
   re-prompt automático — nem no Web App, nem no editor).
2. **"Required permissions: X" no erro = manifesto OK, grant defasado.**
   Não gastar tempo em manifesto/push/scriptId nesse cenário — ir direto à
   revogação.
3. **Publicação só pela esteira:** `clasp push` + `create-version` +
   `update-deployment <id> -V n`, terminando SEMPRE com diff de verificação
   (pull da versão × repo). Nunca criar versão/implantação pelo editor web
   (drift v15 provou o custo).
4. **clasp 3.3 não deleta arquivos remotos** — para remover, forçar o
   fileset com um byte temporário e verificar por pull.
5. **Sonda temporária no HEAD é uma técnica segura de diagnóstico**
   (produção pinada em versão não é afetada) — criar, usar, remover,
   verificar remoção.
6. **Verificar premissas registradas antes de agir** — o "sem chamador em
   UI" do §11 estava errado; um grep de 10 segundos evitou remover uma
   rota em uso.
7. **Sessões paralelas:** `git fetch` antes de push; `clasp deployments`
   antes de deploy; conflitos em TASK_ROUTER se resolvem preservando os
   registros de todas as sessões.
8. **Princípio operacional:** "Se depende de um navegador autenticado, o
   humano faz" — não gastar tokens tentando contornar autenticação Google.

# Observações para futuras sessões

- **Fonte única de estado:** `docs/_workspace/TASK_ROUTER.md` (ler antes de
  tudo). Erros de login conhecidos: tabela em
  `docs/_workspace/DEPLOY_CHECKLIST.md`.
- **Produção:** deploymentId `AKfycbwUhR1P7ZQlf9l_gf5PdlXrxwVU4oyefWwIEg4o
  PUwpeHTqOo-iA6sB7bjnBvq58s0Q4g` (nunca criar deployment novo — as
  redirect URIs da credencial apontam para o `/exec` deste ID). Ao fim
  desta sessão: @23.
- **Identidade:** a chave de usuário é o `sub` Google, não o e-mail. Conta
  do operador nesta homologação: `elafashionmkt@gmail.com` (aguardando
  bootstrap RN-07). O e-mail de Parceira para vinculação vem da coluna
  `EMAIL` da `BASE DE DADOS` (ainda vazia até a importação).
- **Não reimplementar:** RN-07 não é feature faltante — é procedimento
  manual por design (SPEC-035 §6); `completarCadastro` criar PENDING não é
  bug.
- **`ERR_AUTH_STATE_INVALIDO` em reload da URL de callback é comportamento
  esperado** (state de consumo único, TTL 600s).
- **IDs de planilhas não são versionados** (governança §3.5/§3.6) —
  localizar via Drive: "[PROD] TEAR - Base Operacional" (nova) e
  "[ELÃ] TEAR" (legada, ADR-010).
- **Ferramentas do agente:** navegador MCP não tem sessão Google (login E2E
  = humano); `clasp run` exige toggle manual da "Google Apps Script API"
  em `script.google.com/home/usersettings` (ainda não confirmado ligado).
- **Memórias persistentes do agente atualizadas:** `tear-sessoes-paralelas`
  (concorrência), `tear-status-specs-2026-07-16` (estado). O snapshot de
  status menciona "produção v19" — este handoff é mais recente: **v23**.
- Este documento vive em `knowledge/sessions/` (base versionada do
  NotebookLM; sincronização via `scripts/sync-notebook.sh` — **não
  executada nesta sessão**, a pedido do responsável).

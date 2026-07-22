# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `c3763df` — **1 commit à frente de `origin/feat/ui-design-system-ela`,
  ainda não pushado** (`chore: ignore local secrets directory`, commit do
  próprio responsável do projeto, adiciona `.secrets/` ao `.gitignore`).
- **Branch:** `feat/ui-design-system-ela`.
- **Working tree: mudanças acumuladas e propositalmente NÃO commitadas**,
  por instrução explícita do responsável do projeto ("acumule todas as
  mudanças pendentes e faça um único commit quando o fluxo OAuth estiver
  completamente validado"). São elas:
  - `tear-v2-app/backend/app/Services/GoogleDriveService.php` — remove a
    dependência de Shared Drive (`corpora=drive`/`driveId`); adiciona
    `getFile()`/`downloadFile()`/`deleteFile()`; `accessToken()` passa a
    público.
  - Novo `tear-v2-app/backend/app/Console/Commands/TestGoogleDriveConfiguracao.php`
    (`php artisan google-drive:test`) + teste dedicado
    `tests/Feature/TestGoogleDriveConfiguracaoCommandTest.php`.
  - `.env`, `.env.example`, `.env.production.example` — `GOOGLE_DRIVE_ROOT_FOLDER_ID`/
    `_BACKUP_FOLDER_ID` já com os valores reais entregues pelo responsável
    do projeto; `_CLIENT_ID`/`_CLIENT_SECRET`/`_REFRESH_TOKEN` ainda vazios.
  - Correções textuais (Shared Drive/Workspace/Service Account → pasta
    comum/conta pessoal/OAuth) em `ARQUITETURA_PRODUCAO.md`,
    `AUDITORIA_LOCAWEB.md`, `IMPLEMENTACAO_TECNICA.md`,
    `PLANO_DE_IMPLANTACAO.md`, `PLANO_IMPLEMENTACAO.md`,
    `CONFIGURACAO_PRODUCAO.md`, `DEPLOY.md`.
  - `docs/_workspace/TASK_ROUTER.md` §34 (registro desta sessão).
  - Os mesmos 3 arquivos `??` de sessões anteriores seguem intocados
    (mantidos assim por instrução explícita, sessões passadas):
    `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
    `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`,
    `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React), fase Go-Live.
  Sessão inteira dedicada a destravar a Prioridade 1 do checklist:
  autenticação do Google Drive.
- **Testes:** suíte completa do backend 202/202 verde, Pint limpo —
  validado após todas as mudanças de código desta sessão (`GoogleDriveService`,
  novo comando `google-drive:test`, fixtures de teste ajustadas).

## 2. Última sessão concluída — Google Drive sem Service Account, sem Workspace, sem Shared Drive (2026-07-22)

Sessão de continuação da anterior (auditoria funcional + mudança de fase
para Go-Live, `TASK_ROUTER.md` §32). Nesta sessão, só a frente de Google
Drive foi trabalhada, em três voltas:

1. **Volta 1 — troca de Service Account Key por OAuth (`ADR-017`,
   commit `20fe0dd`, já pushado):** ao tentar executar a Etapa 5 do
   Go-Live, o responsável do projeto encontrou a Org Policy
   `iam.disableServiceAccountKeyCreation` habilitada em
   `elafashionmkt-org`, bloqueando a chave JSON que `GoogleDriveService`
   exigia. Decisão (ADR-017): trocar por OAuth 2.0 de conta dedicada
   (`refresh_token`), obtido via Device Authorization Grant (RFC 8628) —
   novo comando `php artisan google-drive:obter-refresh-token`. Testes
   ajustados, suíte verde, commit pushado.
2. **Volta 2 — correção: não há Google Workspace (não commitado ainda):**
   o responsável do projeto esclareceu que o projeto usa conta **pessoal**
   (`elafashionmkt@gmail.com`), não Workspace. Isso revelou um segundo
   problema, independente do primeiro: `GoogleDriveService::ensureFolder()`
   usava `corpora=drive`+`driveId`, parâmetros que só funcionam contra um
   **Shared Drive** — recurso exclusivo de Workspace, indisponível numa
   conta pessoal. Corrigido: parâmetros removidos, o serviço passa a
   operar contra uma pasta comum no Meu Drive da conta dedicada. Nesta
   mesma volta, a pedido do responsável do projeto, foi criado o comando
   `php artisan google-drive:test` (valida em 8 etapas — variáveis de
   ambiente, access token, acesso à pasta ROOT, existência/criação da
   pasta BACKUP, permissão de escrita, upload, leitura, exclusão — com
   relatório de sucesso/falha por etapa), e uma varredura ampla de
   documentação substituiu menções a Shared Drive/Service Account/Workspace
   pela realidade atual em `ARQUITETURA_PRODUCAO.md`, `AUDITORIA_LOCAWEB.md`,
   `IMPLEMENTACAO_TECNICA.md`, `PLANO_DE_IMPLANTACAO.md`,
   `PLANO_IMPLEMENTACAO.md`, `CONFIGURACAO_PRODUCAO.md`, `DEPLOY.md`. O
   responsável do projeto também forneceu os IDs reais das pastas
   (`GOOGLE_DRIVE_ROOT_FOLDER_ID=1uSmA2qt8apAkNP54z9yBChhitYXSw2y4`,
   `GOOGLE_DRIVE_BACKUP_FOLDER_ID=1c_ImyhRDHGox509kRjTJKHkyiIc5zzBE`),
   já preenchidos em `.env`/`.env.example`/`.env.production.example`.
3. **Volta 3 — pivot para "critical path" (interrompido):** o responsável
   do projeto interrompeu a varredura de documentação (ainda incompleta
   em 1-2 arquivos secundários — ver §4) e instruiu foco exclusivo em:
   finalizar `google-drive:obter-refresh-token`, rodar o fluxo OAuth,
   gerar o `refresh_token` real, validar um upload real, confirmar
   sucesso — e só então fazer um único commit consolidando tudo. A
   sessão terminou **bloqueada**: os valores reais de
   `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET` ainda não foram entregues
   (a mensagem do responsável do projeto trazia só placeholders,
   `<Client ID do OAuth>`/`<Client Secret do OAuth>`); sem eles, o
   comando `google-drive:obter-refresh-token` não pode ser executado.

## 3. Próxima tarefa recomendada

**Retomar exatamente do ponto de bloqueio:** pedir ao responsável do
projeto os valores reais de `GOOGLE_DRIVE_CLIENT_ID` e
`GOOGLE_DRIVE_CLIENT_SECRET` (do OAuth Client "TVs and Limited Input
devices" criado no Cloud Console). Assim que chegarem:

1. Rodar `php artisan google-drive:obter-refresh-token --client-id=... --client-secret=...`,
   repassar ao responsável do projeto a URL + código para autorizar no
   navegador logado como `elafashionmkt@gmail.com`.
2. Preencher `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET`/`_REFRESH_TOKEN`
   no `.env` real com o resultado.
3. Rodar `php artisan google-drive:test` — todas as 8 etapas devem
   passar.
4. Validar upload real de um Material em homologação (Etapa 16 do
   `PLANO_DE_IMPLANTACAO.md`).
5. **Só então**, um único commit consolidando toda a mudança acumulada
   desta sessão (código + docs), por instrução explícita do responsável
   do projeto.

**Depois disso** (não antes, por instrução explícita — modo "critical
path" ainda vigente): retomar a varredura de documentação que ficou
incompleta (ver TODO em §4) e decidir a questão pendente da estrutura
fixa de pastas (idem).

**Em paralelo, mesma prioridade do checklist de Go-Live:** SMTP de
produção (Prioridade 2, inalterado desde sessões anteriores).

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Bloqueio ativo:** `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET` reais
  ainda não entregues — impede rodar `google-drive:obter-refresh-token`
  e, por consequência, todo o resto do fluxo (teste, upload real,
  commit).
- **TODO (registrado a pedido do responsável do projeto, "se algo estiver
  pendente, registre apenas um TODO e continue"):** varredura de
  documentação por `GOOGLE_DRIVE_CLIENT_EMAIL`/`_PRIVATE_KEY`/
  `ServiceAccount`/`Google\Auth`/"Shared Drive"/"Workspace" — já
  confirmada limpa no código (`app/`, `config/`, `tests/`); nos docs,
  ainda não verificados neste ciclo: `docs/archive/planejamento-pre-codigo/UX_FLOW.md`
  (provavelmente fora de escopo, arquivo de arquivo histórico) e uma
  conferência final de `ARQUITETURA_PRODUCAO.md`/`IMPLEMENTACAO_TECNICA.md`/
  `PLANO_DE_IMPLANTACAO.md` já editados nesta sessão, mas sem uma
  segunda passada de confirmação. Baixo risco — não bloqueia o fluxo
  funcional.
- **TODO (decisão de produto pendente, não bloqueia):** o responsável do
  projeto pediu uma função que garanta a estrutura fixa
  `ROOT → Materiais/Backup/Temporarios/Contratos/Exportacoes`. A
  estrutura real em produção (`MaterialController`/`PagamentoController`)
  é dinâmica (`ROOT/<Parceira>/<Campanha>/<Tipo|Comprovantes>`) — conflito
  de requisito identificado, ainda não resolvido com o responsável do
  projeto. Não implementado.
- **TODO (não iniciado, deferido explicitamente):** documento
  `docs/deployment/GOOGLE_DRIVE_RECOVERY.md` (novo refresh token, troca
  de conta Google, recriar OAuth Client, migrar Drive de conta,
  checklist de troubleshooting) — pedido pelo responsável do projeto,
  adiado para depois da validação funcional do upload.
- **SMTP de produção** — inalterado, credencial/decisão de provedor
  pendente (Prioridade 2 do checklist de Go-Live).
- Estratégia de infraestrutura do PostgreSQL, autenticação de deploy
  (ADR-016 não resolveu totalmente), DNS de `influencia.estudioela.com`,
  PR #62 vs. `worktree-agente-b-deploy-infra` — todos inalterados desde
  sessões anteriores.
- GESTOR_MARCA não funcional, congelamento não cobre Briefing, validação
  de formato Instagram, rótulo "(em breve)" na sidebar, recorrência de
  pagamento — não bloqueiam o ciclo certificado, inalterados.

## 5. Riscos ativos

1. **Fluxo Google Drive ainda não validado ponta a ponta com credenciais
   reais** — `GoogleDriveService` foi reescrito duas vezes nesta sessão
   (Service Account → OAuth; Shared Drive → pasta comum) sem nenhum
   upload real executado ainda. Só testes com `Http::fake` confirmam o
   comportamento; a validação real (Etapa 16) é o próximo passo crítico
   antes de considerar este bloqueador resolvido.
2. **Mudanças de código e documentação acumuladas sem commit** — por
   instrução explícita, mas representa um volume de trabalho não
   persistido em caso de perda da sessão local. Working tree limpo o
   suficiente para reconstruir (nada destrutivo), mas prioridade é
   fechar o ciclo e commitar assim que o upload real for validado.
3. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma (inalterado).
4. Pipeline de deploy com incompatibilidade de autenticação não resolvida
   (inalterado).
5. DNS de `influencia.estudioela.com` não apontado (inalterado).
6. Validação comercial concentrada em piloto único ainda não confirmado;
   bus factor 1 (inalterado).

**Risco encerrado nesta sessão:** dependência de Google Workspace para
autenticação/armazenamento do Drive — não existe mais; o mecanismo
(OAuth de conta pessoal + pasta comum) é compatível com a configuração
real do projeto, confirmado por análise de código, não por suposição.

## 6. IA recomendada para a próxima tarefa

- **Obtenção dos valores `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET` reais
  e autorização do fluxo OAuth no navegador:** responsável do projeto —
  não é tarefa de IA (exige login humano em `elafashionmkt@gmail.com`).
- **Execução do restante do fluxo assim que os valores chegarem
  (`obter-refresh-token`, `google-drive:test`, upload real, commit
  único):** **ChatGPT** ou **Claude**, indiferente — é um fluxo mecânico
  e curto, já com os comandos prontos; qualquer uma das duas conduz sem
  ambiguidade.
- **Retomada da varredura de documentação e da decisão de estrutura de
  pastas (depois da validação):** **Claude**, mesmo motivo de sessões
  anteriores (auditoria/documentação).
- Toda sessão nesta fase de Go-Live segue reportando ao final: Concluído
  / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima prioridade /
  Checklist de Go-Live (convenção registrada em sessões anteriores).

## 7. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), fase de
Go-Live. Estado e pendências completos em docs/_workspace/ESTADO_SESSAO.md
(leia primeiro) e docs/_workspace/TASK_ROUTER.md §33-§34.

Estado: MVP funcionalmente certificado (sessões anteriores). Bloqueador
ativo desta fase é só de credenciais/infraestrutura, não de lógica de
aplicação. Nesta sessão, a autenticação do Google Drive foi trocada de
Service Account Key (bloqueada por Org Policy em elafashionmkt-org) para
OAuth de conta pessoal dedicada (elafashionmkt@gmail.com, sem Google
Workspace — ADR-017 + adendo), e o código foi corrigido para não mais
depender de Shared Drive (recurso exclusivo de Workspace, indisponível
numa conta pessoal). Um novo comando `php artisan google-drive:test`
valida toda a configuração (env, token, pastas, escrita, upload, leitura,
exclusão) com relatório por etapa. Os IDs reais das pastas já foram
entregues e estão no `.env`: GOOGLE_DRIVE_ROOT_FOLDER_ID e
GOOGLE_DRIVE_BACKUP_FOLDER_ID.

Tarefa desta sessão (retomar do ponto exato de bloqueio): pedir ao
responsável do projeto os valores reais de GOOGLE_DRIVE_CLIENT_ID e
GOOGLE_DRIVE_CLIENT_SECRET (do OAuth Client "TVs and Limited Input
devices" no Cloud Console — a mensagem anterior trazia só placeholders).
Assim que chegarem: rodar `php artisan google-drive:obter-refresh-token`,
repassar a URL+código de autorização ao responsável do projeto, preencher
o .env com o refresh_token resultante, rodar `php artisan google-drive:test`
(todas as 8 etapas devem passar), validar upload real de um Material em
homologação, e só então fazer UM ÚNICO commit consolidando toda a mudança
acumulada desta sessão (instrução explícita do responsável do projeto:
não commitar antes disso).

Depois da validação (não antes): retomar 2 TODOs registrados em
ESTADO_SESSAO.md §4 — varredura final de documentação (poucos arquivos
residuais) e decisão pendente sobre estrutura fixa de pastas
(Materiais/Backup/Temporarios/Contratos/Exportacoes) vs. a estrutura
dinâmica real já em produção (ROOT/<Parceira>/<Campanha>/<Tipo>) — são
requisitos conflitantes, não decidir sozinho, perguntar ao responsável
do projeto.

Regras: não alterar arquitetura sem ADR; não criar documentação
duplicada; uma frente por vez; validar (testes/lint) antes de commit;
reportar ao final: Concluído / Bloqueadores (Crítico/Alto/Médio/Baixo) /
Próxima prioridade / Checklist de Go-Live.
```

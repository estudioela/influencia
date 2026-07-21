# GO_LIVE_CHECKLIST — TEAR V2 (`tear-v2-app`)

Checklist operacional definitivo para o primeiro deploy de produção.
Usar este documento **no dia da infraestrutura definitiva** — cada item é
uma ação a executar e marcar, na ordem em que aparece.

Escopo: `tear-v2-app/` (Laravel 13 + React/Vite). Não cobre o Portal
legado GAS (`src/`).

**Referências (não duplicar aqui, consultar quando precisar de detalhe):**
- `TEAR_V2.5_GO_LIVE_CHECKLIST.md` (raiz) — auditoria completa, por que
  cada item existe, o que foi implementado e o que ficou documentado por
  conflito com trabalho em paralelo.
- `tear-v2-app/docs/DEPLOY.md` — runbook de comandos (deploy, rollback,
  backup).
- `tear-v2-app/docs/MONITORING.md` — o que observar pós-deploy (Pulse,
  logs, filas).

---

## Fase 0 — Decisões humanas (bloqueiam tudo abaixo)

Nenhum item das fases seguintes pode ser executado sem isto definido primeiro.

- [ ] Provedor de hosting escolhido (onde os containers vão rodar)
- [ ] Domínio definido e DNS apontado para o host de produção
- [ ] Estratégia de TLS/HTTPS definida (reverse proxy externo ao
      `docker-compose.yml` — ex.: Caddy, Traefik, ou LB do provedor — o
      `nginx` do compose escuta HTTP puro na porta interna)
- [ ] Instância real de Postgres provisionada (host, porta, usuário,
      senha, database)
- [ ] Decisão sobre Google Drive: usar credenciais reais de service
      account (upload vai para o Drive) ou aceitar fallback de storage
      local para o primeiro go-live (decisão reversível depois)
- [ ] (Opcional) Webhook do Slack para alertas de uptime
      (`SLACK_WEBHOOK_URL` do `scripts/healthcheck.sh`)

---

## Fase 1 — Preparar variáveis de ambiente

- [ ] `cp tear-v2-app/backend/.env.production.example tear-v2-app/backend/.env`
- [ ] Preencher todo campo marcado `CHANGE_ME`, incluindo no mínimo:
  - [ ] `APP_URL` (domínio real, com `https://`)
  - [ ] `FRONTEND_URL`
  - [ ] `SANCTUM_STATEFUL_DOMAINS`
  - [ ] `DB_HOST`/`DB_PORT`/`DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` (Postgres real da Fase 0)
  - [ ] `GOOGLE_DRIVE_*` (se optou por Drive real na Fase 0)
- [ ] Gerar `APP_KEY`:
  `docker compose run --rm app php artisan key:generate --show`
  e colar o valor em `APP_KEY=` no `.env`
- [ ] Confirmar `APP_ENV=production` e `APP_DEBUG=false`

---

## Fase 2 — Primeiro deploy

- [ ] `docker compose up -d --build`
- [ ] Confirmar que o container `app` rodou `migrate --force` no boot sem
      erro (`docker compose logs app`)
- [ ] `docker compose ps` → todos os serviços saudáveis (`app`, `nginx`,
      `frontend`, `db`; `queue` sem healthcheck dedicado, mas deve estar
      `Up` sem reiniciar em loop)

---

## Fase 3 — Provisionar o primeiro Administrador

- [ ] `docker compose exec app php artisan admin:create --name="Nome Completo" --email="admin@dominio.com"`
      (comando idempotente — pode rodar de novo para resetar senha)
- [ ] Login do admin validado na SPA em produção

---

## Fase 4 — Smoke test (validação pós-deploy)

- [ ] `curl -f https://SEU_DOMINIO/up` → 200
- [ ] `curl -f https://SEU_DOMINIO/api/health` → `{"status":"ok",...}`
- [ ] Login funcional na SPA
- [ ] `/pulse` acessível só para usuário ADMIN (testar com usuário não-admin → deve bloquear)
- [ ] Fluxo ponta a ponta mínimo executado manualmente:
  - [ ] Cadastro público de uma influenciadora de teste
  - [ ] Aprovação da influenciadora pelo admin
  - [ ] Criação de campanha/participação de teste
  - [ ] Upload de um Material de teste (confirmar destino: Drive ou storage local, conforme decidido na Fase 0)
  - [ ] Aprovação do Material e avanço de pagamento de teste
- [ ] `TEAR_URL=https://SEU_DOMINIO ./scripts/healthcheck.sh` roda limpo

---

## Fase 5 — Backup

- [ ] `./scripts/backup-db.sh` executado manualmente uma vez com sucesso
- [ ] Agendado via cron do host (não do container):
  ```
  0 3 * * * cd /caminho/para/tear-v2-app && ./scripts/backup-db.sh && find ./backups -name '*.sql.gz' -mtime +14 -delete
  ```
- [ ] Teste de restore validado ao menos uma vez em ambiente não-produtivo (`./scripts/restore-db.sh <arquivo>`)

---

## Fase 6 — Pendências de código conhecidas (aplicar quando liberado)

Estes dois itens são fixes pequenos e já especificados, mas foram
**deliberadamente não aplicados** durante a produtização por conflito
ativo de edição com o Agente A (`worktree-spec-mvp-completa`) nos mesmos
arquivos. Aplicar assim que essa frente mesclar ou abrir uma janela sem
edição concorrente — idealmente antes do primeiro deploy de produção real,
mas não bloqueiam o deploy em si:

- [ ] Rate limiting no `POST /login` (`routes/api.php`):
      `->middleware('throttle:5,1')`
- [ ] Whitelist de mime/extensão no upload de Material
      (`StoreMaterialRequest.php`):
      `'arquivo' => ['required','file','max:51200','mimes:jpg,jpeg,png,mp4,mov,pdf']`
      (ajustar lista de mimes ao que o produto realmente aceita)

---

## Fase 7 — Sign-off

- [ ] Responsável do projeto validou o smoke test (Fase 4) em produção
- [ ] Data e hora do go-live registradas
- [ ] Backup do primeiro dia confirmado (Fase 5)

**Go-live concluído em:** _____________ (preencher)

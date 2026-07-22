# Configuração de Produção — `tear-v2-app`

> **Nota (2026-07-22):** a ordem de execução oficial do Go-Live é
> `docs/deployment/PLANO_DE_IMPLANTACAO.md`. Este documento continua
> valendo como auditoria de referência de cada variável (o que faz,
> impacto se ausente) — só os comandos de exemplo com `docker compose`
> abaixo estão desatualizados: a arquitetura vigente é Locaweb sem
> Docker (`docs/deployment/ARQUITETURA_PRODUCAO.md`, 2026-07-21). Onde
> este documento disser `docker compose run --rm app ...`, o comando
> real é o mesmo `php artisan ...` rodado via SSH dentro de
> `~/tear/current/` — ver `PLANO_DE_IMPLANTACAO.md` Etapa 7.
>
> **Correção factual (2026-07-22, `ADR-017`):** as linhas
> `GOOGLE_DRIVE_CLIENT_EMAIL`/`GOOGLE_DRIVE_PRIVATE_KEY` abaixo estão
> superadas — a organização `elafashionmkt-org` bloqueia Service Account
> Key via Org Policy. O backend passou a autenticar via OAuth de conta
> dedicada do Workspace: `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`
> e `GOOGLE_DRIVE_REFRESH_TOKEN` (obtidos via
> `php artisan google-drive:obter-refresh-token`), no lugar de
> `_CLIENT_EMAIL`/`_PRIVATE_KEY`. Ver
> `docs/adrs/ADR-017-oauth-conta-dedicada-google-drive.md`.

Auditoria de todas as variáveis de ambiente usadas pelo backend (Laravel
12) e pelo frontend (Vite/React), com o que é obrigatório preencher para
o Go-Live. **Nenhuma credencial real está neste documento** — só nomes,
exemplos ilustrativos e onde obter cada valor. Preencher o `.env` real
continua sendo responsabilidade de quem tem acesso às credenciais; este
documento não substitui isso.

Fonte: `grep` de todo `env('...')` em `config/*.php` e `app/`, cruzado com
`tear-v2-app/backend/.env.example`, `.env.production.example` e
`tear-v2-app/frontend/.env.example`. Ver também `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`
(raiz do repositório) para o checklist de prontidão geral e
`docs/DEPLOY.md`/`docs/MONITORING.md` para o runbook operacional.

---

## 1. Backend — variáveis por categoria

### 1.1 Aplicação

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `APP_NAME` | Não | Nome exibido em e-mails e título | `TEAR` | Definido pela equipe | Nome genérico do framework aparece em e-mails/logs |
| `APP_ENV` | **Sim** | Ambiente de execução | `production` | Fixo por ambiente | Se diferente de `production`, seeds/rotas de dev podem ficar acessíveis e o gate padrão do Pulse se comporta de forma diferente |
| `APP_KEY` | **Sim** | Chave de criptografia (sessão, cookies, hashing) | `base64:...` | Gerar com `php artisan key:generate --show` **no próprio ambiente de destino** — nunca reaproveitar de dev/homologação | App não sobe (erro fatal "No application encryption key") |
| `APP_DEBUG` | **Sim** | Exibe stack trace detalhado em erros | `false` | Fixo por ambiente | Se `true` em produção, vaza stack trace, paths do servidor e variáveis de ambiente nas respostas de erro — risco de segurança grave |
| `APP_URL` | **Sim** | URL pública do backend | `https://api.tear.com.br` | Domínio real definido pela equipe/hosting | URLs assinadas e link de `storage:link` gerados incorretamente |
| `APP_LOCALE` / `APP_FALLBACK_LOCALE` / `APP_FAKER_LOCALE` | Não (default já `pt_BR`) | Idioma de mensagens de validação/erro | `pt_BR` | Já correto no template | Mensagens de erro voltam a aparecer em inglês |
| `APP_MAINTENANCE_DRIVER` | Não | Driver do modo de manutenção | `file` | Default | Nenhum crítico |
| `BCRYPT_ROUNDS` | Não (tem default) | Custo do hash de senha | `12` | Decisão de segurança da equipe | Rounds baixos enfraquecem o hash armazenado |

### 1.2 Banco de dados

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `DB_CONNECTION` | **Sim** | Driver do banco | `pgsql` | Fixo (Postgres é a decisão já tomada) | Se ficar `sqlite`, banco não aguenta escrita concorrente em produção (P0-2 do checklist de Go-Live) |
| `DB_HOST` | **Sim** | Host do Postgres | `db` (nome do serviço no compose) ou IP/hostname do provedor | Provedor de hosting do banco | App não conecta — 500 em toda rota que toca o banco (praticamente todas) |
| `DB_PORT` | **Sim** | Porta do Postgres | `5432` | Provedor | Idem acima |
| `DB_DATABASE` | **Sim** | Nome do banco | `tear` | Provedor / criado no provisionamento | Idem acima |
| `DB_USERNAME` | **Sim** | Usuário do banco | `tear` | Provedor / criado no provisionamento | Idem acima |
| `DB_PASSWORD` | **Sim** | Senha do usuário do banco | *(senha forte, gerada pelo gestor de segredos)* | Provedor / criado no provisionamento | Idem acima |

### 1.3 Sessão

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `SESSION_DRIVER` | **Sim** (manter) | Onde sessões são armazenadas | `database` | Fixo | Se `file` com múltiplas réplicas, sessão não é compartilhada → logout aleatório |
| `SESSION_LIFETIME` | Não | Minutos até expirar a sessão | `120` | Decisão de produto | Sessão expira cedo/tarde demais |
| `SESSION_ENCRYPT` | Não | Criptografa o cookie de sessão | `false` | Default do Laravel | Nenhum crítico — cookie já é assinado |
| `SESSION_SECURE_COOKIE` | **Sim em produção** | Exige HTTPS para o cookie trafegar | `true` | Sempre `true` quando `APP_URL` é `https` | **Sem default no `config/session.php`** — se omitida, cookie de sessão trafega sem a flag `Secure` mesmo atrás de HTTPS, expondo a sequestro de sessão em rede insegura. Estava ausente do `.env.example` — adicionada nesta auditoria (ver §4) |
| `SESSION_PATH` | Não | Path do cookie | `/` | Default | Nenhum |
| `SESSION_DOMAIN` | **Sim** | Domínio do cookie de sessão | `.tear.com.br` | Domínio real de produção, com o ponto inicial se cobrir subdomínios | Se errado, cookie não é enviado entre frontend/backend em subdomínios diferentes → login falha silenciosamente |

### 1.4 CORS / Sanctum (autenticação SPA)

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `FRONTEND_URL` | **Sim** | Origem permitida no CORS (`config/cors.php`) | `https://app.tear.com.br` | Domínio real do frontend | Browser bloqueia toda requisição do frontend por CORS — app inteiro quebrado |
| `SANCTUM_STATEFUL_DOMAINS` | **Sim** | Domínios que recebem cookie de sessão stateful (SPA) | `app.tear.com.br` (sem protocolo) | Mesmo domínio do frontend | Sanctum trata as requisições como token-based em vez de sessão SPA → login não persiste, 401 constante |

### 1.5 Cache / Fila / Storage

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `BROADCAST_CONNECTION` | Não | Driver de broadcast (nenhum evento em tempo real usado hoje) | `log` | Default | Nenhum — feature não usada |
| `FILESYSTEM_DISK` | **Sim** (manter) | Disco padrão de storage | `local` | Fixo | `GoogleDriveService` não usa este disco (fala direto com a API do Drive) — mudar aqui não afeta upload de Material, mas afeta `storage:link`/arquivos locais |
| `QUEUE_CONNECTION` | **Sim** (manter) | Driver de fila | `database` | Fixo | Nenhum job real existe hoje (nenhuma classe `ShouldQueue`) — o worker do compose roda ocioso; relevante só se filas passarem a ser usadas |
| `CACHE_STORE` | **Sim** (manter) | Driver de cache — usado também pelo cache de token de acesso do Drive | `database` | Fixo | Sem cache configurado, token do Drive seria buscado a cada request (mais lento, risco de rate-limit da API do Google) |

### 1.6 Google Drive (upload de Material)

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `GOOGLE_DRIVE_CLIENT_ID` | **Sim** | Client ID do OAuth Client (tipo "Desktop app" — Device Flow não suporta o escopo `drive` completo, ver `ADR-017` adendo) | `123...apps.googleusercontent.com` | Google Cloud Console → Credentials | Sem as 3 variáveis OAuth: upload de Material retorna **503 para todo usuário, sem fallback** — bloqueia uma função central do Portal |
| `GOOGLE_DRIVE_CLIENT_SECRET` | **Sim** | Client Secret do mesmo OAuth Client | *(fornecido pelo Cloud Console)* | Google Cloud Console → Credentials | Idem acima |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | **Sim** | Token de longa duração da conta dedicada, trocado por access tokens em tempo de execução | *(gerado uma única vez)* | `php artisan google-drive:obter-refresh-token` (Authorization Code + redirect loopback local) | Idem acima |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | **Sim** | ID da pasta raiz do Drive onde os materiais são organizados | `1O9CYZNguX0zL1w1Tz9f5eM5Co4xO18CW` | ID na URL da pasta do Google Drive (pasta comum no Meu Drive da conta dedicada, não Shared Drive — ver `ADR-017`) | Idem acima |

### 1.7 E-mail (SMTP)

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `MAIL_MAILER` | **Sim** | Driver de envio | `smtp` | Fixo (decisão: SMTP/SES) | Se `log`, nenhum e-mail real (convite, redefinição de senha) chega a caixa alguma — bloqueia onboarding de influenciadoras |
| `MAIL_SCHEME` | Não | Protocolo (`null` = auto, `smtps` força TLS implícito) | `null` | Provedor SMTP | Handshake incorreto dependendo do provedor, em casos raros |
| `MAIL_HOST` | **Sim** (se `MAIL_MAILER=smtp`) | Host do servidor SMTP | `smtp.sendgrid.net` | Provedor SMTP/SES escolhido | E-mail não sai — a notificação é enviada de forma síncrona, gera exceção na requisição (convite/reset) |
| `MAIL_PORT` | **Sim** | Porta SMTP | `587` | Provedor | Idem acima |
| `MAIL_USERNAME` | **Sim** | Usuário SMTP | *(fornecido pelo provedor)* | Provedor | Autenticação SMTP falha, e-mail não sai |
| `MAIL_PASSWORD` | **Sim** | Senha/API key SMTP | *(fornecida pelo provedor)* | Provedor | Idem acima |
| `MAIL_FROM_ADDRESS` | **Sim** | Remetente exibido | `contato@tear.com.br` | Domínio verificado no provedor (SPF/DKIM) | E-mails podem cair em spam ou ser rejeitados se o domínio do From não for verificado |
| `MAIL_FROM_NAME` | Não | Nome do remetente exibido | `"TEAR"` | Definido pela equipe | Nome genérico exibido |

### 1.8 Logs

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `LOG_CHANNEL` / `LOG_STACK` | Não (default já correto) | Canal e estratégia de log | `stack` / `daily` | Já definido no template de produção | Sem `daily`, o log cresce em um único arquivo indefinidamente |
| `LOG_LEVEL` | Não | Nível mínimo de log | `warning` | Decisão da equipe | `debug` em produção gera volume excessivo de log |
| `LOG_DEPRECATIONS_CHANNEL` | Não | Canal de deprecations | `null` | Default | Nenhum |
| `LOG_DAILY_DAYS` | Não (default Laravel = 14) | Dias de retenção do log diário | `30` | Decisão de negócio (exigência de auditoria) | Log antigo é apagado automaticamente após N dias — ajustar se a retenção exigida for maior |

### 1.9 Observabilidade

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `PULSE_ENABLED` | Não (default `true`) | Liga/desliga o dashboard `/pulse` | `true` | Default do pacote | Nenhum crítico — painel de observabilidade, não bloqueia operação. Estava ausente do `.env.example` (só existia comentado em `.env.production.example`) — adicionada nesta auditoria (ver §4) |

### 1.10 Presentes no template mas **não usadas** na arquitetura atual

Documentado para não confundir quem for preencher o `.env` — preencher
estas variáveis hoje **não tem efeito nenhum**:

| Variável | Por que não é usada |
|---|---|
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_USE_PATH_STYLE_ENDPOINT` | O disco `s3` existe em `config/filesystems.php`, mas `FILESYSTEM_DISK=local` e `GoogleDriveService` fala direto com a API do Google (não usa a fachada `Storage`) — resíduo do template padrão do Laravel |
| `MEMCACHED_HOST` | Driver alternativo de cache não usado (`CACHE_STORE=database`) |
| `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT` | Driver alternativo de cache/fila/sessão não usado hoje — relevante só se o projeto migrar para Redis (P2 do `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`) |

---

## 2. Frontend (`tear-v2-app/frontend/.env`)

| Variável | Obrigatória? | Descrição | Exemplo | Onde obter | Impacto se ausente |
|---|---|---|---|---|---|
| `VITE_API_URL` | **Sim** | URL base da API consumida pelo frontend | `https://api.tear.com.br/api` | Domínio real do backend | Frontend não consegue fazer nenhuma chamada de API (tela em branco ou erros de rede em todas as telas) |

---

## 3. Checklist de provisionamento

### PostgreSQL
- [ ] Provisionar instância Postgres 16 (mesma versão do `docker-compose.yml`), gerenciada ou própria.
- [ ] Criar banco de dados dedicado e usuário com senha forte.
- [ ] Garantir rede: host acessível pelo container `app` (mesma rede do compose ou firewall liberado só para o IP do backend).
- [ ] Preencher `DB_HOST`/`DB_PORT`/`DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` no `.env` real (nunca no `.env.example`).
- [ ] Rodar migrations (`entrypoint.sh` já chama `migrate --force` automaticamente no boot do container).
- [ ] Confirmar as 20 migrations aplicadas (`php artisan migrate:status`).
- [ ] Agendar `scripts/backup-db.sh` via cron do host (diário).

### Google Drive
- [ ] Criar/usar um projeto no Google Cloud Console (conta Google — não
      exige Workspace, ver `ADR-017`).
- [ ] Habilitar a Google Drive API nesse projeto.
- [ ] Criar um OAuth Client ID, tipo **TVs and Limited Input devices**
      (não usa Service Account nem exige URI de redirecionamento).
- [ ] Criar (ou escolher) a pasta raiz no Meu Drive da conta dedicada que
      vai guardar os materiais — não é um Shared Drive.
- [ ] Copiar o ID da pasta (da URL) para `GOOGLE_DRIVE_ROOT_FOLDER_ID`.
- [ ] Rodar `php artisan google-drive:obter-refresh-token` (Device
      Authorization Grant) e preencher `GOOGLE_DRIVE_CLIENT_ID`/
      `_CLIENT_SECRET`/`_REFRESH_TOKEN` no `.env` real com o resultado.
- [ ] Rodar `php artisan google-drive:test` para validar toda a
      configuração (env, token, pastas, escrita, upload, leitura,
      exclusão) antes do primeiro upload real.
- [ ] Testar upload real de um Material em homologação antes do Go-Live.

### SMTP
- [ ] Escolher provedor (SES, SendGrid, Postmark etc. — decisão do responsável do projeto).
- [ ] Verificar o domínio de envio no provedor (SPF/DKIM/DMARC) para reduzir chance de spam.
- [ ] Gerar credenciais SMTP dedicadas.
- [ ] Preencher `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` no `.env` real.
- [ ] Testar envio real ponta a ponta em homologação: convite de influenciadora e redefinição de senha.
- [ ] Revisar/aceitar o "Regards," em inglês no template de e-mail (P2 já registrado em `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`).

### APP_KEY
- [ ] Nunca reaproveitar a `APP_KEY` de dev/homologação em produção.
- [ ] Gerar com `php artisan key:generate --show` (local ou via SSH no host — ver `PLANO_DE_IMPLANTACAO.md` Etapa 7).
- [ ] Colar o valor gerado em `APP_KEY=` no `.env` real do ambiente de produção.
- [ ] Guardar a chave em um gestor de segredos — trocá-la invalida todas as sessões/cookies ativos.

### Sanctum
- [ ] Definir `FRONTEND_URL` com o domínio real do frontend (com `https://`).
- [ ] Definir `SANCTUM_STATEFUL_DOMAINS` com o domínio do frontend, sem protocolo.
- [ ] Confirmar que backend e frontend estão sob o mesmo domínio raiz (necessário para o cookie cross-subdomain funcionar com `SESSION_DOMAIN=.dominio.com.br`).
- [ ] Testar login real na SPA após o deploy (cookie de sessão deve persistir entre reloads).

### Session
- [ ] `SESSION_DRIVER=database` (manter).
- [ ] `SESSION_SECURE_COOKIE=true` — obrigatório com HTTPS (variável estava ausente do `.env.example`; adicionada nesta auditoria, ver §4).
- [ ] `SESSION_DOMAIN=.dominio-real.com.br` (com o ponto inicial, para cobrir subdomínios).
- [ ] Confirmar `SESSION_LIFETIME` adequado ao produto (`120` min é o default; ajustar se o negócio pedir sessões mais longas/curtas).

### Storage
- [ ] `FILESYSTEM_DISK=local` (manter — Google Drive não usa este disco).
- [ ] Confirmar que `storage:link` roda no build/boot (já incluso no fluxo do `composer.json`/Docker).
- [ ] Confirmar o volume persistente do storage no `docker-compose.yml` (volume nomeado, para não perder arquivos locais entre deploys).
- [ ] Sem Google Drive configurado, uploads de Material ficam bloqueados (503) — não há fallback para o disco local.

### Queue
- [ ] `QUEUE_CONNECTION=database` (manter).
- [ ] Confirmar o container `queue` do `docker-compose.yml` rodando (`docker compose ps`).
- [ ] Hoje nenhum `Job`/`Listener` usa fila (achado do `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`, P1) — o worker roda ocioso; não é um bloqueio, só custo residual.
- [ ] Se um Job futuro for adicionado, confirmar as tabelas `jobs`/`failed_jobs` (migrations padrão do Laravel, já presentes).

### Scheduler
- [ ] Nenhuma rotina agendada existe hoje no código (`Schedule::` vazio/ausente em `bootstrap/app.php` e `routes/console.php` — confirmado nesta auditoria).
- [ ] Não é necessário configurar cron de `schedule:run` até que uma rotina periódica real seja implementada (P2 do roadmap: expirar convites, lembrete de pagamento).
- [ ] Os agendamentos que já existem hoje são externos ao Scheduler do Laravel — cron do **host** chamando `scripts/backup-db.sh` (diário) e `scripts/healthcheck.sh` (a cada 5 min). Ver `docs/DEPLOY.md` §7 e `docs/MONITORING.md` §3.

---

## 4. Variáveis ausentes identificadas nesta auditoria

Duas variáveis são usadas pelo código (`config/session.php`,
`config/pulse.php`) mas não apareciam em `tear-v2-app/backend/.env.example`
— só o template de dev, o de produção já tinha uma delas parcialmente
(comentada). Adicionadas nesta sessão **com placeholders**, sem nenhum
valor real:

- **`SESSION_SECURE_COOKIE`** — sem default no `config/session.php`
  (`env('SESSION_SECURE_COOKIE')`, sem segundo argumento); se a variável
  não existir em nenhum `.env`, o cookie de sessão trafega sem a flag
  `Secure` mesmo atrás de HTTPS. Adicionada em `.env.example` como
  `SESSION_SECURE_COOKIE=false` (correto para dev, que usa HTTP), com
  comentário explicando que deve ser `true` em produção.
- **`PULSE_ENABLED`** — default `true` no pacote, não crítico, mas ausente
  do `.env.example` (só existia comentado em `.env.production.example`).
  Adicionada comentada em `.env.example`, mesmo padrão do arquivo de
  produção, só para descoberta.

Nenhuma outra variável usada em `config/*.php` relevante para a
arquitetura atual (Postgres, sessão/cache/fila via `database`, Sanctum
SPA, SMTP, Google Drive) estava ausente dos dois templates.

**Nenhum arquivo `.env` real foi criado ou preenchido — só
`.env.example` (dev) recebeu os placeholders acima. `.env.production.example`
não foi alterado nesta sessão.**

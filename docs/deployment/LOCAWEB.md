# LOCAWEB.md — Inventário de Infraestrutura

- **Papel:** documento de referência rápida (fato, não narrativa) sobre a
  infraestrutura Locaweb contratada para o TEAR.
- **Fonte:** integralmente derivado de `docs/deployment/AUDITORIA_LOCAWEB.md`
  (auditoria read-only do painel Locaweb, 2026-07-22) e cruzado com
  `docs/deployment/ARQUITETURA_PRODUCAO.md` e
  `docs/adrs/ADR-016-composer-no-ci-deploy-manual.md` (achados de uma
  auditoria subsequente via SSH). **Nenhuma informação nova foi coletada
  nesta sessão** — não havia prints anexados nesta conversa; se o
  responsável do projeto pretendia anexar novos prints, este documento
  precisa ser revisado assim que eles chegarem.
- **Convenção de pasta:** colocado em `docs/deployment/` (não em
  `docs/infrastructure/`, que não existe no projeto) para seguir a mesma
  pasta onde já vivem `AUDITORIA_LOCAWEB.md`, `ARQUITETURA_PRODUCAO.md` e
  `PLANO_DE_IMPLANTACAO.md`, evitando fragmentar a documentação de
  infraestrutura em dois lugares.
- **Não é fonte de decisão de arquitetura** — decisões continuam em
  `ARQUITETURA_PRODUCAO.md`; este documento só descreve a infraestrutura
  contratada.

---

# Infraestrutura

- **Provedor:** Locaweb.
- **Tipo de hospedagem:** Hospedagem I Linux (compartilhada) — entry-level
  do catálogo, sem Docker, sem acesso root, sem systemd. Sistema
  operacional: Rocky Linux 8.
- **Domínio principal:** `estudioela.com` — hospedagem-alvo do TEAR
  (usuário FTP/SSH `estudioela1`, diretório raiz `/home/estudioela1/`, IP
  compartilhado `191.252.83.211`).
  - Existe uma segunda hospedagem idêntica na mesma conta,
    `elafashionmkt.com.br` (usuário `elafashionmkt1`), que serve o site da
    agência — **não é alvo do deploy do TEAR**, citada aqui só para não
    confundir as duas ao operar a conta.
- **Ambiente de produção:** subdomínio `influencia.estudioela.com`
  (decisão definitiva do responsável do projeto, 2026-07-22). Ainda não
  criado dentro da hospedagem `estudioela.com`; DNS do domínio pai
  pendente de apontamento.

---

# Runtime

- **PHP:** 8.3 ativo, confirmado no painel (Configurações de hospedagem).
- **Versão:** ⚠️ **discrepância não resolvida** — o painel indica PHP 8.3
  ativo, mas uma auditoria subsequente via SSH (citada em `ADR-016`)
  encontrou **PHP 8.4.22** no host (mesma sessão que confirmou Rocky Linux
  8.10 e Composer ausente). Pode ser diferença entre a versão do PHP-FPM
  (servindo requisições web) e a versão do PHP-CLI (usada por SSH/cron) —
  não investigado a fundo. **Pendente de validação em ambiente** (rodar
  `php -v` via SSH habilitado e comparar com o que o painel mostra para o
  handler web).
- **Extensões identificadas:** nenhuma confirmada via `php -m` até o
  momento (SSH não estava habilitado durante a auditoria original). O que
  se sabe é o que o código exige (`composer.lock`): `pdo_pgsql`,
  `mbstring`, `openssl`, `ctype`, `filter`, `hash`, `session`,
  `tokenizer`, `fileinfo`. **Pendente de validação em ambiente** para
  todas. `gd`, `zip`, `intl`, `bcmath` não são requisito real do app hoje
  (só "suggest" opcional de libs de terceiros).
- **Observações:** Composer **não está instalado globalmente no host**
  (confirmado). Por decisão de arquitetura (`ADR-016`), isso deixou de ser
  bloqueio — `vendor/` é gerado no runner do CI (GitHub Actions) e enviado
  já pronto via `rsync`; o host nunca executa `composer install`.

---

# Banco de Dados

- **Tecnologias disponíveis:** MySQL, PostgreSQL e MS SQL — todas
  confirmadas disponíveis no painel (0/10 bancos usados no plano).
- **Tecnologia escolhida:** **PostgreSQL gerenciado** (decisão de
  arquitetura, `ARQUITETURA_PRODUCAO.md` §2 — mantém o motor já modelado
  em migrations/queries/testes, sem esforço de portar para MySQL). Banco
  de produção ainda **não foi criado**.
- **Limites do plano:** até 10 bancos de dados (qualquer motor, dentro do
  mesmo total). Limites de armazenamento/conexões simultâneas por banco
  não são expostos numericamente no painel. **Pendente de validação em
  ambiente.**
- **Observações:** nenhum banco criado ainda em nenhum dos três motores
  disponíveis.

---

# SSH

- **Disponível:** sim, mas **desabilitado por padrão**.
- **Como habilitar:** manualmente pelo painel Locaweb (Configurações →
  SSH → botão "Habilitar"). Não há API nem automação oficial para isso.
- **Limitação de tempo:** sessão de **~3 horas**, renovação manual a cada
  vez. Autenticação por **usuário/senha** (a mesma senha do FTP) — **não
  há cadastro de chave pública** confirmado no painel.
- **Porta:** não identificada nos achados existentes. **Pendente de
  validação em ambiente.**
- **Observações:** essa limitação (temporário + por senha) é o principal
  fator que forçou o ajuste da estratégia de deploy original (que assumia
  SSH por chave, disparo automático por push) — ver seção "Git / Deploy"
  abaixo e `ADR-016`.

---

# FTP

- **Disponível:** sim.
- **Diretório raiz:** `/home/estudioela1/` (hospedagem `estudioela.com`,
  alvo do TEAR).
- **Host:** IP compartilhado `191.252.83.211` (hospedagem `estudioela.com`).
  Um host FTP nomeado (ex.: `ftp.estudioela.com`) não foi confirmado.
  **Pendente de validação em ambiente.**
- **Observações:** FTP multiusuário **não incluso** no plano — é upsell
  pago ("Contratar" no painel). Hoje há só 1 usuário FTP/SSH por
  hospedagem. O recurso "Publicar via Git" do painel, apesar do nome, é na
  prática um template de upload FTP (ver seção seguinte).

---

# Git / Deploy

- **Integração GitHub Actions ("Publicar via Git" do painel):** gera um
  workflow padrão que faz **só upload FTP** (`locaweb/ftp-deploy`) do
  diretório de build para `public_html`. Não executa comandos no
  servidor, não tem hook pós-deploy — **não é Git real**.
- **Deploy por FTP:** viável para publicar arquivos, mas sem mecanismo
  nativo de release atômica (releases/ + symlink) nem execução remota de
  `migrate`/cache — precisaria ser complementado por SSH manual para essas
  etapas.
- **Deploy manual:** viável via SSH, quando habilitado — permite rodar
  `rsync`/`scp` para publicar arquivos e comandos `artisan` (`migrate
  --force`, `config:cache`, etc.) diretamente no host.
- **Limitações:**
  - Sem SSH por chave — incompatível com automação 100% sem intervenção
    humana a cada deploy.
  - "Publicar via Git" não substitui deploy real (é só FTP).
  - Sem suporte nativo a deploy atômico (releases/symlink) — implementado
    por script próprio do projeto (`scripts/deploy-locaweb.sh`), não pela
    Locaweb.
  - **Decisão já tomada** (`ADR-016`): manter `rsync`/SSH (não trocar por
    FTP), Composer rodando só no runner do CI, disparo do workflow manual
    (`workflow_dispatch`, não automático por push) — porque a janela de
    SSH de 3h não é garantida no momento de um push.

---

# Scheduler

- **Crontab nativo Linux:** confirmado disponível, 0 tarefas agendadas
  hoje. Aceita e-mail de log de execução.
- **Suporte a agendador via HTTP (cron por URL):** **não confirmado** —
  não identificado nos achados existentes do painel. **Pendente de
  validação em ambiente.**

---

# SSL

- **Estado atual:** Let's Encrypt gratuito disponível via painel. Para a
  hospedagem `estudioela.com` (alvo do TEAR), a emissão está **bloqueada**
  com status "DNS Pendente" — Let's Encrypt só emite depois do DNS
  apontado. Nenhum subdomínio (`influencia`) foi criado ainda dentro dessa
  hospedagem.
- **Procedimento para ativação:**
  1. Criar o subdomínio `influencia.estudioela.com` na seção "Domínios" da
     hospedagem `estudioela.com`.
  2. Apontar o DNS (registro `A`/`CNAME`) para o host Locaweb.
  3. Aguardar propagação.
  4. Emitir o certificado Let's Encrypt pelo painel (fluxo exato —
     automático ou com botão manual de emissão — **pendente de validação
     em ambiente**, não confirmado nos achados existentes).

---

# Capacidades

| Recurso | Status | Observação |
|---|---|---|
| PHP 8.3 | ✅ Confirmado (painel) | Auditoria via SSH encontrou 8.4.22 — discrepância pendente de validação |
| SSH | ⚠️ Disponível, com restrição | Desabilitado por padrão, senha (não chave), sessão de 3h |
| FTP | ✅ Confirmado | 1 usuário por hospedagem; multiusuário é upsell pago |
| MySQL | ✅ Disponível | Não é o motor escolhido (decisão: PostgreSQL) |
| PostgreSQL | ✅ Disponível | Motor escolhido; banco de produção ainda não criado |
| MS SQL | ✅ Disponível | Não avaliado para uso no projeto |
| SSL (Let's Encrypt) | ⚠️ Disponível, bloqueado | Emissão depende do DNS já apontado |
| Scheduler (Crontab) | ✅ Confirmado | Nativo, 0 tarefas hoje |
| Scheduler HTTP | ❔ Pendente de validação em ambiente | Não identificado no painel |
| GitHub Actions (deploy real) | ⚠️ Parcial | "Git" do painel é só upload FTP; deploy real (migrate/cache) exige SSH manual |
| Web FTP / Gerenciador de arquivos | ❔ Pendente de validação em ambiente | Não identificado nos achados existentes |
| Composer no host | ❌ Ausente | Confirmado ausente globalmente; roda só no CI (`ADR-016`) |
| WAF | ✅ Ativa por padrão | Pode gerar falso positivo em rotas de API/upload — não testado |
| Backup automático nativo | ❌ Não ativado | Recurso existe ("Ativar"), não habilitado |

---

# Limitações

- Hospedagem compartilhada: **sem Docker, sem acesso root, sem systemd.**
- SSH **temporário (~3h) e por senha**, sem suporte a chave — quebra a
  premissa de deploy 100% automatizado sem intervenção humana.
- **"Publicar via Git" não é deploy real** — só upload FTP, sem execução
  de comandos remotos.
- **FTP multiusuário é upsell pago** — só 1 usuário FTP/SSH disponível
  hoje.
- **Composer não está instalado globalmente no host.**
- **Discrepância de versão de PHP** entre painel (8.3) e achado via SSH
  (8.4.22) — não investigada a fundo.
- Quota de disco/CPU/processos simultâneos **não exposta no painel** —
  não confirmada.
- **WAF ativa por padrão** pode interferir com rotas de API JSON (Sanctum)
  ou upload de Material — precisa ser testada no primeiro deploy real.
- **Backup automático nativo não está ativado.**
- IP(s)/CIDR do proxy reverso da Locaweb (necessário para
  `TRUSTED_PROXIES`) **não foi levantado**.
- Host/porta do relay SMTP incluso no plano **não foram localizados** no
  painel (seção "Email Locaweb" existe, detalhes não confirmados).
- Porta SSH e existência de Web FTP/gerenciador de arquivos: **pendentes
  de validação em ambiente.**

---

# Próximos passos

Tarefas necessárias para colocar o sistema em produção usando esta
infraestrutura (sem repetir o que já está decidido/pronto em código):

1. Apontar o DNS de `estudioela.com` e criar o subdomínio
   `influencia.estudioela.com` dentro da hospedagem correspondente.
2. Criar o banco PostgreSQL de produção no painel (credenciais dedicadas).
3. Habilitar o SSH e confirmar, numa única sessão: versão real do PHP
   (`php -v`), extensões (`php -m`), quota de disco (`df -h`), porta SSH
   real, IP/CIDR do proxy reverso (para `TRUSTED_PROXIES`).
4. Levantar host/porta do relay SMTP incluso no plano (seção "Email
   Locaweb" do painel ou suporte).
5. Emitir o certificado SSL (Let's Encrypt) assim que o DNS propagar.
6. Preencher o `.env` de produção e executar o primeiro deploy, seguindo
   a mecânica já decidida em `ADR-016` (Composer só no CI, disparo manual
   do workflow, `rsync`/SSH para publicar).

Detalhamento completo de cada etapa (dependências, comandos, critérios de
aceite): `docs/deployment/PLANO_DE_IMPLANTACAO.md`.

# GO_LIVE_STATUS.md — Auditoria de Prontidão para Produção (Tear V2 / ELÃ | influência)

> Data original da auditoria: 2026-07-22
> Autor: Agente B — auditoria read-only de go-live, mandato de operação
> autônoma de 2026-07-16 (`CLAUDE.md`)
> Escopo: `tear-v2-app/` (Laravel 13 + React/Vite) e pipeline de deploy
> (`.github/workflows/`, `tear-v2-app/scripts/`). Não altera código, não
> implementa nada, não abre novas frentes de auditoria — este documento
> apenas consolida o conhecimento já produzido na missão desta sessão.
> Não substitui nem duplica `docs/deployment/PLANO_DE_IMPLANTACAO.md`
> (ordem de execução oficial) nem `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`
> (histórico de sessão anterior, já marcado como superado) — é um
> relatório de auditoria independente, complementar aos dois.
>
> **Revisão 2026-07-22:** adicionada a seção "Estado Atual" e o
> Bloqueador #4, após confirmação do suporte técnico da Locaweb de que o
> plano contratado ("Hospedagem I") não oferece PostgreSQL — informação
> que substitui a hipótese anterior (baseada em evidência de painel) e
> reabre a decisão de infraestrutura de banco de dados de produção.

---

## 1. Estado Atual

**Data:** 2026-07-22

**Arquitetura:**
- Laravel 13
- React + Vite
- Deploy via GitHub Actions
- Composer executado no CI
- Deploy manual (`workflow_dispatch`)

**Infraestrutura:**
- Hospedagem Locaweb I
- **PostgreSQL indisponível neste plano** (confirmação do suporte técnico
  da Locaweb)
- **Definição do banco em produção pendente**

**Reconciliação com a auditoria original (ver §4 "Banco" e §6
"Bloqueador 1"):**
- A auditoria inicial (e `docs/deployment/AUDITORIA_LOCAWEB.md`)
  considerou PostgreSQL disponível, com base em evidência observada no
  painel da hospedagem ("PostgreSQL disponível, 0/10 usados").
- Posteriormente, o **suporte oficial da Locaweb confirmou** que o plano
  contratado ("Hospedagem I") **não oferece PostgreSQL** como banco de
  dados suportado.
- Essa confirmação **substitui a hipótese anterior** e passa a ser a
  **referência oficial** sobre a infraestrutura de banco de dados. Os
  achados técnicos de schema/índices/constraints (§4, itens 11/19/20)
  permanecem válidos para o desenho do banco em si, mas todos assumiam
  uma conexão PostgreSQL que hoje não está disponível no plano
  atualmente contratado.

**Conclusão desta reconciliação:** a aplicação encontra-se apta para
validação final do ponto de vista de código/aplicação. O Go-Live
permanece condicionado apenas à resolução dos bloqueadores de
infraestrutura listados abaixo (§3) — agora incluindo, como bloqueador
mais fundamental, a definição do banco de dados de produção
(Bloqueador #4).

## 2. Resumo executivo

Auditoria completa de prontidão para produção, cobrindo Laravel,
frontend, API/segurança, banco de dados, segurança de secrets, pipeline
de deploy e observabilidade. Metodologia: 5 investigações read-only
paralelas sobre o código e configuração reais (não sobre a documentação
de intenção), seguidas de reclassificação de cada achado por impacto
real no primeiro deploy (bloqueador × recomendado × pós-MVP), e
posteriormente atualizada com a confirmação do suporte Locaweb sobre a
indisponibilidade de PostgreSQL no plano contratado (§1).

**Conclusão central:** o núcleo da aplicação (schema de banco, segurança
de API, validações, tratamento de erros, frontend/build) está sólido —
a grande maioria dos itens auditados veio "OK". A lacuna real está
concentrada em **infraestrutura**: três bloqueadores de pipeline/deploy
(restore, autenticação SSH, apontamento de webroot) e, agora, um quarto
bloqueador mais fundamental — o banco de dados de produção ainda não
tem infraestrutura definida. Nenhum dos 4 bloqueadores é falha de
código de aplicação.

## 3. Nota final

### **55 / 100**

Justificativa: a aplicação em si (testes 192/192 verdes, Pint limpo,
`tsc -b`/`oxlint`/`vite build` limpos — última medição conhecida) segue
madura, com poucos achados de código de fato graves (1 linha em
`session.php`, 1 diretiva de middleware ausente). A nota, já puxada para
baixo pelos 3 bloqueadores de pipeline de deploy na versão anterior
deste relatório, cai mais um pouco com a confirmação de que o banco de
dados de produção — pré-requisito para qualquer um dos demais itens ser
validado de ponta a ponta — ainda não tem infraestrutura definida.

## 4. Bloqueadores confirmados (GO-LIVE BLOCKER)

| # | Achado | Categoria | Por que bloqueia |
|---|---|---|---|
| 1 | `restore-db.sh` assume Docker, que não existe na hospedagem Locaweb | Deploy (técnico) | Sem restauração funcional, não há disaster recovery assim que existir dado real de produção. |
| 2 | Workflow de deploy usa `SSH_PRIVATE_KEY`, mas a Locaweb só autentica por senha | Deploy (técnico) | O pipeline mecanicamente não executa contra o host real — não é risco, é quebra funcional. Decisão do responsável do projeto pendente (modelo híbrido FTP+SSH). |
| 3 | Apontamento do domínio para `current/public` não documentado nem validado | Segurança (técnico) | Se o painel Locaweb apontar para `current` em vez de `current/public`, o 1º deploy já nasce expondo `.env`/`vendor`/`storage` publicamente. |
| 4 | **Banco de dados de produção indefinido** — plano Locaweb I não oferece PostgreSQL (confirmado pelo suporte) | **Infraestrutura externa** | Sem um banco de dados de produção definido e disponível, nenhum outro bloqueador ou item recomendado pode ser validado de ponta a ponta. É o bloqueador mais fundamental da lista, mas de natureza diferente dos demais: decisão externa de infraestrutura/plano de hospedagem, não falha de código ou de pipeline de deploy. |

> Nota de classificação: os bloqueadores #1–#3 são **técnicos** (código/config do próprio pipeline, corrigíveis pelo time de engenharia). O bloqueador #4 é de **infraestrutura externa** (depende de decisão comercial/contratual sobre hospedagem — upgrade de plano, PostgreSQL externo/gerenciado, ou outro SGBD), fora do controle direto do código do repositório.

## 5. Itens recomendados (GO-LIVE RECOMMENDED)

| # | Achado | Categoria | Justificativa resumida |
|---|---|---|---|
| 5 | `SESSION_SECURE_COOKIE` sem default seguro (`config/session.php:172`) | Laravel | Mitigado pelo `.env.production.example`, mas é correção de 1 linha que fecha fail-open real. |
| 6 | Rate limiting ausente na API autenticada (upload de materiais incluso) | Backend | Go-live é interno (usuárias conhecidas); ainda assim barato de corrigir e protege custo/armazenamento. |
| 7 | Sem backup imediatamente antes de `migrate --force` | Deploy | 1º deploy é em banco vazio (nada a perder); vira crítico a partir do 2º deploy, quando já houver dado real. |
| 8 | Sem healthcheck pós-deploy / rollback automático | Deploy/Observabilidade | O responsável acompanha o 1º deploy pessoalmente; automação vira necessária em deploys sem supervisão direta. |
| 9 | Health check não verifica dependências reais (DB/cache) | Observabilidade | Só importa quando algo consumir o healthcheck automaticamente (depende do item 8). |
| 10 | Sem `chmod` explícito para `storage/`/`bootstrap/cache` no deploy | Segurança | Nunca validado em ambiente real (SSH ainda não liberado); se errado, quebra a app imediatamente — checar no 1º deploy real. |
| 11 | Backups com PII sem confirmação de isolamento de ACL no Google Drive | Segurança | Vira risco de LGPD ativo assim que os backups automatizados rodarem com dado real. |
| 12 | Ausência de soft deletes em tabelas de negócio | Banco | Decisão de produto, não bug; mais barato decidir/implementar antes de existir dado real do que depois. |

## 6. Itens pós-MVP (POST-MVP)

| # | Achado | Categoria | Justificativa resumida |
|---|---|---|---|
| 13 | Fila provisionada sem uso (`ShouldQueue` ausente, notificações síncronas) | Laravel | Só adiciona latência pontual, não quebra nada. |
| 14 | `docker-compose.yml` com fallback silencioso de `VITE_API_URL` | Frontend | Não é o caminho de deploy real hoje (Locaweb não usa Docker). |
| 15 | Sem `Cache-Control`/`mod_expires` para assets estáticos | Frontend | Puramente performance, sem impacto funcional/segurança. |
| 16 | CI valida `npm run build` mas não `build:locaweb` | Frontend | Mesmo type-check nos dois; diferença só de `base`/`outDir`, já testada no job de deploy real. |
| 17 | Google Fonts via CDN externo sem fallback | Frontend | Ponto único de falha de baixo impacto. |
| 18 | `APP_KEY` sem checagem automatizada pré-migrate | Laravel | Passo manual já documentado/tracked em `PLANO_DE_IMPLANTACAO.md` Etapa 7. |
| 19 | Scheduler configurado sem nenhuma tarefa `Schedule::` real | Laravel | Puramente informativo, sem comportamento inesperado. |
| 20 | FKs sem índice explícito (PostgreSQL) | Banco | Relevante em escala; sem gargalo no volume inicial de go-live interno. Condicionado à mesma decisão de infraestrutura do Bloqueador #4. |
| 21 | `config/database.php` com default `sqlite` | Banco | Já mitigado por env explícita em produção. |
| 22 | Bug de concatenação no default de `SANCTUM_STATEFUL_DOMAINS` | Backend | Nunca exercido em produção (env sempre definida explicitamente). |
| 23 | Sem GitHub Environment / gate de aprovação no deploy | Deploy | Coerente com o "Mandato de operação autônoma" já vigente (decisão concentrada). |
| 24 | Releases antigas nunca removidas (disco) | Deploy | Risco cumulativo ao longo de múltiplos deploys, inexistente no dia 1. |
| 25 | Rollback só manual, sem script dedicado | Deploy | Procedimento manual já existe e é simples (troca de symlink). |

## 7. Evidências dos bloqueadores

### Bloqueador 1 — `restore-db.sh` assume Docker inexistente na Locaweb

- **Arquivo:** `tear-v2-app/scripts/restore-db.sh:19`
  ```
  gunzip -c "$BACKUP_FILE" | docker compose exec -T db psql -U "${DB_USER:-tear}" "${DB_NAME:-tear}"
  ```
- **Contradição interna:** `tear-v2-app/scripts/backup-db.sh:2-3` documenta
  explicitamente "Backup do PostgreSQL de produção (banco gerenciado da
  Locaweb, **sem Docker**...)" e usa `pg_dump` direto contra
  `DB_HOST`/`DB_PORT` — ou seja, o próprio par de scripts (backup vs.
  restore) já se contradiz.
- **Confirmação arquitetural:** `docs/deployment/ARQUITETURA_PRODUCAO.md`
  (linhas 30, 45, 65) reforça "sem Docker, sem acesso root" como premissa
  da hospedagem real contratada.

### Bloqueador 2 — `SSH_PRIVATE_KEY` incompatível com a Locaweb

- **Arquivo:** `.github/workflows/tear-v2-deploy.yml:69,80-101` — todo o
  bloco monta `~/.ssh/deploy_key` a partir de
  `secrets.SSH_PRIVATE_KEY` e autentica com `ssh -i`.
- **Confirmação de infraestrutura real:** `docs/deployment/AUDITORIA_LOCAWEB.md`
  §4.1 documenta que o SSH da Locaweb autentica **apenas por senha**
  (mesma do FTP), sessão de 3h, sem suporte a `authorized_keys`.
- **Status:** achado já conhecido de sessões anteriores, confirmado nesta
  auditoria como ainda presente no código atual (não corrigido, só
  anotado em documentação). Recomendação já registrada em
  `AUDITORIA_LOCAWEB.md` §5.1 (modelo híbrido FTP+SSH pontual), aguardando
  decisão do responsável do projeto — **não decidir por conta própria**.

### Bloqueador 3 — Apontamento do domínio para `current/public` não documentado/validado

- **Arquivo:** `tear-v2-app/scripts/deploy-locaweb.sh:35` —
  `ln -sfn "$RELEASE_PATH" "$BASE_PATH/current"` — o symlink `current`
  aponta para a **raiz do backend Laravel**, não para `current/public`.
- **Lacuna de documentação confirmada:** grep por
  `public_html|webroot|DocumentRoot|apontar.*domínio` em todo
  `docs/deployment/` não retornou nenhuma menção ao passo de configurar,
  no painel da Locaweb, a pasta do domínio apontando para
  `current/public` — incluindo a Etapa 10 de
  `docs/deployment/PLANO_DE_IMPLANTACAO.md` (criação de estrutura de
  diretórios), onde esse passo seria esperado.
- **Risco concreto:** se o webroot apontar para a raiz em vez de
  `public/`, `.env` (com credenciais reais de DB/Google Drive/`APP_KEY`),
  `vendor/` e `storage/` ficam servíveis publicamente via HTTP.

### Bloqueador 4 — Banco de dados de produção indefinido (PostgreSQL indisponível no plano)

- **Evidência original (agora superada):** `docs/deployment/AUDITORIA_LOCAWEB.md`
  registrava PostgreSQL como "disponível (0/10 usados)" no painel da
  hospedagem Locaweb — evidência de painel, não confirmação de suporte.
- **Evidência atual (referência oficial):** confirmação do suporte
  técnico da Locaweb de que o plano contratado "Hospedagem I" **não
  inclui PostgreSQL** como banco de dados suportado (registrada nesta
  sessão em 2026-07-22 — fato de infraestrutura externo, não auditável
  via grep/código-fonte).
- **Impacto:** invalida a premissa usada em `config/database.php`
  (`DB_CONNECTION` esperado como `pgsql` em produção,
  `.env.production.example: DB_CONNECTION=pgsql`) e condiciona todos os
  achados de banco desta auditoria (§4/§6, itens 12/20/21) a uma nova
  decisão de infraestrutura ainda não tomada: upgrade de plano,
  PostgreSQL externo/gerenciado, ou migração para outro SGBD.

## 8. Checklist final para autorizar o primeiro deploy

Marcar cada item antes de autorizar o primeiro `git push`/deploy real
para produção:

- [ ] **Bloqueador #4 resolvido** — decisão de infraestrutura de banco
      tomada (upgrade do plano Locaweb, PostgreSQL externo/gerenciado,
      ou outro SGBD) e `DB_CONNECTION` + demais variáveis de
      `.env.production.example` preenchidas com valores reais e
      validados no `.env` do host — **pré-requisito para todos os
      itens abaixo que dependem de banco**.
- [ ] **Bloqueador #1** — `restore-db.sh` reescrito para usar `psql`/`pg_restore`
      direto contra `DB_HOST`/`DB_PORT` (sem `docker compose`), testado
      contra um backup real ou dump de teste.
- [ ] **Bloqueador #2** — Estratégia de autenticação SSH decidida pelo
      responsável do projeto (chave vs. senha vs. modelo híbrido
      FTP+SSH) e workflow atualizado para refletir a decisão.
- [ ] **Bloqueador #3** — Painel Locaweb configurado com o domínio
      apontando para `$DEPLOY_BASE_PATH/current/public`; validado com
      `curl -I https://<domínio>/.env` retornando **404** (não 200)
      antes de liberar tráfego real.
- [ ] `APP_KEY` gerado e presente no `.env` real do host (Etapa 7 do
      `PLANO_DE_IMPLANTACAO.md`), confirmado **antes** do primeiro
      `migrate --force`.
- [ ] `SESSION_SECURE_COOKIE=true` confirmado no `.env` real (mitigação
      do achado #5, já documentada no template).
- [ ] Extensões PHP, `composer`, conexão ao banco definido no
      Bloqueador #4 e IP/CIDR do proxy reverso (`TRUSTED_PROXIES`)
      validados via SSH real.
- [ ] Decisão registrada (mesmo que "aceito o risco por ora") sobre os
      itens recomendados #5–#12 — não é necessário implementá-los antes
      do deploy, mas cada um deve ter uma decisão explícita, não silêncio.
- [ ] **Validação local concluída pelo Agente A.**
- [ ] **Aprovação final para Go-Live** concedida pelo responsável do
      projeto.
- [ ] Após o primeiro deploy real: validação manual de que o site
      carrega, login funciona, e `/api/health` responde — na ausência
      de healthcheck automatizado (achado #8/#9), esta verificação
      humana é o gate de sucesso desta primeira vez.

**Deploy explicitamente não autorizado nesta etapa.** Depende de: (1)
definição do banco de produção (Bloqueador #4), (2) conclusão da
validação local pelo Agente A, (3) aprovação final para Go-Live pelo
responsável do projeto. Nenhum item deste documento foi implementado —
este é um relatório de consolidação.

# HANDOFF FINAL — Fase de Desenvolvimento → Fase de Implantação (TEAR V2.5)

**Data:** 2026-07-22
**Branch:** `feat/ui-design-system-ela`
**HEAD:** `1a1d59c` (pushado, working tree limpa)
**Escopo:** `tear-v2-app/` (Laravel 12 + Sanctum + Spatie Permission /
React 19 + Vite). Não cobre o Portal legado GAS (`src/`), que continua em
produção sem alteração, nem o domínio soberano (`CONTRATO_SOBERANO.md`,
nunca reaberto).

---

## 1. Estado atual do projeto

MVP funcionalmente completo e validado por código (não só documentação).
Os dois fluxos ponta a ponta são utilizáveis sem travar:

- **Admin:** Painel, Marcas, Parceiras, Campanhas — CRUD completo, mais
  aprovação/reprovação de Parceira, e drill-down por participação
  (briefing, materiais, pagamento, envio, congelamento).
- **Portal da Influenciadora:** Painel, Campanhas, Perfil, participação
  individual (briefing + upload de material + status de pagamento).
- Frontend servido pelo Laravel a partir de `public/build`, origem única
  (ADR-015) — CI de build + deploy via SSH já existe
  (`.github/workflows/tear-v2-deploy.yml`), sem executar ainda por falta
  de credenciais reais.
- Backend: 192/192 testes verdes (478 assertions), Pint limpo. Frontend:
  `tsc -b`, `vite build` e `oxlint` limpos (só um warning pré-existente
  não relacionado em `auth.tsx:80`).

---

## 2. O que foi concluído nesta fase

- Merge de `worktree-spec-mvp-completa` (logística/Envio, reprovação de
  cadastro, dados contratuais, congelamento de participação, Materiais
  vinculados a Briefing, Portal reorganizado) — 183 testes.
- Macrofase A, ajustes de código sem credenciais reais: Shared Drive
  institucional no `GoogleDriveService`, `TRUSTED_PROXIES`, backup via
  `pg_dump` direto + upload ao Drive + notificação de falha,
  `crontab.example` — 188 testes.
- **ADR-015** — decisão e implementação: Laravel serve o build do Vite,
  origem única. `.github/workflows/tear-v2-deploy.yml` e
  `scripts/deploy-locaweb.sh` criados; `tear-v2-docker.yml` removido
  (produção não consome mais imagem Docker) — 191 testes.
- **Auditoria funcional do MVP** (código real, item a item de cada menu)
  encontrou e corrigiu um bug crítico: crash da tela "Campanhas" do
  Portal da Influenciadora (`CampanhaController::index()` não
  eager-carregava `participacoes`; sem `ErrorBoundary`, a SPA inteira
  quebrava). Corrigido nos dois lados + teste de regressão. Validado ao
  vivo no navegador.
- Menu do Admin revisado: 9 itens que prometiam telas inexistentes
  (Colaborações, Briefings, Materiais, Aprovações, Logística, Pagamentos,
  Documentos, Histórico, Perfil) tiveram a navegação desabilitada
  (`"Item (em breve)"`) — **nada foi removido da arquitetura**: rotas,
  componentes e a funcionalidade real de briefing/materiais/pagamento
  (acessível via Campanha → participação) continuam intactos.
- Documentação de deployment reconciliada: `IMPLEMENTACAO_TECNICA.md`,
  `PLANO_IMPLEMENTACAO.md`, `CONFIGURACAO_PRODUCAO.md`, `DEPLOY.md` e
  `GO_LIVE_CHECKLIST.md` tinham referências desatualizadas (comandos
  Docker de uma arquitetura já substituída, notas de "pendente" já
  resolvidas) — corrigidas.
- **`docs/deployment/PLANO_DE_IMPLANTACAO.md`** criado — consolida todo o
  necessário para o Go-Live em um único documento executável (ver §5).
- Suíte de testes: 192/192 (era 183 no início desta fase).

---

## 3. O que NÃO faz mais parte desta fase

- **Nenhuma funcionalidade nova.** A partir daqui o trabalho é
  implantação, configuração, segurança, validação e operação —
  explicitamente fora de escopo: novas telas, novos endpoints, mudança de
  regra de negócio.
- **Os 9 itens de menu "(em breve)"** (Colaborações, Briefings,
  Materiais, Aprovações, Logística, Pagamentos, Documentos, Histórico,
  Perfil do admin) — permanecem como estão até uma decisão de produto
  específica sobre cada um. Não implementar por conta própria.
- **`GESTOR_MARCA`** — papel seedado mas sem nenhuma tela alcançável
  hoje (sem UI de criação de usuário com esse papel; `CampanhaController`/
  `ParceiraController` retornam vazio/403 para ele). Sem risco ativo
  (ninguém consegue assumir esse papel pelo produto hoje) — não é
  bloqueio de Go-Live, não deve ser "corrigido" nesta fase.
- **Itens P1/P2 de `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`**
  (Policies dedicadas por recurso, rate limit global, lazy loading de
  rotas, Error Boundary React global, Sentry/monitoramento de erro
  frontend, health-checks consolidados, Redis, 2FA) — não bloqueiam o
  Go-Live, ficam para depois.
- **Correção do `MedidaController` para update-in-place** — investigado
  nesta fase e descartado: é histórico de medidas deliberado e testado
  (`MedidaInfluenciadoraTest`), não um bug. Só mudar se houver decisão de
  produto explícita para abrir mão do histórico.
- **A rewrite completa de `CONFIGURACAO_PRODUCAO.md`/`MONITORING.md`** —
  só os comandos ativamente incorretos foram corrigidos; a rewrite
  integral não foi feita (baixo risco, documentado como nota de ponteiro).

---

## 4. Próxima fase oficial

**Fase de Implantação (Go-Live).** Objetivo: sair do ambiente local atual
para o primeiro acesso real em produção, seguindo exclusivamente
atividades de infraestrutura, configuração, segurança, validação e
operação — sem tocar em código de funcionalidade.

---

## 5. Documento fonte da verdade para implantação

**`docs/deployment/PLANO_DE_IMPLANTACAO.md`**

Único documento que define ordem de execução e critérios de aceite do
Go-Live. Os demais documentos de deployment (`PLANO_IMPLEMENTACAO.md`,
`CONFIGURACAO_PRODUCAO.md`, `DEPLOY.md`, `GO_LIVE_CHECKLIST.md`)
continuam válidos como referência detalhada, mas **em caso de conflito, o
`PLANO_DE_IMPLANTACAO.md` decide.**

---

## 6. Ordem dos documentos que o próximo agente deve ler

1. Este documento (`HANDOFF_FINAL_DA_FASE_DE_DESENVOLVIMENTO.md`).
2. `CLAUDE.md` §Documentos oficiais (protocolo padrão do projeto).
3. `docs/_workspace/TASK_ROUTER.md` §18–§22 (histórico completo desta
   fase — bloqueio arquitetural, ADR-015, auditoria funcional, bug
   corrigido, consolidação do plano de implantação).
4. `docs/deployment/PLANO_DE_IMPLANTACAO.md` (execução — ver §5 acima).
5. `docs/deployment/ARQUITETURA_PRODUCAO.md` (por que cada decisão de
   infra foi tomada — não reabrir).
6. `docs/adrs/ADR-015-frontend-servido-pelo-laravel.md` (arquitetura de
   origem única frontend/backend).
7. `CONTRATO_SOBERANO.md` (domínio soberano — nunca reabrir).
8. Sob demanda, durante a execução: `tear-v2-app/docs/CONFIGURACAO_PRODUCAO.md`
   (variável por variável), `tear-v2-app/docs/DEPLOY.md` (runbook
   narrativo), `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` (histórico
   de P0/P1/P2), `tear-v2-app/docs/MONITORING.md` (observabilidade).

---

## 7. Checklist do primeiro dia da fase de implantação

- [ ] Confirmar que `git log`/`git status` batem com este handoff (HEAD
      `1a1d59c`, working tree limpa) antes de qualquer ação.
- [ ] Ler `PLANO_DE_IMPLANTACAO.md` por completo antes de executar
      qualquer etapa.
- [ ] Etapa 1: travar o subdomínio definitivo de produção com o
      responsável do projeto (bloqueia todas as etapas seguintes).
- [ ] Etapa 2: confirmar acesso SSH + painel da Locaweb.
- [ ] Não prosseguir para Etapas 3+ sem 1 e 2 resolvidas.
- [ ] Nenhuma etapa desta fase deve alterar código de funcionalidade —
      se aparecer necessidade de mudar código, é sinal de que se trata de
      um bug real (parar e registrar) ou de scope creep (recusar).

---

## 8. Riscos conhecidos

1. **Validação comercial concentrada em um único piloto** ainda não
   confirmado — risco de negócio, não técnico.
2. **Bus factor 1** — fundador único operando agência, produto e
   suporte.
3. **Migração de infraestrutura** prevista para coincidir com o pico
   sazonal da Jescri em dezembro — planejar a janela de corte (Etapa 17
   do plano de implantação) fora desse período, se possível.
4. **Limites de CPU/memória da hospedagem compartilhada** — `composer
   install --no-dev` pode não caber no plano Locaweb; alternativa já
   documentada (rodar `composer install` no CI, subir `vendor/` pronto
   via `rsync`) caso isso se confirme na Etapa 11 do plano de
   implantação.
5. **Sem monitoramento de erro de frontend** (Pulse cobre só backend) —
   um erro de render não tratado ainda derruba a SPA sem aviso ao time;
   mitigado nesta fase apenas no ponto específico já corrigido
   (`PortalCampanhasListPage`), não de forma geral (Error Boundary global
   é P1, não implementado).
6. **`GESTOR_MARCA` não funcional** — se alguém decidir usar esse papel
   antes de uma implementação real, o usuário verá listas vazias/403 em
   vez de erro claro.
7. **Volume de e-mail transacional** pode exceder o limite do relay SMTP
   incluso no plano Locaweb — sem dado real de volume ainda para
   confirmar se isso é um risco ativo.

---

## 9. Dependências externas

Nenhuma pode ser resolvida pelo agente — todas exigem acesso, credencial
ou decisão do responsável do projeto:

| Dependência | Para quê |
|---|---|
| Subdomínio definitivo | DNS, `APP_URL`/`FRONTEND_URL`/`SESSION_DOMAIN` |
| Acesso SSH + painel Locaweb | Todo o restante do deploy |
| Instância PostgreSQL gerenciada | Banco de produção |
| Registro DNS do subdomínio | Resolução do domínio |
| Google Shared Drive + Service Account | Upload de Material + backup de banco |
| Credenciais SMTP (relay Locaweb ou provedor dedicado) | Convite/reset de senha por e-mail |
| 4 secrets do GitHub Actions (`SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_BASE_PATH`) | Pipeline de deploy funcionar de fato |

Detalhe completo de cada uma (objetivo, onde configurar, como validar,
critério de aceite) em `PLANO_DE_IMPLANTACAO.md` Etapas 1–9.

---

## 10. Critérios para considerar o Go-Live concluído

Todos os itens abaixo verdadeiros (checklist executável completo em
`PLANO_DE_IMPLANTACAO.md` Etapa 16):

- [ ] `/up` e `/api/health` respondem 200 em produção.
- [ ] Certificado HTTPS válido.
- [ ] `php artisan migrate:status` sem pendências.
- [ ] Login funcional na SPA com um `ADMIN` real.
- [ ] Uma rota autenticada de leitura responde sem 500.
- [ ] `/pulse` acessível só para `ADMIN`.
- [ ] `X-Request-Id` presente nas respostas.
- [ ] Upload real de Material funcional (ou 503 controlado, nunca 500).
- [ ] E-mail real de convite/reset chega.
- [ ] Backup válido e recente existe no Google Drive.
- [ ] Sem exceção não tratada recorrente nos logs.
- [ ] Uso real por 24–48h sem incidente que exija rollback (Etapa 17).

Só depois de tudo isso: comunicar a URL definitiva aos usuários `ADMIN`
reais e tratar `tear.<subdomínio>` como o sistema em produção — mantendo
o legado GAS acessível e intocado como *fallback* durante a transição.

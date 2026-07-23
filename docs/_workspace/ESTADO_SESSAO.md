# ESTADO DA SESSÃO

> Snapshot rápido do estado operacional. Não é histórico — histórico
> completo é `docs/_workspace/TASK_ROUTER.md`; marcos são
> `docs/handoff/README.md`. Este documento é reescrito por completo a cada
> `/fim`, nunca acrescentado.

**Última atualização:** 2026-07-23

---

## Estado atual

- **Projeto:** Influencia (Estúdio Elã), Projeto TEAR.
- **Branch:** `docs/governance-phase2`.
- **Commit mais recente:** `906e98c` (local, **não pushado**) — dois
  commits novos desta sessão (`fix(dev)` + `docs(dev)`), aplicados via
  `git cherry-pick` a partir da branch `worktree-fix-dev-env` (PR #78,
  já pushada, aberta em draft com o mesmo conteúdo). Working tree segue
  com as mudanças não commitadas de sessões anteriores (ver
  Pendências), sem alteração.
- **Fase:** ambiente de desenvolvimento corrigido nesta sessão (ver
  abaixo). Missão de documentação arquitetural (Etapa 2, `docs/
  arquitetura/01-03`) segue bloqueada, sem mudança nesta sessão.

## Última sessão concluída (2026-07-23)

Sessão dedicada a corrigir o ambiente de desenvolvimento local
(`backend/` Laravel + `frontend/` React/Vite), sem relação com a missão
de documentação arquitetural das sessões anteriores.

- **Causa raiz identificada:** `backend/composer.json` script `dev`
  rodava `npm run dev` com `cwd` em `backend/`, disparando o Vite do
  scaffold padrão do Laravel (`resources/js/app.js`, `vite.config.js`,
  Tailwind) — sem nenhuma view usando `@vite` — que competia pela porta
  5173 com o Vite real de `frontend/` (React). Daí os "dois Vites" e a
  tela padrão "Laravel + Vite" em vez da aplicação.
- **Corrigido:** `composer dev` agora chama `npm --prefix ../frontend
  run dev`; removidos `backend/vite.config.js`, `backend/resources/js/
  app.js`, `backend/resources/css/app.css` e as deps mortas
  (`laravel-vite-plugin`, `tailwindcss`, `@tailwindcss/vite`, `vite`) de
  `backend/package.json`; removido o script `dev:all` (orquestração
  concorrente e redundante) e a dep `concurrently` não usada de
  `frontend/package.json`; `dev.sh` (script improvisado) apagado;
  `README.md` e `backend/README.md` atualizados para apontar `composer
  dev` como único fluxo oficial.
- **Validado por navegação real** (Chrome DevTools, não só processos
  subindo): `http://localhost:5173` carrega a SPA React (tela "Quero
  ser Parceira", navegação client-side até `/login`), login dispara
  handshake CSRF do Sanctum e `POST http://localhost:8000/api/login`
  com sucesso de CORS (422 esperado, credenciais fictícias). Testado
  primeiro isolado (worktree) e depois no checkout principal, após
  `npm install` em `backend/` remover fisicamente o `vite` antigo do
  `node_modules`.
- **PR #78** (branch `worktree-fix-dev-env`) aberta em draft com o fix
  completo. Os mesmos 2 commits foram também aplicados (`cherry-pick`)
  em `docs/governance-phase2` para permitir teste imediato no checkout
  principal — ainda não pushados nessa branch (decisão de push/merge
  pendente, ver Pendências).
- **Resolve um achado da sessão anterior:** os arquivos não rastreados
  `dev.sh` e `backend/package-lock.json`, registrados como "origem
  desconhecida" em `ESTADO_SESSAO.md`/`TASK_ROUTER.md` §46, eram na
  verdade produto desta mesma sessão (rodando em paralelo à sessão de
  documentação). `dev.sh` foi removido; `backend/package-lock.json`
  agora é rastreado corretamente (reflete só a dependência `concurrently`).
- **Comando oficial de dev:** `cd backend && composer dev`. Aplicação:
  `http://localhost:5173`. API: `http://localhost:8000/api`.
- Detalhe completo: `docs/_workspace/TASK_ROUTER.md` §47.

## Próxima tarefa recomendada

Duas frentes independentes seguem em aberto, sem relação entre si:

1. **Ambiente de dev (esta sessão):** decidir push/merge — (a) mergear
   PR #78 e sincronizar `docs/governance-phase2` depois, ou (b) dar
   `git push` direto em `docs/governance-phase2` com os 2 commits já
   aplicados localmente. Nenhuma ação de código pendente, só decisão de
   fluxo Git.
2. **Missão de documentação arquitetural (sessões anteriores):**
   responsável do projeto decide como desbloquear a Etapa 2 (`docs/
   arquitetura/01-03`) — mesmas 4 opções já levantadas (fornecer
   conteúdo real, habilitar acesso ao artifact de pesquisa, autorizar
   rascunho do agente a partir de `provisorios/`, ou manter como está).
   Decisão adicional pendente, sem relação com a anterior: resolver a
   sobreposição entre `docs/arquitetura/03-plano-mestre-de-implementacao.md`
   e `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`.

## Pendências/bloqueios

- **Push/merge do fix de dev-env pendente** — PR #78 aberta em draft;
  commits equivalentes já aplicados (não pushados) em
  `docs/governance-phase2`. Ver "Próxima tarefa recomendada" item 1.
- **Etapa 2 da missão de documentação arquitetural bloqueada** — ver
  acima e `TASK_ROUTER.md` §46.
- **Mudanças não commitadas acumuladas** (herdadas de sessões
  anteriores, sem alteração nesta sessão): `.claude/commands/{comecar,
  fim}.md`, `CLAUDE.md`, `docs/_workspace/{ESTADO_SESSAO,TASK_ROUTER}.md`,
  `docs/arquitetura/{README,01,02,03}.md`, `docs/governanca/
  GOVERNANCA_DO_PROJETO.md`, `docs/handoff/README.md`, `docs/knowledge/
  README.md`; novos: `.claude/commands/prompt-gpt.md`, `docs/knowledge/
  referencias-externas/` — decisão do responsável do projeto se/quando
  commitar.
- `docs/_workspace/DOCS_INVENTARIO.txt`, `docs/_workspace/
  ESTADO_SESSAO.backup.md` e `provisorios/` (`deep-research-report.md`,
  `documento_de_arquitetura_influencia.md`) seguem não rastreados, sem
  relação com esta sessão.
- Fase 3 da arquitetura de comandos (`/prompt-gpt`) segue aguardando
  aprovação — sem mudança nesta sessão.

## Riscos ativos

- Duplicação real de "Plano Mestre" (`docs/arquitetura/03` vs.
  `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`) sem decisão de qual
  prevalece.
- Inconsistência de estrutura em `docs/arquitetura/README.md` (subpastas
  `adr/`, `legado/`, `planos/`, `referencias/` vazias e divergentes de
  `docs/adrs/`, que é a real).

## IA recomendada

Claude, para a próxima decisão/sessão (planejamento/auditoria — regra
padrão do projeto). Para o fluxo Git de push/merge da pendência 1,
qualquer IA de terminal serve igualmente.

## Prompt de handoff

```
Contexto: projeto Influencia (Estúdio Elã), branch docs/governance-phase2.

Duas frentes em aberto, sem relação entre si:

1. Ambiente de dev (sessão concluída em 2026-07-23): composer.json/
   package.json corrigidos para `composer dev` ser o único comando de
   desenvolvimento (backend/ + frontend/ juntos, sem Vite duplicado).
   PR #78 (branch worktree-fix-dev-env) aberta em draft; os mesmos
   commits já estão localmente em docs/governance-phase2 (não
   pushados). Falta só decidir o fluxo de push/merge — nenhum código
   pendente.

2. Missão de documentação arquitetural (sessões anteriores a esta):
   Etapa 1 (CLAUDE.md) concluída; Etapa 2 (docs/arquitetura/01-03)
   bloqueada — são esqueletos de template sem conteúdo real, e nenhuma
   fonte disponível (provisorios/, artifact de pesquisa) serviu para
   preenchê-los. Também há duplicação não resolvida entre
   docs/arquitetura/03 e docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md.

Ler antes de começar: docs/_workspace/TASK_ROUTER.md §46 (bloqueio da
Etapa 2) e §47 (fix de dev-env).
```

## Checklist

### Ambiente de desenvolvimento

- [x] Causa raiz do Vite duplicado identificada e corrigida
- [x] `composer dev` único comando oficial (backend + frontend + fila + logs)
- [x] `dev.sh` e `dev:all` (fluxos concorrentes/improvisados) removidos
- [x] Validado por navegação real (não só processos subindo)
- [x] README.md e backend/README.md atualizados
- [ ] PR #78 mergeada / commits locais pushados em `docs/governance-phase2`

### Arquitetura de comandos (Fases 1-2)

- [x] Fase 1 — arquitetura definida (Commands, não Skills)
- [x] Fase 2 — `/comecar` e `/fim` implementados
- [ ] Fase 3 — `/prompt-gpt` (e possivelmente `/prompt-cursor`,
      `/prompt-codex`) implementados, reaproveitando lógica compartilhada

### Pesquisa OSS (domínio Influencia)

- [x] Pesquisa de mercado realizada e aprovada
- [x] Consolidada em `docs/knowledge/referencias-externas/`
- [ ] Estudo profundo dos 5 projetos prioritários (Payload, Medusa,
      Frappe, Documenso, Atrium)

### Pesquisa MySQL

- [ ] Rascunho já existe em `provisorios/documento_de_arquitetura_influencia.md`,
      mas propõe stack divergente da oficial (Next.js+Prisma) — precisa
      revisão/decisão do responsável antes de consolidar ou descartar

### Missão de documentação arquitetural (CLAUDE.md + docs/arquitetura)

- [x] Etapa 1 — `CLAUDE.md` revisado como ponto de entrada
- [ ] Etapa 2 — `docs/arquitetura/01-03` preenchidos com conteúdo real
      (bloqueado, aguardando decisão do responsável)
- [ ] Sobreposição `docs/arquitetura/03` vs.
      `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` resolvida
- [ ] Inconsistência de subpastas em `docs/arquitetura/README.md`
      (`adr/`/`legado/`/`planos/`/`referencias/` vs. `docs/adrs/` real)
      corrigida

## Observações

Este documento deve permanecer pequeno e ser sempre substituído por
completo, nunca acrescentado. Decisões permanentes pertencem ao
`CLAUDE.md`; marcos concluídos pertencem a `docs/handoff/README.md`;
histórico completo e dependências entre SPECs pertencem a
`docs/_workspace/TASK_ROUTER.md`.

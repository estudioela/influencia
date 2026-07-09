# NEXT_AGENT.md — contexto mínimo para continuar

> Fonte única de continuidade. Atualizado em 2026-07-08, após o realinhamento de direção da V2.

## Resumo do sistema (≤15 linhas)
ERP + Portal de Influenciadoras do Estúdio Elã. **Um único projeto Google Apps Script** (`mae/`), versionado neste repo e deployado via `clasp`. `mae/Código.js` é o ERP (roda dentro da Planilha Google, menu customizado). `mae/WebApp.js` é o backend do Portal (Web App público, `doGet`). `mae/Index.html` é o front-end do Portal (SPA de arquivo único, sem framework). A **Planilha Google é o único banco de dados**. Arquivos ficam no Google Drive. `portal.estudioela.com` é servido por GitHub Pages **deste repo**, branch `pages-portal` (não `main`) — é produção, sem staging. Versão em produção: deploy `@37` (ERP 1.8), estabilizada. Suíte Jest (~156–163 testes) executa o código GAS real via `vm` e é a **especificação executável** das regras de negócio.

## Arquitetura (poucas linhas)
GitHub Pages (front) · Google Apps Script (backend) · Google Sheets (banco) · Google Drive (arquivos) · Git/GitHub (versionamento). **Essa stack permanece na V2.**

## Estado atual
V1 **estabilizada e em produção** (`@37`). A **V2 acaba de ser redefinida (2026-07-08)**: *não* é migração de infraestrutura — é evolução da aplicação **dentro da stack atual** (arquitetura de código, modularização, débito técnico, UX/UI, funcionalidades, documentação, robustez). **Nenhum código da V2 foi escrito ainda.**

## Tarefas pendentes (em ordem)
1. **P0.1 — Amendar o `CLAUDE.md`** autorizando a evolução da V2. **Bloqueia tudo** (ver "Armadilhas").
2. **P0.2 — Definir com o usuário o escopo funcional** da V2 (funcionalidades novas + melhorias de UX). Hoje indefinido.
3. **P1 — Camada de acesso a dados** (`mae/Repo.js`): isolar `SpreadsheetApp` atrás de um repositório.
4. **P2 — Modularizar `mae/Index.html`** via includes do HtmlService.
5. **P3 — Separar responsabilidades** em `WebApp.js` / `Código.js` (auth, regras, dados).
6. **P4 — Ambiente de staging** (planilha + deployment de teste). Requer ação manual do usuário.
7. **P5–P8** — testes, UX/UI, módulo de Contratos, documentação.

Detalhamento completo, critérios de aceite e dependências: **`docs/V2_ROADMAP.md`**.

## Decisões arquiteturais já tomadas
- **A V2 mantém a stack atual.** Supabase, ETL, Postgres, Next.js e migração de banco estão **suspensos** e reclassificados como pesquisa para uma futura **V3** (só depois que a V2 amadurecer).
- Toda coluna de planilha é resolvida **por nome de cabeçalho** (`getHeaderMap()`), nunca por índice fixo. Migração concluída em 2026-07-07/08.
- IDs de ativação são **UUIDs estáveis** na coluna `ID` de `ATIVAÇÕES` (migração 2026-07-08); upload resolve a linha por ID, não por número de linha.
- Arquivamento (`arquivarGenerico()`) copia **por nome de cabeçalho**, não por posição.
- `BRIEFING` casa por `MES` + `ANO_REFERENCIA`.
- Preparação para a V3 se faz **isolando o acesso a dados** (P1), não migrando agora.

## Armadilhas conhecidas
- **🚨 BLOQUEIO ATIVO**: `CLAUDE.md` §10 (*FRAMEWORK LOCK MODE*) e §11 (*MODO MANUTENÇÃO*) **proíbem refatorar e explorar o repositório**. A V2 é justamente refatoração. **O próximo agente deve, antes de tocar em código, propor ao usuário a seção que autoriza a evolução** (P0.1). Não contornar por conta própria.
- **`clasp push` substitui o remoto por completo.** Arquivo novo em `mae/` só sobe se estiver na allowlist `mae/.claspignore`.
- **`clasp run` não funciona** (a conta é editora, não dona do script). Funções de menu exigem execução manual pelo usuário. Não reinvestigar sem motivo novo.
- **Trabalho não-commitado já foi perdido** por um `clasp pull` externo. **Commitar imediatamente após testes verdes.**
- **`main` é protegido** (PR obrigatório, sem force-push). Nunca contornar.
- **`pages-portal` e `clasp deploy` atingem produção na hora** — sem staging.
- **Erros de validação de célula escapam de `try/catch`** (flush diferido). Foi a causa raiz do "Failed to fetch" no upload.
- **Regras permanentes do usuário**: nunca descartar dado sem informar antes; parar e reportar ao achar risco de perda de dados; `clasp push`/`deploy` só com aprovação explícita.

## Comandos úteis
```bash
npm test                 # suíte Jest — especificação executável das regras
cd mae && clasp push     # SÓ com aprovação explícita do usuário
cd mae && clasp pull     # cuidado: sobrescreve o working dir
```

## Documentação — ordem de leitura
1. **Este arquivo.**
2. `docs/V2_ROADMAP.md` — plano de execução da V2 (fases, aceite, dependências).
3. `FLOW.md` — mapa de fluxos; fonte de execução segundo o `CLAUDE.md`.
4. `CLAUDE.md` — regras estruturais, zona proibida, mapa de risco.
5. `SYSTEM_TRUTH.md` / `SYSTEM_MAP.md` — verdade do sistema. `SYSTEM_SCHEMA.md` é **gerado**, não editar.
6. `docs/V2_ESPECIFICACAO_TECNICA.md` — **suspenso**, pesquisa de V3. Não implementar.

## Arquivos críticos
- `mae/WebApp.js` — backend do Portal (`doGet`, `login`, `get*`, upload). **Ler inteiro antes de qualquer grep parcial.**
- `mae/Código.js` — ERP: menu, `onEdit`, `onFormSubmit`, ciclo mensal, arquivamento.
- `mae/Index.html` — todo o front-end do Portal em um arquivo.
- `mae/.claspignore` — allowlist de deploy. Arquivo novo não listado **não sobe**.
- `mae/appsscript.json`, `mae/.clasp.json` — **zona proibida** (§7 do `CLAUDE.md`).
- `test/` — a especificação executável.

## Primeiro passo recomendado
Ler `docs/V2_ROADMAP.md` §1 e **propor ao usuário o texto da nova seção do `CLAUDE.md`** que autoriza a evolução da V2 (P0.1), junto com a definição do escopo funcional (P0.2). **Nenhum código antes disso** — o próprio `CLAUDE.md` proíbe.

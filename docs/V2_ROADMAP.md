# V2 — Roadmap operacional (evolução sobre a stack atual)

> **Decisão fundadora (2026-07-08)**: a V2 **não é migração de infraestrutura**. A stack permanece: GitHub Pages (front) + Google Apps Script (backend) + Google Sheets (banco) + Google Drive (arquivos) + Git/GitHub (versionamento).
> Objetivo: uma V2 **sólida, organizada, escalável e profissional** dentro dessa arquitetura. Só quando ela estiver madura planejaremos uma **V3** com infraestrutura própria.
> Pesquisa de V3 (Supabase/ETL/Next.js) preservada e **suspensa**: `docs/V2_ESPECIFICACAO_TECNICA.md` + repo `estudioela/plataforma`, tag `v3-research-parked`.

---

## 0. Escopo

**Dentro**: arquitetura de código, modularização, débito técnico, UX/UI, novas funcionalidades, documentação, robustez, manutenibilidade, preparação para migração futura.

**Fora (suspenso)**: Supabase · ETL · migração de banco · Next.js · schema de nova infraestrutura.

---

## 1. Bloqueio de governança — resolver ANTES de qualquer código (P0)

O `CLAUDE.md` atual, escrito para a fase de estabilização, **proíbe exatamente o trabalho que a V2 exige**:

| Regra vigente | Conflito com a V2 |
|---|---|
| §10 *FRAMEWORK LOCK MODE*: "se o fluxo não está no `FLOW.md`, a tarefa não é executada, ponto final"; proibido explorar o repositório | Refatorar/criar módulos exige tocar código ainda não descrito como fluxo |
| §11 *MODO MANUTENÇÃO*: "guardião de estabilidade, **não** refatorador"; "não reestruturar arquitetura sem solicitação explícita" | A V2 **é** reestruturação de arquitetura |
| §11: "não otimizar por conta própria" | Redução de débito técnico é o objetivo |

**Sem resolver isto, o próximo agente é obrigado a recusar a tarefa.** A solicitação explícita do usuário existe (2026-07-08) e precisa estar **escrita no `CLAUDE.md`**, não só no histórico de conversa.

**Ação P0.1 — amendar o `CLAUDE.md`** com uma seção nova (ex.: §12 *MODO V2 — EVOLUÇÃO AUTORIZADA*) que:
- registre a autorização explícita e permanente de refatorar/modularizar dentro do escopo §0;
- mantenha intactas a **zona proibida** (§7) e as travas de produção (`clasp push`/`deploy` só com aprovação; `main` protegido; `pages-portal` é produção);
- substitua o *lock* de exploração por: exploração permitida **dentro de `mae/` e `test/`**, com obrigação de atualizar `FLOW.md` ao final de cada fluxo tocado;
- preserve a saída obrigatória de avaliação de estabilidade.

**Ação P0.2 — decidir o escopo funcional da V2** (ver §3): quais funcionalidades novas e quais melhorias de UX entram. Hoje isso **não está definido** e é a maior incógnita do roadmap.

---

## 2. Pilares técnicos (ordem sugerida)

### P1 — Camada de acesso a dados (maior retorno, prepara a V3)
Hoje `SpreadsheetApp` é chamado direto de dentro das regras de negócio, espalhado por `mae/WebApp.js` e `mae/Código.js`. A unificação por `getHeaderMap()` (2026-07-07/08) já provou o padrão: **toda coluna é resolvida por nome**.

Próximo passo: um módulo de repositório (ex.: `mae/Repo.js`) que concentre leitura/escrita de abas e devolva objetos, não matrizes de células.

- **Por que primeiro**: mata o débito de acoplamento, reduz leituras duplicadas de planilha (risco §11.1) **e** é a preparação real para a V3 — quando a planilha virar banco, só o repositório muda.
- **Critério de aceite**: nenhuma chamada a `SpreadsheetApp` fora de `Repo.js` nos fluxos migrados; suíte de testes verde sem alterar as asserções de negócio.
- **Arquivos**: novo `mae/Repo.js`; `mae/WebApp.js`; `mae/Código.js`; `mae/.claspignore` (allowlist — arquivo novo **não sobe** sem ser listado); `test/`.

### P2 — Modularizar o front-end do Portal
`mae/Index.html` é um arquivo único com todo o HTML+CSS+JS. O HtmlService suporta *includes* (`HtmlService.createTemplateFromFile` + `include()`), então dá para quebrar em parciais **sem trocar nada de infraestrutura**.

- **Critério de aceite**: `Index.html` vira shell + parciais por tela; nenhum comportamento de UI muda; `?mode=qa` continua funcionando.
- **Arquivos**: `mae/Index.html` → novos `mae/views_*.html` / `mae/styles.html` / `mae/scripts.html`; `mae/WebApp.js` (`doGet`); `mae/.claspignore`.
- **Atenção**: esses nomes já existiram e foram consolidados; recriá-los é uma **reversão deliberada**, não um resgate de legado. Documentar como tal.

### P3 — Separar responsabilidades no backend
`mae/WebApp.js` (~900 linhas) mistura roteamento, autenticação, acesso a dados e regra de negócio. `mae/Código.js` acumula menu, `onEdit`, `onFormSubmit`, ciclo mensal, arquivamento e sincronização de looks.

- **Critério de aceite**: auth isolada (`Auth.js`), regras de negócio puras e testáveis sem `SpreadsheetApp`; `doGet` permanece com o fallback incondicional para o Portal (risco conhecido do `?mode=qa`).
- **Arquivos**: `mae/WebApp.js`, `mae/Código.js`, novos módulos, `mae/.claspignore`, `test/`.

### P4 — Ambiente de staging (maior ganho de robustez disponível)
Hoje **não existe staging**: `clasp deploy` atinge o deployment de produção e a branch `pages-portal` atinge `portal.estudioela.com` imediatamente.

- **Proposta**: planilha de teste + deployment separado (`clasp deploy` sem `-i`) + `app_settings` via `PropertiesService` para apontar o `scriptId`/planilha por ambiente.
- **Critério de aceite**: é possível exercitar login, briefing, upload e pagamentos ponta a ponta sem tocar dados reais.
- **Requer**: ação manual do usuário (criar planilha de teste, autorizar deployment novo).

### P5 — Testes e robustez
Base já existe: suíte Jest executando o código GAS real via `vm` (~156–163 testes) — é a **especificação executável** das regras de negócio.

- Ampliar cobertura junto de cada refatoração (o teste é a rede de segurança do refactor, não um extra).
- Endurecer pontos frágeis conhecidos: `onFormSubmit` depende de trigger instalável fora do código; erros que escapam de `try/catch` no flush da planilha (lição do `STATUS_CONTEUDO`).

### P6 — UX/UI
Referência visual disponível em `docs/design-reference/`. Depende de P2 (modularização) para ser sustentável.
- **Não mexer** em `.tracker{align-items:flex-start}` (causa raiz de bug já corrigido).

### P7 — Funcionalidades novas
Única já identificada e ratificada: **módulo de Contratos** (substituiria o AutoCrat). É funcionalidade, não infraestrutura — cabe em GAS. **O resto do escopo funcional depende de P0.2.**

### P8 — Documentação
`CLAUDE.md`, `FLOW.md`, `SYSTEM_MAP.md`, `SYSTEM_TRUTH.md` são as fontes de verdade; `SYSTEM_SCHEMA.md` é gerado. Toda refatoração **atualiza `FLOW.md` no mesmo PR** — não depois.

---

## 3. Dependências

```
P0.1 (amendar CLAUDE.md) ──> tudo
P0.2 (escopo funcional)  ──> P6, P7
P1 (Repo) ──> P3 ──> P7
P2 (front modular) ──> P6
P4 (staging) ──> valida P1/P2/P3 com segurança  [pode correr em paralelo]
P5 (testes) ──> acompanha P1, P2, P3 (não é fase separada)
```

## 4. Riscos conhecidos (herdados, continuam válidos)

- **`clasp push` substitui o conteúdo remoto por completo** — arquivo novo em `mae/` só sobe se estiver na allowlist `mae/.claspignore`; arquivo removido do repo some do script vivo.
- **`clasp run` não funciona** neste projeto (conta é editora, não dona). Funções de menu exigem execução manual do usuário. Não reinvestigar sem motivo novo.
- **`main` é protegido de verdade** (PR obrigatório, sem force-push, `enforce_admins`). Nunca contornar.
- **`pages-portal` é produção sem staging.**
- **Perda de trabalho não-commitado**: um `clasp pull` externo já reverteu alterações testadas. **Commitar imediatamente após testes verdes.**
- **Bug de data (troca dia/mês)** já corrigido em `formatarData()` — não reintroduzir com parser genérico.
- **Zona proibida (§7 do `CLAUDE.md`)** permanece integralmente em vigor.

## 5. Dívidas técnicas adiáveis

- Abas legado de histórico (nome variável, detecção dinâmica) — consolidar depois.
- `mae/PortalUi.js` e `mae_backup_antes_clasp/` não versionados no working dir — investigar e limpar (não tocados até hoje).
- Observabilidade além do Execution Log.
- Divergência de data `LÊ PENHA/JULHO/reel` (BRIEFING 04/08/2026 × ATIVAÇÕES 23/07/2026) — pendente de decisão do usuário.

## 6. Fluxo de trabalho por tarefa

1. Identificar **fluxo → arquivo → função** (regra do `CLAUDE.md`).
2. Escrever/ajustar o **teste primeiro**; ele congela o comportamento atual.
3. Refatorar até o teste passar **sem alterar as asserções de negócio**.
4. `npm test` verde → **commit imediato**.
5. Atualizar `FLOW.md` (e `CLAUDE.md` se a estrutura mudou) **no mesmo PR**.
6. Branch + PR para `main`; CI verde.
7. `clasp push` / `clasp deploy` **só com aprovação explícita do usuário**.
8. Emitir a saída obrigatória de estabilidade (§11 do `CLAUDE.md`).

## 7. Primeiro passo

**P0.1** — propor ao usuário o texto da nova seção do `CLAUDE.md` que autoriza a evolução da V2. Nenhum código antes disso.

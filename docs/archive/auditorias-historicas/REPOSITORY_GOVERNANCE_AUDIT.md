# Auditoria de Governança do Repositório — TEAR V2

**Data:** 2026-07-21
**Escopo:** organização documental do repositório (`docs/`, `knowledge/`,
`scripts/`, raiz). Não avalia código de aplicação (`src/`, `test/`,
`tear-v2-app/backend`, `tear-v2-app/frontend`, `mcp/`).

---

# 1. Resumo executivo

O repositório acumulou, ao longo do desenvolvimento das SPECs e da
produtização (`tear-v2-app`), um volume grande de relatórios de sprint,
planos técnicos, auditorias pontuais e checkpoints de sessão — documentos
que cumpriram sua função no momento em que foram escritos, mas cujas
conclusões já foram absorvidas pelo documento de estado canônico
(`docs/_workspace/TASK_ROUTER.md`). Havia também um subconjunto de arquivos
em `knowledge/specs/` que eram duplicatas byte-idênticas ou cópias
desatualizadas de arquivos canônicos em `docs/`.

Nenhuma decisão arquitetural, regra de negócio ou código foi alterado por
esta auditoria ou pela limpeza que a seguiu.

# 2. Diagnóstico

- **Overengineering documental confirmado**, concentrado em `docs/` raiz:
  ~22 relatórios/planos de ponto-no-tempo (sprint reports, auditorias,
  checkpoints), a maioria autodeclarada como não-mutante ("nenhum código
  foi alterado", "checkpoint de sessão") e sem nenhuma referência ativa
  fora do próprio cluster de relatórios.
- **Duplicação estrutural em `knowledge/specs/`**: 5 de 8 arquivos eram
  cópias (exatas ou obsoletas) de arquivos já canônicos em `docs/history/`,
  `docs/specs/` e `docs/_workspace/` — incluindo uma cópia desatualizada de
  `TASK_ROUTER.md`, o documento que o próprio `/CLAUDE.md` declara como
  "fonte única de estado".
- **Referências mortas em `README.md`** (raiz): seção "Documentação"
  duplicada (aparecia duas vezes no arquivo) apontando para
  `docs/engenharia_reversa/`, pasta que nunca existiu neste repositório.
- **`.gitignore` com regra ampla demais**: `archive/` (sem âncora) ignorava
  qualquer diretório chamado "archive" em qualquer profundidade — incluindo
  `knowledge/archive/`, que já continha conteúdo intencionalmente versionado.
- Documentos com débito ainda aberto (perguntas 🟠 ao PO, achados ainda não
  corrigidos) foram mantidos ativos, não arquivados — arquivamento não é
  aplicado a decisão pendente.

# 3. Arquivos mantidos (canônicos ou ativos)

`CLAUDE.md`, `README.md`, `PROJECT_GOVERNANCE.md`, `docs/PRD.md`,
`docs/_workspace/TASK_ROUTER.md`, `docs/_workspace/DEPLOY_CHECKLIST.md`,
`docs/_workspace/ROTEIRO_HOMOLOGACAO.md`, `docs/history/CONTRATO_SOBERANO.md`,
`docs/adrs/*` (10), `docs/specs/*` (14), `docs/architecture/*`,
`docs/domain/*`, `docs/design/*`, `docs/stitch-export/*`, `docs/history/*`,
`ARQUITETURA_PRODUCAO.md`, `PLANO_IMPLEMENTACAO.md`, `IMPLEMENTACAO_TECNICA.md`,
`TEAR_V2.5_GO_LIVE_CHECKLIST.md`, `TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md`,
`TEAR_V2.5_RELEASE_READINESS.md`, `docs/ARCHITECTURE_REVIEW_V2_5.md`,
`docs/HANDOFF_FINAL.md`, `docs/ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md`,
`docs/ROADMAP_MESTRE_TEAR_V2.md`, `docs/CONSOLIDACAO_REGRAS_CRITICAS_P0_TEAR_V2.md`
(5 perguntas 🟠 ao PO ainda abertas), `docs/RELATORIO_SPRINT_2_1_PORTAL_INFLUENCIADORA.md`
e `docs/HANDOFF_PRODUCTIZACAO_TEAR_V2.md` (referenciados ativamente por
`TASK_ROUTER.md`), `docs/BACKLOG_FUNCIONAL_V2_6.md`, `tear-v2-app/docs/*`,
`knowledge/README.md`, `knowledge/references/REF-001..004`,
`knowledge/sistema-b/*`, `scripts/*`.

# 4. Arquivos consolidados

Nenhuma consolidação de conteúdo (fusão de dois documentos em um) foi
executada nesta rodada — apenas arquivamento e remoção de duplicatas.
Candidatos identificados para consolidação futura, não executados por
exigirem reescrita de conteúdo (fora do critério "arquivar/excluir" desta
limpeza):
- `PLANO_IMPLEMENTACAO.md` ↔ `IMPLEMENTACAO_TECNICA.md` (sobreposição de
  escopo não totalmente comprovada).
- `PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` contém decisão arquitetural
  (P0-2) que tecnicamente deveria virar ADR formal.

# 5. Arquivos movidos para archive/

**`docs/archive/`** (19 arquivos, de `docs/` e `docs/_workspace/`) — ver
`docs/archive/README.md` para a lista e o critério exato de arquivamento
(sem referência ativa em `README*`, `CLAUDE.md`, `HANDOFF*`,
`TASK_ROUTER.md`, scripts ou workflows).

**`knowledge/archive/`** (+3 arquivos): `00_BRIEFING_DO_PO.md`,
`01_ESTRUTURA_DA_SPEC.md`, `PROMPT_GEMINI.md` — artefatos de processo
(insumos originais para a escrita das SPECs), já consumidos, sem uso ativo
além do índice de sincronização do NotebookLM (`knowledge/.notebook-index.json`,
atualizado para refletir o novo caminho).

# 6. Arquivos removidos

6 duplicatas comprovadas (diff byte-a-byte vazio, ou cópia obsoleta
divergente do canônico), todas em `knowledge/`:

| Arquivo removido | Duplicava | Evidência |
|---|---|---|
| `knowledge/CLAUDE.md` | `/CLAUDE.md` | `diff` vazio |
| `knowledge/specs/CONTRATO_SOBERANO.md` | `docs/history/CONTRATO_SOBERANO.md` | `diff` vazio |
| `knowledge/specs/SPEC-025.md` | `docs/specs/SPEC-025-acesso-ao-portal-da-parceira.md` | `diff` vazio |
| `knowledge/specs/SPEC-035.md` | `docs/specs/SPEC-035-identidade-e-acesso.md` | `diff` vazio |
| `knowledge/specs/README.md` | `knowledge/README.md` | cópia obsoleta (citava `Envelope.js`, renomeado para `Nucleo.js` pela ADR-014) |
| `knowledge/specs/TASK_ROUTER.md` | `docs/_workspace/TASK_ROUTER.md` | cópia divergente e desatualizada (849 vs 1457 linhas) do documento declarado "fonte única de estado" |

`knowledge/specs/` ficou vazio e deixou de existir. O índice
`knowledge/.notebook-index.json` foi atualizado para remover as entradas
correspondentes (mantendo consistência com o disco).

# 7. Estrutura final do repositório (documentação)

```text
docs/
├── adrs/           — decisões arquiteturais (nunca reabertas sem novo ADR)
├── specs/          — especificação de cada SPEC-NNN implementada
├── architecture/    — modelo de dados e persistência
├── domain/          — domínio (Sistema A / GAS)
├── design/          — sistema de design e fluxos de UX (Sistema B)
├── history/         — Contrato Soberano e histórico de migração
├── archive/         — relatórios e planos históricos já superados (novo)
└── _workspace/       — TASK_ROUTER.md (fonte única de estado) e checklists

knowledge/
├── README.md
├── archive/          — pesquisa de referência e artefatos de processo já consumidos
├── references/       — pesquisa técnica profunda (OAuth, sessão, identidade)
└── sistema-b/         — baseline de arquitetura/domínio do tear-v2-app
```

# 8. Plano de limpeza em etapas (executado)

1. Confirmar estado do git (branch, sincronização, alterações pendentes) —
   feito.
2. Levantar todos os documentos em escopo e classificar
   (manter / manter com ressalvas / arquivar / excluir) com evidência
   objetiva (diff, grep de referências cruzadas) — feito.
3. Verificar ausência de referência ativa em `README*`, `CLAUDE.md`,
   `HANDOFF*`, `TASK_ROUTER.md`, scripts e workflows para cada candidato a
   arquivar/excluir — feito; reclassificou 9 arquivos de `knowledge/specs/`
   de "excluir" para "manter com ressalvas" na primeira passada, até a
   leitura de `scripts/sync-notebook.sh` confirmar que o índice tolera
   entradas órfãs (já havia precedente disso no próprio repositório),
   liberando a remoção com segurança.
4. Mover os 19 arquivos de `docs/`/`docs/_workspace/` para `docs/archive/`;
   mover os 3 artefatos de processo de `knowledge/specs/` para
   `knowledge/archive/`; remover as 6 duplicatas comprovadas — feito via
   `git mv`/`git rm` (preserva histórico).
5. Atualizar `knowledge/.notebook-index.json` para os novos caminhos e
   remover entradas dos arquivos excluídos — feito.
6. Corrigir `.gitignore` (`archive/` → `/archive/`) para não ignorar as
   pastas de archive intencionais — feito.
7. Corrigir referências obsoletas: seção duplicada e links mortos em
   `README.md`; 3 referências cruzadas em documentos mantidos
   (`PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`,
   `RELATORIO_SPRINT_2_1_PORTAL_INFLUENCIADORA.md`,
   `CONSOLIDACAO_REGRAS_CRITICAS_P0_TEAR_V2.md`) atualizadas para o novo
   caminho em `docs/archive/` — feito.
8. Varredura final confirmando que nenhuma referência externa a um arquivo
   arquivado/removido permanece fora de `docs/archive/` — feito.
9. Commit atômico único — feito.

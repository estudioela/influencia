# ADR-010 · Banco oficial do Portal (planilha V2)

**Status:** Aprovado (decisão do operador, 16/07/2026)
**Resolve:** pendência levantada na sessão de implementação da SPEC-027 — qual
planilha o Apps Script Standalone deve abrir (reaproveitar o ID legado
`1BTTQNbpT3qvndE7qnfOU_rBggWZgnIIFTr8qaT97sZY` ou provisionar uma planilha
nova); referenciada como Q-10 em `TASK_ROUTER.md`/`PLANILHA_TEAR_2.0_MAPA.md`.
**Contexto:** `src/shared/Config.js` já reserva a chave `SPREADSHEET_ID`
(Script Properties) sem valor versionado (`PROJECT_GOVERNANCE` §3.5/§3.6);
faltava decidir se essa chave aponta para a planilha antiga ou para uma nova.

> **Nota histórica (2026-07-23):** decisão sobre qual planilha Google
> Sheets serviria de banco do Portal legado (`src/`), removido do
> repositório — substituído por `tear-v2-app/` (Laravel + PostgreSQL/
> SQLite, `ADR-015`). Mantido como registro histórico; não orienta
> trabalho vigente.

## Decisão

Será criada uma **planilha V2 nova**, nome oficial **"Portal Ela"**, como
banco oficial do Portal — cobre todas as abas físicas do domínio (`BASE DE
DADOS`, `COLABORACOES`, `BRIEFING`, `ENTREGAS`, `ENVIOS`, `DOCUMENTOS`,
`SESSOES`, `BLOQUEIOS`, e as que vierem a seguir).

- **Origem dos dados:** migração da planilha antiga (legado) — não nasce
  vazia; os dados existentes migram para a estrutura V2.
- **Tipo de projeto Apps Script:** Standalone (não containerbound à planilha
  antiga).
- **Configuração:** o ID da planilha nova é provisionado em Script
  Properties, sob a chave `SPREADSHEET_ID` (já definida em
  `src/shared/Config.js` — nenhuma alteração de código exigida por este ADR).

## Regras

- Nenhum ID de planilha é versionado no repositório (mantém
  `PROJECT_GOVERNANCE` §3.5/§3.6).
- O ID legado `1BTTQNbpT3qvndE7qnfOU_rBggWZgnIIFTr8qaT97sZY` NÃO deve ser
  configurado em `SPREADSHEET_ID` — essa chave aponta exclusivamente para a
  planilha nova "Portal Ela".
- A migração de dados da planilha antiga para "Portal Ela" é
  responsabilidade do operador (execução manual ou rotina futura), fora do
  escopo de código deste ADR.
- Toda aba física nova exigida por uma SPEC (ex.: `SESSOES`/`BLOQUEIOS` da
  SPEC-025) é criada dentro de "Portal Ela", nunca na planilha antiga.

## Consequências

- Antes do primeiro `clasp push`/deploy real, o operador deve: (1) criar a
  planilha "Portal Ela"; (2) criar todas as abas físicas exigidas pelas SPECs
  já implementadas; (3) migrar os dados da planilha antiga; (4) provisionar
  `SPREADSHEET_ID` em Script Properties do projeto Standalone.
- Nenhuma alteração de código é exigida por este ADR — `Config.js`/`Portal.js`
  já leem a chave de forma agnóstica ao valor.
- Não há, ainda, rotina automatizada de criação/migração de planilha no
  repositório — se vier a ser necessária, exige nova SPEC/ADR.

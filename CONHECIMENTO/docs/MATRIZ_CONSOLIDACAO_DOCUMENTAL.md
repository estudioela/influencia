# MATRIZ_CONSOLIDACAO_DOCUMENTAL.md

> Matriz de consolidacao da auditoria documental do Projeto TEAR.
> Sem execucao de delecao nesta etapa.
>
> Regra aplicada: Soberano V2 vence. Documentacao descreve destino, nao o estado tecnico legado.

## 1. Classificacao por geracao

- Geracao A (soberana, manter):
  - CONTRATO_SOBERANO.md
  - DOMAIN_MODEL_V2.md
  - PLANILHA_TEAR_2.0_MAPA.md
  - DIRETRIZES_DE_ENGENHARIA_PARA_O_PROJETO_TEAR.md

- Geracao B/C (legado de modelo Ciclo/Plano, obsolescencia programada):
  - CORE_DOMAIN.md
  - EVENT_CATALOG.md
  - GUIA_OPERACIONAL_TEAR.md
  - spec/SCHEMA_V2.md
  - docs_para_revisar/DOMAIN_DECISIONS.md
  - docs_para_revisar/INVARIANTS.md
  - docs_para_revisar/USE_CASES.md
  - docs_para_revisar/PLANO_DE_TESTES_QA.md
  - docs_para_revisar/PROJECT_STATUS.md
  - docs_para_revisar/BACKLOG.md
  - docs_para_revisar/CHANGELOG.md
  - docs_para_revisar/CHANGELOG_DE_DESENVOLVIMENTO.md
  - docs_para_revisar/README.md

- Geracao Meta/V3 (arquivo historico, fora do escopo operacional V2):
  - V2_ESPECIFICACAO_TECNICA.md

## 2. Ordem recomendada (apos sua validacao)

1. Promover os documentos consolidados como referencia primaria.
2. Reclassificar os documentos B/C e Meta/V3 como obsoletos/arquivo.
3. Executar delecao apenas com sua autorizacao final.

## 3. Tabela de decisao

| DOCUMENTO NOVO | DOCUMENTOS INCORPORADOS | PODE APAGAR? |
|---|---|---|
| DOMAIN_MODEL_CONSOLIDADO.md | DOMAIN_MODEL_V2.md; CORE_DOMAIN.md; EVENT_CATALOG.md; spec/SCHEMA_V2.md; docs_para_revisar/DOMAIN_DECISIONS.md; docs_para_revisar/INVARIANTS.md; docs_para_revisar/USE_CASES.md | Sim, apos validacao final (somente os incorporados de B/C) |
| OPERATIONS_GUIDE.md | GUIA_OPERACIONAL_TEAR.md; docs_para_revisar/PLANO_DE_TESTES_QA.md; docs_para_revisar/PROJECT_STATUS.md; docs_para_revisar/BACKLOG.md | Sim, apos validacao final (somente os incorporados de B/C) |
| MATRIZ_CONSOLIDACAO_DOCUMENTAL.md | docs_para_revisar/CHANGELOG.md; docs_para_revisar/CHANGELOG_DE_DESENVOLVIMENTO.md; docs_para_revisar/README.md; V2_ESPECIFICACAO_TECNICA.md | Sim, apos validacao final (B/C e Meta/V3) |

## 4. Nota de transicao

A implementacao atual ainda contem estruturas de modelo legado Ciclo/Plano.
Isso e tratado como divida tecnica e nao altera o modelo documental soberano V2.

# Sistema B — tear-v2-app: por que existe, objetivo e relação com o legado

> Decisão de governança registrada em 2026-07-20 pelo responsável do projeto.
> Este documento é a referência oficial para essa decisão até que seja
> formalizada em ADR/TASK_ROUTER do repositório principal.

## O que é

`tear-v2-app/` (backend Laravel 13 + Sanctum + Spatie Permission; frontend
React 19 + Vite + TypeScript) é uma segunda implementação do domínio TEAR,
iniciada em 2026-07-19 dentro da branch `feat/ui-design-system-ela` do
repositório principal, sem ADR ou SPEC formal — decisões de domínio foram
aprovadas em conversa direta com o responsável do projeto e registradas como
prosa no `docs/_workspace/TASK_ROUTER.md` §15 do repositório GAS.

## Por que existe

O sistema em produção (Google Apps Script + Google Sheets, ver
`knowledge/README.md`) atingiu os limites estruturais do seu banco físico
(planilha) e da sua camada de apresentação (HTML Service dentro de iframe
sandboxed). `tear-v2-app` nasceu como uma reconstrução em stack convencional
(banco relacional, API REST, SPA) para permitir crescimento que o modelo
atual não comporta com a mesma velocidade.

## Objetivo

**`tear-v2-app` é o sucessor planejado do sistema GAS — não um protótipo
descartável nem um esforço paralelo permanente.** A intenção declarada é que
ele se torne a nova plataforma TEAR e, no futuro, substitua o sistema atual
em produção.

## Relação com o legado (sistema GAS)

- O sistema GAS **permanece a operação atual** enquanto `tear-v2-app`
  amadurece — nenhuma migração de dados foi iniciada, e nenhuma data foi
  definida para isso.
- O sistema GAS é tratado como **fonte histórica e referência de domínio**:
  o vocabulário e as regras de negócio consolidados em
  `CONTRATO_SOBERANO.md`, no `docs/PRD.md` e nas SPECs continuam sendo a
  referência de o que o negócio precisa — mesmo quando `tear-v2-app` decide
  modelar isso de forma diferente (ver `DOMAIN_MODEL.md` para as divergências
  já conhecidas, ex.: `Campanha` sem vínculo com `MesReferencia`).
- O sistema GAS **não será evoluído como produto principal** a partir desta
  decisão — novas capacidades de negócio devem ser construídas em
  `tear-v2-app`, não no GAS. Correções de bug e dívidas técnicas já
  registradas no GAS continuam válidas até a eventual substituição.

## Prioridade atual (2026-07-20)

Consolidar documentação, arquitetura e mapa do sistema antes de retomar
desenvolvimento de novas features. Ver `ARCHITECTURE.md`, `DOMAIN_MODEL.md`
e `BUSINESS_FLOWS.md` nesta mesma pasta.

## Pendências de governança conhecidas (não resolvidas por este documento)

- O `docs/_workspace/TASK_ROUTER.md` do repositório principal ainda descreve
  `tear-v2-app` como "esforço paralelo" (§15) — precisa ser atualizado para
  refletir a decisão de sucessor planejado registrada aqui.
- Nenhum ADR formal do sistema GAS documenta esta decisão de sucessão;
  recomenda-se abrir um ADR quando o repositório principal for tocado de
  novo, para não depender só deste arquivo em `knowledge/`.

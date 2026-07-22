# INVENTARIO_DOCUMENTAL.md — Documentação de Deployment/Release (TEAR V2.5)

**Data:** 2026-07-22
**Escopo:** documentação relacionada à implantação em produção
(Go-Live) do `tear-v2-app/` — deployment, arquitetura de produção,
release readiness e runbooks operacionais associados. Não cobre a
documentação de produto/domínio (`docs/PRD.md`, `docs/specs/`,
`docs/domain/`) nem a auditoria de reorganização geral do repositório
(`docs/governance/REPOSITORY_GOVERNANCE_AUDIT.md`, escopo distinto e já
executado).

**Objetivo:** um só lugar para responder "qual documento eu leio para
saber X sobre o Go-Live" — sem precisar abrir 10 arquivos para descobrir
que 6 deles dizem a mesma coisa com datas diferentes.

---

## Como ler a coluna Status

- **ativo** — fonte de informação corrente, sem substituto.
- **ativo (fonte única)** — além de ativo, é o documento a citar/editar
  quando o assunto for esse; os demais documentos que tocam o mesmo
  assunto devem apontar para ele, não repetir o conteúdo.
- **legado** — superado para fins de execução, mantido só como histórico
  auditável (decisão já tomada por uma sessão anterior, registrada no
  próprio arquivo). Não editar para refletir estado novo — só o
  documento "fonte única" correspondente.
- **redundante (parcial)** — parte do conteúdo é redundante com um
  documento mais novo; a parte não-redundante continua válida. Candidato
  a reescrita futura, não a remoção.

Nenhum arquivo abaixo é candidato a **exclusão** nesta sessão — a emenda
que originou este inventário foi explícita: identificar, propor migração,
não apagar.

---

## Inventário

| Documento | Objetivo | Status | Fonte oficial (se não for ele mesmo) | Dependências |
|---|---|---|---|---|
| `docs/deployment/PLANO_DE_IMPLANTACAO.md` | Ordem de execução completa do Go-Live (18 itens), critérios de aceite, GO/NO-GO do dia do deploy, rollback, operação pós-go-live | **ativo (fonte única)** | — | `ARQUITETURA_PRODUCAO.md` (não reabre), `ADR-015`, `AUDITORIA_LOCAWEB.md`, `GO_LIVE_CHECKLIST.md`, `RELEASE_READINESS.md` |
| `docs/deployment/ARQUITETURA_PRODUCAO.md` | Decisão de arquitetura de infraestrutura (hospedagem, banco, deploy, storage, backup, domínio) — aprovada e definitiva, 2026-07-21 | **ativo (fonte única)** — de arquitetura, não de execução | — | Nenhuma (raiz da decisão) |
| `docs/adrs/ADR-015-frontend-servido-pelo-laravel.md` | ADR: Laravel serve o build do Vite (`public/build`), origem única frontend/backend | **ativo (fonte única)** | — | `ARQUITETURA_PRODUCAO.md` §3 |
| `docs/deployment/AUDITORIA_LOCAWEB.md` | Achados reais (read-only) do painel Locaweb — Etapa 2 do Go-Live. Origem do bloqueio ⚠ sobre SSH/deploy ainda não resolvido | **ativo (fonte única)** — do estado real da hospedagem | — | `ARQUITETURA_PRODUCAO.md` §1/§3 (pontos que precisam revisão) |
| `docs/deployment/IMPLEMENTACAO_TECNICA.md` | Mapeamento técnico arquivo-a-arquivo do que mudou em código para a arquitetura aprovada existir, com status por item | ativo — referência técnica detalhada, complementar | Ordem de execução: `PLANO_DE_IMPLANTACAO.md` | `ARQUITETURA_PRODUCAO.md` |
| `docs/deployment/PLANO_IMPLEMENTACAO.md` | Runbook original das 12 etapas (anterior à consolidação de 2026-07-22) | **legado** (nota explícita no topo do próprio arquivo) | `docs/deployment/PLANO_DE_IMPLANTACAO.md` | — |
| `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` | Histórico de bloqueios P0/P1/P2 de código e o que foi resolvido em cada sessão | ativo (histórico auditável) — **redundante (parcial)** na seção "Infraestrutura/Deploy" | Ordem de execução/infra: `PLANO_DE_IMPLANTACAO.md`. P0/P1/P2 de código: este arquivo mesmo | `ARQUITETURA_PRODUCAO.md` (nota de consolidação já presente no arquivo) |
| `docs/release/TEAR_V2.5_RELEASE_READINESS.md` | Fotografia de prontidão de **código** (GO/NO-GO), auditoria independente, testes/lint executados em 2026-07-21 | ativo — mas é um snapshot pontual, não um portão de decisão vivo | Portão de decisão do dia do deploy: `PLANO_DE_IMPLANTACAO.md` §3 (GO/NO-GO) | Verificação direta no código, não em outros documentos |
| `tear-v2-app/docs/DEPLOY.md` | Runbook narrativo de deploy (pré-requisitos, pipeline, smoke test, rollback, backup) | ativo — nível "como fazer" citado pela Etapa 16 de `PLANO_DE_IMPLANTACAO.md` | Ordem/critérios de aceite: `PLANO_DE_IMPLANTACAO.md` | `ARQUITETURA_PRODUCAO.md`, ADR-015 |
| `tear-v2-app/docs/CONFIGURACAO_PRODUCAO.md` | Auditoria variável-a-variável do `.env` de produção (o que cada uma faz, impacto se ausente) | **redundante (parcial)** — comandos de exemplo (`docker compose ...`) ainda são da arquitetura anterior; a explicação de cada variável continua correta | Comandos reais: `PLANO_DE_IMPLANTACAO.md` Etapa 8 (nota já presente no próprio `PLANO_DE_IMPLANTACAO.md` §0) | `ARQUITETURA_PRODUCAO.md` |
| `tear-v2-app/docs/MONITORING.md` | O que já existe de observabilidade (Pulse, RequestId) e o que fica para P1/P2 | ativo | — | — |
| `docs/history/CONTRATO_SOBERANO.md` | Fonte oficial e imutável de domínio/negócio do projeto — nunca reaberto | **ativo (fonte única)** | — | Nenhuma (raiz da decisão de domínio) |
| `docs/governance/REPOSITORY_GOVERNANCE_AUDIT.md` | Auditoria de reorganização geral da documentação do repositório, já executada | **legado** (histórico de uma limpeza já concluída, escopo repositório inteiro, não Go-Live) | Para o assunto Go-Live especificamente: este inventário | — |

---

## Achados desta revisão (corrigidos nesta sessão)

- **4 referências quebradas a `CONTRATO_SOBERANO.md`** — citado sem
  caminho (implicitamente na raiz) em `CLAUDE.md` (×2),
  `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` e
  `docs/release/TEAR_V2.5_RELEASE_READINESS.md`. O arquivo foi movido
  para `docs/history/CONTRATO_SOBERANO.md` na reorganização de
  documentação (commit `5547042`) e as referências nunca foram
  atualizadas. **Corrigido nos 4 arquivos.**
- **Caminho incompleto** em `PLANO_DE_IMPLANTACAO.md` §0: o comando
  `BackupDatabaseToDrive.php` estava listado sem o prefixo
  `tear-v2-app/backend/`. **Corrigido.**
- **`AUDITORIA_LOCAWEB.md` e `RELEASE_READINESS.md` não estavam listados
  nas Referências (§6) de `PLANO_DE_IMPLANTACAO.md`**, apesar de ambos
  serem centrais ao Go-Live. **Corrigido.**
- **Bloqueio real não reconciliado** entre `AUDITORIA_LOCAWEB.md`
  (achado de 2026-07-22, SSH por senha/temporário, "Git" = FTP) e as
  Etapas 9/11 de `PLANO_DE_IMPLANTACAO.md` (que ainda descreviam deploy
  100% automatizado por chave SSH). **Anotado com callout ⚠ nas duas
  etapas** — não resolvido (é decisão de arquitetura de deploy, fora do
  mandato desta sessão).

## Não corrigido nesta sessão (fora do escopo de documentação)

- `tear-v2-app/docs/CONFIGURACAO_PRODUCAO.md` mantém comandos de exemplo
  de uma arquitetura Docker anterior — reescrita completa é trabalho
  maior que uma correção pontual; `PLANO_DE_IMPLANTACAO.md` já documenta
  essa ressalva e traduz os comandos certos onde importa (Etapa 8).
- A decisão de arquitetura de deploy (Etapa 9 de `PLANO_DE_IMPLANTACAO.md`)
  continua em aberto — é decisão do responsável do projeto, não deste
  agente.

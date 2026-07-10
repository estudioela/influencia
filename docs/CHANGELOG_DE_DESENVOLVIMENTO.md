# Changelog de Desenvolvimento — Projeto Tear (V2)

Registro objetivo por data. Mais recente no topo.

## 2026-07-10 — Módulo de Logística (V2, back-end)

**Objetivo:** implementar a Logística de envios como entidade persistida real
(aba `Logistica`), seguindo o padrão V2 (Repository/Entity/Service/Controller).
Sprint decidida pelo usuário: só Logística. Pagamento permanece derivado
(`PagamentoService`); Briefing permanece coluna (`Ativacoes.Link_Briefing`) — **não** viraram abas.

**Criados (dentro dos 10 arquivos consolidados — sem novos arquivos de back-end)**
- `Logistica` (entidade + máquina de estados) → `tear/Modelos.js`
- `LogisticaRepository` + `CAMPOS_LOGISTICA` → `tear/Repositories.js`
- `LogisticaService` (+ eventos `LogisticaEnviada`/`LogisticaStatusAlterado`) → `tear/Services.js`
- `LogisticaController` + `ACOES_LOGISTICA` → `tear/Controllers.js`
- `ESTADOS_LOGISTICA` + `PLANILHAS.LOGISTICA` → `tear/Infra.js`
- `test/tear-logistica.test.js` (28 testes: entidade, repositório, service, controller)
- Aba `Logistica` documentada em `docs/spec/SCHEMA_V2.md`; fluxo em `FLOW.md`

**Reconciliado**
- `DevTools.cabecalhosV2_()`: cabeçalhos de `Logistica` migrados do rascunho V1
  (`INFLU KEY`/`STATUS LOGISTICA`) para o schema V2 (`ID_Logistica`, `ID_Ciclo`, …).

**Automação:** `registrarEnvio()` = transição `Aguardando Envio → Enviado` + rastreio +
evento. **Disparo real de e-mail NÃO acoplado** — efeito externo, aguarda autorização (§12.4).

**Fora de escopo (registrado, não implementado):**
- UI de Logística (Painel Admin) + entrypoint `google.script.run` em `Roteador.js` — próximo incremento; levanta a questão de auth de admin (inexistente na V2).
- `DevTools.cabecalhosV2_()` ainda define a aba `Briefings`, que a decisão desta sprint diz **não** criar. `setupV2Database()` a criaria se executado — revisar antes do cut-over.

**Testes:** `jest` — 466/466 verdes (33 suítes).

## 2026-07-10 — Consolidação de arquivos + Wizard de cadastro de parceiras

**Objetivo:** reduzir 34 → 10 arquivos principais (fusão por camada) e implementar
cadastro/edição de parceiras em wizard de 3 passos com endpoints administrativos.

**Criados**
- `tear/{Infra,Modelos,Repositories,Services,Controllers,Roteador,DevTools}.js` (back-end fundido por camada)
- `tear/{Styles,Templates}.html` (front-end fundido)
- `test/tear-parceira.test.js` (8 testes: lookup/upsert, validação, gate admin)
- `docs/{SYSTEM_MAP,KNOWN_DECISIONS,CHANGELOG_DE_DESENVOLVIMENTO}.md`

**Removidos**
- Pastas `tear/{controllers,dominio,entrypoints,infra,operacoes,repositories,services}/` (24 arquivos)
- `tear/{styles_core,styles_theme,components_ui,components_nav,views,app}.html`

**Renomeados/fundidos:** nenhum nome de função ou classe alterado — só concatenação por camada.

**Principais funções alteradas/criadas**
- `ParceiroRepository`: +`buscarPorCampo`, +`upsert` (por cabeçalho físico), +`_todasAsLinhas`
- `ParceiroService` (novo), `ParceiroController` (novo)
- `Roteador`: +`_exigirAdmin` (extraído de `adminDefinirSenha`), +`apiBuscarParceira`, +`apiSalvarParceira`, +`_montarControllerDeParceiro`
- `DevTools.cabecalhosV2_()`: schema físico completo de `Parceiros_Influenciadoras` (+ abas Briefings/Logistica); `parceirosDaBaseV1`: migra todo histórico, ignora status
- Front (`Templates.html`): rota+`view-cadastro`, estado `WIZARD`, schema `CAMPOS_PARCEIRA`, navegação avançar/voltar, prefill por e-mail/CNPJ

**Testes:** `jest` — 438/438 verdes (32 suítes).

**Commits (branch `feat/segregacao-tear`)**
- `refactor(tear): funde back-end em 7 arquivos por camada`
- `refactor(tear): funde front-end em 3 arquivos (Index, Styles, Templates)`
- `feat(tear): wizard admin de cadastro de parceiras (Etapa 2)`
- `chore(tear): schema fisico completo de Parceiros + migracao de todo historico`

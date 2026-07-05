# FLOW.md — Fluxos executáveis (fonte primária para agentes)

> Consultar este arquivo ANTES de qualquer edição, conforme `CLAUDE.md` seção 9 (EXECUTION PROTOCOL). Formato fixo por fluxo: ENTRADA → PROCESSAMENTO → SAÍDA, com arquivo + função + origem dos dados + destino. Se um fluxo pedido não estiver aqui, ver protocolo de exceção na seção 9 do `CLAUDE.md` antes de explorar.

---

## FLOW: Login

- **ENTRADA**: usuário submete CNPJ/senha na tela do Portal.
  arquivo: `mae/Index.html` · função: `fazerLogin()` (~L1068)
- **PROCESSAMENTO**: front-end despacha via `chamar('login', ...)` (~L921) → backend valida credencial e tentativas.
  arquivo: `mae/WebApp.js` · função: `login()` (~L153)
  origem dos dados: aba `BASE DE DADOS`
- **SAÍDA**: token de sessão ou `{ok:false, erro:"CODIGO"}`.
  destino: front-end (`fazerLogin()` faz `switch` por código de erro).

---

## FLOW: Sessão (validação / logout)

- **ENTRADA**: chamada autenticada qualquer (token existente) ou ação de sair.
  arquivo: `mae/Index.html` · função: `sairDoApp()` (chama `google.script.run.logout(token)`)
- **PROCESSAMENTO**: valida token vigente ou encerra sessão.
  arquivo: `mae/WebApp.js` · funções: `validarToken()` (~L210), `logout()` (~L223)
  origem dos dados: token em memória/sessão (duração 21600s/6h, hardcoded em `login()` e `validarToken()`)
- **SAÍDA**: sessão válida/inválida; encerramento de sessão.
  destino: front-end (`mae/Index.html`).

---

## FLOW: Dashboard / Pendências

- **ENTRADA**: abertura do dashboard ou seleção de período pela influenciadora.
  arquivo: `mae/Index.html` · funções: `carregarPendencias()` (~L1153), `carregarPeriodos()` (~L1113)
- **PROCESSAMENTO**: busca ativações pendentes e lista de períodos disponíveis.
  arquivo: `mae/WebApp.js` · funções: `getPendencias()` (~L234), `listarPeriodos()` (~L653)
  origem dos dados: aba `ATIVAÇÕES`
- **SAÍDA**: lista de pendências/períodos renderizada no dashboard.
  destino: front-end (`mae/Index.html`).

---

## FLOW: Briefing

- **ENTRADA**: influenciadora abre o briefing do mês.
  arquivo: `mae/Index.html` · função: `abrirBriefing()` (~L1222)
- **PROCESSAMENTO**: monta resumo cruzando ativação com dados de briefing (com fallback de nome de coluna).
  arquivo: `mae/WebApp.js` · função: `getBriefing()` (~L289)
  origem dos dados: abas `ATIVAÇÕES` + `BRIEFING`
- **SAÍDA**: dados de resumo do briefing.
  destino: componente visual `.briefing-resumo` em `mae/Index.html`.

---

## FLOW: Envio de material

- **ENTRADA**: influenciadora seleciona e envia arquivo.
  arquivo: `mae/Index.html` · funções: `arquivoSelecionado`, `iniciarEnvio`, `enviarArquivoResumable()` (~L1334, controla `CHUNK_SIZE`)
- **PROCESSAMENTO**: abre e finaliza upload resumable; resolve a linha da ativação por ID estável (não por número de linha).
  arquivo: `mae/WebApp.js` · funções: `iniciarEnvioResumable()` (~L822), `finalizarEnvioResumable()` (~L862), `encontrarLinhaAtivacaoPorId()` (~L636)
  origem dos dados: aba `ATIVAÇÕES` (localização da linha) + arquivo enviado pelo front-end
- **SAÍDA**: arquivo salvo na pasta da influenciadora no Drive; status atualizado na planilha.
  destino: Google Drive (pasta por influenciadora via `PropertiesService`) + aba `ATIVAÇÕES`.

---

## FLOW: Pagamentos

- **ENTRADA**: influenciadora abre a tela de pagamentos.
  arquivo: `mae/Index.html` · função: `carregarPagamentos()` (~L1383)
  origem dos dados: nenhuma (ação do usuário, dispara a chamada ao backend).

- **PROCESSAMENTO**: backend lê a aba de pagamentos e normaliza o status de cada registro para o vocabulário fixo do tracker.
  arquivo: `mae/WebApp.js` · funções: `getPagamentos()` (~L376), `normalizarStatusPagamento()` (~L726)
  origem dos dados: aba `PAGAMENTOS`
  regra de normalização: reconhece substrings `"pago"` e `"aprovado"` no valor bruto da planilha, mapeando para `PENDENTE`/`APROVADO`/`PAGO`.
  restrição: o vocabulário de status usado aqui tem que casar exatamente com `ETAPA_ORDEM`/`ETAPA_LABELS` em `mae/Index.html` (~L860) — os dois lados (backend e front) precisam concordar, senão o tracker exibe etapa errada silenciosamente.

- **SAÍDA**: lista de pagamentos com status normalizado, renderizada como tracker visual.
  destino: componente tracker em `mae/Index.html` (`ETAPA_ORDEM`/`ETAPA_LABELS`, ~L860).
  restrição de layout: CSS `.tracker{align-items:flex-start}` — não trocar para `center` (causa raiz de bug de alinhamento já corrigido).

### Schema oficial da aba `PAGAMENTOS` (planilha `[JESCRI] INFLUÊNCIA 360º`)

| Coluna | Descrição |
|---|---|
| `INFLU_KEY` | identificador da influenciadora |
| `MES_REFERENCIA` | mês da campanha |
| `VALOR_TOTAL` | valor do pagamento |
| `CHAVE_PIX` | chave PIX da influenciadora |
| `STATUS_PAGAMENTO` | status do pagamento (`PENDENTE` \| `APROVADO` \| `PAGO`) |
| `DATA_PAGAMENTO` | data em que o pagamento foi efetivado |
| `MENSAGEM_PIX` | mensagem formatada para envio via PIX |

**Regras de negócio (fonte: usuário, 2026-07-05):**
- atualização de status ocorre **exclusivamente** em `STATUS_PAGAMENTO` — nenhuma outra coluna é tocada por essa operação.
- `DATA_PAGAMENTO` só é preenchida quando `STATUS_PAGAMENTO = PAGO` (efeito colateral condicional, não uma escrita independente).
- proibido criar novas colunas ou inferir campos fora deste schema.

### CORREÇÃO DE ARQUITETURA (fonte: usuário, 2026-07-05)

**Não existe função isolada de escrita em `PAGAMENTOS`.** A suposição anterior (uma função dedicada recebendo `google.script.run` do front-end e gravando `STATUS_PAGAMENTO` diretamente) estava **errada** e foi removida deste documento.

Modelo correto:
- `PAGAMENTOS` é atualizado **indiretamente**, através do fluxo de campanha/conteúdo — não por uma escrita isolada e dedicada a pagamento.
- backend principal continua sendo `mae/WebApp.js` (mesmo arquivo dos outros fluxos).
- existem duas camadas de status, **distintas**:
  - `STATUS_CONTEUDO` — estado da ativação (envio/upload/aprovação de material), camada de conteúdo.
  - `STATUS_PAGAMENTO` — estado financeiro, aba `PAGAMENTOS`.
- `STATUS_PAGAMENTO` é determinado/derivado a partir do estado de `STATUS_CONTEUDO`, não escrito de forma independente por uma função própria de pagamento.

### `STATUS_CONTEUDO` (aba `ATIVAÇÕES`, planilha `[JESCRI] INFLUÊNCIA 360º`)

Camada de conteúdo, distinta de `STATUS_PAGAMENTO`. Valores possíveis:
- `EM_APROVACAO`
- `APROVADO`
- `POSTADO`

### FLOW: Pagamentos — derivação `STATUS_CONTEUDO` → `STATUS_PAGAMENTO` (FECHADO)

- **ENTRADA**: influenciadora envia material (mesmo gatilho do `FLOW: Envio de material`).
  arquivo: `mae/Index.html` (`arquivoSelecionado`/`iniciarEnvio`/`enviarArquivoResumable()` ~L1334) → `google.script.run`

- **PROCESSAMENTO**:
  1. `mae/WebApp.js:iniciarEnvioResumable()` (~L822) — cria/atualiza item em `ATIVAÇÕES` e define `STATUS_CONTEUDO = EM_APROVACAO`.
  2. `mae/WebApp.js:finalizarEnvioResumable()` (~L862) — atualiza `STATUS_CONTEUDO` conforme avanço da aprovação/postagem (`APROVADO` ou `POSTADO`).
  3. **Regra de derivação (escopo limitado — ver ressalva abaixo)**: quando `STATUS_CONTEUDO` muda para `APROVADO` ou `POSTADO`, o sistema atualiza `STATUS_PAGAMENTO` na aba `PAGAMENTOS` como consequência direta dessa mudança — não existe função intermediária isolada de pagamento. **Esta derivação NÃO cobre a transição para `PAGO`** (ver sub-fluxo manual abaixo).
  4. Regras de coluna em `PAGAMENTOS` (já confirmadas): só `STATUS_PAGAMENTO` muda diretamente nessa derivação; nenhuma coluna nova é criada.
  origem dos dados: aba `ATIVAÇÕES` (`STATUS_CONTEUDO`)

- **SAÍDA**: aba `PAGAMENTOS` atualizada (`STATUS_PAGAMENTO`) como consequência do avanço de `STATUS_CONTEUDO` em `ATIVAÇÕES`.
  destino: aba `PAGAMENTOS`.

**Arquivos envolvidos**: `mae/Index.html`, `mae/WebApp.js`
**Funções envolvidas**: `iniciarEnvioResumable()` (~L822), `finalizarEnvioResumable()` (~L862)

Sub-fluxo fechado — sem pendências, para as transições `PENDENTE`→`APROVADO` (via avanço de conteúdo). Confirmado pelo usuário (2026-07-05): não existe função intermediária separada de pagamento; a derivação ocorre dentro de `finalizarEnvioResumable()`/`iniciarEnvioResumable()`.

### FLOW: Pagamentos — `STATUS_PAGAMENTO = PAGO` (manual, fora do fluxo de conteúdo)

> Confirmado pelo usuário (2026-07-05): esta transição **não faz parte** do fluxo de conteúdo/campanha acima e não passa por `iniciarEnvioResumable()`/`finalizarEnvioResumable()`.

- **ENTRADA**: equipe marca manualmente `STATUS_PAGAMENTO = PAGO` diretamente na aba `PAGAMENTOS` da planilha `[JESCRI] INFLUÊNCIA 360º`. Não existe função automática/portal para essa marcação — é edição direta na planilha, fora do código.
  arquivo: n/a (ação manual na planilha, fora do repositório)

- **PROCESSAMENTO** (confirmado por leitura direta do código, exceção pontual ao FRAMEWORK LOCK MODE autorizada pelo usuário em 2026-07-05):
  1. `mae/Código.js`, trigger instalável `onEdit(e)` (~L170), bloco específico **~L269-270**:
     ```js
     if (name === SETUP.ABAS.PAGAMENTOS && col === h['STATUS_PAGAMENTO'] && String(e.value).toLowerCase().includes("pago")) {
       arquivarGenerico(SETUP.ABAS.PAGAMENTOS, SETUP.ABAS.HISTORICO_PAG, 'STATUS_PAGAMENTO', ['pago'], true);
     }
     ```
     Dispara automaticamente quando a célula editada é `STATUS_PAGAMENTO` na aba `PAGAMENTOS` e o novo valor contém `"pago"` (case-insensitive).
  2. `mae/Código.js`, função `arquivarGenerico()` (~L509-539). Trecho que preenche a data, **~L527-528**:
     ```js
     if(h['DATA_PAGAMENTO'] && !linha[h['DATA_PAGAMENTO']-1]) {
       linha[h['DATA_PAGAMENTO']-1] = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm");
     }
     ```
     Preenche `DATA_PAGAMENTO` com timestamp atual **somente se ainda estiver vazia**.
  arquivo: `mae/Código.js` · função: `onEdit()` (~L170, condição em L269-270) → `arquivarGenerico()` (~L509-539, preenchimento em L527-528)

- **⚠️ Achado adicional (comportamento real, além do descrito pelo usuário)**: `arquivarGenerico()` não apenas preenche `DATA_PAGAMENTO` — ela **move a linha inteira** de `PAGAMENTOS` para `HISTORICO_PAG` (`shD.appendRow(linha)` + `shO.deleteRow(i+1)`, mesma função, mesma execução). Ou seja, marcar `STATUS_PAGAMENTO = PAGO` dispara **arquivamento imediato da linha para o histórico**, não é um preenchimento isolado de campo dentro de `PAGAMENTOS`.

- **Segunda implementação encontrada (mesma função `arquivarGenerico()`, gatilho diferente — NÃO é a ativa para este comportamento)**: `menuArquivarTudo()` (~L492-494) chama `arquivarGenerico(SETUP.ABAS.PAGAMENTOS, SETUP.ABAS.HISTORICO_PAG, 'STATUS_PAGAMENTO', ['pago'], false)` — acionado manualmente via menu do ERP (arquivamento em lote de 3 abas), não por edição de célula. A implementação **ativa** para "automático ao marcar PAGO" é exclusivamente a chamada dentro de `onEdit()` (L269-270).

- **SAÍDA**: linha movida de `PAGAMENTOS` para `HISTORICO_PAG`, com `DATA_PAGAMENTO` preenchida (se ainda vazia) antes da movimentação.
  destino: aba `HISTORICO_PAG` (não permanece em `PAGAMENTOS`).

**Regra final consolidada deste sub-fluxo (FECHADO — confirmado por código, sem pendências):**
- `STATUS_PAGAMENTO = PAGO` → **manual** (ação da equipe, direto na planilha).
- `DATA_PAGAMENTO` → **automático**, via `onEdit()` (~L269-270, `mae/Código.js`) → `arquivarGenerico()` (~L527-528).
- Efeito colateral real, não previsto na descrição original: a linha é **arquivada imediatamente** em `HISTORICO_PAG`, saindo de `PAGAMENTOS`.

**Bloqueio remanescente (FRAMEWORK LOCK MODE, `CLAUDE.md` seção 10):** o comportamento (automático, timestamp atual, disparado por `STATUS_PAGAMENTO = PAGO`) está confirmado. Falta apenas o **nome exato da função** e linha aproximada em `mae/Código.js` (ou `mae/WebApp.js`, se for o caso) — "provavelmente `onEdit`" não é confirmação suficiente para preencher o campo função exata exigido pelo protocolo. Não localizo isso por busca própria; assim que confirmado, este sub-fluxo fecha sem nenhuma pendência.

---

## FLOW: Histórico

- **ENTRADA**: influenciadora abre o histórico.
  arquivo: `mae/Index.html` · função: `carregarHistorico()` (~L1440)
- **PROCESSAMENTO**: agrega histórico de conteúdos/pagamentos e varre abas legado (detecção por cabeçalho `INFLU_KEY`+`MES_REFERENCIA`, excluindo as já conhecidas em `nomesConhecidos`).
  arquivo: `mae/WebApp.js` · funções: `getHistorico()` (~L441), `listarAbasHistoricoLegado()` (~L72)
  origem dos dados: abas `HISTÓRICO DE CONTEÚDOS` + `HISTÓRICO DE PAGAMENTOS` + abas legado detectadas dinamicamente
- **SAÍDA**: lista consolidada de histórico.
  destino: front-end (`mae/Index.html`).

---

## FLOW: Perfil

- **ENTRADA**: influenciadora abre ou edita o próprio perfil.
  arquivo: `mae/Index.html` · funções: `carregarPerfil()` (~L1500), `salvarPerfil()` (~L1526)
- **PROCESSAMENTO**: lê/atualiza dados cadastrais.
  arquivo: `mae/WebApp.js` · funções: `getPerfil()` (~L524), `updatePerfil()` (~L575)
  origem dos dados: aba `BASE DE DADOS`
- **SAÍDA**: dados de perfil exibidos ou confirmação de atualização.
  destino: aba `BASE DE DADOS` (na escrita) / front-end (na leitura).

---

## FLOW: Sincronização de looks (ERP, não é o Portal)

- **ENTRADA**: execução via menu do ERP (dentro da Planilha Google).
  arquivo: `mae/Código.js` · função: `sincronizarLooks()` (~L411)
- **PROCESSAMENTO**: abre planilha externa por influenciadora, usando URL própria de cada uma.
  arquivo: `mae/Código.js`
  origem dos dados: aba `BASE DE DADOS`, coluna `INFLU_SHEET_URL` → planilha externa individual
- **SAÍDA**: looks sincronizados de volta para a estrutura do ERP.
  destino: planilha Google (ERP).

---

## FLOW: Cadastro de nova influenciadora

- **ENTRADA**: preenchimento de formulário externo (Google Form, repositório `estudioela/estudioela`, fora deste repo).
  arquivo: n/a (fora deste repo)
- **PROCESSAMENTO**: submissão cai na aba `CADASTROS`, dispara trigger instalável de `onFormSubmit()`.
  arquivo: `mae/Código.js` · função: `onFormSubmit()` (~L544)
  origem dos dados: aba `CADASTROS`
  nota: depende de trigger instalável configurado fora do código-fonte (painel de Triggers do Apps Script) — não verificável por código.
- **SAÍDA**: novo registro de influenciadora.
  destino: aba `BASE DE DADOS`.

---

## Validação de existência de arquivos (2026-07-05)

Confirmado via `ls`: `mae/Index.html`, `mae/WebApp.js`, `mae/Código.js` existem no repositório. Todos os fluxos acima apontam exclusivamente para esses três arquivos (mais destinos externos ao repo: Google Drive, planilha externa por influenciadora, Google Form). Nenhum caminho órfão encontrado.

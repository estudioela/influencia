/**
 * MÓDULO: Nucleo — utilitários transversais puros (Config, ErroComCodigo, Envelope, ColunaFisica, Include)
 *
 * Fatia vertical (ADR-014): camadas como seções, na ordem
 * DOMAIN → ACL → REPOSITORY → SERVICE → CONTROLLER → ADAPTERS.
 * Os contratos de camada valem integralmente (docs/ARQUITETURA_CAMADAS.md).
 */

// ============================================================================
// SHARED — Config.js (ex-src/shared/Config.js)
// ============================================================================

/**
 * Acesso a segredos/IDs de ambiente — nunca hardcode no código
 * (roadmap §4 "Ambiente"; PROJECT_GOVERNANCE §3.5/§3.6).
 *
 * Valores vivem em Script Properties (Projeto GAS → Configurações),
 * provisionadas pelo operador. O repositório carrega apenas as CHAVES,
 * jamais os valores.
 *
 * Camada: shared. Fail-fast: chave ausente é erro barulhento.
 */

/** Chaves conhecidas de configuração (documentação executável). */
var CONFIG_KEYS = {
  // ID da planilha nova `portal-ela` (banco V2, Q-10). Provisionado pelo operador.
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  // ID da planilha legada (SPEC-003, Q-10) — SOMENTE LEITURA (RN-01/INV-01).
  // Nunca é o mesmo valor de SPREADSHEET_ID. Provisionado pelo operador.
  SPREADSHEET_ID_LEGADO: 'SPREADSHEET_ID_LEGADO',
  // client_id OAuth2 do TEAR no provedor de identidade (SPEC-035 §14.1,
  // validação de audience). Provisionado pelo operador.
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  // client_secret OAuth2 do TEAR (ADR-013) — usado EXCLUSIVAMENTE pelo
  // AdaptadorOAuthGoogle na troca do authorization code. SEGREDO: nunca
  // logar, nunca devolver ao cliente. Provisionado pelo operador.
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
};

/**
 * @param {string} key uma das chaves de CONFIG_KEYS.
 * @returns {string} valor da propriedade.
 * @throws se a chave não estiver provisionada (fail-fast).
 */
function getConfig(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (value === null || value === undefined || value === '') {
    throw new Error('Config ausente: "' + key + '". Provisionar em Script Properties.');
  }
  return value;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG_KEYS, getConfig };
}

// ============================================================================
// SHARED — ErroComCodigo.js (ex-src/shared/ErroComCodigo.js)
// ============================================================================

/**
 * Fábrica de erro com código de contrato — usada pelos Services que expõem
 * erros do contrato externo (§17: AC-, PC-, PP- etc.). Extraída para
 * eliminar a duplicação byte-idêntica que existia como função livre
 * `erroDeX(codigo, mensagem)` em AcessoPortalService, PortalDeConteudoService
 * e PerfilPortalService (cada um com seu próprio nome local).
 *
 * Camada: shared (infraestrutura transversal). Sem regra de negócio, sem
 * acesso a Sheets/HTTP.
 */

/**
 * @param {string} codigo código do contrato de erros da SPEC correspondente
 *   (§17).
 * @param {string} mensagem mensagem SEM credencial/PII (RN-04 e disciplinas
 *   equivalentes nas demais SPECs).
 * @returns {Error} erro com `codigo` anexado para o Controller.
 */
function erroComCodigo(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// Exportação condicional: no-op sob Apps Script (sem `module`),
// disponível para o harness de teste (Node/vm/jest).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { erroComCodigo };
}

// ============================================================================
// SHARED — Envelope.js (ex-src/shared/Envelope.js)
// ============================================================================

/**
 * Envelope de resposta padrão do contrato externo.
 * PROJECT_GOVERNANCE §3.3 — toda função exposta a `google.script.run`
 * retorna exatamente uma destas formas:
 *
 *   sucesso: { success: true,  data:  {...} }
 *   falha:   { success: false, error: {...} }
 *
 * Camada: shared (infraestrutura transversal). Sem regra de negócio,
 * sem acesso a Sheets/HTTP.
 */

/**
 * @param {*} [data] payload de sucesso; ausente vira objeto vazio.
 * @returns {{success: true, data: *}}
 */
function envelopeOk(data) {
  return { success: true, data: data === undefined ? {} : data };
}

/**
 * @param {*} [error] descrição do erro; ausente vira objeto vazio.
 * @returns {{success: false, error: *}}
 */
function envelopeFail(error) {
  return { success: false, error: error === undefined ? {} : error };
}

/**
 * Converte um erro de Service em envelope de falha, preservando o `codigo`
 * do contrato (§17) quando presente. Extraída para eliminar a duplicação
 * byte-idêntica que existia como método `falhar(erro)` em
 * AcessoController, PortalDeConteudoController e PerfilPortalController.
 * @param {Error} erro
 * @returns {{success: false, error: {codigo: (string|undefined), mensagem: string}}}
 *   `codigo` presente apenas quando o erro pertence ao contrato de erros da
 *   SPEC correspondente.
 */
function falharComCodigo(erro) {
  return envelopeFail(
    erro.codigo ? { codigo: erro.codigo, mensagem: erro.message } : { mensagem: erro.message }
  );
}

// Exportação condicional: no-op sob Apps Script (sem `module`),
// disponível para o harness de teste (Node/vm/jest).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { envelopeOk, envelopeFail, falharComCodigo };
}

// ============================================================================
// SHARED — ColunaFisica.js (ex-src/shared/ColunaFisica.js)
// ============================================================================

/**
 * ColunaFisica — utilitários compartilhados de acesso físico às abas,
 * usados pelas ACLs (Contrato §7: uma ACL por aba, resolução SEMPRE por
 * cabeçalho, nunca por índice fixo).
 *
 * Extraído para eliminar a duplicação byte-idêntica (exceto o nome da aba
 * física na mensagem de erro) que existia como métodos locais
 * `resolvedorDeColuna`/`dataParaCanonica`/`reescrever` repetidos em
 * BloqueioACL, BriefingACL, DocumentoACL, ParceiraACL, EntregaACL, SessaoACL,
 * EnvioACL e ColaboracaoMensalACL (FASE 1 pós-SPECs: eliminar código
 * duplicado). Mesmo padrão de extração já aplicado a `erroComCodigo`
 * (ver src/shared/ErroComCodigo.js).
 *
 * Camada: shared (infraestrutura transversal). Sem regra de negócio, sem
 * acesso a Sheets/HTTP além do `sheet` recebido por parâmetro.
 */

/**
 * @param {Array} cabecalho
 * @param {string} nomeDaAba nome físico da aba, para a mensagem de erro.
 * @returns {function(string): number} resolve nome → índice, fail-fast.
 */
function criarResolvedorDeColuna(cabecalho, nomeDaAba) {
  return (nome) => {
    const indice = cabecalho.indexOf(nome);
    if (indice === -1) {
      throw new Error("Coluna '" + nome + "' ausente em '" + nomeDaAba + "'.");
    }
    return indice;
  };
}

/**
 * Coage valor cru de célula de data → Date canônica (fail-fast).
 * @param {*} cru valor lido da célula.
 * @param {string} colunaNome para a mensagem de erro.
 * @param {string} nomeDaAba nome físico da aba, para a mensagem de erro.
 * @returns {Date|null} null quando a célula está vazia.
 */
function celulaParaData(cru, colunaNome, nomeDaAba) {
  if (cru == null || cru === '') {
    return null;
  }
  const data =
    typeof cru.getTime === 'function' ? new Date(cru.getTime()) : new Date(cru);
  if (isNaN(data.getTime())) {
    throw new Error(
      "Valor de data inválido em '" + nomeDaAba + "'." + colunaNome + ": '" + cru + "'."
    );
  }
  return data;
}

/**
 * Regrava a aba inteira (cabeçalho + linhas) num único setValues.
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API).
 * @param {Array} cabecalho
 * @param {Array[]} linhas
 */
function reescreverAba(sheet, cabecalho, linhas) {
  const matriz = [cabecalho].concat(linhas);
  sheet.clearContents();
  sheet.getRange(1, 1, matriz.length, cabecalho.length).setValues(matriz);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { criarResolvedorDeColuna, celulaParaData, reescreverAba };
}

// ============================================================================
// SHARED — Include.js (ex-src/shared/Include.js)
// ============================================================================

/**
 * Helper de composição de HTML Service (ADR-002 / PROJECT_GOVERNANCE §3.3).
 * Permite `<?!= include('caminho/arquivo') ?>` em templates.
 *
 * Camada: shared. Não conhece regra de negócio nem tokens de design;
 * apenas injeta o conteúdo de um arquivo HTML no template chamador.
 *
 * @param {string} filename nome do arquivo HTML (sem extensão) no projeto GAS.
 * @returns {string} conteúdo renderizado do arquivo.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { include };
}

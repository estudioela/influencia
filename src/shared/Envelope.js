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

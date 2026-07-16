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

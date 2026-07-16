/**
 * VALUE OBJECT: CodigoRastreio (SPEC-016 §6.1)
 *
 * Código de rastreio do Envio físico junto à transportadora (UC-016.02).
 *
 * Invariantes preservadas:
 * - Imutável após criação; código vazio falha barulhento (RN-05).
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL,
 * UrlFetchApp (a consulta à transportadora é da porta de rastreio, §6.3).
 */

this.CodigoRastreio = class CodigoRastreio {
  /**
   * @param {string} codigo código informado pelo Operador (UC-016.02).
   */
  constructor(codigo) {
    const texto = String(codigo == null ? '' : codigo).trim();
    if (texto === '') {
      throw new Error('CodigoRastreio exige o código de rastreio do Envio (UC-016.02).');
    }
    this.valor = texto;
    Object.freeze(this);
  }

  /**
   * Igualdade de VO pelo valor.
   * @param {CodigoRastreio} outro
   * @returns {boolean}
   */
  igualA(outro) {
    return outro instanceof CodigoRastreio && this.valor === outro.valor;
  }

  /**
   * @returns {string} o código de rastreio.
   */
  toString() {
    return this.valor;
  }
};

/**
 * VO: Credencial (SPEC-025 §6.1) — par identificador + segredo apresentado
 * pela Parceira na autenticação (RN-01).
 *
 * INV-03 / RN-04 (Contrato §5): a credencial nunca pode ser registrada em
 * claro — o segredo não participa de serializações acidentais (String/JSON).
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, nem o
 * mecanismo concreto de verificação (isso é do adaptador atrás da porta).
 */

this.Credencial = class Credencial {
  constructor(identificador, segredo) {
    const id = String(identificador == null ? '' : identificador).trim();
    const chave = String(segredo == null ? '' : segredo).trim();
    if (!id || !chave) {
      throw new Error('Credencial exige identificador e segredo.');
    }
    this.identificador = id;
    // Segredo fora de propriedade enumerável: não vaza em JSON/log (INV-03).
    Object.defineProperty(this, 'segredo', {
      value: chave,
      enumerable: false,
      writable: false,
    });
  }

  toString() {
    return '[Credencial ' + this.identificador + ']';
  }
};

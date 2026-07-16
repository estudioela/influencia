/**
 * VALUE OBJECT: EnderecoDeEntrega (SPEC-016 §6.1)
 *
 * Endereço físico de entrega da Parceira — PII (Contrato §5, INV-04).
 *
 * DECISÃO D-03 (aprovada pelo PO em 2026-07-15): exceção autorizada — o
 * módulo Logística acessa endereço/PIX EXCLUSIVAMENTE durante a UC-016.01;
 * o dado não é persistido no Envio, não vai a log e não é exposto fora do
 * caso de uso. RN-10 (SPEC-002) permanece válida.
 *
 * Invariantes preservadas:
 * - Imutável; endereço vazio falha barulhento.
 * - INV-04: `toString`/`toJSON` NUNCA revelam o valor — leitura só pelo
 *   acesso explícito a `valor`, dentro da UC-016.01.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, Logger.
 */

this.EnderecoDeEntrega = class EnderecoDeEntrega {
  /**
   * @param {string} endereco endereço completo de entrega (PII).
   */
  constructor(endereco) {
    const texto = String(endereco == null ? '' : endereco).trim();
    if (texto === '') {
      throw new Error('EnderecoDeEntrega exige o endereço de entrega da Parceira (UC-016.01).');
    }
    this.valor = texto;
    Object.freeze(this);
  }

  /**
   * Igualdade de VO pelo valor.
   * @param {EnderecoDeEntrega} outro
   * @returns {boolean}
   */
  igualA(outro) {
    return outro instanceof EnderecoDeEntrega && this.valor === outro.valor;
  }

  /**
   * INV-04: interpolação/log acidental não vaza PII.
   * @returns {string} marcador protegido, nunca o endereço.
   */
  toString() {
    return '[ENDEREÇO PROTEGIDO — INV-04]';
  }

  /**
   * INV-04: serialização acidental (JSON.stringify) não vaza PII.
   * @returns {string} marcador protegido, nunca o endereço.
   */
  toJSON() {
    return '[ENDEREÇO PROTEGIDO — INV-04]';
  }
};

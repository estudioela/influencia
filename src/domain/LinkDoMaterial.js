/**
 * VALUE OBJECT: LinkDoMaterial (SPEC-012 §6.1)
 *
 * Referência ao arquivo (imagem/vídeo) que a Parceira envia para uma
 * Entrega (Material Enviado, §4).
 *
 * DECISÃO LOCAL (D-02, aprovada pelo PO em 2026-07-15): nesta etapa o
 * material é persistido apenas como URL informada pela Parceira — upload
 * físico ao Drive é dívida registrada com ADR futuro (RNF-02: o domínio
 * independe do armazenamento).
 *
 * Invariantes preservadas:
 * - Imutável após criação; link vazio ou fora de http(s) falha barulhento.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, DriveApp.
 */

this.LinkDoMaterial = class LinkDoMaterial {
  /**
   * @param {string} url referência ao material enviado.
   */
  constructor(url) {
    const texto = String(url == null ? '' : url).trim();
    if (texto === '') {
      throw new Error('LinkDoMaterial exige a referência ao material enviado (UC-012.02).');
    }
    if (!/^https?:\/\/\S+$/i.test(texto)) {
      throw new Error(
        "LinkDoMaterial exige uma URL http(s) válida (recebido '" + url + "')."
      );
    }
    this.valor = texto;
    Object.freeze(this);
  }

  /**
   * Igualdade de VO pelo valor.
   * @param {LinkDoMaterial} outro
   * @returns {boolean}
   */
  igualA(outro) {
    return outro instanceof LinkDoMaterial && this.valor === outro.valor;
  }

  /**
   * @returns {string} a URL do material.
   */
  toString() {
    return this.valor;
  }
};

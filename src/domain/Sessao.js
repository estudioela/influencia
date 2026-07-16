/**
 * AGREGADO: Sessão (raiz — SPEC-025 §6.2) — janela de acesso autenticado da
 * Parceira, com expiração deslizante de 6 horas (RN-03: PRD §7 RN-18).
 *
 * INV-01: Sessão só existe para Parceira autenticada — nasce vinculada a um
 * parceiraId e a um TokenDeSessao, sempre.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL.
 */

this.Sessao = class Sessao {
  /** Duração canônica da sessão (RN-03). */
  static get DURACAO_HORAS() {
    return 6;
  }

  /**
   * @param {string} parceiraId identidade da Parceira autenticada (INV-01).
   * @param {TokenDeSessao} token token opaco da sessão.
   * @param {Date} agora instante da autenticação.
   */
  constructor(parceiraId, token, agora) {
    const id = String(parceiraId == null ? '' : parceiraId).trim();
    if (!id) {
      throw new Error('Sessão exige Parceira autenticada (INV-01).');
    }
    if (!token || !token.valor) {
      throw new Error('Sessão exige TokenDeSessao.');
    }
    this.parceiraId = id;
    this.token = token;
    this.renovar(agora);
  }

  /**
   * Reidrata uma Sessão persistida SEM recomputar a validade.
   * @param {string} parceiraId
   * @param {string} valorDoToken
   * @param {Date} expiraEm validade persistida.
   * @returns {Sessao}
   */
  static reconstituir(parceiraId, valorDoToken, expiraEm) {
    const sessao = Object.create(Sessao.prototype);
    sessao.parceiraId = String(parceiraId).trim();
    sessao.token = new TokenDeSessao(valorDoToken);
    sessao.expiraEm = new Date(expiraEm.getTime());
    return sessao;
  }

  /**
   * Expiração deslizante (UC-025.02): cada interação renova 6h a partir dela.
   * @param {Date} interacao instante da interação.
   */
  renovar(interacao) {
    if (!interacao || typeof interacao.getTime !== 'function' || isNaN(interacao.getTime())) {
      throw new Error('Sessão exige instante válido para renovar.');
    }
    this.expiraEm = new Date(
      interacao.getTime() + Sessao.DURACAO_HORAS * 60 * 60 * 1000
    );
  }

  /**
   * @param {Date} instante
   * @returns {boolean} true se a sessão expirou (CB-02 / AC-03).
   */
  expiradaEm(instante) {
    return instante.getTime() >= this.expiraEm.getTime();
  }
};

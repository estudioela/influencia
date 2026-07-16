/**
 * VO: JanelaDeBloqueio (SPEC-025 §6.1, RN-02) — suspensão temporária do
 * acesso após tentativas malsucedidas: 15 minutos a partir do início.
 *
 * INV-02: enquanto a janela está ativa, nenhuma autenticação é aceita
 * (CB-03); após o fim, o acesso volta a NaoAutenticada (§9).
 */

this.JanelaDeBloqueio = class JanelaDeBloqueio {
  /** Duração canônica do bloqueio (RN-02: PRD §7 RN-17). */
  static get DURACAO_MINUTOS() {
    return 15;
  }

  /** @param {Date} inicio instante da falha que disparou o bloqueio. */
  constructor(inicio) {
    if (!inicio || typeof inicio.getTime !== 'function' || isNaN(inicio.getTime())) {
      throw new Error('JanelaDeBloqueio exige início válido.');
    }
    this.inicio = new Date(inicio.getTime());
    this.fim = new Date(
      inicio.getTime() + JanelaDeBloqueio.DURACAO_MINUTOS * 60 * 1000
    );
  }

  /**
   * @param {Date} instante
   * @returns {boolean} true enquanto o bloqueio impede autenticação (INV-02).
   */
  ativaEm(instante) {
    return instante.getTime() < this.fim.getTime();
  }
};

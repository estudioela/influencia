/**
 * ADAPTADOR: GuardiaoDeEstadoOAuth — guarda anti-CSRF do parâmetro `state`
 * (ADR-013, condição 3). Registra o state emitido no início do login e o
 * valida COM CONSUMO no callback: cada state autoriza exatamente uma troca
 * de código. O cache é injetado (CacheService.getScriptCache() na
 * composição do entrypoint) — este arquivo não toca serviço Google
 * diretamente, permanecendo testável com um fake em memória.
 *
 * Expiração: 600s (janela do login). CacheService é best-effort: evicção
 * antecipada derruba o login com ERR_AUTH_STATE_INVALIDO — o usuário
 * recomeça (degradação segura, nunca bypass).
 */

this.GuardiaoDeEstadoOAuth = class GuardiaoDeEstadoOAuth {
  /** Janela máxima entre iniciar o login e concluir o callback. */
  static get TTL_SEGUNDOS() {
    return 600;
  }

  /** @param {{put: Function, get: Function, remove: Function}} cache */
  constructor(cache) {
    this.cache = cache;
  }

  /** @param {string} state nonce opaco (UUID) emitido para este login. */
  registrar(state) {
    this.cache.put(this.chave(state), '1', GuardiaoDeEstadoOAuth.TTL_SEGUNDOS);
  }

  /**
   * @param {string} state valor devolvido pelo provedor no callback.
   * @returns {boolean} true se o state foi emitido por nós e ainda não usado.
   */
  validarEConsumir(state) {
    const valor = String(state == null ? '' : state).trim();
    if (!valor) {
      return false;
    }
    const chave = this.chave(valor);
    const achado = this.cache.get(chave);
    if (achado) {
      this.cache.remove(chave);
    }
    return Boolean(achado);
  }

  /**
   * @param {string} state
   * @returns {string} chave namespaced no cache do script.
   */
  chave(state) {
    return 'oauth-state:' + state;
  }
};

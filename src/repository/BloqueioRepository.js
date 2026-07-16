/**
 * REPOSITORY: BloqueioRepository — persistência do estado de tentativas e
 * da Janela de Bloqueio por identificador (SPEC-025 RN-02).
 *
 * Projeção explícita (§3.5): identificador (chave), tentativas, início da
 * janela. Acessa a aba SEMPRE via ACL. A política (limite/duração) é do
 * domínio (Autenticador/JanelaDeBloqueio) — aqui só estado.
 *
 * @param {BloqueioACL} acl ACL única da aba BLOQUEIOS.
 */

this.BloqueioRepository = class BloqueioRepository {
  constructor(acl) {
    this.acl = acl;
  }

  /**
   * @param {string} identificador
   * @returns {number} falhas acumuladas (0 se não houver registro).
   */
  contarFalhas(identificador) {
    const registro = this.acl.obter(identificador);
    return registro ? registro.tentativas : 0;
  }

  /**
   * Persiste o total de falhas do identificador (sem janela).
   * @param {string} identificador
   * @param {number} falhas
   */
  salvarFalhas(identificador, falhas) {
    this.acl.salvar(identificador, falhas, null);
  }

  /**
   * @param {string} identificador
   * @returns {JanelaDeBloqueio|null} janela persistida, se houver.
   */
  obterJanela(identificador) {
    const registro = this.acl.obter(identificador);
    if (!registro || !registro.inicio) {
      return null;
    }
    return new JanelaDeBloqueio(registro.inicio);
  }

  /**
   * Persiste a Janela de Bloqueio aplicada ao identificador (CB-01).
   * @param {string} identificador
   * @param {JanelaDeBloqueio} janela
   * @param {number} falhas total de falhas que disparou o bloqueio.
   */
  bloquear(identificador, janela, falhas) {
    this.acl.salvar(identificador, falhas, janela.inicio);
  }

  /**
   * Zera o estado do identificador (janela vencida ou autenticação ok — §9).
   * @param {string} identificador
   */
  limpar(identificador) {
    this.acl.remover(identificador);
  }
};

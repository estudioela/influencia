/**
 * REPOSITORY: SessaoRepository — persistência do agregado Sessão (SPEC-025).
 *
 * Projeção explícita (§3.5): token (chave), parceiraId, expiraEm. Acessa a
 * aba SEMPRE via ACL — nunca toca SpreadsheetApp nem índice físico.
 * Não pode conter regra de negócio nem formatar envelope.
 *
 * @param {SessaoACL} acl ACL única da aba SESSOES.
 */

this.SessaoRepository = class SessaoRepository {
  constructor(acl) {
    this.acl = acl;
  }

  /**
   * Persiste (insere ou renova) a Sessão.
   * @param {Sessao} sessao
   * @returns {Sessao} a mesma Sessão persistida.
   */
  salvar(sessao) {
    this.acl.upsert({
      token: sessao.token.valor,
      parceiraId: sessao.parceiraId,
      expiraEm: sessao.expiraEm,
    });
    return sessao;
  }

  /**
   * @param {string} valorDoToken
   * @returns {Sessao|null} Sessão reidratada com a validade persistida.
   */
  obterPorToken(valorDoToken) {
    const registro = this.acl.obterPorToken(valorDoToken);
    if (!registro) {
      return null;
    }
    return Sessao.reconstituir(registro.parceiraId, registro.token, registro.expiraEm);
  }

  /**
   * Remove a Sessão do token (logout/expiração).
   * @param {string} valorDoToken
   */
  remover(valorDoToken) {
    this.acl.remover(valorDoToken);
  }
};

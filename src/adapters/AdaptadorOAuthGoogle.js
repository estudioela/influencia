/**
 * ADAPTADOR: AdaptadorOAuthGoogle — cumpre a porta de troca de código do
 * OAuth 2.0 Authorization Code Flow (ADR-013, condição 4). ÚNICO componente
 * autorizado a falar com o endpoint `token` do provedor e a tocar o Client
 * Secret (Script Property GOOGLE_CLIENT_SECRET, condição 2).
 *
 * Constrói também a URL de autorização para o redirect top-level do
 * frontend (escopos openid/email/profile — só identidade, nenhum acesso a
 * dados do usuário).
 *
 * Fail-closed: qualquer falha na troca (rede, HTTP != 200, JSON malformado,
 * resposta sem id_token) lança Error com o código do contrato
 * (ERR_AUTH_INVALID_TOKEN, SPEC-035 §14.3) — nunca devolve token parcial.
 * Segredo e código de autorização JAMAIS aparecem em log, erro ou URL.
 *
 * Não pode conter regra de negócio de identidade/estado (Service) nem
 * validar claims do id_token (isso permanece no ValidadorDeTokenGoogle,
 * inalterado — o id_token é validado duas vezes por decisão do ADR-013).
 */

this.AdaptadorOAuthGoogle = class AdaptadorOAuthGoogle {
  /**
   * @param {string} clientId client_id OAuth2 do TEAR (Config.js).
   * @param {string} clientSecret client_secret OAuth2 do TEAR (Config.js).
   * @param {string} redirectUri URL /exec do deployment (ScriptApp, entrypoint).
   */
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = String(clientId == null ? '' : clientId).trim();
    this.clientSecret = String(clientSecret == null ? '' : clientSecret).trim();
    this.redirectUri = String(redirectUri == null ? '' : redirectUri).trim();
  }

  /**
   * @param {string} state nonce anti-CSRF já registrado (GuardiaoDeEstadoOAuth).
   * @returns {string} URL do endpoint de autorização do provedor.
   */
  construirUrlDeAutorizacao(state) {
    return (
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      [
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=' + encodeURIComponent(this.redirectUri),
        'response_type=code',
        'scope=' + encodeURIComponent('openid email profile'),
        'state=' + encodeURIComponent(state),
        'prompt=select_account',
      ].join('&')
    );
  }

  /**
   * @param {string} code authorization code devolvido pelo provedor.
   * @returns {string} id_token bruto (validação de claims fica no
   *   ValidadorDeTokenGoogle, como sempre).
   * @throws {Error} ERR_AUTH_INVALID_TOKEN em qualquer falha.
   */
  trocarCodigoPorIdToken(code) {
    const codigo = String(code == null ? '' : code).trim();
    if (!codigo) {
      throw this.erroInvalido('código de autorização vazio');
    }
    const resposta = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'post',
      muteHttpExceptions: true,
      payload: {
        grant_type: 'authorization_code',
        code: codigo,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      },
    });
    if (resposta.getResponseCode() !== 200) {
      throw this.erroInvalido('troca de código recusada pelo provedor de identidade');
    }
    let corpo;
    try {
      corpo = JSON.parse(resposta.getContentText());
    } catch {
      throw this.erroInvalido('resposta malformada do provedor de identidade');
    }
    const idToken = String((corpo && corpo.id_token) == null ? '' : corpo.id_token).trim();
    if (!idToken) {
      throw this.erroInvalido('resposta sem id_token');
    }
    return idToken;
  }

  /**
   * @param {string} motivo mensagem interna (nunca inclui code/segredo).
   * @returns {Error} erro com o código do contrato (§14.3).
   */
  erroInvalido(motivo) {
    const erro = new Error('ERR_AUTH_INVALID_TOKEN: ' + motivo + '.');
    erro.codigo = 'ERR_AUTH_INVALID_TOKEN';
    return erro;
  }
};

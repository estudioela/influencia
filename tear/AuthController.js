const ACOES_AUTH = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ME: 'ME'
});

/**
 * Fronteira de autenticação. Mesmo contrato das demais:
 * `{ success, data?, error? }`. Proibido tocar infraestrutura (CLAUDE.md §13).
 */
class AuthController {
  constructor(authService) {
    if (!authService) {
      throw new TypeError('AuthController exige uma instância de AuthService.');
    }

    this.authService = authService;
  }

  handleAuth(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Requisição inválida: payload ausente.');
      }

      if (payload.action === ACOES_AUTH.LOGIN) {
        return { success: true, data: this.authService.login(payload.cupom, payload.senha) };
      }

      if (payload.action === ACOES_AUTH.ME) {
        return { success: true, data: this.authService.sessaoAtual(payload.token) };
      }

      if (payload.action === ACOES_AUTH.LOGOUT) {
        return { success: true, data: this.authService.logout(payload.token) };
      }

      throw new Error(`Requisição inválida: ação "${payload.action}" não é suportada.`);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

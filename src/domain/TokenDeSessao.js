/**
 * VO: TokenDeSessao (SPEC-025 §6.1) — identificador opaco da Sessão.
 *
 * O domínio não conhece o gerador (UUID etc.): o valor chega pronto da
 * composição (porta geradorDeToken) — RNF-03: independente da tecnologia.
 */

this.TokenDeSessao = class TokenDeSessao {
  constructor(valor) {
    const token = String(valor == null ? '' : valor).trim();
    if (!token) {
      throw new Error('TokenDeSessao exige valor.');
    }
    this.valor = token;
  }
};

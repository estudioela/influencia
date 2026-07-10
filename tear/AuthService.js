/**
 * Autenticação da V2.
 *
 * Nenhum DTO daqui carrega `Senha_Hash`. Nenhuma mensagem de erro distingue
 * "cupom não existe" de "senha errada": a diferença permitiria enumerar
 * parceiras cadastradas.
 */
class AuthService {
  constructor(parceiroRepository, sessaoRepository) {
    if (!parceiroRepository || !sessaoRepository) {
      throw new TypeError('AuthService exige ParceiroRepository e SessaoRepository.');
    }

    this.parceiroRepository = parceiroRepository;
    this.sessaoRepository = sessaoRepository;
  }

  login(cupom, senha) {
    if (!cupom || !senha) {
      throw new Error('Informe o cupom e a senha.');
    }

    if (this.sessaoRepository.estaBloqueado(cupom)) {
      throw new Error('Muitas tentativas. Tente novamente em alguns minutos.');
    }

    const parceiro = this.parceiroRepository.findByCupom(cupom);

    // Uma parceira sem senha definida não loga — a aba nasce sem credencial.
    if (!parceiro || !senhaConfere(senha, parceiro[CAMPOS_PARCEIRO.SENHA_HASH])) {
      this.sessaoRepository.registrarTentativa(cupom);
      throw new Error('Cupom ou senha inválidos.');
    }

    this.sessaoRepository.limparTentativas(cupom);

    return {
      token: this.sessaoRepository.criar(parceiro[CAMPOS_PARCEIRO.ID]),
      perfil: this._paraDto(parceiro)
    };
  }

  sessaoAtual(token) {
    const idInfluenciadora = this.sessaoRepository.resolver(token);

    if (!idInfluenciadora) {
      throw new Error('Sessão expirada. Entre novamente.');
    }

    const parceiro = this.parceiroRepository.getById(idInfluenciadora);

    if (!parceiro) {
      throw new Error('Sessão expirada. Entre novamente.');
    }

    return this._paraDto(parceiro);
  }

  logout(token) {
    this.sessaoRepository.destruir(token);

    return { encerrada: true };
  }

  /** `Senha_Hash` e `Cupom` não saem daqui. */
  _paraDto(parceiro) {
    return {
      idInfluenciadora: this._texto(parceiro[CAMPOS_PARCEIRO.ID]),
      nome: this._texto(parceiro[CAMPOS_PARCEIRO.NOME]),
      statusContrato: this._texto(parceiro[CAMPOS_PARCEIRO.STATUS_CONTRATO]),
      categoria: this._texto(parceiro[CAMPOS_PARCEIRO.CATEGORIA])
    };
  }

  _texto(valor) {
    return valor === null || valor === undefined ? '' : String(valor);
  }
}

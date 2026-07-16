/**
 * SERVICE: AcessoPortalService — casos de uso do Acesso ao Portal
 * (SPEC-025 UC-025.01 / UC-025.02).
 *
 * Orquestra o Autenticador (porta de domínio), os repositórios de Sessão e
 * Bloqueio, a porta de token e o relógio. Erros de acesso carregam o código
 * do contrato (§17): AC-01 credencial inválida, AC-02 acesso bloqueado,
 * AC-03 sessão expirada. Mensagens nunca contêm credencial ou PII (RN-04).
 *
 * Não pode: falar HTTP/HTML; formatar envelope (Controller); conhecer
 * coluna física (ACL) nem o mecanismo concreto de credencial (adaptador).
 *
 * @param {Autenticador} autenticador serviço de domínio (porta).
 * @param {SessaoRepository} sessaoRepository
 * @param {BloqueioRepository} bloqueioRepository
 * @param {{gerar: function(): string}} geradorDeToken porta de token opaco.
 * @param {{hoje: function(): Date}} relogio porta de tempo.
 * @param {{publicar: function(object)}} publicador porta de eventos (§12).
 */

this.AcessoPortalService = class AcessoPortalService {
  constructor(
    autenticador,
    sessaoRepository,
    bloqueioRepository,
    geradorDeToken,
    relogio,
    publicador
  ) {
    this.autenticador = autenticador;
    this.sessaoRepository = sessaoRepository;
    this.bloqueioRepository = bloqueioRepository;
    this.geradorDeToken = geradorDeToken;
    this.relogio = relogio;
    this.publicador = publicador;
  }

  /**
   * UC-025.01: autentica a Parceira e cria a Sessão.
   * @param {{identificador: string, segredo: string}} dados credenciais.
   * @returns {Sessao} sessão ativa.
   * @throws AC-01 credencial inválida; AC-02 acesso bloqueado (INV-02/CB-03).
   */
  entrar(dados) {
    let credencial;
    try {
      credencial = new Credencial(dados && dados.identificador, dados && dados.segredo);
    } catch {
      throw erroComCodigo('AC-01', 'Credencial inválida.');
    }
    const agora = this.relogio.hoje();
    const identificador = credencial.identificador;

    const janela = this.bloqueioRepository.obterJanela(identificador);
    if (janela && janela.ativaEm(agora)) {
      throw erroComCodigo('AC-02', 'Acesso bloqueado. Tente novamente mais tarde.');
    }
    if (janela) {
      // Janela vencida: Bloqueada → NaoAutenticada (§9); zera as tentativas.
      this.bloqueioRepository.limpar(identificador);
    }

    const resultado = this.autenticador.autenticar(
      credencial,
      this.bloqueioRepository.contarFalhas(identificador),
      agora
    );

    if (!resultado.sucesso) {
      if (resultado.bloqueio) {
        this.bloqueioRepository.bloquear(identificador, resultado.bloqueio, resultado.falhas);
        this.publicador.publicar({
          nome: 'AcessoBloqueado',
          identificador: identificador,
          janela: {
            inicio: resultado.bloqueio.inicio.toISOString(),
            fim: resultado.bloqueio.fim.toISOString(),
          },
        });
        throw erroComCodigo('AC-02', 'Acesso bloqueado. Tente novamente mais tarde.');
      }
      this.bloqueioRepository.salvarFalhas(identificador, resultado.falhas);
      throw erroComCodigo('AC-01', 'Credencial inválida.');
    }

    this.bloqueioRepository.limpar(identificador);
    const sessao = this.autenticador.criarSessao(
      resultado.parceiraId,
      this.geradorDeToken.gerar(),
      agora
    );
    this.sessaoRepository.salvar(sessao);
    this.publicador.publicar({ nome: 'SessaoIniciada', parceiraId: sessao.parceiraId });
    return sessao;
  }

  /**
   * UC-025.02: renova a validade da Sessão a cada interação (deslizante).
   * @param {{token: string}} dados
   * @returns {Sessao} sessão renovada.
   * @throws AC-03 sessão inexistente ou expirada (CB-02).
   */
  renovar(dados) {
    const token = String((dados && dados.token) == null ? '' : dados.token).trim();
    if (!token) {
      throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
    }
    const agora = this.relogio.hoje();
    const sessao = this.sessaoRepository.obterPorToken(token);
    if (!sessao) {
      throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
    }
    if (sessao.expiradaEm(agora)) {
      this.sessaoRepository.remover(token);
      throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
    }
    sessao.renovar(agora);
    this.sessaoRepository.salvar(sessao);
    return sessao;
  }

  /**
   * Logout (§9: Autenticada → NaoAutenticada). Idempotente.
   * @param {{token: string}} dados
   */
  sair(dados) {
    const token = String((dados && dados.token) == null ? '' : dados.token).trim();
    if (token) {
      this.sessaoRepository.remover(token);
    }
  }
};

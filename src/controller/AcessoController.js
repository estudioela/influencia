/**
 * CONTROLLER: AcessoController — adapta o contrato externo do Acesso ao
 * Portal (SPEC-025). Recebe a chamada do Entrypoint, invoca o Service e
 * devolve SEMPRE o envelope padrão {success,data}/{success,error}
 * (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Erros do contrato (§17: AC-01/AC-02/AC-03) carregam o código; erros de
 * infraestrutura seguem o padrão dos pares (envelope só com mensagem) —
 * nunca rotulados com código de credencial. Mensagens sem credencial/PII
 * (RN-04). Expõe apenas projeção serializável da Sessão — nunca a
 * instância de domínio.
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {AcessoPortalService} acessoPortalService
 */

this.AcessoController = class AcessoController {
  constructor(acessoPortalService) {
    this.acessoPortalService = acessoPortalService;
  }

  /**
   * @param {Sessao} sessao
   * @returns {{token: string, parceiraId: string, expiraEm: string}}
   */
  projetar(sessao) {
    return {
      token: sessao.token.valor,
      parceiraId: sessao.parceiraId,
      expiraEm: sessao.expiraEm.toISOString(),
    };
  }

  /**
   * UC-025.01: autentica a Parceira (entrada no Portal).
   * @param {{identificador: string, segredo: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  entrar(dados) {
    try {
      return envelopeOk(this.projetar(this.acessoPortalService.entrar(dados)));
    } catch (erro) {
      return falharComCodigo(erro);
    }
  }

  /**
   * UC-025.02: renova a sessão (expiração deslizante).
   * @param {{token: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  renovar(dados) {
    try {
      return envelopeOk(this.projetar(this.acessoPortalService.renovar(dados)));
    } catch (erro) {
      return falharComCodigo(erro);
    }
  }

  /**
   * Logout da Parceira (§9).
   * @param {{token: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  sair(dados) {
    try {
      this.acessoPortalService.sair(dados);
      return envelopeOk({});
    } catch (erro) {
      return falharComCodigo(erro);
    }
  }
};

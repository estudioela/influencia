/**
 * CONTROLLER: ParceiraController — adapta o contrato externo do cadastro.
 *
 * Recebe a chamada do Entrypoint (google.script.run), invoca o Service e
 * devolve SEMPRE o envelope padrão {success,data}/{success,error}
 * (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física. Expõe apenas uma projeção serializável da Parceira — nunca a
 * instância de domínio.
 *
 * @param {CadastrarParceiraService} cadastrarParceiraService
 */

this.ParceiraController = class ParceiraController {
  constructor(cadastrarParceiraService) {
    this.cadastrarParceiraService = cadastrarParceiraService;
  }

  /**
   * Adapta o cadastro de Parceira ao contrato externo.
   * @param {{nome: string}} dados dados do formulário.
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  cadastrar(dados) {
    try {
      const parceira = this.cadastrarParceiraService.executar(dados);
      return envelopeOk({ nome: parceira.nome, estado: parceira.estado });
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }
};

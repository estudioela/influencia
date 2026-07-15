/**
 * CONTROLLER: BriefingController — adapta o contrato externo do Briefing
 * (SPEC-009 UC-009.01 e query de leitura).
 *
 * Recebe a chamada do Entrypoint (google.script.run), invoca o
 * BriefingService e devolve SEMPRE o envelope padrão {success,data}/
 * {success,error} (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Expõe apenas uma projeção serializável do Briefing — nunca a instância
 * de domínio; datas saem como 'AAAA-MM-DD'. A projeção não carrega PII.
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {BriefingService} briefingService
 */

this.BriefingController = class BriefingController {
  constructor(briefingService) {
    this.briefingService = briefingService;
  }

  /**
   * Adapta o comando PreencherBriefing (UC-009.01) ao contrato externo.
   * @param {{mesReferencia: string, parceiraId: string, blocos: Array}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  preencherBriefing(dados) {
    try {
      return envelopeOk(this.projetar(this.briefingService.preencherEPublicar(dados)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Adapta a query do briefing por Parceira/competência.
   * @param {{mesReferencia: string, parceiraId: string}} dados
   * @returns {{success: true, data: object|null}|{success: false, error: object}}
   */
  obterBriefing(dados) {
    try {
      const briefing = this.briefingService.obterBriefing(
        dados && dados.mesReferencia,
        dados && dados.parceiraId
      );
      return envelopeOk(briefing === null ? null : this.projetar(briefing));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Projeção serializável do agregado (datas 'AAAA-MM-DD', sem PII).
   * @param {Briefing} briefing
   * @returns {object}
   */
  projetar(briefing) {
    return {
      parceiraId: briefing.parceiraId,
      mesReferencia: briefing.mesReferencia.toString(),
      estado: briefing.estado,
      blocos: briefing.blocos.map((bloco) => ({
        rotulo: bloco.rotulo,
        look: bloco.look,
        dataEntrega: this.dataParaTexto(bloco.dataEntrega),
        dataPostagem: this.dataParaTexto(bloco.dataPostagem),
        orientacao: bloco.orientacao,
        dataAprovacaoInterna: this.dataParaTexto(bloco.dataAprovacaoInterna),
      })),
    };
  }

  /**
   * @param {Date|null} data
   * @returns {string|null} 'AAAA-MM-DD' (calendário local) ou null.
   */
  dataParaTexto(data) {
    if (data == null) {
      return null;
    }
    const mes = data.getMonth() + 1;
    const dia = data.getDate();
    return (
      data.getFullYear() +
      '-' +
      (mes < 10 ? '0' + mes : String(mes)) +
      '-' +
      (dia < 10 ? '0' + dia : String(dia))
    );
  }
};

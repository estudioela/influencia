/**
 * CONTROLLER: DocumentoController — adapta o contrato externo da Geração
 * de Documentos (SPEC-023 UC-023.01/UC-023.02).
 *
 * Recebe a chamada do Entrypoint (google.script.run), invoca o
 * DocumentoService e devolve SEMPRE o envelope padrão {success,data}/
 * {success,error} (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Expõe apenas uma projeção serializável do Documento — nunca a instância
 * de domínio. O `conteudo` mesclado vai no envelope porque o operador é o
 * ator autorizado (§13) que entrega o documento ao destinatário (RNF-01);
 * ele nunca é persistido nem logado por esta camada.
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {DocumentoService} documentoService
 */

this.DocumentoController = class DocumentoController {
  constructor(documentoService) {
    this.documentoService = documentoService;
  }

  /**
   * Adapta o comando GerarContrato (UC-023.01) ao contrato externo.
   * @param {{parceiraId: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  gerarContrato(dados) {
    try {
      return envelopeOk(this.projetar(this.documentoService.gerarContrato(dados)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Adapta o comando GerarBriefingFormal (UC-023.02) ao contrato externo.
   * @param {{parceiraId: string, mesReferencia: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  gerarBriefingFormal(dados) {
    try {
      return envelopeOk(this.projetar(this.documentoService.gerarBriefingFormal(dados)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Projeção serializável do resultado da geração.
   * @param {{documento: Documento, conteudo: string}} resultado
   * @returns {object}
   */
  projetar(resultado) {
    return {
      parceiraId: resultado.documento.parceiraId,
      tipo: resultado.documento.tipo,
      estado: resultado.documento.estado,
      mesReferencia: resultado.documento.mesReferencia,
      referencia: resultado.documento.referencia,
      conteudo: resultado.conteudo,
    };
  }
};

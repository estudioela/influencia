/**
 * CONTROLLER: EnvioController — adapta o contrato externo do Envio
 * (SPEC-016 UC-016.01/02/03).
 *
 * Recebe a chamada do Entrypoint (google.script.run), invoca o
 * EnvioService e devolve SEMPRE o envelope padrão {success,data}/
 * {success,error} (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Expõe apenas uma projeção serializável do Envio — nunca a instância de
 * domínio; datas saem como 'AAAA-MM-DD'. A projeção NUNCA carrega endereço/
 * PIX (INV-04) — a única exceção autorizada é a `mensagem` de confirmação
 * devolvida por confirmarEndereco (D-03, UC-016.01), destinada ao Operador
 * que faz o envio manual.
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {EnvioService} envioService
 */

this.EnvioController = class EnvioController {
  constructor(envioService) {
    this.envioService = envioService;
  }

  /**
   * Adapta o comando ConfirmarEndereco (UC-016.01) ao contrato externo.
   * @param {{mesReferencia: string, parceiraId: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  confirmarEndereco(dados) {
    try {
      const resultado = this.envioService.confirmarEndereco(dados);
      const projecao = this.projetar(resultado.envio);
      projecao.mensagem = resultado.mensagem;
      return envelopeOk(projecao);
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Adapta o comando RegistrarRastreio (UC-016.02) ao contrato externo.
   * @param {{mesReferencia: string, parceiraId: string, codigo: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  registrarRastreio(dados) {
    try {
      return envelopeOk(this.projetar(this.envioService.registrarRastreio(dados)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Adapta o comando AtualizarStatus (UC-016.03) ao contrato externo.
   * @param {{mesReferencia: string, parceiraId: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  atualizarStatus(dados) {
    try {
      return envelopeOk(this.projetar(this.envioService.atualizarStatus(dados)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Adapta a query de Envios por competência/Parceira.
   * @param {{mesReferencia: string, parceiraId: (string|undefined)}} dados
   * @returns {{success: true, data: object[]}|{success: false, error: object}}
   */
  listarEnvios(dados) {
    try {
      const envios = this.envioService.listarEnvios(
        dados && dados.mesReferencia,
        dados && dados.parceiraId === undefined ? undefined : dados.parceiraId
      );
      return envelopeOk(envios.map((envio) => this.projetar(envio)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Projeção serializável do agregado (datas 'AAAA-MM-DD', sem PII).
   * @param {Envio} envio
   * @returns {object}
   */
  projetar(envio) {
    return {
      parceiraId: envio.parceiraId,
      mesReferencia: envio.mesReferencia.toString(),
      revisao: envio.revisao,
      jornada: envio.jornada,
      rastreio: envio.rastreio === null ? null : envio.rastreio.toString(),
      dataEnvio: this.dataParaTexto(envio.dataEnvio),
      dataArquivamento: this.dataParaTexto(envio.dataArquivamento),
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

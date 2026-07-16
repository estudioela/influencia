/**
 * ACL: EnvioACL — camada anticorrupção do Envio (SPEC-016; aba física
 * ENVIOS, nova, própria da V2 — legado ("FLUXO LOGÍSTICO") nunca é
 * normativo).
 *
 * DECISÃO LOCAL (rótulos crus — D-01, SPEC-016 §21, a confirmar por ADR):
 * como a aba ENVIOS é nova e não há seed legado a observar, os rótulos
 * crus adotados seguem a mesma convenção mecânica já usada em BriefingACL/
 * EntregaACL/ColaboracaoMensalACL (SCREAMING_SNAKE_CASE do nome canônico).
 * Pendência D-01 permanece aberta para confirmação do arquiteto.
 *
 * Uma ACL por aba (Contrato §7): único ponto que conhece as colunas físicas
 * da aba ENVIOS. Resolução SEMPRE por cabeçalho, nunca por índice fixo.
 *
 * Projeção física — uma linha por Envio:
 * - INFLU_KEY / ANO_REFERENCIA / MES_REFERENCIA ← identidade (Parceira ×
 *   competência, RN-01/INV-01 — sem rótulo, ao contrário da Entrega)
 * - STATUS_REVISAO / STATUS_LOGISTICA ← as DUAS máquinas independentes (§9,
 *   RN-04, ADR-001 §2.4)
 * - RASTREIO / DATA_ENVIO / DATA_ARQUIVAMENTO ← campos da Jornada física
 * Nenhuma coluna de endereço/PIX existe nesta aba — PII nunca persistida
 * no Envio (INV-04, D-03: o endereço só é lido, nunca gravado, na UC-016.01).
 *
 * Escrita: substituição/upsert reescrevem a aba inteira num ÚNICO setValues
 * (RN-01 — a competência é recriada no mesmo lote).
 *
 * A reidratação atravessa o domínio (confirmarEndereco/registrarRastreio/
 * marcarEntregue/cancelar) — nunca escreve estado por fora. A ordem importa:
 * a Revisão (confirmarEndereco) é aplicada ANTES de qualquer mutação de
 * Jornada, porque Entregue arquiva o Envio (INV-03) e bloqueia mutações
 * subsequentes, incluindo a de Revisão. Estado cru desconhecido (RN-05) ou
 * incoerente com as demais colunas falha barulhento.
 *
 * Não pode conter regra de negócio nem ser duplicada.
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues(), clearContents() e
 *   getRange(...).setValues(...)).
 */

this.EnvioACL = class EnvioACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Coage a Revisão canônica → rótulo cru persistido (§9, D-01).
   * @param {string} canonico
   * @returns {string}
   */
  revisaoParaCru(canonico) {
    const mapa = { AguardandoConfirmacao: 'AGUARDANDO_CONFIRMACAO', Confirmado: 'CONFIRMADO' };
    if (!mapa[canonico]) {
      throw new Error("Revisão de Envio desconhecida: '" + canonico + "'.");
    }
    return mapa[canonico];
  }

  /**
   * Coage o STATUS_REVISAO físico cru → canônico do domínio (trim +
   * casefold). Valor desconhecido → erro de validação (RN-05).
   * @param {string} cru
   * @returns {string}
   */
  revisaoParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    const mapa = { aguardando_confirmacao: 'AguardandoConfirmacao', confirmado: 'Confirmado' };
    if (!mapa[normalizado]) {
      throw new Error("LG-02: STATUS_REVISAO desconhecido em 'ENVIOS'.STATUS_REVISAO: '" + cru + "'.");
    }
    return mapa[normalizado];
  }

  /**
   * Coage a Jornada canônica → rótulo cru persistido (§9, D-01).
   * @param {string} canonico
   * @returns {string}
   */
  jornadaParaCru(canonico) {
    const mapa = {
      Pendente: 'PENDENTE',
      Expedido: 'EXPEDIDO',
      Entregue: 'ENTREGUE',
      Cancelado: 'CANCELADO',
    };
    if (!mapa[canonico]) {
      throw new Error("Jornada de Envio desconhecida: '" + canonico + "'.");
    }
    return mapa[canonico];
  }

  /**
   * Coage o STATUS_LOGISTICA físico cru → canônico do domínio (trim +
   * casefold). Valor desconhecido → erro de validação (RN-05).
   * @param {string} cru
   * @returns {string}
   */
  jornadaParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    const mapa = {
      pendente: 'Pendente',
      expedido: 'Expedido',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    if (!mapa[normalizado]) {
      throw new Error("LG-02: STATUS_LOGISTICA desconhecido em 'ENVIOS'.STATUS_LOGISTICA: '" + cru + "'.");
    }
    return mapa[normalizado];
  }

  /**
   * Coage valor cru de célula de data → Date canônica (fail-fast).
   * @param {*} cru valor lido da célula.
   * @param {string} colunaNome para a mensagem de erro.
   * @returns {Date|null} null quando a célula está vazia.
   */
  dataParaCanonica(cru, colunaNome) {
    if (cru == null || cru === '') {
      return null;
    }
    const data = typeof cru.getTime === 'function' ? new Date(cru.getTime()) : new Date(cru);
    if (isNaN(data.getTime())) {
      throw new Error("Valor de data inválido em 'ENVIOS'." + colunaNome + ": '" + cru + "'.");
    }
    return data;
  }

  /**
   * Substitui TODOS os Envios da competência num único lote (RN-01):
   * linhas de outras competências são preservadas.
   * @param {MesReferencia} mesReferencia
   * @param {Envio[]} envios
   */
  substituirCompetencia(mesReferencia, envios) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const mantidas = valores.slice(1).filter((linha) => {
      if (String(linha[coluna('INFLU_KEY')]).trim() === '') {
        return false;
      }
      return !(
        Number(linha[coluna('ANO_REFERENCIA')]) === mesReferencia.ano &&
        Number(linha[coluna('MES_REFERENCIA')]) === mesReferencia.mes
      );
    });
    this.reescrever(cabecalho, mantidas.concat(this.linhasDe(cabecalho, envios)));
  }

  /**
   * Upsert de um Envio pela identidade permanente (Parceira × competência).
   * @param {Envio} envio
   */
  salvar(envio) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const mantidas = valores.slice(1).filter((linha) => {
      if (String(linha[coluna('INFLU_KEY')]).trim() === '') {
        return false;
      }
      return !(
        String(linha[coluna('INFLU_KEY')]) === envio.parceiraId &&
        Number(linha[coluna('ANO_REFERENCIA')]) === envio.mesReferencia.ano &&
        Number(linha[coluna('MES_REFERENCIA')]) === envio.mesReferencia.mes
      );
    });
    this.reescrever(cabecalho, mantidas.concat(this.linhasDe(cabecalho, [envio])));
  }

  /**
   * Lê a aba inteira e reconstrói os agregados (uma linha por Envio).
   * Linhas sem INFLU_KEY são ignoradas.
   * @returns {Envio[]}
   */
  listarTodos() {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    return valores
      .slice(1)
      .filter((linha) => String(linha[coluna('INFLU_KEY')]).trim() !== '')
      .map((linha) => this.reidratar(linha, coluna));
  }

  /**
   * Reconstrói um Envio a partir da linha física, atravessando o domínio.
   * A Revisão é aplicada ANTES da Jornada: Entregue arquiva o Envio
   * (INV-03) e bloquearia a mutação de Revisão se aplicada depois.
   * @param {Array} linha linha física do Envio.
   * @param {function(string): number} coluna resolve nome → índice.
   * @returns {Envio}
   */
  reidratar(linha, coluna) {
    const envio = new Envio(
      String(linha[coluna('INFLU_KEY')]),
      new MesReferencia(
        Number(linha[coluna('ANO_REFERENCIA')]),
        Number(linha[coluna('MES_REFERENCIA')])
      )
    );

    const revisaoCanonica = this.revisaoParaCanonico(linha[coluna('STATUS_REVISAO')]);
    if (revisaoCanonica === 'Confirmado') {
      envio.confirmarEndereco();
    }

    const jornadaCanonica = this.jornadaParaCanonico(linha[coluna('STATUS_LOGISTICA')]);
    const rastreioCru = String(
      linha[coluna('RASTREIO')] == null ? '' : linha[coluna('RASTREIO')]
    ).trim();
    if (rastreioCru !== '') {
      envio.registrarRastreio(
        rastreioCru,
        this.dataParaCanonica(linha[coluna('DATA_ENVIO')], 'DATA_ENVIO')
      );
    }
    if (jornadaCanonica === 'Entregue') {
      envio.marcarEntregue(
        this.dataParaCanonica(linha[coluna('DATA_ARQUIVAMENTO')], 'DATA_ARQUIVAMENTO')
      );
    }
    if (jornadaCanonica === 'Cancelado') {
      envio.cancelar();
    }

    if (envio.revisao !== revisaoCanonica || envio.jornada !== jornadaCanonica) {
      throw new Error(
        "LG-02: linha incoerente em 'ENVIOS' — Revisão '" +
          revisaoCanonica +
          "' / Jornada '" +
          jornadaCanonica +
          "' não é alcançável com as colunas persistidas do Envio de '" +
          envio.parceiraId +
          "'."
      );
    }
    return envio;
  }

  /**
   * @param {Array} cabecalho
   * @returns {function(string): number} resolve nome → índice, fail-fast.
   */
  resolvedorDeColuna(cabecalho) {
    return (nome) => {
      const indice = cabecalho.indexOf(nome);
      if (indice === -1) {
        throw new Error("Coluna '" + nome + "' ausente em 'ENVIOS'.");
      }
      return indice;
    };
  }

  /**
   * Projeta Envios em linhas físicas (uma por Envio), posicionando cada
   * campo pela sua coluna.
   * @param {Array} cabecalho
   * @param {Envio[]} envios
   * @returns {Array[]}
   */
  linhasDe(cabecalho, envios) {
    return envios.map((envio) => {
      const fisico = {
        INFLU_KEY: envio.parceiraId,
        MES_REFERENCIA: envio.mesReferencia.mes,
        ANO_REFERENCIA: envio.mesReferencia.ano,
        STATUS_REVISAO: this.revisaoParaCru(envio.revisao),
        STATUS_LOGISTICA: this.jornadaParaCru(envio.jornada),
        RASTREIO: envio.rastreio ? envio.rastreio.toString() : '',
        DATA_ENVIO: envio.dataEnvio ? envio.dataEnvio : '',
        DATA_ARQUIVAMENTO: envio.dataArquivamento ? envio.dataArquivamento : '',
      };
      return cabecalho.map((nome) =>
        Object.prototype.hasOwnProperty.call(fisico, nome) ? fisico[nome] : ''
      );
    });
  }

  /**
   * Regrava a aba inteira (cabeçalho + linhas) num único setValues.
   * @param {Array} cabecalho
   * @param {Array[]} linhas
   */
  reescrever(cabecalho, linhas) {
    const matriz = [cabecalho].concat(linhas);
    this.sheet.clearContents();
    this.sheet.getRange(1, 1, matriz.length, cabecalho.length).setValues(matriz);
  }
};

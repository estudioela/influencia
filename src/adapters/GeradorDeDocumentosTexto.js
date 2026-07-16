/**
 * ADAPTADOR: GeradorDeDocumentosTexto — cumpre a porta "Gerador de
 * Documentos" (SPEC-023 §6.3; RNF-02: o Service é independente do motor
 * documental).
 *
 * Contrato da porta: gerarContrato/gerarBriefingFormal devolvem
 * `{referencia, conteudo}` — a `referencia` é OPACA e sem PII (é o que se
 * persiste, §14.2 "meio: Referência"); o `conteudo` é o documento mesclado,
 * restrito ao destinatário (RNF-01) — NUNCA persistido em aba nem logado.
 *
 * DÍVIDA REGISTRADA (SPEC-023 D-01): o motor documental real
 * (template Docs/Drive/AutoCrat) será definido por ADR futuro — lá a
 * referência passa a ser o link/id do arquivo gerado. Até lá, este
 * adaptador mescla num documento de texto puro, determinístico e sem
 * dependência externa (portanto sem falha degradável a tratar).
 *
 * Não pode conter regra de negócio (elegibilidade RN-01/RN-02 é do Service).
 */

this.GeradorDeDocumentosTexto = class GeradorDeDocumentosTexto {
  /**
   * Mescla os dados cadastrais/comerciais no Contrato individual
   * (UC-023.01).
   * @param {CamposDeMesclagem} campos termos comerciais vigentes (RN-03).
   * @returns {{referencia: string, conteudo: string}} referência opaca do
   *   documento (sem PII) e conteúdo mesclado (restrito ao destinatário).
   */
  gerarContrato(campos) {
    const quantidades = Object.keys(campos.quantidades)
      .map((formato) => formato + ': ' + campos.quantidades[formato])
      .join('; ');
    const conteudo = [
      'CONTRATO DE COLABORAÇÃO',
      'Razão social: ' + campos.razaoSocial,
      'CNPJ: ' + campos.cnpj,
      'Endereço: ' + campos.endereco,
      'Entregáveis: ' + quantidades,
      'Valor: R$ ' + campos.valorNumero + ' (' + campos.valorExtenso + ')',
      'Uso de imagem: ' + campos.canaisUsoImagem + ' — prazo: ' + campos.prazoUsoImagem,
      campos.cidadeAssinatura + ', ' + campos.dataAssinatura + '.',
    ].join('\n');
    return { referencia: this.referenciaOpaca(['CONTRATO']), conteudo: conteudo };
  }

  /**
   * Mescla a identificação da Parceira e o briefing no Briefing formal
   * (UC-023.02).
   * @param {CamposDeMesclagem} campos dados cadastrais da Parceira.
   * @param {Briefing} briefing briefing da colaboração (SPEC-009).
   * @returns {{referencia: string, conteudo: string}} referência opaca do
   *   documento (sem PII) e conteúdo mesclado (restrito ao destinatário).
   */
  gerarBriefingFormal(campos, briefing) {
    const blocos = briefing.blocos.map((bloco) => '- ' + bloco.rotulo).join('\n');
    const competencia = briefing.mesReferencia.toString();
    const conteudo = [
      'BRIEFING FORMAL',
      'Parceira: ' + campos.razaoSocial,
      'Competência: ' + competencia,
      'Blocos:',
      blocos,
    ].join('\n');
    return {
      referencia: this.referenciaOpaca(['BRIEFING_FORMAL', competencia]),
      conteudo: conteudo,
    };
  }

  /**
   * Referência opaca interina (D-01): identifica o documento sem carregar
   * PII — o motor real devolverá o link/id do arquivo.
   * @param {string[]} partes
   * @returns {string}
   */
  referenciaOpaca(partes) {
    return partes.join(':');
  }
};

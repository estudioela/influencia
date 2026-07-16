/**
 * SERVICE: DocumentoService — casos de uso da Geração de Documentos
 * (SPEC-023 UC-023.01/UC-023.02).
 *
 * - UC-023.01 · Gerar Contrato: apenas Parceiras Ativas (RN-01/INV-01);
 *   Parceira Inativa não gera nada nem persiste nada (CB-01).
 * - UC-023.02 · Gerar Briefing formal: apenas Parceiras sinalizadas 'SIM'
 *   (RN-02/CB-02); exige briefing existente na competência (DC-02).
 * - RN-03: os campos de mesclagem são lidos da porta do Cadastro no
 *   instante da geração — refletem os termos vigentes.
 * - CB-03: regeneração cria novo Documento; o Repository substitui o
 *   anterior (upsert).
 * - §12: evento `DocumentoGerado` publicado SÓ APÓS persistência
 *   bem-sucedida; payload apenas {parceiraId, tipoDocumento} — sem PII
 *   (RNF-01, Contrato §5).
 * - §17: DC-01 Parceira inexistente; DC-02 dados de mesclagem ausentes.
 *
 * DÍVIDAS REGISTRADAS:
 * - D-01 (§21): motor documental real por ADR futuro — aqui só a porta.
 * - §13/DC-03 (autorização por papel): o Portal ainda não possui camada de
 *   autenticação/papéis (chega com SPEC-025) — mesma dívida registrada em
 *   BriefingService (aprovada pelo PO em 2026-07-15).
 *
 * Não pode: tocar SpreadsheetApp; conhecer coluna física; formatar envelope.
 *
 * @param {ParceiraACL} cadastro porta do Cadastro (SPEC-002 §14.1:
 *   obterParaDocumentos).
 * @param {BriefingRepository} briefingRepository briefing da colaboração
 *   (SPEC-009 §14.1 — somente leitura).
 * @param {DocumentoRepository} documentoRepository persistência da
 *   referência do documento gerado.
 * @param {object} geradorDeDocumentos porta Gerador de Documentos (§6.3):
 *   gerarContrato(campos), gerarBriefingFormal(campos, briefing).
 * @param {object} publicadorDeEventos porta de eventos: publicar(evento).
 */

this.DocumentoService = class DocumentoService {
  constructor(
    cadastro,
    briefingRepository,
    documentoRepository,
    geradorDeDocumentos,
    publicadorDeEventos
  ) {
    this.cadastro = cadastro;
    this.briefingRepository = briefingRepository;
    this.documentoRepository = documentoRepository;
    this.geradorDeDocumentos = geradorDeDocumentos;
    this.publicadorDeEventos = publicadorDeEventos;
  }

  /**
   * UC-023.01 · Gerar Contrato individual da Parceira Ativa.
   * @param {{parceiraId: string}} comando
   * @returns {{documento: Documento, conteudo: string}} o contrato
   *   persistido (referência opaca) e o conteúdo mesclado — restrito ao
   *   destinatário, nunca persistido/logado (RNF-01).
   * @throws {Error} DC-01 Parceira inexistente; RN-01 Parceira Inativa;
   *   DC-02 dados de mesclagem ausentes.
   */
  gerarContrato(comando) {
    const parceiraId = this.parceiraIdDe(comando);
    const dados = this.dadosDaParceira(parceiraId);
    if (dados.estado !== 'Ativa') {
      throw new Error(
        "RN-01: contrato é gerado apenas para Parceiras Ativas — '" +
          parceiraId +
          "' está Inativa (INV-01/CB-01)."
      );
    }
    const campos = new CamposDeMesclagem(dados.campos);
    const gerado = this.geradorDeDocumentos.gerarContrato(campos);
    const documento = new Documento(parceiraId, 'Contrato', null).gerar(
      gerado.referencia
    );
    return this.persistirEPublicar(documento, gerado.conteudo);
  }

  /**
   * UC-023.02 · Gerar Briefing formal da Parceira sinalizada.
   * @param {{parceiraId: string, mesReferencia: string}} comando
   *   competência 'AAAA-MM' do briefing (SPEC-009: Parceira × mês).
   * @returns {{documento: Documento, conteudo: string}} o briefing formal
   *   persistido (referência opaca) e o conteúdo mesclado (RNF-01).
   * @throws {Error} DC-01 Parceira inexistente; RN-02 não sinalizada;
   *   DC-02 briefing/dados de mesclagem ausentes.
   */
  gerarBriefingFormal(comando) {
    const parceiraId = this.parceiraIdDe(comando);
    const dados = this.dadosDaParceira(parceiraId);
    if (!dados.sinalizada) {
      throw new Error(
        "RN-02: briefing formal é gerado apenas para Parceiras sinalizadas 'SIM' — '" +
          parceiraId +
          "' não está sinalizada (CB-02)."
      );
    }
    const mesReferencia = MesReferencia.deTexto(String(comando.mesReferencia));
    const briefing = this.briefingRepository.obterPor(mesReferencia, parceiraId);
    if (briefing === null) {
      throw new Error(
        "DC-02: dados de briefing ausentes para '" +
          parceiraId +
          "' na competência " +
          mesReferencia.toString() +
          ' (§17).'
      );
    }
    const campos = new CamposDeMesclagem(dados.campos);
    const gerado = this.geradorDeDocumentos.gerarBriefingFormal(campos, briefing);
    const documento = new Documento(
      parceiraId,
      'BriefingFormal',
      mesReferencia.toString()
    ).gerar(gerado.referencia);
    return this.persistirEPublicar(documento, gerado.conteudo);
  }

  /**
   * @param {{parceiraId: string}} comando
   * @returns {string} parceiraId validado.
   */
  parceiraIdDe(comando) {
    if (comando == null || typeof comando !== 'object' || !comando.parceiraId ||
        !String(comando.parceiraId).trim()) {
      throw new Error('DC-01: Parceira não informada (§17).');
    }
    return String(comando.parceiraId).trim();
  }

  /**
   * INV-02/DC-01: todo documento referencia uma Parceira existente.
   * @param {string} parceiraId
   * @returns {object} projeção da porta do Cadastro.
   */
  dadosDaParceira(parceiraId) {
    const dados = this.cadastro.obterParaDocumentos(parceiraId);
    if (dados === null) {
      throw new Error("DC-01: Parceira '" + parceiraId + "' inexistente (§17).");
    }
    return dados;
  }

  /**
   * §12: persiste e SÓ DEPOIS publica `DocumentoGerado` — falha na
   * persistência nunca publica evento. Payload apenas
   * {parceiraId, tipoDocumento} — o conteúdo mesclado (PII) jamais entra
   * em evento/log (RNF-01).
   * @param {Documento} documento
   * @param {string} conteudo documento mesclado, restrito ao destinatário.
   * @returns {{documento: Documento, conteudo: string}}
   */
  persistirEPublicar(documento, conteudo) {
    this.documentoRepository.salvar(documento);
    this.publicadorDeEventos.publicar({
      nome: 'DocumentoGerado',
      parceiraId: documento.parceiraId,
      tipoDocumento: documento.tipo,
    });
    return { documento: documento, conteudo: conteudo };
  }
};

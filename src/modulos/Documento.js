/**
 * MÓDULO: Documento — geração de contratos e briefings formais (SPEC-023)
 *
 * Fatia vertical (ADR-014): camadas como seções, na ordem
 * DOMAIN → ACL → REPOSITORY → SERVICE → CONTROLLER → ADAPTERS.
 * Os contratos de camada valem integralmente (docs/ARQUITETURA_CAMADAS.md).
 */

// ============================================================================
// DOMAIN — Documento.js (ex-src/domain/Documento.js)
// ============================================================================

/**
 * ENTIDADE: Documento (SPEC-023 §6.2)
 *
 * Documento formal gerado por Parceira: o Contrato individual (Parceiras
 * Ativas, UC-023.01) ou o Briefing formal (Parceiras sinalizadas,
 * UC-023.02), a partir dos dados cadastrais/comerciais e do briefing.
 *
 * Invariantes preservadas:
 * - INV-02: todo documento referencia uma Parceira (identidade obrigatória;
 *   a existência da Parceira é verificada pelo Service, DC-01).
 * - §9: máquina de estados fechada NaoGerado → Gerado, transição única —
 *   regeneração NÃO reabre o estado: cria-se um novo Documento e o
 *   Repository substitui o anterior (CB-03).
 * - Tipos canônicos fechados (ADR-001 §2.1): 'Contrato' | 'BriefingFormal';
 *   desconhecido = erro barulhento. Briefing formal existe por
 *   Parceira × competência; Contrato é individual, sem competência.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, coluna
 * física, motor documental (a mesclagem é da porta Gerador de Documentos).
 */

this.Documento = class Documento {
  /**
   * @param {string} parceiraId identidade estável da Parceira (INV-02).
   * @param {'Contrato'|'BriefingFormal'} tipo tipo canônico fechado.
   * @param {string|null} mesReferencia competência 'AAAA-MM' — obrigatória
   *   para BriefingFormal; null para Contrato.
   */
  constructor(parceiraId, tipo, mesReferencia) {
    const parceiraIdTexto = String(parceiraId == null ? '' : parceiraId).trim();
    if (parceiraIdTexto === '') {
      throw new Error('INV-02: todo documento referencia uma Parceira existente.');
    }
    if (tipo !== 'Contrato' && tipo !== 'BriefingFormal') {
      throw new Error("Tipo de documento desconhecido: '" + tipo + "'.");
    }
    if (tipo === 'BriefingFormal' && (!mesReferencia || !String(mesReferencia).trim())) {
      throw new Error(
        'Briefing formal exige a competência da colaboração (Parceira × mês).'
      );
    }
    this.parceiraId = parceiraId;
    this.tipo = tipo;
    this.mesReferencia = tipo === 'BriefingFormal' ? String(mesReferencia).trim() : null;
    // §9: nasce NaoGerado; Gerado só via gerar().
    this.estado = 'NaoGerado';
    this.referencia = null;
  }

  /**
   * NaoGerado → Gerado (§9): anexa a referência produzida pela porta
   * Gerador de Documentos (§14.2 fornece o documento por referência).
   * @param {string} referencia referência do documento gerado.
   * @returns {Documento}
   */
  gerar(referencia) {
    if (this.estado !== 'NaoGerado') {
      throw new Error(
        "Transição inválida (§9): gerar exige 'NaoGerado', estado atual: '" +
          this.estado +
          "' — regeneração cria um novo Documento (CB-03)."
      );
    }
    const referenciaTexto = String(referencia == null ? '' : referencia).trim();
    if (referenciaTexto === '') {
      throw new Error('Documento não pode ser Gerado sem referência (§14.2).');
    }
    this.referencia = String(referencia);
    this.estado = 'Gerado';
    return this;
  }

  /**
   * @returns {boolean}
   */
  estaGerado() {
    return this.estado === 'Gerado';
  }
};

// ============================================================================
// DOMAIN — CamposDeMesclagem.js (ex-src/domain/CamposDeMesclagem.js)
// ============================================================================

/**
 * VALUE OBJECT: CamposDeMesclagem (SPEC-023 §6.1)
 *
 * Conjunto dos dados cadastrais/comerciais mesclados nos documentos:
 * razão social, CNPJ, endereço, quantidades por formato, valor (número e
 * por extenso), escopo/prazo de uso de imagem e cidade/data de assinatura.
 *
 * Invariantes preservadas:
 * - DC-02 (§17): campo de mesclagem ausente ou inválido falha barulhento
 *   identificando o campo — nenhum documento é gerado com lacunas.
 * - RN-03: o VO fotografa os termos vigentes no instante da geração —
 *   imutável após criação (congelamento profundo).
 * - Diferente do Snapshot Comercial (SPEC-005), este VO CONTÉM PII
 *   (CNPJ, endereço) legitimamente: o destino é o documento do
 *   destinatário (RNF-01). PII nunca sai daqui para log/evento.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, coluna
 * física.
 */

this.CamposDeMesclagem = class CamposDeMesclagem {
  /**
   * @param {{razaoSocial: string, cnpj: string, endereco: string,
   *          quantidades: Object<string, string>, valorNumero: number,
   *          valorExtenso: string, canaisUsoImagem: string,
   *          prazoUsoImagem: string, cidadeAssinatura: string,
   *          dataAssinatura: string}} campos dados vigentes da Parceira.
   * @throws {Error} DC-02 quando qualquer campo está ausente ou inválido.
   */
  constructor(campos) {
    if (campos == null || typeof campos !== 'object') {
      throw new Error('DC-02: campos de mesclagem ausentes (§17).');
    }

    const textos = [
      'razaoSocial',
      'cnpj',
      'endereco',
      'valorExtenso',
      'canaisUsoImagem',
      'prazoUsoImagem',
      'cidadeAssinatura',
      'dataAssinatura',
    ];
    textos.forEach((nome) => {
      const texto = String(campos[nome] == null ? '' : campos[nome]).trim();
      if (texto === '') {
        throw new Error("DC-02: campo de mesclagem ausente — '" + nome + "' (§17).");
      }
    });

    const valorNumero = campos.valorNumero;
    if (typeof valorNumero !== 'number' || !isFinite(valorNumero) || valorNumero < 0) {
      throw new Error("DC-02: campo de mesclagem ausente — 'valorNumero' (§17).");
    }

    const quantidades = campos.quantidades;
    if (
      quantidades == null ||
      typeof quantidades !== 'object' ||
      Array.isArray(quantidades) ||
      Object.keys(quantidades).length === 0
    ) {
      throw new Error("DC-02: campo de mesclagem ausente — 'quantidades' (§17).");
    }

    textos.forEach((nome) => {
      this[nome] = String(campos[nome]).trim();
    });
    this.valorNumero = valorNumero;
    this.quantidades = Object.freeze(Object.assign({}, quantidades));
    Object.freeze(this);
  }
};

// ============================================================================
// ACL — DocumentoACL.js (ex-src/acl/DocumentoACL.js)
// ============================================================================

/**
 * ACL: DocumentoACL — camada anticorrupção do Documento (SPEC-023; aba
 * física DOCUMENTOS, nova, própria da V2 — legado nunca é normativo).
 *
 * DECISÃO LOCAL (rótulos crus — mesma convenção mecânica de EnvioACL/
 * EntregaACL, SCREAMING_SNAKE_CASE do nome canônico): a SPEC-023 não
 * define persistência física (§1); a referência do documento gerado
 * (§14.2) é persistida numa linha por Documento.
 *
 * Uma ACL por aba (Contrato §7): único ponto que conhece as colunas
 * físicas da aba DOCUMENTOS. Resolução SEMPRE por cabeçalho.
 *
 * Projeção física — uma linha por Documento:
 * - INFLU_KEY / TIPO_DOCUMENTO / MES_REFERENCIA ← identidade (Parceira ×
 *   tipo × competência; competência vazia para Contrato).
 * - REFERENCIA ← referência do documento gerado (§14.2).
 * Só documentos Gerados são persistidos (§9) — a reidratação atravessa o
 * domínio via gerar(). Nenhum campo de mesclagem (PII) é persistido aqui:
 * a aba guarda apenas a referência (RNF-01).
 *
 * Escrita: substituir() faz upsert reescrevendo a aba num ÚNICO setValues
 * (CB-03: regeneração substitui o documento anterior).
 *
 * Não pode conter regra de negócio nem ser duplicada.
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues(), clearContents() e
 *   getRange(...).setValues(...)).
 */

this.DocumentoACL = class DocumentoACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Coage o tipo canônico → rótulo cru persistido.
   * @param {'Contrato'|'BriefingFormal'} canonico
   * @returns {string}
   */
  tipoParaCru(canonico) {
    const mapa = { Contrato: 'CONTRATO', BriefingFormal: 'BRIEFING_FORMAL' };
    if (!mapa[canonico]) {
      throw new Error("Tipo de documento desconhecido: '" + canonico + "'.");
    }
    return mapa[canonico];
  }

  /**
   * Coage o TIPO_DOCUMENTO físico cru → canônico do domínio (trim +
   * casefold). Valor desconhecido → erro barulhento (ADR-001 §2).
   * @param {string} cru
   * @returns {'Contrato'|'BriefingFormal'}
   */
  tipoParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    const mapa = { contrato: 'Contrato', briefing_formal: 'BriefingFormal' };
    if (!mapa[normalizado]) {
      throw new Error(
        "TIPO_DOCUMENTO desconhecido em 'DOCUMENTOS'.TIPO_DOCUMENTO: '" + cru + "'."
      );
    }
    return mapa[normalizado];
  }

  /**
   * Upsert de um Documento pela identidade (Parceira × tipo × competência),
   * num único lote (CB-03: a regeneração substitui o anterior).
   * @param {Documento} documento documento Gerado.
   */
  substituir(documento) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const tipoCru = this.tipoParaCru(documento.tipo);
    const competencia = documento.mesReferencia == null ? '' : documento.mesReferencia;
    const mantidas = valores.slice(1).filter((linha) => {
      if (String(linha[coluna('INFLU_KEY')]).trim() === '') {
        return false;
      }
      return !(
        String(linha[coluna('INFLU_KEY')]).trim() === documento.parceiraId &&
        String(linha[coluna('TIPO_DOCUMENTO')]).trim() === tipoCru &&
        String(linha[coluna('MES_REFERENCIA')]).trim() === competencia
      );
    });
    const fisico = {
      INFLU_KEY: documento.parceiraId,
      TIPO_DOCUMENTO: tipoCru,
      MES_REFERENCIA: competencia,
      REFERENCIA: documento.referencia,
    };
    const nova = cabecalho.map((nome) =>
      Object.prototype.hasOwnProperty.call(fisico, nome) ? fisico[nome] : ''
    );
    this.reescrever(cabecalho, mantidas.concat([nova]));
  }

  /**
   * Lê a aba inteira e reconstrói os Documentos (uma linha por Documento,
   * sempre Gerado — §9). Linhas sem INFLU_KEY são ignoradas.
   * @returns {Documento[]}
   */
  listarTodos() {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    return valores
      .slice(1)
      .filter((linha) => String(linha[coluna('INFLU_KEY')]).trim() !== '')
      .map((linha) => {
        const tipo = this.tipoParaCanonico(linha[coluna('TIPO_DOCUMENTO')]);
        const competencia = String(
          linha[coluna('MES_REFERENCIA')] == null ? '' : linha[coluna('MES_REFERENCIA')]
        ).trim();
        const documento = new Documento(
          String(linha[coluna('INFLU_KEY')]).trim(),
          tipo,
          competencia === '' ? null : competencia
        );
        return documento.gerar(String(linha[coluna('REFERENCIA')]));
      });
  }

  /**
   * @param {Array} cabecalho
   * @returns {function(string): number} resolve nome → índice, fail-fast.
   */
  resolvedorDeColuna(cabecalho) {
    return criarResolvedorDeColuna(cabecalho, 'DOCUMENTOS');
  }

  /**
   * Regrava a aba inteira (cabeçalho + linhas) num único setValues.
   * @param {Array} cabecalho
   * @param {Array[]} linhas
   */
  reescrever(cabecalho, linhas) {
    reescreverAba(this.sheet, cabecalho, linhas);
  }
};

// ============================================================================
// REPOSITORY — DocumentoRepository.js (ex-src/repository/DocumentoRepository.js)
// ============================================================================

/**
 * REPOSITORY: DocumentoRepository — persistência do Documento (SPEC-023).
 *
 * Único ponto (junto da ACL) que trata persistência do Documento. Projeção
 * explícita: identidade (Parceira × tipo × competência) + referência do
 * documento gerado (§14.2). Acessa a planilha SEMPRE via ACL.
 *
 * CB-03: salvar é upsert — a regeneração substitui o documento anterior.
 *
 * Não pode conter regra de negócio nem formatar envelope.
 *
 * @param {DocumentoACL} acl ACL única do Documento.
 */

this.DocumentoRepository = class DocumentoRepository {
  constructor(acl) {
    this.acl = acl;
  }

  /**
   * Persiste um Documento gerado, substituindo o anterior de mesma
   * identidade (CB-03).
   * @param {Documento} documento
   * @returns {Documento} o mesmo Documento persistido.
   */
  salvar(documento) {
    this.acl.substituir(documento);
    return documento;
  }

  /**
   * Consulta um Documento pela identidade.
   * @param {string} parceiraId
   * @param {'Contrato'|'BriefingFormal'} tipo
   * @param {string|null} mesReferencia 'AAAA-MM' (null para Contrato).
   * @returns {Documento|null}
   */
  obterPor(parceiraId, tipo, mesReferencia) {
    const competencia = mesReferencia == null ? null : String(mesReferencia).trim();
    return (
      this.acl
        .listarTodos()
        .find(
          (documento) =>
            documento.parceiraId === String(parceiraId).trim() &&
            documento.tipo === tipo &&
            documento.mesReferencia === competencia
        ) || null
    );
  }
};

// ============================================================================
// SERVICE — DocumentoService.js (ex-src/service/DocumentoService.js)
// ============================================================================

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

// ============================================================================
// CONTROLLER — DocumentoController.js (ex-src/controller/DocumentoController.js)
// ============================================================================

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

// ============================================================================
// ADAPTERS — GeradorDeDocumentosTexto.js (ex-src/adapters/GeradorDeDocumentosTexto.js)
// ============================================================================

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

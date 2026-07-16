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

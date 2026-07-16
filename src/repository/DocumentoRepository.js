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

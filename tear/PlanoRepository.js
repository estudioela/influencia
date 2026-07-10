/**
 * Colunas da aba `Planos_Colaboracao` (docs/spec/SCHEMA_V2.md).
 * Tabela de junção entre `Parceiros_Influenciadoras` e `Ciclos`.
 */
const CAMPOS_PLANO = Object.freeze({
  ID: 'ID_Plano',
  INFLUENCIADORA: 'ID_Influenciadora',
  CICLO: 'ID_Ciclo',
  QTD_ENTREGAVEIS: 'Qtd_Entregaveis',
  VALOR_CACHE: 'Valor_Cache'
});

/** Única camada autorizada a tocar `SpreadsheetApp` para a entidade Plano. */
class PlanoRepository {
  constructor(spreadsheet) {
    this.spreadsheet = spreadsheet || SpreadsheetApp.getActive();
  }

  findByCiclo(idCiclo) {
    if (!idCiclo) {
      return [];
    }

    const nome = PLANILHAS.PLANOS_COLABORACAO;
    const { cabecalho, linhas } = lerAbaComCabecalho(this.spreadsheet, nome);
    const cicloIdx = indiceDaColuna(cabecalho, CAMPOS_PLANO.CICLO, nome);

    return linhasComChave(cabecalho, linhas, CAMPOS_PLANO.ID, nome)
      .filter(linha => String(linha[cicloIdx]).trim() === String(idCiclo).trim())
      .map(linha => linhaParaObjeto(cabecalho, linha));
  }
}

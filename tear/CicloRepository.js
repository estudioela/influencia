/**
 * Colunas da aba `Ciclos` (docs/spec/SCHEMA_V2.md).
 */
const CAMPOS_CICLO = Object.freeze({
  ID: 'ID_Ciclo',
  NOME: 'Nome_Ciclo',
  INICIO_LOGISTICA: 'Data_Inicio_Logistica',
  FIM_OPERACAO: 'Data_Fim_Operacao'
});

/** Única camada autorizada a tocar `SpreadsheetApp` para a entidade Ciclo. */
class CicloRepository {
  constructor(spreadsheet) {
    this.spreadsheet = spreadsheet || SpreadsheetApp.getActive();
  }

  listarTodos() {
    const nome = PLANILHAS.CICLOS;
    const { cabecalho, linhas } = lerAbaComCabecalho(this.spreadsheet, nome);

    return linhasComChave(cabecalho, linhas, CAMPOS_CICLO.ID, nome)
      .map(linha => linhaParaObjeto(cabecalho, linha));
  }
}

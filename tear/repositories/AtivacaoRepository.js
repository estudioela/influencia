/**
 * Colunas da aba `Ativacoes` (docs/spec/SCHEMA_V2.md).
 *
 * `Estado_Derivado` está deliberadamente ausente: é coluna de apresentação,
 * calculada por fórmula na planilha. Nenhum Repository, Entity ou Service da
 * V2 pode lê-la ou escrevê-la — não é fonte de verdade.
 */
const CAMPOS_ATIVACAO = Object.freeze({
  ID: 'ID_Ativacao',
  CICLO: 'ID_Ciclo',
  INFLUENCIADORA: 'ID_Influenciadora',
  TIPO_CONTEUDO: 'Tipo_Conteudo',
  ESTADO: 'Estado_Principal',
  LOOK: 'Look_Referencia',
  ENTREGA_PREVISTA: 'Data_Prevista_Entrega',
  LINK_BRIEFING: 'Link_Briefing',
  LINK_UPLOAD_HD: 'Link_Upload_HD'
});

class AtivacaoRepository {
  constructor(spreadsheet) {
    this.spreadsheet = spreadsheet || SpreadsheetApp.getActive();
  }

  getById(id) {
    if (!id) {
      return null;
    }

    const { cabecalho, linhas } = this._lerDados();
    const idIdx = indiceDaColuna(cabecalho, CAMPOS_ATIVACAO.ID, PLANILHAS.ATIVACOES);
    const linha = linhas.find(l => this._mesmoId(l[idIdx], id));

    return linha ? linhaParaObjeto(cabecalho, linha) : null;
  }

  findByCiclo(cicloId) {
    if (!cicloId) {
      return [];
    }

    const { cabecalho, linhas } = this._lerDados();
    const cicloIdx = indiceDaColuna(cabecalho, CAMPOS_ATIVACAO.CICLO, PLANILHAS.ATIVACOES);

    return linhas
      .filter(l => this._mesmoId(l[cicloIdx], cicloId))
      .map(l => linhaParaObjeto(cabecalho, l));
  }

  save(ativacaoData) {
    if (!ativacaoData || typeof ativacaoData !== 'object') {
      throw new TypeError('save() espera um objeto de ativação.');
    }

    const { aba, cabecalho, linhas } = this._lerDados();
    const idIdx = indiceDaColuna(cabecalho, CAMPOS_ATIVACAO.ID, PLANILHAS.ATIVACOES);
    const id = ativacaoData[CAMPOS_ATIVACAO.ID];
    const posicao = id ? linhas.findIndex(l => this._mesmoId(l[idIdx], id)) : -1;

    if (posicao === -1) {
      const novo = Object.assign({}, ativacaoData);
      novo[CAMPOS_ATIVACAO.ID] = id || Utilities.getUuid();
      aba.appendRow(cabecalho.map(coluna => (coluna in novo ? novo[coluna] : '')));
      return novo;
    }

    const linhaAtual = linhas[posicao];
    const intervalo = aba.getRange(posicao + 2, 1, 1, cabecalho.length);
    const formulas = intervalo.getFormulas()[0];

    const atualizada = cabecalho.map((coluna, i) =>
      coluna && Object.prototype.hasOwnProperty.call(ativacaoData, coluna)
        ? ativacaoData[coluna]
        : linhaAtual[i]
    );

    const paraGravar = atualizada.map((valor, i) => (formulas[i] ? formulas[i] : valor));

    intervalo.setValues([paraGravar]);
    return linhaParaObjeto(cabecalho, atualizada);
  }

  // Leitura, resolução de coluna e serialização de linha vêm de Planilha.js —
  // os mesmos helpers dos outros Repositories. Só `_mesmoId` (comparação com
  // trim) e o `save()` (preservação de fórmula) são específicos desta entidade.
  _lerDados() {
    return lerAbaComCabecalho(this.spreadsheet, PLANILHAS.ATIVACOES);
  }

  _mesmoId(valorCelula, valorBusca) {
    return String(valorCelula).trim() === String(valorBusca).trim();
  }
}

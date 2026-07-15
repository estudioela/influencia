/**
 * ACL: BriefingACL — camada anticorrupção do Briefing da Colaboração
 * (SPEC-009; aba física BRIEFING).
 *
 * DECISÃO LOCAL (D-01, aprovada pelo PO em 2026-07-15): a aba BRIEFING é
 * nova, própria da V2, com carimbo de competência (MES_REFERENCIA +
 * ANO_REFERENCIA, Contrato §7.2). A estrutura física do legado NÃO é
 * referência — legado nunca é normativo.
 *
 * Uma ACL por aba (Contrato §7): único ponto que conhece as colunas físicas
 * da aba BRIEFING. Resolução SEMPRE por cabeçalho, nunca por índice fixo.
 *
 * Projeção física — uma linha por bloco de formato:
 * - INFLU_KEY               ← parceiraId
 * - MES_REFERENCIA (1..12)  ← mesReferencia.mes
 * - ANO_REFERENCIA          ← mesReferencia.ano
 * - ESTADO                  ← RASCUNHO|PUBLICADO
 * - BLOCO_ROTULO            ← rótulo do bloco (ex.: 'Stories 1')
 * - LOOK / DATA_ENTREGA / DATA_POSTAGEM / ORIENTACAO ← preenchimento
 * - DATA_APROVACAO_INTERNA  ← projeção de LEITURA HUMANA: na reidratação a
 *   data é rederivada pelo domínio via preencher() (INV-03) — nunca lida
 *   de volta da planilha.
 * - Briefing sem bloco (CB-03) persiste uma única linha com BLOCO_ROTULO
 *   vazio, para a identidade não se perder.
 *
 * Escrita: substituição/upsert reescrevem a aba inteira num ÚNICO setValues
 * (RN-03/CB-02 — o rascunho anterior da competência é limpo no mesmo lote).
 * Nenhuma coluna PII existe nesta aba (Contrato §5).
 *
 * A reidratação atravessa o domínio (preencher/publicar) — nunca escreve
 * estado por fora, preservando invariantes.
 *
 * Não pode conter regra de negócio nem ser duplicada.
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues(), clearContents() e
 *   getRange(...).setValues(...)).
 */

this.BriefingACL = class BriefingACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Coage o estado canônico → cru persistido na aba (ADR-001 §2.1).
   * @param {'Rascunho'|'Publicado'} canonico
   * @returns {'RASCUNHO'|'PUBLICADO'}
   */
  estadoParaCru(canonico) {
    if (canonico === 'Rascunho') return 'RASCUNHO';
    if (canonico === 'Publicado') return 'PUBLICADO';
    throw new Error("Estado de Briefing desconhecido: '" + canonico + "'.");
  }

  /**
   * Coage o ESTADO físico cru → canônico do domínio (trim + casefold).
   * @param {string} cru
   * @returns {'Rascunho'|'Publicado'}
   */
  estadoParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    if (normalizado === 'rascunho') return 'Rascunho';
    if (normalizado === 'publicado') return 'Publicado';
    throw new Error("ESTADO desconhecido em 'BRIEFING'.ESTADO: '" + cru + "'.");
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
    const data =
      typeof cru.getTime === 'function' ? new Date(cru.getTime()) : new Date(cru);
    if (isNaN(data.getTime())) {
      throw new Error(
        "Valor de data inválido em 'BRIEFING'." + colunaNome + ": '" + cru + "'."
      );
    }
    return data;
  }

  /**
   * Substitui TODOS os briefings da competência num único lote (RN-03/CB-02):
   * linhas de outras competências são preservadas.
   * @param {MesReferencia} mesReferencia
   * @param {Briefing[]} briefings
   */
  substituirCompetencia(mesReferencia, briefings) {
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
    this.reescrever(cabecalho, mantidas.concat(this.linhasDe(cabecalho, briefings)));
  }

  /**
   * Upsert de um briefing pela identidade natural (preenchimento/publicação).
   * @param {Briefing} briefing
   */
  salvar(briefing) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const mantidas = valores.slice(1).filter((linha) => {
      if (String(linha[coluna('INFLU_KEY')]).trim() === '') {
        return false;
      }
      return !(
        String(linha[coluna('INFLU_KEY')]) === briefing.parceiraId &&
        Number(linha[coluna('ANO_REFERENCIA')]) === briefing.mesReferencia.ano &&
        Number(linha[coluna('MES_REFERENCIA')]) === briefing.mesReferencia.mes
      );
    });
    this.reescrever(cabecalho, mantidas.concat(this.linhasDe(cabecalho, [briefing])));
  }

  /**
   * Lê a aba inteira e reconstrói os agregados, agrupando as linhas de
   * bloco pela identidade natural. Linhas sem INFLU_KEY são ignoradas.
   * @returns {Briefing[]}
   */
  listarTodos() {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const grupos = [];
    const porChave = {};
    valores
      .slice(1)
      .filter((linha) => String(linha[coluna('INFLU_KEY')]).trim() !== '')
      .forEach((linha) => {
        const chave =
          String(linha[coluna('INFLU_KEY')]) +
          '|' +
          Number(linha[coluna('ANO_REFERENCIA')]) +
          '|' +
          Number(linha[coluna('MES_REFERENCIA')]);
        if (!porChave[chave]) {
          porChave[chave] = [];
          grupos.push(porChave[chave]);
        }
        porChave[chave].push(linha);
      });
    return grupos.map((linhas) => this.reidratar(linhas, coluna));
  }

  /**
   * Reconstrói um agregado a partir das linhas físicas dos seus blocos,
   * atravessando o domínio: blocos preenchidos passam por preencher()
   * (a data de aprovação é rederivada — INV-03) e o estado Publicado por
   * publicar().
   * @param {Array[]} linhas linhas do mesmo briefing.
   * @param {function(string): number} coluna resolve nome → índice.
   * @returns {Briefing}
   */
  reidratar(linhas, coluna) {
    const primeira = linhas[0];
    const mesReferencia = new MesReferencia(
      Number(primeira[coluna('ANO_REFERENCIA')]),
      Number(primeira[coluna('MES_REFERENCIA')])
    );
    const blocos = linhas
      .filter((linha) => String(linha[coluna('BLOCO_ROTULO')]).trim() !== '')
      .map((linha) => {
        const bloco = new BlocoDeFormato(String(linha[coluna('BLOCO_ROTULO')]));
        const look = String(linha[coluna('LOOK')] == null ? '' : linha[coluna('LOOK')]);
        if (look.trim() !== '') {
          bloco.preencher({
            look: look,
            dataEntrega: this.dataParaCanonica(
              linha[coluna('DATA_ENTREGA')],
              'DATA_ENTREGA'
            ),
            dataPostagem: this.dataParaCanonica(
              linha[coluna('DATA_POSTAGEM')],
              'DATA_POSTAGEM'
            ),
            orientacao: linha[coluna('ORIENTACAO')],
          });
        }
        return bloco;
      });
    const briefing = new Briefing(
      String(primeira[coluna('INFLU_KEY')]),
      mesReferencia,
      blocos
    );
    if (this.estadoParaCanonico(primeira[coluna('ESTADO')]) === 'Publicado') {
      briefing.publicar();
    }
    return briefing;
  }

  /**
   * @param {Array} cabecalho
   * @returns {function(string): number} resolve nome → índice, fail-fast.
   */
  resolvedorDeColuna(cabecalho) {
    return (nome) => {
      const indice = cabecalho.indexOf(nome);
      if (indice === -1) {
        throw new Error("Coluna '" + nome + "' ausente em 'BRIEFING'.");
      }
      return indice;
    };
  }

  /**
   * Projeta briefings em linhas físicas (uma por bloco; CB-03 → linha única
   * com BLOCO_ROTULO vazio), posicionando cada campo pela sua coluna.
   * @param {Array} cabecalho
   * @param {Briefing[]} briefings
   * @returns {Array[]}
   */
  linhasDe(cabecalho, briefings) {
    const linhas = [];
    briefings.forEach((briefing) => {
      const blocos = briefing.blocos.length > 0 ? briefing.blocos : [null];
      blocos.forEach((bloco) => {
        const fisico = {
          INFLU_KEY: briefing.parceiraId,
          MES_REFERENCIA: briefing.mesReferencia.mes,
          ANO_REFERENCIA: briefing.mesReferencia.ano,
          ESTADO: this.estadoParaCru(briefing.estado),
          BLOCO_ROTULO: bloco ? bloco.rotulo : '',
          LOOK: bloco && bloco.look ? bloco.look : '',
          DATA_ENTREGA: bloco && bloco.dataEntrega ? bloco.dataEntrega : '',
          DATA_POSTAGEM: bloco && bloco.dataPostagem ? bloco.dataPostagem : '',
          ORIENTACAO: bloco && bloco.orientacao ? bloco.orientacao : '',
          DATA_APROVACAO_INTERNA:
            bloco && bloco.dataAprovacaoInterna ? bloco.dataAprovacaoInterna : '',
        };
        linhas.push(
          cabecalho.map((nome) =>
            Object.prototype.hasOwnProperty.call(fisico, nome) ? fisico[nome] : ''
          )
        );
      });
    });
    return linhas;
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

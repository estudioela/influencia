/**
 * ACL: ParceiraACL — camada anticorrupção da Parceira.
 *
 * ACL única do sistema (invariante Freeze §4): único ponto que conhece a
 * coluna física da planilha e faz a coerção cru↔canônico com fail-fast
 * (ADR-001 §2/§2.1: valor desconhecido = erro barulhento identificando a
 * coluna e o valor).
 *
 * Acessa a planilha SEMPRE por cabeçalho, nunca por índice fixo.
 * PII nunca é registrada em log/evento.
 *
 * Não pode conter regra de negócio nem ser duplicada.
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues() e appendRow(array)).
 */

this.ParceiraACL = class ParceiraACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Coage o STATUS físico cru → canônico do domínio.
   * Normalização (ADR-001 §2): trim + casefold. Desconhecido → erro.
   * @param {string} cru valor lido da coluna STATUS.
   * @returns {'Ativa'|'Inativa'}
   */
  statusParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    if (normalizado === 'on') return 'Ativa';
    if (normalizado === 'off') return 'Inativa';
    throw new Error(
      "STATUS desconhecido em 'BASE DE DADOS'.STATUS: '" + cru + "'."
    );
  }

  /**
   * Coage o estado canônico → cru persistido na planilha (ADR-001 §2.1).
   * @param {'Ativa'|'Inativa'} canonico
   * @returns {'ON'|'OFF'}
   */
  statusParaCru(canonico) {
    if (canonico === 'Ativa') return 'ON';
    if (canonico === 'Inativa') return 'OFF';
    throw new Error("Estado de vínculo desconhecido: '" + canonico + "'.");
  }

  /**
   * Insere uma Parceira como nova linha, posicionando cada campo pela sua
   * coluna no cabeçalho (nunca por índice fixo).
   * Projeção do cadastro: INFLU_KEY (identidade) e STATUS (vínculo).
   * @param {{nome: string, estado: string}} parceira
   */
  inserir(parceira) {
    const cabecalho = this.sheet.getDataRange().getValues()[0];
    const fisico = {
      INFLU_KEY: parceira.nome,
      STATUS: this.statusParaCru(parceira.estado),
    };
    const linha = cabecalho.map((coluna) =>
      Object.prototype.hasOwnProperty.call(fisico, coluna) ? fisico[coluna] : ''
    );
    this.sheet.appendRow(linha);
  }

  /**
   * Porta do Cadastro para a compilação (SPEC-005 §14.1): Parceiras ativas
   * com a projeção curada das Condições Comerciais (Contrato §7.3).
   * PII (CHAVE_PIX, CNPJ, ENDERECO) NUNCA entra na projeção (RN-10).
   * @returns {{parceiraId: string, condicoes: {
   *   valorMensal: number,
   *   formatosContratados: string[],
   *   quantidadePorFormato: Object<string, number>}}[]}
   */
  listarAtivasComCondicoes() {
    const valores = this.sheet.getDataRange().getValues();
    const coluna = this.resolvedorDeColuna(valores[0]);
    return valores
      .slice(1)
      .filter((linha) => String(linha[coluna('INFLU_KEY')]).trim() !== '')
      .filter(
        (linha) => this.statusParaCanonico(linha[coluna('STATUS')]) === 'Ativa'
      )
      .map((linha) => ({
        parceiraId: String(linha[coluna('INFLU_KEY')]).trim(),
        condicoes: this.condicoesDaLinha(linha, coluna),
      }));
  }

  /**
   * Porta de contato de envio para a Logística (SPEC-016 UC-016.01, D-03):
   * projeção mínima com endereço e chave PIX da Parceira, para a mensagem
   * de confirmação de envio manual. Não expõe a linha completa nem
   * qualquer outro dado da BASE DE DADOS; ParceiraACL segue sendo o único
   * ponto que toca esta aba (Freeze §4).
   * @param {string} parceiraId INFLU_KEY da Parceira.
   * @returns {{endereco: string, pix: string}|null} null se a Parceira não existir.
   */
  obterContatoDeEnvio(parceiraId) {
    const valores = this.sheet.getDataRange().getValues();
    const coluna = this.resolvedorDeColuna(valores[0]);
    const colInfluKey = coluna('INFLU_KEY');
    const colEndereco = coluna('INFLUENCIADORA_ENDERECO');
    const colPix = coluna('CHAVE_PIX');
    const linha = valores
      .slice(1)
      .find((l) => String(l[colInfluKey]).trim() === String(parceiraId).trim());
    if (!linha) {
      return null;
    }
    return {
      endereco: String(linha[colEndereco] == null ? '' : linha[colEndereco]).trim(),
      pix: String(linha[colPix] == null ? '' : linha[colPix]).trim(),
    };
  }

  /**
   * Porta do Cadastro para a Geração de Documentos (SPEC-023 §14.1):
   * projeção da linha da Parceira com o estado do vínculo, a sinalização
   * e os campos de mesclagem (§6.1). Segue o padrão de obterContatoDeEnvio
   * (SPEC-016 D-03): ParceiraACL permanece o ÚNICO ponto que toca a
   * BASE DE DADOS (Freeze §4). Os campos contêm PII (CNPJ, endereço)
   * porque o destino é o documento do destinatário (RNF-01) — nunca
   * registrá-los em log/evento.
   * @param {string} parceiraId INFLU_KEY da Parceira.
   * @returns {{estado: ('Ativa'|'Inativa'), sinalizada: boolean,
   *   campos: {razaoSocial: string, cnpj: string, endereco: string,
   *     quantidades: Object<string, string>, valorNumero: (number|null),
   *     valorExtenso: string, canaisUsoImagem: string,
   *     prazoUsoImagem: string, cidadeAssinatura: string,
   *     dataAssinatura: string}}|null} null se a Parceira não existir.
   */
  obterParaDocumentos(parceiraId) {
    const valores = this.sheet.getDataRange().getValues();
    const coluna = this.resolvedorDeColuna(valores[0]);
    const linha = valores
      .slice(1)
      .find((l) => String(l[coluna('INFLU_KEY')]).trim() === String(parceiraId).trim());
    if (!linha) {
      return null;
    }
    const texto = (nome) =>
      String(linha[coluna(nome)] == null ? '' : linha[coluna(nome)]).trim();
    const rotulos = {
      Reels: 'REELS_TEXTO',
      Carrossel: 'CARROSSEL_TEXTO',
      Stories: 'STORIES_TEXTO',
      Looks: 'LOOKS_QTD_TEXTO',
    };
    const quantidades = {};
    Object.keys(rotulos).forEach((formato) => {
      const valor = texto(rotulos[formato]);
      if (valor !== '') {
        quantidades[formato] = valor;
      }
    });
    return {
      estado: this.statusParaCanonico(linha[coluna('STATUS')]),
      sinalizada: this.sinalizacaoParaCanonico(linha[coluna('SIM/NÃO')]),
      campos: {
        razaoSocial: texto('INFLUENCIADORA_RAZAO_SOCIAL'),
        cnpj: texto('INFLUENCIADORA_CNPJ'),
        endereco: texto('INFLUENCIADORA_ENDERECO'),
        quantidades: quantidades,
        valorNumero:
          texto('VALOR_TOTAL') === ''
            ? null
            : this.valorMensalDe(linha[coluna('VALOR_TOTAL')]),
        valorExtenso: texto('VALOR_TOTAL_EXTENSO'),
        canaisUsoImagem: texto('CANAIS_USO_IMAGEM'),
        prazoUsoImagem: texto('PRAZO_USO_IMAGEM'),
        cidadeAssinatura: texto('CIDADE_ASSINATURA'),
        dataAssinatura: texto('DATA_ASSINATURA'),
      },
    };
  }

  /**
   * Coage a sinalização física crua ('SIM/NÃO') → canônico do domínio
   * (SPEC-023 RN-02). Normalização ADR-001 §2: trim + casefold; vazio é
   * "não sinalizada"; valor desconhecido → erro barulhento.
   * @param {string} cru valor lido da coluna SIM/NÃO.
   * @returns {boolean}
   */
  sinalizacaoParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    if (normalizado === 'sim') return true;
    if (normalizado === 'não' || normalizado === 'nao' || normalizado === '') return false;
    throw new Error(
      "Sinalização desconhecida em 'BASE DE DADOS'.SIM/NÃO: '" + cru + "'."
    );
  }

  /**
   * @param {Array} cabecalho
   * @returns {function(string): number} resolve nome → índice, fail-fast.
   */
  resolvedorDeColuna(cabecalho) {
    return (nome) => {
      const indice = cabecalho.indexOf(nome);
      if (indice === -1) {
        throw new Error("Coluna '" + nome + "' ausente em 'BASE DE DADOS'.");
      }
      return indice;
    };
  }

  /**
   * Coage a linha física → condições comerciais canônicas.
   * Formatos canônicos fechados: Reels, Carrossel, Stories, Looks
   * (Contrato §7.3: entregáveis da BASE DE DADOS).
   * @param {Array} linha linha crua da aba.
   * @param {function(string): number} coluna resolve nome → índice.
   * @returns {{valorMensal: number, formatosContratados: string[],
   *   quantidadePorFormato: Object<string, number>}}
   */
  condicoesDaLinha(linha, coluna) {
    const entregaveis = {
      Reels: 'REELS_TEXTO',
      Carrossel: 'CARROSSEL_TEXTO',
      Stories: 'STORIES_TEXTO',
      Looks: 'LOOKS_QTD',
    };
    const quantidadePorFormato = {};
    Object.keys(entregaveis).forEach((formato) => {
      const quantidade = this.quantidadeContratada(
        linha[coluna(entregaveis[formato])],
        entregaveis[formato]
      );
      if (quantidade > 0) {
        quantidadePorFormato[formato] = quantidade;
      }
    });
    return {
      valorMensal: this.valorMensalDe(linha[coluna('VALOR_TOTAL')]),
      formatosContratados: Object.keys(quantidadePorFormato),
      quantidadePorFormato: quantidadePorFormato,
    };
  }

  /**
   * Coage VALOR_TOTAL cru → número. Desconhecido → erro barulhento.
   * @param {*} cru
   * @returns {number}
   */
  valorMensalDe(cru) {
    const texto = String(cru == null ? '' : cru).trim();
    const valor = Number(texto);
    if (texto === '' || isNaN(valor)) {
      throw new Error(
        "VALOR_TOTAL inválido em 'BASE DE DADOS'.VALOR_TOTAL: '" + cru + "'."
      );
    }
    return valor;
  }

  /**
   * Coage o texto de um entregável → quantidade contratada.
   * Vazio → 0 (não contratado); prefixo numérico ('2 reels') → 2;
   * texto sem número à frente → erro barulhento (ADR-001 §2).
   * @param {*} cru valor lido da coluna do entregável.
   * @param {string} colunaFisica nome da coluna, para o erro.
   * @returns {number}
   */
  quantidadeContratada(cru, colunaFisica) {
    const texto = String(cru == null ? '' : cru).trim();
    if (texto === '') {
      return 0;
    }
    const prefixo = texto.match(/^(\d+)/);
    if (!prefixo) {
      throw new Error(
        colunaFisica + " inválido em 'BASE DE DADOS'." + colunaFisica + ": '" + cru + "'."
      );
    }
    return parseInt(prefixo[1], 10);
  }
};

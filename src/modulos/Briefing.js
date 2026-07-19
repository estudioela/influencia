/**
 * MÓDULO: Briefing — briefing mensal da colaboração (SPEC-009)
 *
 * Fatia vertical (ADR-014): camadas como seções, na ordem
 * DOMAIN → ACL → REPOSITORY → SERVICE → CONTROLLER → ADAPTERS.
 * Os contratos de camada valem integralmente (docs/ARQUITETURA_CAMADAS.md).
 */

// ============================================================================
// DOMAIN — Briefing.js (ex-src/domain/Briefing.js)
// ============================================================================

/**
 * AGREGADO RAIZ: Briefing da Colaboração (SPEC-009 §6.2)
 *
 * Conjunto de orientações e prazos, por formato, de uma Colaboração Mensal.
 * Identidade natural `(parceiraId, mesReferencia)` — INV-01: todo Briefing
 * pertence a exatamente uma Colaboração Mensal.
 *
 * Invariantes preservadas:
 * - INV-02/RN-02: todo bloco corresponde a um formato contratado da
 *   Parceira — os blocos são derivados exclusivamente do Snapshot Comercial
 *   da Colaboração (formatosContratados × quantidadePorFormato).
 * - CB-03: Parceira sem formato contratado → nenhum bloco criado.
 * - §9: máquina de estados fechada Rascunho → Publicado; publicar exige
 *   todos os blocos preenchidos; transição inválida falha barulhento.
 * - RN-03/CB-02: a recriação por compilação pertence ao Service/Repository —
 *   o agregado apenas nasce sempre como Rascunho vazio.
 *
 * DECISÃO LOCAL (vocabulário de blocos): a SPEC-009 enumera os blocos do
 * contrato padrão ('Reel, Carrossel, Stories 1, Stories 2'); o vocabulário
 * canônico de formatos do projeto (M1/SPEC-005) é 'Reels', 'Carrossel',
 * 'Stories' com `quantidadePorFormato`. A derivação aqui é genérica: um
 * bloco por unidade contratada, rotulado com índice quando a quantidade é
 * maior que 1 (ex.: Stories×2 → 'Stories 1', 'Stories 2'). O contrato
 * padrão produz exatamente os 4 blocos da SPEC.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, coluna
 * física. Não conhece o estado da Entrega (SPEC-012) nem Envio/Pagamento.
 */

this.Briefing = class Briefing {
  /**
   * @param {string} parceiraId identidade estável da Parceira.
   * @param {MesReferencia} mesReferencia competência da colaboração (VO).
   * @param {BlocoDeFormato[]} blocos blocos derivados dos formatos contratados.
   */
  constructor(parceiraId, mesReferencia, blocos) {
    const parceiraIdTexto = String(parceiraId == null ? '' : parceiraId).trim();
    if (parceiraIdTexto === '') {
      throw new Error('Briefing exige a identidade da Parceira (INV-01).');
    }
    if (!(mesReferencia instanceof MesReferencia)) {
      throw new Error(
        'Briefing exige o Value Object MesReferencia como competência (INV-01).'
      );
    }
    if (!Array.isArray(blocos) || blocos.some((b) => !(b instanceof BlocoDeFormato))) {
      throw new Error('Briefing exige uma lista de BlocoDeFormato (RN-02).');
    }
    this.parceiraId = parceiraId;
    this.mesReferencia = mesReferencia;
    this.blocos = blocos;
    // §9: nasce Rascunho; Publicado só via publicar().
    this.estado = 'Rascunho';
  }

  /**
   * Fábrica do rascunho: deriva os blocos do Snapshot Comercial da
   * Colaboração (INV-02/RN-02; CB-03 quando não há formato contratado).
   * @param {string} parceiraId
   * @param {MesReferencia} mesReferencia
   * @param {CondicaoComercialSnapshot} snapshot fotografia comercial da
   *   Colaboração Mensal compilada (SPEC-005).
   * @returns {Briefing} rascunho com um bloco por unidade contratada.
   */
  static criarRascunho(parceiraId, mesReferencia, snapshot) {
    if (!(snapshot instanceof CondicaoComercialSnapshot)) {
      throw new Error(
        'Briefing exige o Snapshot Comercial da Colaboração para derivar os blocos (INV-02).'
      );
    }
    const blocos = [];
    snapshot.formatosContratados.forEach((formato) => {
      const quantidade = snapshot.quantidadePorFormato[formato] || 1;
      for (let indice = 1; indice <= quantidade; indice++) {
        const rotulo = quantidade > 1 ? formato + ' ' + indice : formato;
        blocos.push(new BlocoDeFormato(rotulo));
      }
    });
    return new Briefing(parceiraId, mesReferencia, blocos);
  }

  /**
   * Igualdade de entidade pela chave natural (Parceira × MesReferencia).
   * @param {Briefing} outro
   * @returns {boolean}
   */
  igualA(outro) {
    return (
      outro instanceof Briefing &&
      this.parceiraId === outro.parceiraId &&
      this.mesReferencia.igualA(outro.mesReferencia)
    );
  }

  /**
   * Preenche um bloco pelo rótulo (UC-009.01). Só em Rascunho.
   * @param {string} rotulo rótulo do bloco (ex.: 'Stories 1').
   * @param {{look: string, dataEntrega: Date, dataPostagem: Date,
   *          orientacao: (string|undefined)}} dados
   * @returns {BlocoDeFormato} o bloco preenchido.
   * @throws {Error} bloco fora dos formatos contratados (INV-02) ou
   *   briefing já publicado (§9).
   */
  preencherBloco(rotulo, dados) {
    if (this.estado !== 'Rascunho') {
      throw new Error(
        "Transição inválida (§9): preencher exige 'Rascunho', estado atual: '" +
          this.estado +
          "'."
      );
    }
    const bloco = this.blocos.find((b) => b.rotulo === rotulo);
    if (!bloco) {
      throw new Error(
        "INV-02: bloco '" +
          rotulo +
          "' não corresponde a formato contratado da Parceira '" +
          this.parceiraId +
          "'."
      );
    }
    return bloco.preencher(dados);
  }

  /**
   * Rascunho → Publicado (§9). Exige todos os blocos preenchidos
   * (UC-009.01: o preenchimento completo precede a publicação).
   * @returns {Briefing}
   */
  publicar() {
    if (this.estado !== 'Rascunho') {
      throw new Error(
        "Transição inválida (§9): publicar exige 'Rascunho', estado atual: '" +
          this.estado +
          "'."
      );
    }
    const pendente = this.blocos.find((b) => !b.estaPreenchido());
    if (pendente) {
      throw new Error(
        "BR-02: publicação recusada — bloco '" +
          pendente.rotulo +
          "' ainda não preenchido (UC-009.01)."
      );
    }
    this.estado = 'Publicado';
    return this;
  }
};

// ============================================================================
// DOMAIN — BlocoDeFormato.js (ex-src/domain/BlocoDeFormato.js)
// ============================================================================

/**
 * ENTIDADE (interna ao agregado): BlocoDeFormato (SPEC-009 §4/§6.2)
 *
 * Unidade do Briefing para um formato contratado: look, data de entrega,
 * data de postagem e orientação criativa. Nasce vazio (rascunho) e é
 * preenchido pela equipe (UC-009.01).
 *
 * Invariantes preservadas:
 * - INV-03: `dataAprovacaoInterna` é sempre derivada pela
 *   CalculadoraDeAprovacao no ato do preenchimento — não existe caminho
 *   para informá-la manualmente.
 * - BR-02 (§17): datas inválidas falham fail-fast.
 *
 * Só o agregado Briefing cria e manipula blocos — nenhuma camada externa
 * instancia BlocoDeFormato diretamente.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL.
 */

this.BlocoDeFormato = class BlocoDeFormato {
  /**
   * @param {string} rotulo rótulo do bloco (ex.: 'Reels', 'Stories 1').
   */
  constructor(rotulo) {
    const rotuloTexto = String(rotulo == null ? '' : rotulo).trim();
    if (rotuloTexto === '') {
      throw new Error('BlocoDeFormato exige um rótulo de formato (RN-02).');
    }
    this.rotulo = String(rotulo);
    this.look = null;
    this.dataEntrega = null;
    this.dataPostagem = null;
    this.orientacao = null;
    this.dataAprovacaoInterna = null;
  }

  /**
   * Preenche o bloco (UC-009.01) e deriva a data de aprovação interna
   * (RN-01 via CalculadoraDeAprovacao — INV-03).
   * @param {{look: string, dataEntrega: Date, dataPostagem: Date,
   *          orientacao: (string|undefined)}} dados
   * @returns {BlocoDeFormato}
   * @throws {Error} BR-02 quando look ausente ou datas inválidas.
   */
  preencher(dados) {
    if (dados == null || typeof dados !== 'object') {
      throw new Error(
        "BR-02: preenchimento inválido — dados ausentes para o bloco '" +
          this.rotulo +
          "'."
      );
    }
    const lookTexto = String(dados.look == null ? '' : dados.look).trim();
    if (lookTexto === '') {
      throw new Error(
        "BR-02: preenchimento inválido — look/peça é obrigatório no bloco '" +
          this.rotulo +
          "'."
      );
    }
    // Duck-typing (não instanceof): Date pode vir de outro realm (vm).
    if (
      dados.dataEntrega == null ||
      typeof dados.dataEntrega.getTime !== 'function' ||
      isNaN(dados.dataEntrega.getTime())
    ) {
      throw new Error(
        "BR-02: data de entrega inválida no bloco '" + this.rotulo + "'."
      );
    }

    // BR-02 de postagem é validado dentro da Calculadora (fonte única).
    this.dataAprovacaoInterna = CalculadoraDeAprovacao.calcular(dados.dataPostagem);
    this.look = String(dados.look);
    this.dataEntrega = dados.dataEntrega;
    this.dataPostagem = dados.dataPostagem;
    this.orientacao = dados.orientacao == null ? '' : String(dados.orientacao);
    return this;
  }

  /**
   * @returns {boolean} true quando o bloco já foi preenchido (UC-009.01).
   */
  estaPreenchido() {
    return this.dataAprovacaoInterna !== null;
  }
};

// ============================================================================
// DOMAIN — CalculadoraDeAprovacao.js (ex-src/domain/CalculadoraDeAprovacao.js)
// ============================================================================

/**
 * SERVIÇO DE DOMÍNIO: CalculadoraDeAprovacao (SPEC-009 §6.3)
 *
 * Deriva a Data de Aprovação Interna a partir da data de postagem (RN-01):
 * aprovação = postagem − 7 dias; se o resultado cair em
 * sexta → +3 (segunda), sábado → +2 (segunda), domingo → +1 (segunda).
 * A aprovação nunca cai em fim de semana nem em sexta-feira.
 *
 * Invariantes preservadas:
 * - INV-03: a data de aprovação é sempre derivada, nunca arbitrária — este
 *   serviço é o único caminho de cálculo.
 * - RNF-01: cálculo determinístico (aritmética de calendário local, sem
 *   relógio, sem fuso, sem I/O) e testável.
 * - BR-02 (§17): data de postagem inválida falha fail-fast.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL.
 */

this.CalculadoraDeAprovacao = class CalculadoraDeAprovacao {
  /**
   * Aplica RN-01 sobre a data de postagem.
   * @param {Date} dataPostagem data planejada de postagem do conteúdo.
   * @returns {Date} data de aprovação interna derivada.
   * @throws {Error} BR-02 quando a data de postagem não é uma Date válida.
   */
  static calcular(dataPostagem) {
    // Duck-typing em vez de instanceof: Date pode vir de outro realm
    // (harness vm) e instanceof falharia entre realms.
    if (
      dataPostagem == null ||
      typeof dataPostagem.getTime !== 'function' ||
      isNaN(dataPostagem.getTime())
    ) {
      throw new Error(
        "BR-02: data de postagem inválida — esperada Date válida (recebido '" +
          dataPostagem +
          "')."
      );
    }

    const aprovacao = new Date(
      dataPostagem.getFullYear(),
      dataPostagem.getMonth(),
      dataPostagem.getDate() - 7
    );

    // getDay(): 0=domingo, 5=sexta, 6=sábado (RN-01: ajuste até segunda).
    const diaDaSemana = aprovacao.getDay();
    let ajuste = 0;
    if (diaDaSemana === 5) {
      ajuste = 3;
    } else if (diaDaSemana === 6) {
      ajuste = 2;
    } else if (diaDaSemana === 0) {
      ajuste = 1;
    }

    return new Date(
      aprovacao.getFullYear(),
      aprovacao.getMonth(),
      aprovacao.getDate() + ajuste
    );
  }
};

// ============================================================================
// ACL — BriefingACL.js (ex-src/acl/BriefingACL.js)
// ============================================================================

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
    return celulaParaData(cru, colunaNome, 'BRIEFING');
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
    return criarResolvedorDeColuna(cabecalho, 'BRIEFING');
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
    reescreverAba(this.sheet, cabecalho, linhas);
  }
};

// ============================================================================
// REPOSITORY — BriefingRepository.js (ex-src/repository/BriefingRepository.js)
// ============================================================================

/**
 * REPOSITORY: BriefingRepository — persistência do Briefing da Colaboração
 * (SPEC-009).
 *
 * Único ponto (junto da ACL) que trata persistência do agregado. Fala
 * exclusivamente com a porta da ACL — nunca toca SpreadsheetApp nem conhece
 * coluna física (RNF-02).
 *
 * - RN-03/CB-02: a recriação por compilação substitui TODOS os briefings da
 *   competência num único lote atômico da ACL (o rascunho anterior é limpo
 *   antes do novo — tudo ou nada; falha física propaga sem efeito parcial).
 * - salvar persiste preenchimento/publicação de um briefing existente
 *   (upsert por identidade natural na ACL).
 * - obterPor atende UC-009.01.
 *
 * Não pode conter regra de negócio nem formatar envelope.
 *
 * @param {object} acl ACL do Briefing (porta: substituirCompetencia,
 *   salvar, listarTodos).
 */

this.BriefingRepository = class BriefingRepository {
  constructor(acl) {
    this.acl = acl;
  }

  /**
   * Recria os briefings de uma competência num único lote atômico:
   * remove os anteriores e grava os novos (RN-03/CB-02).
   * @param {MesReferencia} mesReferencia
   * @param {Briefing[]} briefings rascunhos recém-derivados da compilação.
   * @returns {Briefing[]} os mesmos briefings persistidos.
   */
  recriarCompetencia(mesReferencia, briefings) {
    this.acl.substituirCompetencia(mesReferencia, briefings);
    return briefings;
  }

  /**
   * Base factual para a reconciliação idempotente da compilação (achado F1
   * da auditoria SPEC-012, `docs/_workspace/auditorias/AUDITORIA_SPEC012.md`):
   * a decisão de (re)materializar ou pular pertence ao Service, não aqui.
   * @param {MesReferencia} mesReferencia
   * @returns {boolean}
   */
  existeParaCompetencia(mesReferencia) {
    return this.acl
      .listarTodos()
      .some((briefing) => briefing.mesReferencia.igualA(mesReferencia));
  }

  /**
   * Persiste o estado atual de um briefing (preenchimento/publicação).
   * @param {Briefing} briefing
   * @returns {Briefing} o mesmo briefing persistido.
   */
  salvar(briefing) {
    this.acl.salvar(briefing);
    return briefing;
  }

  /**
   * Busca o briefing de uma Parceira numa competência (identidade natural).
   * @param {MesReferencia} mesReferencia
   * @param {string} parceiraId
   * @returns {Briefing|null}
   */
  obterPor(mesReferencia, parceiraId) {
    return (
      this.acl
        .listarTodos()
        .find(
          (briefing) =>
            briefing.mesReferencia.igualA(mesReferencia) &&
            briefing.parceiraId === parceiraId
        ) || null
    );
  }
};

// ============================================================================
// SERVICE — BriefingService.js (ex-src/service/BriefingService.js)
// ============================================================================

/**
 * SERVICE: BriefingService — casos de uso do Briefing da Colaboração
 * (SPEC-009 UC-009.01; RN-03).
 *
 * - Reage a `MesCompilado` (§14.1): recria os briefings da competência como
 *   rascunhos derivados do Snapshot de cada Colaboração (RN-03/CB-02 — o
 *   rascunho anterior é limpo pelo Repository num lote atômico).
 * - UC-009.01: preenche os blocos, o domínio deriva a data de aprovação
 *   (RN-01/INV-03), publica o agregado e SÓ APÓS a persistência publica o
 *   evento `BriefingPublicado` (§12) — falha na persistência nunca publica
 *   evento (mesma disciplina de SPEC-005 CB-03).
 * - BR-01 (§17): competência sem Colaboração compilada para a Parceira é
 *   recusada fail-fast.
 * - BR-02 (§17): datas externas chegam como texto 'AAAA-MM-DD' e são
 *   coagidas aqui, fail-fast.
 *
 * DÍVIDAS REGISTRADAS (aprovadas pelo PO em 2026-07-15):
 * - UC-009.02 (Importar Looks de planilha externa) FORA deste módulo —
 *   sem integração externa nesta etapa.
 * - BR-03 (autorização por papel, §13): o Portal ainda não possui camada de
 *   autenticação/papéis (chega com SPEC-025); até lá o acesso segue o
 *   modelo atual do Web App (operador único).
 *
 * Não pode: tocar SpreadsheetApp; conhecer coluna física; formatar envelope.
 *
 * @param {ColaboracaoMensalRepository} colaboracaoMensalRepository base
 *   factual de BR-01 (M2, congelado — somente leitura).
 * @param {BriefingRepository} briefingRepository persistência do agregado.
 * @param {object} publicadorDeEventos porta de eventos: publicar(evento).
 */

this.BriefingService = class BriefingService {
  constructor(colaboracaoMensalRepository, briefingRepository, publicadorDeEventos) {
    this.colaboracaoMensalRepository = colaboracaoMensalRepository;
    this.briefingRepository = briefingRepository;
    this.publicadorDeEventos = publicadorDeEventos;
  }

  /**
   * Reação a `MesCompilado` (RN-03): recria os briefings da competência,
   * um rascunho por Colaboração compilada, blocos derivados do Snapshot.
   * Idempotente por competência (achado F1/F2 da auditoria SPEC-012): se já
   * existe algum briefing desta competência, é no-op — nunca sobrescreve
   * (protege preenchimentos/publicações já feitos e permite reconciliar com
   * segurança uma compilação anterior que falhou parcialmente).
   * @param {string} mesReferenciaTexto competência 'AAAA-MM' (aceita o VO
   *   via toString).
   * @returns {Briefing[]} rascunhos recriados (vazio se já existia).
   */
  recriarParaCompetencia(mesReferenciaTexto) {
    const mesReferencia = MesReferencia.deTexto(String(mesReferenciaTexto));
    if (this.briefingRepository.existeParaCompetencia(mesReferencia)) {
      return [];
    }
    const colaboracoes = this.colaboracaoMensalRepository.listarPor(mesReferencia);
    const rascunhos = colaboracoes.map((colaboracao) =>
      Briefing.criarRascunho(
        colaboracao.parceiraId,
        colaboracao.mesReferencia,
        colaboracao.snapshot
      )
    );
    return this.briefingRepository.recriarCompetencia(mesReferencia, rascunhos);
  }

  /**
   * UC-009.01 · Preencher Briefing: preenche os blocos informados, publica
   * o agregado, persiste e publica `BriefingPublicado`.
   * @param {{mesReferencia: string, parceiraId: string,
   *          blocos: Array<{rotulo: string, look: string,
   *                         dataEntrega: string, dataPostagem: string,
   *                         orientacao: (string|undefined)}>}} comando
   * @returns {Briefing} o briefing publicado.
   * @throws {Error} BR-01 sem Colaboração compilada; BR-02 dados inválidos.
   */
  preencherEPublicar(comando) {
    if (comando == null || typeof comando !== 'object') {
      throw new Error('BR-02: comando de preenchimento ausente (UC-009.01).');
    }
    const mesReferencia = MesReferencia.deTexto(String(comando.mesReferencia));
    const parceiraId = comando.parceiraId;

    const colaboracoes = this.colaboracaoMensalRepository.listarPor(
      mesReferencia,
      parceiraId
    );
    if (colaboracoes.length === 0) {
      throw new Error(
        "BR-01: não existe Colaboração Mensal compilada para '" +
          parceiraId +
          "' na competência " +
          mesReferencia.toString() +
          '.'
      );
    }

    const briefing = this.briefingRepository.obterPor(mesReferencia, parceiraId);
    if (briefing === null) {
      throw new Error(
        'BR-01: briefing inexistente para a competência ' +
          mesReferencia.toString() +
          ' — recompile o mês (RN-03).'
      );
    }

    const blocos = Array.isArray(comando.blocos) ? comando.blocos : [];
    blocos.forEach((dados) => {
      briefing.preencherBloco(dados.rotulo, {
        look: dados.look,
        dataEntrega: this.paraData(dados.dataEntrega, 'data de entrega'),
        dataPostagem: this.paraData(dados.dataPostagem, 'data de postagem'),
        orientacao: dados.orientacao,
      });
    });
    briefing.publicar();
    this.briefingRepository.salvar(briefing);

    // §12: evento só após persistência bem-sucedida; payload sem PII.
    this.publicadorDeEventos.publicar({
      nome: 'BriefingPublicado',
      parceiraId: briefing.parceiraId,
      mesReferencia: briefing.mesReferencia.toString(),
      blocos: briefing.blocos.map((bloco) => bloco.rotulo),
    });
    return briefing;
  }

  /**
   * Query do briefing de uma Parceira na competência (SPEC-027/023; UI).
   * @param {string} mesReferenciaTexto 'AAAA-MM'.
   * @param {string} parceiraId
   * @returns {Briefing|null}
   */
  obterBriefing(mesReferenciaTexto, parceiraId) {
    return this.briefingRepository.obterPor(
      MesReferencia.deTexto(String(mesReferenciaTexto)),
      parceiraId
    );
  }

  /**
   * Coage texto externo 'AAAA-MM-DD' → Date local determinística (BR-02).
   * @param {string} texto
   * @param {string} rotulo para a mensagem de erro.
   * @returns {Date}
   */
  paraData(texto, rotulo) {
    const casamento = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto));
    if (!casamento) {
      throw new Error(
        'BR-02: ' + rotulo + " inválida — esperado 'AAAA-MM-DD' (recebido '" + texto + "')."
      );
    }
    return new Date(
      Number(casamento[1]),
      Number(casamento[2]) - 1,
      Number(casamento[3])
    );
  }
};

// ============================================================================
// CONTROLLER — BriefingController.js (ex-src/controller/BriefingController.js)
// ============================================================================

/**
 * CONTROLLER: BriefingController — adapta o contrato externo do Briefing
 * (SPEC-009 UC-009.01 e query de leitura).
 *
 * Recebe a chamada do Entrypoint (google.script.run), invoca o
 * BriefingService e devolve SEMPRE o envelope padrão {success,data}/
 * {success,error} (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Expõe apenas uma projeção serializável do Briefing — nunca a instância
 * de domínio; datas saem como 'AAAA-MM-DD'. A projeção não carrega PII.
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {BriefingService} briefingService
 */

this.BriefingController = class BriefingController {
  constructor(briefingService) {
    this.briefingService = briefingService;
  }

  /**
   * Adapta o comando PreencherBriefing (UC-009.01) ao contrato externo.
   * @param {{mesReferencia: string, parceiraId: string, blocos: Array}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  preencherBriefing(dados) {
    try {
      return envelopeOk(this.projetar(this.briefingService.preencherEPublicar(dados)));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Adapta a query do briefing por Parceira/competência.
   * @param {{mesReferencia: string, parceiraId: string}} dados
   * @returns {{success: true, data: object|null}|{success: false, error: object}}
   */
  obterBriefing(dados) {
    try {
      const briefing = this.briefingService.obterBriefing(
        dados && dados.mesReferencia,
        dados && dados.parceiraId
      );
      return envelopeOk(briefing === null ? null : this.projetar(briefing));
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }

  /**
   * Projeção serializável do agregado (datas 'AAAA-MM-DD', sem PII).
   * @param {Briefing} briefing
   * @returns {object}
   */
  projetar(briefing) {
    return {
      parceiraId: briefing.parceiraId,
      mesReferencia: briefing.mesReferencia.toString(),
      estado: briefing.estado,
      blocos: briefing.blocos.map((bloco) => ({
        rotulo: bloco.rotulo,
        look: bloco.look,
        dataEntrega: this.dataParaTexto(bloco.dataEntrega),
        dataPostagem: this.dataParaTexto(bloco.dataPostagem),
        orientacao: bloco.orientacao,
        dataAprovacaoInterna: this.dataParaTexto(bloco.dataAprovacaoInterna),
      })),
    };
  }

  /**
   * @param {Date|null} data
   * @returns {string|null} 'AAAA-MM-DD' (calendário local) ou null.
   */
  dataParaTexto(data) {
    if (data == null) {
      return null;
    }
    const mes = data.getMonth() + 1;
    const dia = data.getDate();
    return (
      data.getFullYear() +
      '-' +
      (mes < 10 ? '0' + mes : String(mes)) +
      '-' +
      (dia < 10 ? '0' + dia : String(dia))
    );
  }
};

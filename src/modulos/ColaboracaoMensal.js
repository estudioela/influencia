/**
 * MÓDULO: ColaboracaoMensal — ciclo mensal de colaboração e compilação do mês (SPEC-005)
 *
 * Fatia vertical (ADR-014): camadas como seções, na ordem
 * DOMAIN → ACL → REPOSITORY → SERVICE → CONTROLLER → ADAPTERS.
 * Os contratos de camada valem integralmente (docs/ARQUITETURA_CAMADAS.md).
 */

// ============================================================================
// DOMAIN — ColaboracaoMensal.js (ex-src/domain/ColaboracaoMensal.js)
// ============================================================================

/**
 * AGREGADO RAIZ: ColaboracaoMensal (SPEC-005 §6.2)
 *
 * Participação de uma Parceira em uma MesReferencia. Identidade natural
 * `(parceiraId, mesReferencia)` — INV-01/RN-07: pertence a exatamente uma
 * Parceira e uma competência.
 *
 * Invariantes preservadas:
 * - INV-02/INV-03: contém exatamente um Snapshot Comercial (obrigatório,
 *   imutável — a imutabilidade mora no próprio VO).
 * - §9: nasce 'Ativa' (sem Rascunho — a compilação é atômica);
 *   máquina de estados fechada Ativa → Concluída → Arquivada.
 * - CM-06 (§17): transição de estado inválida falha barulhento.
 * - RN-08: 'Arquivada' é terminal e imutável (agregado congelado).
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, coluna
 * física. Não cria agregados vizinhos (§6.4) — apenas o evento MesCompilado
 * os aciona, fora deste agregado.
 */

this.ColaboracaoMensal = class ColaboracaoMensal {
  /**
   * @param {string} parceiraId identidade estável da Parceira (INFLU_KEY canônica).
   * @param {MesReferencia} mesReferencia competência da colaboração (VO).
   * @param {CondicaoComercialSnapshot} snapshot fotografia comercial congelada.
   */
  constructor(parceiraId, mesReferencia, snapshot) {
    const parceiraIdTexto = String(parceiraId == null ? '' : parceiraId).trim();
    if (parceiraIdTexto === '') {
      throw new Error('ColaboracaoMensal exige a identidade da Parceira (RN-07).');
    }
    if (!(mesReferencia instanceof MesReferencia)) {
      throw new Error(
        'CM-02: MesReferencia inválida — ColaboracaoMensal exige o Value Object MesReferencia.'
      );
    }
    if (!(snapshot instanceof CondicaoComercialSnapshot)) {
      throw new Error(
        'CM-04: Snapshot inconsistente — ColaboracaoMensal exige exatamente um CondicaoComercialSnapshot (INV-02).'
      );
    }
    this.parceiraId = parceiraId;
    this.mesReferencia = mesReferencia;
    this.snapshot = snapshot;
    // §9: nasce Ativa; não existe Rascunho (compilação atômica).
    this.estado = 'Ativa';
  }

  /**
   * Igualdade de entidade pela chave natural (Parceira × MesReferencia).
   * O Snapshot não participa da identidade.
   * @param {ColaboracaoMensal} outra
   * @returns {boolean}
   */
  igualA(outra) {
    return (
      outra instanceof ColaboracaoMensal &&
      this.parceiraId === outra.parceiraId &&
      this.mesReferencia.igualA(outra.mesReferencia)
    );
  }

  /**
   * Ativa → Concluída (todas as obrigações concluídas em módulos vizinhos).
   * @returns {ColaboracaoMensal}
   */
  concluir() {
    if (this.estado !== 'Ativa') {
      throw new Error(
        "CM-06: transição de estado inválida — concluir exige 'Ativa', estado atual: '" +
          this.estado +
          "'."
      );
    }
    this.estado = 'Concluída';
    return this;
  }

  /**
   * Concluída → Arquivada (arquivamento explícito). Terminal: congela o
   * agregado inteiro (RN-08 — competência arquivada é imutável).
   * @returns {ColaboracaoMensal}
   */
  arquivar() {
    if (this.estado !== 'Concluída') {
      throw new Error(
        "CM-06: transição de estado inválida — arquivar exige 'Concluída', estado atual: '" +
          this.estado +
          "'."
      );
    }
    this.estado = 'Arquivada';
    Object.freeze(this);
    return this;
  }
};

// ============================================================================
// DOMAIN — MesReferencia.js (ex-src/domain/MesReferencia.js)
// ============================================================================

/**
 * VALUE OBJECT: MesReferencia
 *
 * Representa um mês de referência do programa de colaboração, no formato
 * canônico 'AAAA-MM' (ex.: '2026-07') — ordenável e comparável, conforme
 * ADR-001 §3.
 *
 * Invariantes preservadas (SPEC-005 §6.1):
 * - 1 ≤ MM ≤ 12.
 * - AAAA ≥ 2020.
 * - Igualdade estrutural: dois VOs são iguais sse MM e AAAA iguais.
 * - Ordenação total definida (cronológica).
 *
 * Origem física (Contrato §7.2): a projeção sobre MES_REFERENCIA +
 * ANO_REFERENCIA pertence à ACL — este VO nunca conhece coluna física,
 * planilha ou ACL.
 *
 * Erros: toda construção inválida falha fail-fast com Error cuja mensagem
 * inclui o código CM-02 (SPEC-005 §17) e identifica o valor rejeitado.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL.
 */

this.MesReferencia = class MesReferencia {
  /**
   * @param {number} ano inteiro, >= 2020.
   * @param {number} mes inteiro, entre 1 e 12.
   */
  constructor(ano, mes) {
    if (!Number.isInteger(ano) || !Number.isInteger(mes)) {
      throw new Error(
        'CM-02: MesReferencia inválida — ano e mês devem ser inteiros (recebido ano=' +
          ano +
          ', mes=' +
          mes +
          ').'
      );
    }
    if (mes < 1 || mes > 12) {
      throw new Error('CM-02: MesReferencia inválida — mês fora do intervalo 1-12 (recebido ' + mes + ').');
    }
    if (ano < 2020) {
      throw new Error('CM-02: MesReferencia inválida — ano anterior a 2020 (recebido ' + ano + ').');
    }

    this.ano = ano;
    this.mes = mes;
    Object.freeze(this);
  }

  /**
   * Constrói a partir do formato canônico 'AAAA-MM'. Qualquer desvio
   * (formato, tipo, vazio) falha fail-fast com CM-02.
   * @param {string} texto
   * @returns {MesReferencia}
   */
  static deTexto(texto) {
    if (typeof texto !== 'string') {
      throw new Error('CM-02: MesReferencia inválida — texto esperado no formato AAAA-MM (recebido ' + texto + ').');
    }
    const casamento = /^(\d{4})-(\d{2})$/.exec(texto);
    if (!casamento) {
      throw new Error('CM-02: MesReferencia inválida — texto fora do formato canônico AAAA-MM (recebido "' + texto + '").');
    }
    const ano = Number(casamento[1]);
    const mes = Number(casamento[2]);
    return new MesReferencia(ano, mes);
  }

  /**
   * @returns {string} 'AAAA-MM' com mês zero-padded (ex.: '2026-07').
   */
  toString() {
    const mesTexto = this.mes < 10 ? '0' + this.mes : String(this.mes);
    return this.ano + '-' + mesTexto;
  }

  /**
   * Igualdade estrutural: ano e mês iguais.
   * @param {MesReferencia} outro
   * @returns {boolean} false quando `outro` não é um MesReferencia (mesmo
   *   padrão das demais VOs/entidades do domínio, ex. ColaboracaoMensal).
   */
  igualA(outro) {
    return outro instanceof MesReferencia && this.ano === outro.ano && this.mes === outro.mes;
  }

  /**
   * Ordenação total cronológica.
   * @param {MesReferencia} outro
   * @returns {number} -1 se anterior, 0 se igual, 1 se posterior.
   * @throws {Error} CM-02 quando `outro` não é um MesReferencia — a
   *   ordenação não tem um valor de retorno seguro para comparar contra
   *   outro tipo, então falha fail-fast em vez de ler propriedades de um
   *   objeto arbitrário.
   */
  comparadoCom(outro) {
    if (!(outro instanceof MesReferencia)) {
      throw new Error(
        'CM-02: MesReferencia inválida — comparadoCom exige outro Value Object MesReferencia.'
      );
    }
    if (this.ano !== outro.ano) {
      return this.ano < outro.ano ? -1 : 1;
    }
    if (this.mes !== outro.mes) {
      return this.mes < outro.mes ? -1 : 1;
    }
    return 0;
  }
};

// ============================================================================
// ACL — ColaboracaoMensalACL.js (ex-src/acl/ColaboracaoMensalACL.js)
// ============================================================================

/**
 * ACL: ColaboracaoMensalACL — camada anticorrupção da Colaboração Mensal
 * (SPEC-005; ADR-005: aba física COLABORACOES).
 *
 * Uma ACL por aba (Contrato §7): único ponto que conhece as colunas físicas
 * da aba COLABORACOES. Resolução SEMPRE por cabeçalho, nunca por índice
 * fixo. Coerção cru↔canônico com fail-fast (ADR-001 §2/§2.1).
 *
 * Projeções físicas (ADR-005):
 * - INFLU_KEY               ← parceiraId
 * - MES_REFERENCIA (1..12)  ← mesReferencia.mes   (Contrato §7.2)
 * - ANO_REFERENCIA          ← mesReferencia.ano   (Contrato §7.2)
 * - ESTADO                  ← estado canônico como ATIVA|CONCLUIDA|ARQUIVADA
 * - SNAPSHOT_VALOR          ← snapshot.valorMensal
 * - SNAPSHOT_FORMATOS       ← lista separada por vírgula (legível na planilha)
 * - SNAPSHOT_QTD_POR_FORMATO← JSON formato→quantidade (estrutura sem perda)
 *
 * A projeção é fechada: nenhuma coluna PII existe nesta aba e colunas
 * desconhecidas ficam em branco (RN-10, Contrato §5).
 *
 * A reidratação atravessa a máquina de estados do domínio (concluir/
 * arquivar) — nunca escreve estado por fora, preservando invariantes.
 *
 * Não pode conter regra de negócio nem ser duplicada.
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues() e getRange(...).setValues(...)).
 */

this.ColaboracaoMensalACL = class ColaboracaoMensalACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Coage o estado canônico → cru persistido na aba (ADR-001 §2.1).
   * @param {'Ativa'|'Concluída'|'Arquivada'} canonico
   * @returns {'ATIVA'|'CONCLUIDA'|'ARQUIVADA'}
   */
  estadoParaCru(canonico) {
    if (canonico === 'Ativa') return 'ATIVA';
    if (canonico === 'Concluída') return 'CONCLUIDA';
    if (canonico === 'Arquivada') return 'ARQUIVADA';
    throw new Error(
      "Estado de Colaboração Mensal desconhecido: '" + canonico + "'."
    );
  }

  /**
   * Coage o ESTADO físico cru → canônico do domínio.
   * Normalização (ADR-001 §2): trim + casefold. Desconhecido → erro.
   * @param {string} cru valor lido da coluna ESTADO.
   * @returns {'Ativa'|'Concluída'|'Arquivada'}
   */
  estadoParaCanonico(cru) {
    const normalizado = String(cru == null ? '' : cru).trim().toLowerCase();
    if (normalizado === 'ativa') return 'Ativa';
    if (normalizado === 'concluida') return 'Concluída';
    if (normalizado === 'arquivada') return 'Arquivada';
    throw new Error(
      "ESTADO desconhecido em 'COLABORACOES'.ESTADO: '" + cru + "'."
    );
  }

  /**
   * Insere todas as Colaborações da competência num ÚNICO setValues,
   * posicionando cada campo pela sua coluna no cabeçalho (RN-03: lote
   * atômico; nunca linha a linha).
   * @param {ColaboracaoMensal[]} colaboracoes
   */
  inserirEmLote(colaboracoes) {
    if (!colaboracoes || colaboracoes.length === 0) {
      return;
    }
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const linhas = colaboracoes.map((colaboracao) => {
      const fisico = {
        INFLU_KEY: colaboracao.parceiraId,
        MES_REFERENCIA: colaboracao.mesReferencia.mes,
        ANO_REFERENCIA: colaboracao.mesReferencia.ano,
        ESTADO: this.estadoParaCru(colaboracao.estado),
        SNAPSHOT_VALOR: colaboracao.snapshot.valorMensal,
        SNAPSHOT_FORMATOS: colaboracao.snapshot.formatosContratados.join(', '),
        SNAPSHOT_QTD_POR_FORMATO: JSON.stringify(
          colaboracao.snapshot.quantidadePorFormato
        ),
      };
      return cabecalho.map((coluna) =>
        Object.prototype.hasOwnProperty.call(fisico, coluna) ? fisico[coluna] : ''
      );
    });
    this.sheet
      .getRange(valores.length + 1, 1, linhas.length, cabecalho.length)
      .setValues(linhas);
  }

  /**
   * Lê a aba inteira e reconstrói os agregados. Linhas sem INFLU_KEY não
   * são registros e são ignoradas.
   * @returns {ColaboracaoMensal[]}
   */
  listarTodas() {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = criarResolvedorDeColuna(cabecalho, 'COLABORACOES');
    return valores
      .slice(1)
      .filter((linha) => String(linha[coluna('INFLU_KEY')]).trim() !== '')
      .map((linha) => this.reidratar(linha, coluna));
  }

  /**
   * Reconstrói um agregado a partir da linha física, atravessando a
   * máquina de estados do domínio para estados avançados.
   * @param {Array} linha
   * @param {function(string): number} coluna resolve nome → índice.
   * @returns {ColaboracaoMensal}
   */
  reidratar(linha, coluna) {
    const mesReferencia = new MesReferencia(
      Number(linha[coluna('ANO_REFERENCIA')]),
      Number(linha[coluna('MES_REFERENCIA')])
    );
    const snapshot = new CondicaoComercialSnapshot({
      valorMensal: Number(linha[coluna('SNAPSHOT_VALOR')]),
      formatosContratados: String(linha[coluna('SNAPSHOT_FORMATOS')])
        .split(',')
        .map((formato) => formato.trim())
        .filter((formato) => formato !== ''),
      quantidadePorFormato: JSON.parse(linha[coluna('SNAPSHOT_QTD_POR_FORMATO')]),
    });
    const colaboracao = new ColaboracaoMensal(
      String(linha[coluna('INFLU_KEY')]),
      mesReferencia,
      snapshot
    );
    const estado = this.estadoParaCanonico(linha[coluna('ESTADO')]);
    if (estado === 'Concluída' || estado === 'Arquivada') {
      colaboracao.concluir();
    }
    if (estado === 'Arquivada') {
      colaboracao.arquivar();
    }
    return colaboracao;
  }

  /**
   * Reescreve ESTADO=ARQUIVADA em todas as linhas físicas da competência
   * (SPEC-034 RN-06/UC-034.02) — as demais linhas são preservadas intactas.
   * Escrita física pura (mesmo espírito de `inserirEmLote`): não reidrata
   * nem invoca a máquina de estados do domínio, porque a validação da
   * transição (RN-07/CM-06) já foi feita pelo chamador antes de chegar aqui.
   * @param {MesReferencia} mesReferencia
   */
  arquivarCompetencia(mesReferencia) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = criarResolvedorDeColuna(cabecalho, 'COLABORACOES');
    const linhas = valores.slice(1).map((linha) => {
      if (String(linha[coluna('INFLU_KEY')]).trim() === '') {
        return linha;
      }
      const mesDaLinha = new MesReferencia(
        Number(linha[coluna('ANO_REFERENCIA')]),
        Number(linha[coluna('MES_REFERENCIA')])
      );
      if (!mesDaLinha.igualA(mesReferencia)) {
        return linha;
      }
      const copia = linha.slice();
      copia[coluna('ESTADO')] = this.estadoParaCru('Arquivada');
      return copia;
    });
    reescreverAba(this.sheet, cabecalho, linhas);
  }
};

// ============================================================================
// REPOSITORY — ColaboracaoMensalRepository.js (ex-src/repository/ColaboracaoMensalRepository.js)
// ============================================================================

/**
 * REPOSITORY: ColaboracaoMensalRepository — persistência da Colaboração
 * Mensal (SPEC-005).
 *
 * Único ponto (junto da ACL) que trata persistência do agregado. Fala
 * exclusivamente com a porta da ACL — nunca toca SpreadsheetApp nem conhece
 * coluna física (RNF-06).
 *
 * - RN-03/CB-03: a competência é persistida num ÚNICO lote da ACL
 *   (tudo ou nada); falha física propaga sem efeito parcial.
 * - existeCompetencia é a base factual da idempotência (RN-09/CB-01) —
 *   a decisão de recusar/no-op pertence ao Service, não a esta camada.
 * - listarPor atende UC-005.03 (consulta por competência e/ou parceira).
 *
 * Não pode conter regra de negócio nem formatar envelope.
 *
 * @param {object} acl ACL da Colaboração Mensal (porta: inserirEmLote,
 *   listarTodas).
 */

this.ColaboracaoMensalRepository = class ColaboracaoMensalRepository {
  constructor(acl) {
    this.acl = acl;
  }

  /**
   * Persiste todas as Colaborações de uma competência num único lote
   * atômico (RN-03).
   * @param {ColaboracaoMensal[]} colaboracoes
   * @returns {ColaboracaoMensal[]} as mesmas colaborações persistidas.
   */
  salvarTodas(colaboracoes) {
    this.acl.inserirEmLote(colaboracoes);
    return colaboracoes;
  }

  /**
   * Responde se a competência já possui Colaborações compiladas.
   * @param {MesReferencia} mesReferencia
   * @returns {boolean}
   */
  existeCompetencia(mesReferencia) {
    return this.acl
      .listarTodas()
      .some((colaboracao) => colaboracao.mesReferencia.igualA(mesReferencia));
  }

  /**
   * Lista as Colaborações de uma competência, opcionalmente restritas a
   * uma Parceira (UC-005.03).
   * @param {MesReferencia} mesReferencia
   * @param {string} [parceiraId]
   * @returns {ColaboracaoMensal[]}
   */
  listarPor(mesReferencia, parceiraId) {
    return this.acl
      .listarTodas()
      .filter((colaboracao) => colaboracao.mesReferencia.igualA(mesReferencia))
      .filter(
        (colaboracao) =>
          parceiraId === undefined || colaboracao.parceiraId === parceiraId
      );
  }

  /**
   * Lista todas as Colaborações, de todas as competências (SPEC-034 UC-034.01:
   * base para descobrir quais competências ainda não foram seladas).
   * @returns {ColaboracaoMensal[]}
   */
  listarTodas() {
    return this.acl.listarTodas();
  }

  /**
   * Sela a competência inteira: reescreve ESTADO=Arquivada em todas as suas
   * linhas físicas (SPEC-034 RN-06/UC-034.02). A elegibilidade (RN-07) e a
   * transição de domínio (Concluída -> Arquivada, CM-06) já foram validadas
   * pelo chamador antes desta chamada — aqui é só persistência.
   * @param {MesReferencia} mesReferencia
   */
  arquivarCompetencia(mesReferencia) {
    this.acl.arquivarCompetencia(mesReferencia);
  }
};

// ============================================================================
// SERVICE — CompiladorDoMes.js (ex-src/service/CompiladorDoMes.js)
// ============================================================================

/**
 * SERVICE: CompiladorDoMes — única entrada para o comando CompilarMes
 * (SPEC-005 §6.3, UC-005.01).
 *
 * Orquestra a compilação da competência: valida a MesReferencia, garante
 * idempotência pela chave da competência (RN-09/C-02 — segunda chamada é
 * no-op sem efeito colateral), obtém as Parceiras ativas com suas Condições
 * Comerciais na porta do Cadastro (§14.1), congela um Snapshot por Parceira
 * (RN-04), persiste tudo num lote atômico (RN-03) e só então publica
 * `MesCompilado` (§12) — falha na persistência nunca publica evento (CB-03).
 *
 * Os agregados vizinhos (Briefing, Ativação, Logística, Pagamento) NÃO são
 * criados aqui (§6.4): reagem ao evento em seus próprios módulos.
 *
 * Não pode: falar HTTP/HTML; formatar envelope (Controller); conhecer
 * coluna física (ACL).
 *
 * @param {object} cadastroDeParceiras porta do Cadastro:
 *   listarAtivasComCondicoes() → [{parceiraId, condicoes}].
 * @param {ColaboracaoMensalRepository} colaboracaoMensalRepository
 * @param {object} publicadorDeEventos porta de eventos: publicar(evento).
 */

this.CompiladorDoMes = class CompiladorDoMes {
  constructor(cadastroDeParceiras, colaboracaoMensalRepository, publicadorDeEventos) {
    this.cadastroDeParceiras = cadastroDeParceiras;
    this.colaboracaoMensalRepository = colaboracaoMensalRepository;
    this.publicadorDeEventos = publicadorDeEventos;
  }

  /**
   * Comando CompilarMes(MesReferencia).
   * @param {string} mesReferenciaTexto competência no formato canônico 'AAAA-MM'.
   * @returns {{mesReferencia: string,
   *            colaboracoes: ColaboracaoMensal[],
   *            jaCompilada: boolean}}
   */
  executar(mesReferenciaTexto) {
    const mesReferencia = MesReferencia.deTexto(mesReferenciaTexto);

    // RN-09/CB-01: competência já compilada — no-op idempotente, zero efeitos.
    if (this.colaboracaoMensalRepository.existeCompetencia(mesReferencia)) {
      return {
        mesReferencia: mesReferencia.toString(),
        colaboracoes: this.colaboracaoMensalRepository.listarPor(mesReferencia),
        jaCompilada: true,
      };
    }

    const ativas = this.cadastroDeParceiras.listarAtivasComCondicoes();
    if (!ativas || ativas.length === 0) {
      throw new Error(
        'CM-03: nenhuma Parceira ativa — compilação de ' +
          mesReferencia.toString() +
          ' recusada, nada foi criado.'
      );
    }

    const colaboracoes = ativas.map(
      (parceira) =>
        new ColaboracaoMensal(
          parceira.parceiraId,
          mesReferencia,
          new CondicaoComercialSnapshot(parceira.condicoes)
        )
    );

    this.colaboracaoMensalRepository.salvarTodas(colaboracoes);

    this.publicadorDeEventos.publicar({
      nome: 'MesCompilado',
      mesReferencia: mesReferencia.toString(),
      colaboracoes: colaboracoes,
    });

    return {
      mesReferencia: mesReferencia.toString(),
      colaboracoes: colaboracoes,
      jaCompilada: false,
    };
  }
};

// ============================================================================
// CONTROLLER — ColaboracaoMensalController.js (ex-src/controller/ColaboracaoMensalController.js)
// ============================================================================

/**
 * CONTROLLER: ColaboracaoMensalController — adapta o contrato externo da
 * compilação do mês (SPEC-005 UC-005.01).
 *
 * Recebe a chamada do Entrypoint (google.script.run), invoca o
 * CompiladorDoMes e devolve SEMPRE o envelope padrão
 * {success,data}/{success,error} (PROJECT_GOVERNANCE §3.3, via
 * envelopeOk/envelopeFail).
 *
 * Expõe apenas uma projeção serializável das Colaborações — nunca a
 * instância de domínio. A projeção não carrega PII (o Snapshot já nasce
 * sem PII, RN-10).
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {CompiladorDoMes} compiladorDoMes
 */

this.ColaboracaoMensalController = class ColaboracaoMensalController {
  constructor(compiladorDoMes) {
    this.compiladorDoMes = compiladorDoMes;
  }

  /**
   * Adapta o comando CompilarMes ao contrato externo.
   * @param {{mesReferencia: string}} dados dados do formulário ('AAAA-MM').
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  compilarMes(dados) {
    try {
      const resultado = this.compiladorDoMes.executar(dados && dados.mesReferencia);
      return envelopeOk({
        mesReferencia: resultado.mesReferencia,
        jaCompilada: resultado.jaCompilada,
        colaboracoes: resultado.colaboracoes.map((colaboracao) => ({
          parceiraId: colaboracao.parceiraId,
          mesReferencia: colaboracao.mesReferencia.toString(),
          estado: colaboracao.estado,
          snapshot: {
            valorMensal: colaboracao.snapshot.valorMensal,
            formatosContratados: colaboracao.snapshot.formatosContratados.slice(),
            quantidadePorFormato: Object.assign(
              {},
              colaboracao.snapshot.quantidadePorFormato
            ),
          },
        })),
      });
    } catch (erro) {
      return envelopeFail({ mensagem: erro.message });
    }
  }
};

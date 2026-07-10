const EVENTO_ATIVACAO_ESTADO_ALTERADO = 'AtivacaoEstadoAlterado';

class AtivacaoService {
  constructor(eventDispatcher, repository) {
    if (!eventDispatcher) {
      throw new TypeError('AtivacaoService exige um EventDispatcher.');
    }

    this.eventDispatcher = eventDispatcher;
    this.repository = repository || new AtivacaoRepository();
  }

  /**
   * Leitura de todas as ativações de um ciclo, já em DTO.
   *
   * O Service nunca devolve a linha crua do Repository: a UI não pode depender
   * do nome das colunas da planilha, senão trocar Sheets por um banco na V3
   * quebraria o front-end — que é exatamente o que a camada existe para evitar.
   */
  listarPorCiclo(idCiclo) {
    if (!idCiclo) {
      throw new Error('É obrigatório informar o ciclo.');
    }

    return this.repository.findByCiclo(idCiclo).map(linha => this._paraDto(linha));
  }

  /**
   * Escopo por parceira. Sem isto, uma influenciadora autenticada veria as
   * entregas de todas as outras do mesmo ciclo.
   */
  listarDaInfluenciadoraNoCiclo(idCiclo, idInfluenciadora) {
    if (!idInfluenciadora) {
      throw new Error('É obrigatório informar a influenciadora.');
    }

    return this.listarPorCiclo(idCiclo)
      .filter(dto => dto.idInfluenciadora === String(idInfluenciadora));
  }

  /**
   * O histórico da V2 não é uma aba: é o próprio ciclo de vida da ativação.
   * `Arquivada` é o estado terminal (docs/spec/SCHEMA_V2.md) — nada sai de lá.
   */
  listarArquivadasDaInfluenciadoraNoCiclo(idCiclo, idInfluenciadora) {
    return this.listarDaInfluenciadoraNoCiclo(idCiclo, idInfluenciadora)
      .filter(dto => dto.estado === ESTADOS_ATIVACAO.ARQUIVADA);
  }

  obter(idAtivacao, idInfluenciadora) {
    return this._paraDto(this._exigirPropria(idAtivacao, idInfluenciadora));
  }

  /**
   * Posse, antes de qualquer leitura ou escrita de UMA ativação.
   *
   * `listarDaInfluenciadoraNoCiclo` já filtrava por parceira, mas `obter` e
   * `alterarEstado` recebiam só o id da ativação: bastava trocar o argumento
   * para ler — e alterar o estado — a entrega de outra influenciadora.
   *
   * "Não é sua" e "não existe" devolvem a MESMA mensagem: distinguir as duas
   * revelaria quais ids existem na planilha.
   */
  _exigirPropria(idAtivacao, idInfluenciadora) {
    if (!idInfluenciadora) {
      throw new Error('É obrigatório informar a influenciadora.');
    }

    const dados = this.repository.getById(idAtivacao);
    const propria = dados &&
      String(dados[CAMPOS_ATIVACAO.INFLUENCIADORA]) === String(idInfluenciadora);

    if (!propria) {
      throw new Error(`Ativação "${idAtivacao}" não encontrada.`);
    }

    return dados;
  }

  /**
   * A planilha devolve `Date` para colunas de data e `''` para célula vazia.
   * Serializar aqui evita que cada tela invente seu próprio tratamento — e
   * `google.script.run` não preserva `Date` de forma confiável.
   */
  _paraDto(linha) {
    const C = CAMPOS_ATIVACAO;

    return {
      idAtivacao: textoDeCelula(linha[C.ID]),
      idCiclo: textoDeCelula(linha[C.CICLO]),
      idInfluenciadora: textoDeCelula(linha[C.INFLUENCIADORA]),
      tipoConteudo: textoDeCelula(linha[C.TIPO_CONTEUDO]),
      estado: textoDeCelula(linha[C.ESTADO]),
      lookReferencia: textoDeCelula(linha[C.LOOK]),
      entregaPrevista: dataIsoDeCelula(linha[C.ENTREGA_PREVISTA]),
      linkBriefing: textoDeCelula(linha[C.LINK_BRIEFING]),
      linkUploadHd: textoDeCelula(linha[C.LINK_UPLOAD_HD])
    };
  }

  alterarEstado(idAtivacao, novoEstado, idInfluenciadora) {
    const dados = this._exigirPropria(idAtivacao, idInfluenciadora);

    const ativacao = new Ativacao(dados);
    ativacao.validateStateTransition(novoEstado);

    const estadoAnterior = ativacao.estadoAtual;

    const atualizado = Object.assign({}, dados);
    atualizado[CAMPOS_ATIVACAO.ESTADO] = novoEstado;

    const salvo = this.repository.save(atualizado);

    const dto = {
      idAtivacao: salvo[CAMPOS_ATIVACAO.ID],
      estadoAnterior: estadoAnterior,
      novoEstado: novoEstado,
      atualizadoEm: new Date().toISOString()
    };

    this.eventDispatcher.dispatch(EVENTO_ATIVACAO_ESTADO_ALTERADO, dto);

    return dto;
  }
}

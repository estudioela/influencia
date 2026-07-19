/**
 * MÓDULO: Autenticacao — identidade, sessão e OAuth do Portal (SPEC-025 + ADR-013)
 *
 * Fatia vertical (ADR-014): camadas como seções, na ordem
 * DOMAIN → ACL → REPOSITORY → SERVICE → CONTROLLER → ADAPTERS.
 * Os contratos de camada valem integralmente (docs/ARQUITETURA_CAMADAS.md).
 */

// ============================================================================
// DOMAIN — Sessao.js (ex-src/domain/Sessao.js)
// ============================================================================

/**
 * AGREGADO: Sessão (raiz — SPEC-025 §6.2) — janela de acesso autenticado da
 * Parceira, com expiração deslizante de 6 horas (RN-03: PRD §7 RN-18).
 *
 * INV-01: Sessão só existe para Parceira autenticada — nasce vinculada a um
 * parceiraId e a um TokenDeSessao, sempre.
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL.
 */

this.Sessao = class Sessao {
  /** Duração canônica da sessão (RN-03). */
  static get DURACAO_HORAS() {
    return 6;
  }

  /**
   * @param {string} parceiraId identidade da Parceira autenticada (INV-01).
   * @param {TokenDeSessao} token token opaco da sessão.
   * @param {Date} agora instante da autenticação.
   */
  constructor(parceiraId, token, agora) {
    const id = String(parceiraId == null ? '' : parceiraId).trim();
    if (!id) {
      throw new Error('Sessão exige Parceira autenticada (INV-01).');
    }
    if (!token || !token.valor) {
      throw new Error('Sessão exige TokenDeSessao.');
    }
    this.parceiraId = id;
    this.token = token;
    this.renovar(agora);
  }

  /**
   * Reidrata uma Sessão persistida SEM recomputar a validade.
   * @param {string} parceiraId
   * @param {string} valorDoToken
   * @param {Date} expiraEm validade persistida.
   * @returns {Sessao}
   */
  static reconstituir(parceiraId, valorDoToken, expiraEm) {
    const sessao = Object.create(Sessao.prototype);
    sessao.parceiraId = String(parceiraId).trim();
    sessao.token = new TokenDeSessao(valorDoToken);
    sessao.expiraEm = new Date(expiraEm.getTime());
    return sessao;
  }

  /**
   * Expiração deslizante (UC-025.02): cada interação renova 6h a partir dela.
   * @param {Date} interacao instante da interação.
   */
  renovar(interacao) {
    if (!interacao || typeof interacao.getTime !== 'function' || isNaN(interacao.getTime())) {
      throw new Error('Sessão exige instante válido para renovar.');
    }
    this.expiraEm = new Date(
      interacao.getTime() + Sessao.DURACAO_HORAS * 60 * 60 * 1000
    );
  }

  /**
   * @param {Date} instante
   * @returns {boolean} true se a sessão expirou (CB-02 / AC-03).
   */
  expiradaEm(instante) {
    return instante.getTime() >= this.expiraEm.getTime();
  }
};

// ============================================================================
// DOMAIN — TokenDeSessao.js (ex-src/domain/TokenDeSessao.js)
// ============================================================================

/**
 * VO: TokenDeSessao (SPEC-025 §6.1) — identificador opaco da Sessão.
 *
 * O domínio não conhece o gerador (UUID etc.): o valor chega pronto da
 * composição (porta geradorDeToken) — RNF-03: independente da tecnologia.
 */

this.TokenDeSessao = class TokenDeSessao {
  constructor(valor) {
    const token = String(valor == null ? '' : valor).trim();
    if (!token) {
      throw new Error('TokenDeSessao exige valor.');
    }
    this.valor = token;
  }
};

// ============================================================================
// DOMAIN — Credencial.js (ex-src/domain/Credencial.js)
// ============================================================================

/**
 * VO: Credencial (SPEC-025 §6.1) — par identificador + segredo apresentado
 * pela Parceira na autenticação (RN-01).
 *
 * INV-03 / RN-04 (Contrato §5): a credencial nunca pode ser registrada em
 * claro — o segredo não participa de serializações acidentais (String/JSON).
 *
 * Não pode conhecer: SpreadsheetApp, HTML, HTTP, Repository, ACL, nem o
 * mecanismo concreto de verificação (isso é do adaptador atrás da porta).
 */

this.Credencial = class Credencial {
  constructor(identificador, segredo) {
    const id = String(identificador == null ? '' : identificador).trim();
    const chave = String(segredo == null ? '' : segredo).trim();
    if (!id || !chave) {
      throw new Error('Credencial exige identificador e segredo.');
    }
    this.identificador = id;
    // Segredo fora de propriedade enumerável: não vaza em JSON/log (INV-03).
    Object.defineProperty(this, 'segredo', {
      value: chave,
      enumerable: false,
      writable: false,
    });
  }

  toString() {
    return '[Credencial ' + this.identificador + ']';
  }
};

// ============================================================================
// DOMAIN — Autenticador.js (ex-src/domain/Autenticador.js)
// ============================================================================

/**
 * SERVIÇO DE DOMÍNIO: Autenticador (SPEC-025 §6.3) — porta de autenticação.
 *
 * Valida a credencial atrás da porta `verificadorDeCredencial` e aplica a
 * política de bloqueio (RN-02: 5 tentativas → 15 minutos). O mecanismo
 * concreto de verificação é injetado na composição — hoje, o adaptador
 * legado (RN-16, provisório: 🟠 P5/Q-07 aguarda PO); o domínio não o conhece.
 *
 * Lógica pura: o estado de tentativas chega e sai por parâmetro/resultado;
 * persistência é do Service/Repository.
 *
 * @param {{verificar: function(Credencial): (string|null)}}
 *   verificadorDeCredencial porta que resolve credencial → parceiraId.
 */

this.Autenticador = class Autenticador {
  /** Limite de tentativas malsucedidas antes do bloqueio (RN-02). */
  static get LIMITE_DE_TENTATIVAS() {
    return 5;
  }

  constructor(verificadorDeCredencial) {
    this.verificadorDeCredencial = verificadorDeCredencial;
  }

  /**
   * UC-025.01: avalia uma tentativa de autenticação.
   * @param {Credencial} credencial credencial apresentada.
   * @param {number} falhasAnteriores falhas acumuladas do identificador.
   * @param {Date} agora instante da tentativa.
   * @returns {{sucesso: true, parceiraId: string}
   *   |{sucesso: false, falhas: number, bloqueio: (JanelaDeBloqueio|null)}}
   *   em falha, `bloqueio` vem preenchido quando a tentativa atinge o
   *   limite (CB-01).
   */
  autenticar(credencial, falhasAnteriores, agora) {
    const parceiraId = this.verificadorDeCredencial.verificar(credencial);
    if (parceiraId) {
      return { sucesso: true, parceiraId: String(parceiraId) };
    }
    const falhas = (falhasAnteriores || 0) + 1;
    return {
      sucesso: false,
      falhas: falhas,
      bloqueio:
        falhas >= Autenticador.LIMITE_DE_TENTATIVAS
          ? new JanelaDeBloqueio(agora)
          : null,
    };
  }

  /**
   * Cria a Sessão da Parceira autenticada (INV-01; RN-03).
   * @param {string} parceiraId
   * @param {string} valorDoToken valor opaco vindo da porta geradorDeToken.
   * @param {Date} agora
   * @returns {Sessao}
   */
  criarSessao(parceiraId, valorDoToken, agora) {
    return new Sessao(parceiraId, new TokenDeSessao(valorDoToken), agora);
  }
};

// ============================================================================
// ACL — SessaoACL.js (ex-src/acl/SessaoACL.js)
// ============================================================================

/**
 * ACL: SessaoACL — camada anticorrupção da aba física `SESSOES`.
 *
 * Único ponto que conhece as colunas físicas TOKEN | PARCEIRA_ID |
 * EXPIRA_EM. Acessa a planilha SEMPRE por cabeçalho, nunca por índice fixo.
 * Escrita: upsert reescreve a aba inteira num ÚNICO setValues (mesmo padrão
 * DocumentoACL). Datas persistidas em ISO-8601; leitura aceita Date ou
 * texto (coerção cru→canônico fail-fast).
 *
 * PII nunca em log (Contrato §5); o token é opaco e não é PII, mas é
 * segredo de acesso — nunca registrá-lo em log/evento (RN-04).
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues() e getRange(...).setValues(...)).
 */

this.SessaoACL = class SessaoACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Insere ou substitui a sessão do token (upsert por TOKEN).
   * @param {{token: string, parceiraId: string, expiraEm: Date}} sessao
   */
  upsert(sessao) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const nova = cabecalho.map(() => '');
    nova[coluna('TOKEN')] = sessao.token;
    nova[coluna('PARCEIRA_ID')] = sessao.parceiraId;
    nova[coluna('EXPIRA_EM')] = sessao.expiraEm.toISOString();
    const linhas = valores
      .slice(1)
      .filter((linha) => String(linha[coluna('TOKEN')]).trim() !== String(sessao.token).trim());
    linhas.push(nova);
    this.regravar(cabecalho, linhas);
  }

  /**
   * @param {string} token
   * @returns {{token: string, parceiraId: string, expiraEm: Date}|null}
   */
  obterPorToken(token) {
    const valores = this.sheet.getDataRange().getValues();
    const coluna = this.resolvedorDeColuna(valores[0]);
    const linha = valores
      .slice(1)
      .find((l) => String(l[coluna('TOKEN')]).trim() === String(token).trim());
    if (!linha) {
      return null;
    }
    return {
      token: String(linha[coluna('TOKEN')]).trim(),
      parceiraId: String(linha[coluna('PARCEIRA_ID')]).trim(),
      expiraEm: this.dataParaCanonico(linha[coluna('EXPIRA_EM')], 'EXPIRA_EM'),
    };
  }

  /**
   * Remove a sessão do token, se existir (logout/expiração).
   * @param {string} token
   */
  remover(token) {
    const valores = this.sheet.getDataRange().getValues();
    const cabecalho = valores[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const linhas = valores
      .slice(1)
      .filter((linha) => String(linha[coluna('TOKEN')]).trim() !== String(token).trim());
    this.regravar(cabecalho, linhas);
  }

  /**
   * Coage o valor físico de data → Date canônico, fail-fast (ADR-001 §2).
   * @param {*} cru Date do Sheets ou texto ISO.
   * @param {string} colunaFisica nome da coluna, para o erro.
   * @returns {Date}
   */
  dataParaCanonico(cru, colunaFisica) {
    const data = cru && typeof cru.getTime === 'function' ? cru : new Date(String(cru));
    if (isNaN(data.getTime())) {
      throw new Error(
        colunaFisica + " inválida em 'SESSOES'." + colunaFisica + ": '" + cru + "'."
      );
    }
    return data;
  }

  /**
   * @param {Array} cabecalho
   * @returns {function(string): number} resolve nome → índice, fail-fast.
   */
  resolvedorDeColuna(cabecalho) {
    return criarResolvedorDeColuna(cabecalho, 'SESSOES');
  }

  /**
   * Regrava a aba inteira (cabeçalho + linhas) num único setValues.
   * @param {Array} cabecalho
   * @param {Array<Array>} linhas
   */
  regravar(cabecalho, linhas) {
    reescreverAba(this.sheet, cabecalho, linhas);
  }
};

// ============================================================================
// ACL — AdministradorACL.js (ex-src/acl/AdministradorACL.js)
// ============================================================================

/**
 * ACL: AdministradorACL — camada anticorrupção da aba física
 * `BASE_ADMINISTRADORES` (SPEC-035 §10.2.2).
 *
 * Único ponto que conhece as colunas físicas SUB_PROVIDER | NOME_COMPLETO |
 * AREA_RESPONSABILIDADE. Acessa a planilha SEMPRE por cabeçalho (Contrato
 * §7). Escrita por append (mesmo padrão de ParceiraACL.inserir) — dados
 * complementares gravados uma vez, no onboarding.
 *
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API:
 *   getDataRange().getValues() e appendRow(array)).
 */

this.AdministradorACL = class AdministradorACL {
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Insere os dados complementares do Administrador (UC-035.03).
   * @param {{subProvider: string, nomeCompleto: string,
   *   areaResponsabilidade: (string|undefined)}} administrador
   */
  inserir(administrador) {
    const cabecalho = this.sheet.getDataRange().getValues()[0];
    const coluna = this.resolvedorDeColuna(cabecalho);
    const linha = cabecalho.map(() => '');
    linha[coluna('SUB_PROVIDER')] = administrador.subProvider;
    linha[coluna('NOME_COMPLETO')] = administrador.nomeCompleto;
    linha[coluna('AREA_RESPONSABILIDADE')] = administrador.areaResponsabilidade || '';
    this.sheet.appendRow(linha);
  }

  /**
   * @param {string} subProvider
   * @returns {{subProvider: string, nomeCompleto: string,
   *   areaResponsabilidade: string}|null}
   */
  buscarPorSub(subProvider) {
    const valores = this.sheet.getDataRange().getValues();
    const coluna = this.resolvedorDeColuna(valores[0]);
    const alvo = String(subProvider == null ? '' : subProvider).trim();
    const linha = valores.slice(1).find((l) => String(l[coluna('SUB_PROVIDER')]).trim() === alvo);
    if (!linha) {
      return null;
    }
    return {
      subProvider: String(linha[coluna('SUB_PROVIDER')]).trim(),
      nomeCompleto: String(linha[coluna('NOME_COMPLETO')] == null ? '' : linha[coluna('NOME_COMPLETO')]).trim(),
      areaResponsabilidade: String(
        linha[coluna('AREA_RESPONSABILIDADE')] == null ? '' : linha[coluna('AREA_RESPONSABILIDADE')]
      ).trim(),
    };
  }

  /**
   * @param {Array} cabecalho
   * @returns {function(string): number} resolve nome → índice, fail-fast.
   */
  resolvedorDeColuna(cabecalho) {
    return criarResolvedorDeColuna(cabecalho, 'BASE_ADMINISTRADORES');
  }
};

// ============================================================================
// REPOSITORY — SessaoRepository.js (ex-src/repository/SessaoRepository.js)
// ============================================================================

/**
 * REPOSITORY: SessaoRepository — persistência do agregado Sessão (SPEC-025).
 *
 * Projeção explícita (§3.5): token (chave), parceiraId, expiraEm. Acessa a
 * aba SEMPRE via ACL — nunca toca SpreadsheetApp nem índice físico.
 * Não pode conter regra de negócio nem formatar envelope.
 *
 * @param {SessaoACL} acl ACL única da aba SESSOES.
 */

this.SessaoRepository = class SessaoRepository {
  constructor(acl) {
    this.acl = acl;
  }

  /**
   * Persiste (insere ou renova) a Sessão.
   * @param {Sessao} sessao
   * @returns {Sessao} a mesma Sessão persistida.
   */
  salvar(sessao) {
    this.acl.upsert({
      token: sessao.token.valor,
      parceiraId: sessao.parceiraId,
      expiraEm: sessao.expiraEm,
    });
    return sessao;
  }

  /**
   * @param {string} valorDoToken
   * @returns {Sessao|null} Sessão reidratada com a validade persistida.
   */
  obterPorToken(valorDoToken) {
    const registro = this.acl.obterPorToken(valorDoToken);
    if (!registro) {
      return null;
    }
    return Sessao.reconstituir(registro.parceiraId, registro.token, registro.expiraEm);
  }

  /**
   * Remove a Sessão do token (logout/expiração).
   * @param {string} valorDoToken
   */
  remover(valorDoToken) {
    this.acl.remover(valorDoToken);
  }
};

// ============================================================================
// SERVICE — AcessoPortalService.js (ex-src/service/AcessoPortalService.js)
// ============================================================================

/**
 * SERVICE: AcessoPortalService — casos de uso do Acesso ao Portal
 * (SPEC-025 UC-025.01 / UC-025.02).
 *
 * Orquestra o Autenticador (porta de domínio), os repositórios de Sessão e
 * Bloqueio, a porta de token e o relógio. Erros de acesso carregam o código
 * do contrato (§17): AC-01 credencial inválida, AC-02 acesso bloqueado,
 * AC-03 sessão expirada. Mensagens nunca contêm credencial ou PII (RN-04).
 *
 * Não pode: falar HTTP/HTML; formatar envelope (Controller); conhecer
 * coluna física (ACL) nem o mecanismo concreto de credencial (adaptador).
 *
 * @param {Autenticador} autenticador serviço de domínio (porta).
 * @param {SessaoRepository} sessaoRepository
 * @param {BloqueioRepository} bloqueioRepository
 * @param {{gerar: function(): string}} geradorDeToken porta de token opaco.
 * @param {{hoje: function(): Date}} relogio porta de tempo.
 * @param {{publicar: function(object)}} publicador porta de eventos (§12).
 */

this.AcessoPortalService = class AcessoPortalService {
  constructor(
    autenticador,
    sessaoRepository,
    bloqueioRepository,
    geradorDeToken,
    relogio,
    publicador
  ) {
    this.autenticador = autenticador;
    this.sessaoRepository = sessaoRepository;
    this.bloqueioRepository = bloqueioRepository;
    this.geradorDeToken = geradorDeToken;
    this.relogio = relogio;
    this.publicador = publicador;
  }

  /**
   * UC-025.01: autentica a Parceira e cria a Sessão.
   * @param {{identificador: string, segredo: string}} dados credenciais.
   * @returns {Sessao} sessão ativa.
   * @throws AC-01 credencial inválida; AC-02 acesso bloqueado (INV-02/CB-03).
   */
  entrar(dados) {
    let credencial;
    try {
      credencial = new Credencial(dados && dados.identificador, dados && dados.segredo);
    } catch {
      throw erroComCodigo('AC-01', 'Credencial inválida.');
    }
    const agora = this.relogio.hoje();
    const identificador = credencial.identificador;

    const janela = this.bloqueioRepository.obterJanela(identificador);
    if (janela && janela.ativaEm(agora)) {
      throw erroComCodigo('AC-02', 'Acesso bloqueado. Tente novamente mais tarde.');
    }
    if (janela) {
      // Janela vencida: Bloqueada → NaoAutenticada (§9); zera as tentativas.
      this.bloqueioRepository.limpar(identificador);
    }

    const resultado = this.autenticador.autenticar(
      credencial,
      this.bloqueioRepository.contarFalhas(identificador),
      agora
    );

    if (!resultado.sucesso) {
      if (resultado.bloqueio) {
        this.bloqueioRepository.bloquear(identificador, resultado.bloqueio, resultado.falhas);
        this.publicador.publicar({
          nome: 'AcessoBloqueado',
          identificador: identificador,
          janela: {
            inicio: resultado.bloqueio.inicio.toISOString(),
            fim: resultado.bloqueio.fim.toISOString(),
          },
        });
        throw erroComCodigo('AC-02', 'Acesso bloqueado. Tente novamente mais tarde.');
      }
      this.bloqueioRepository.salvarFalhas(identificador, resultado.falhas);
      throw erroComCodigo('AC-01', 'Credencial inválida.');
    }

    this.bloqueioRepository.limpar(identificador);
    const sessao = this.autenticador.criarSessao(
      resultado.parceiraId,
      this.geradorDeToken.gerar(),
      agora
    );
    this.sessaoRepository.salvar(sessao);
    this.publicador.publicar({ nome: 'SessaoIniciada', parceiraId: sessao.parceiraId });
    return sessao;
  }

  /**
   * UC-025.02: renova a validade da Sessão a cada interação (deslizante).
   * @param {{token: string}} dados
   * @returns {Sessao} sessão renovada.
   * @throws AC-03 sessão inexistente ou expirada (CB-02).
   */
  renovar(dados) {
    const token = String((dados && dados.token) == null ? '' : dados.token).trim();
    if (!token) {
      throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
    }
    const agora = this.relogio.hoje();
    const sessao = this.sessaoRepository.obterPorToken(token);
    if (!sessao) {
      throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
    }
    if (sessao.expiradaEm(agora)) {
      this.sessaoRepository.remover(token);
      throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
    }
    sessao.renovar(agora);
    this.sessaoRepository.salvar(sessao);
    return sessao;
  }

  /**
   * Logout (§9: Autenticada → NaoAutenticada). Idempotente.
   * @param {{token: string}} dados
   */
  sair(dados) {
    const token = String((dados && dados.token) == null ? '' : dados.token).trim();
    if (token) {
      this.sessaoRepository.remover(token);
    }
  }
};

// ============================================================================
// CONTROLLER — AcessoController.js (ex-src/controller/AcessoController.js)
// ============================================================================

/**
 * CONTROLLER: AcessoController — adapta o contrato externo do Acesso ao
 * Portal (SPEC-025). Recebe a chamada do Entrypoint, invoca o Service e
 * devolve SEMPRE o envelope padrão {success,data}/{success,error}
 * (PROJECT_GOVERNANCE §3.3, via envelopeOk/envelopeFail).
 *
 * Erros do contrato (§17: AC-01/AC-02/AC-03) carregam o código; erros de
 * infraestrutura seguem o padrão dos pares (envelope só com mensagem) —
 * nunca rotulados com código de credencial. Mensagens sem credencial/PII
 * (RN-04). Expõe apenas projeção serializável da Sessão — nunca a
 * instância de domínio.
 *
 * Não pode: tocar SpreadsheetApp; conter regra de negócio; conhecer coluna
 * física.
 *
 * @param {AcessoPortalService} acessoPortalService
 */

this.AcessoController = class AcessoController {
  constructor(acessoPortalService) {
    this.acessoPortalService = acessoPortalService;
  }

  /**
   * @param {Sessao} sessao
   * @returns {{token: string, parceiraId: string, expiraEm: string}}
   */
  projetar(sessao) {
    return {
      token: sessao.token.valor,
      parceiraId: sessao.parceiraId,
      expiraEm: sessao.expiraEm.toISOString(),
    };
  }

  /**
   * UC-025.01: autentica a Parceira (entrada no Portal).
   * @param {{identificador: string, segredo: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  entrar(dados) {
    try {
      return envelopeOk(this.projetar(this.acessoPortalService.entrar(dados)));
    } catch (erro) {
      return falharComCodigo(erro);
    }
  }

  /**
   * UC-025.02: renova a sessão (expiração deslizante).
   * @param {{token: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  renovar(dados) {
    try {
      return envelopeOk(this.projetar(this.acessoPortalService.renovar(dados)));
    } catch (erro) {
      return falharComCodigo(erro);
    }
  }

  /**
   * Logout da Parceira (§9).
   * @param {{token: string}} dados
   * @returns {{success: true, data: object}|{success: false, error: object}}
   */
  sair(dados) {
    try {
      this.acessoPortalService.sair(dados);
      return envelopeOk({});
    } catch (erro) {
      return falharComCodigo(erro);
    }
  }
};

// ============================================================================
// ADAPTERS — AdaptadorOAuthGoogle.js (ex-src/adapters/AdaptadorOAuthGoogle.js)
// ============================================================================

/**
 * ADAPTADOR: AdaptadorOAuthGoogle — cumpre a porta de troca de código do
 * OAuth 2.0 Authorization Code Flow (ADR-013, condição 4). ÚNICO componente
 * autorizado a falar com o endpoint `token` do provedor e a tocar o Client
 * Secret (Script Property GOOGLE_CLIENT_SECRET, condição 2).
 *
 * Constrói também a URL de autorização para o redirect top-level do
 * frontend (escopos openid/email/profile — só identidade, nenhum acesso a
 * dados do usuário).
 *
 * Fail-closed: qualquer falha na troca (rede, HTTP != 200, JSON malformado,
 * resposta sem id_token) lança Error com o código do contrato
 * (ERR_AUTH_INVALID_TOKEN, SPEC-035 §14.3) — nunca devolve token parcial.
 * Segredo e código de autorização JAMAIS aparecem em log, erro ou URL.
 *
 * Não pode conter regra de negócio de identidade/estado (Service) nem
 * validar claims do id_token (isso permanece no ValidadorDeTokenGoogle,
 * inalterado — o id_token é validado duas vezes por decisão do ADR-013).
 */

this.AdaptadorOAuthGoogle = class AdaptadorOAuthGoogle {
  /**
   * @param {string} clientId client_id OAuth2 do TEAR (Config.js).
   * @param {string} clientSecret client_secret OAuth2 do TEAR (Config.js).
   * @param {string} redirectUri URL /exec do deployment (ScriptApp, entrypoint).
   */
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = String(clientId == null ? '' : clientId).trim();
    this.clientSecret = String(clientSecret == null ? '' : clientSecret).trim();
    this.redirectUri = String(redirectUri == null ? '' : redirectUri).trim();
  }

  /**
   * @param {string} state nonce anti-CSRF já registrado (GuardiaoDeEstadoOAuth).
   * @returns {string} URL do endpoint de autorização do provedor.
   */
  construirUrlDeAutorizacao(state) {
    return (
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      [
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=' + encodeURIComponent(this.redirectUri),
        'response_type=code',
        'scope=' + encodeURIComponent('openid email profile'),
        'state=' + encodeURIComponent(state),
        'prompt=select_account',
      ].join('&')
    );
  }

  /**
   * @param {string} code authorization code devolvido pelo provedor.
   * @returns {string} id_token bruto (validação de claims fica no
   *   ValidadorDeTokenGoogle, como sempre).
   * @throws {Error} ERR_AUTH_INVALID_TOKEN em qualquer falha.
   */
  trocarCodigoPorIdToken(code) {
    const codigo = String(code == null ? '' : code).trim();
    if (!codigo) {
      throw this.erroInvalido('código de autorização vazio');
    }
    const resposta = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'post',
      muteHttpExceptions: true,
      payload: {
        grant_type: 'authorization_code',
        code: codigo,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      },
    });
    if (resposta.getResponseCode() !== 200) {
      throw this.erroInvalido('troca de código recusada pelo provedor de identidade');
    }
    let corpo;
    try {
      corpo = JSON.parse(resposta.getContentText());
    } catch {
      throw this.erroInvalido('resposta malformada do provedor de identidade');
    }
    const idToken = String((corpo && corpo.id_token) == null ? '' : corpo.id_token).trim();
    if (!idToken) {
      throw this.erroInvalido('resposta sem id_token');
    }
    return idToken;
  }

  /**
   * @param {string} motivo mensagem interna (nunca inclui code/segredo).
   * @returns {Error} erro com o código do contrato (§14.3).
   */
  erroInvalido(motivo) {
    const erro = new Error('ERR_AUTH_INVALID_TOKEN: ' + motivo + '.');
    erro.codigo = 'ERR_AUTH_INVALID_TOKEN';
    return erro;
  }
};

// ============================================================================
// ADAPTERS — ValidadorDeTokenGoogle.js (ex-src/adapters/ValidadorDeTokenGoogle.js)
// ============================================================================

/**
 * ADAPTADOR: ValidadorDeTokenGoogle — cumpre a porta de verificação de
 * identidade federada (SPEC-035 §9.1.7/§14.1).
 *
 * Delega a validação de assinatura ao endpoint oficial `tokeninfo` do
 * provedor de identidade (o Apps Script não expõe verificação de
 * assinatura RSA nativamente) e confere, além disso, `aud` (client_id do
 * TEAR — evita confusão de token entre aplicações), `iss` (emissor
 * oficial) e a janela temporal (`exp`/`iat`).
 *
 * Fail-closed: qualquer falha (rede, assinatura, aud, iss, exp, iat, sub
 * ausente) lança Error com o código do contrato (§14.3
 * ERR_AUTH_INVALID_TOKEN) — nunca devolve identidade parcial.
 *
 * Não pode conter regra de negócio de identidade/estado (isso é do
 * Service) nem reaproveitar Autenticador/Credencial/JanelaDeBloqueio
 * (SPEC-025) — decisão justificada em SPEC-035 §9.2-A: bloqueio por
 * tentativas mitiga segredo adivinhável; não se aplica a token assinado
 * criptograficamente.
 */

this.ValidadorDeTokenGoogle = class ValidadorDeTokenGoogle {
  /** Emissores aceitos pelo provedor (ambas as formas são válidas). */
  static get EMISSORES_ACEITOS() {
    return ['accounts.google.com', 'https://accounts.google.com'];
  }

  /** @param {string} clientId client_id OAuth2 do TEAR (Config.js). */
  constructor(clientId) {
    this.clientId = String(clientId == null ? '' : clientId).trim();
  }

  /**
   * @param {string} idToken ID Token bruto vindo do frontend.
   * @param {Date} agora instante da validação (determinístico/testável).
   * @returns {{sub: string, email: string, name: string}}
   * @throws {Error} ERR_AUTH_INVALID_TOKEN em qualquer falha.
   */
  validar(idToken, agora) {
    const token = String(idToken == null ? '' : idToken).trim();
    if (!token) {
      throw this.erroInvalido('token vazio');
    }
    const resposta = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true }
    );
    if (resposta.getResponseCode() !== 200) {
      throw this.erroInvalido('token rejeitado pelo provedor de identidade');
    }
    let claims;
    try {
      claims = JSON.parse(resposta.getContentText());
    } catch {
      throw this.erroInvalido('resposta malformada do provedor de identidade');
    }
    if (!claims || claims.aud !== this.clientId) {
      throw this.erroInvalido('audience não corresponde ao client_id do TEAR');
    }
    if (ValidadorDeTokenGoogle.EMISSORES_ACEITOS.indexOf(claims.iss) === -1) {
      throw this.erroInvalido('emissor não reconhecido');
    }
    const agoraSegundos = agora.getTime() / 1000;
    const exp = Number(claims.exp);
    const iat = Number(claims.iat);
    if (!exp || exp <= agoraSegundos) {
      throw this.erroInvalido('token expirado');
    }
    if (!iat || iat > agoraSegundos) {
      throw this.erroInvalido('token emitido no futuro');
    }
    const sub = String(claims.sub == null ? '' : claims.sub).trim();
    if (!sub) {
      throw this.erroInvalido('claim sub ausente');
    }
    return {
      sub: sub,
      email: String(claims.email == null ? '' : claims.email).trim(),
      name: String(claims.name == null ? '' : claims.name).trim(),
    };
  }

  /**
   * @param {string} motivo mensagem interna (nunca inclui o token — PII/segredo).
   * @returns {Error} erro com o código do contrato (§14.3).
   */
  erroInvalido(motivo) {
    const erro = new Error('ERR_AUTH_INVALID_TOKEN: ' + motivo + '.');
    erro.codigo = 'ERR_AUTH_INVALID_TOKEN';
    return erro;
  }
};

// ============================================================================
// ADAPTERS — GuardiaoDeEstadoOAuth.js (ex-src/adapters/GuardiaoDeEstadoOAuth.js)
// ============================================================================

/**
 * ADAPTADOR: GuardiaoDeEstadoOAuth — guarda anti-CSRF do parâmetro `state`
 * (ADR-013, condição 3). Registra o state emitido no início do login e o
 * valida COM CONSUMO no callback: cada state autoriza exatamente uma troca
 * de código. O cache é injetado (CacheService.getScriptCache() na
 * composição do entrypoint) — este arquivo não toca serviço Google
 * diretamente, permanecendo testável com um fake em memória.
 *
 * Expiração: 600s (janela do login). CacheService é best-effort: evicção
 * antecipada derruba o login com ERR_AUTH_STATE_INVALIDO — o usuário
 * recomeça (degradação segura, nunca bypass).
 */

this.GuardiaoDeEstadoOAuth = class GuardiaoDeEstadoOAuth {
  /** Janela máxima entre iniciar o login e concluir o callback. */
  static get TTL_SEGUNDOS() {
    return 600;
  }

  /** @param {{put: Function, get: Function, remove: Function}} cache */
  constructor(cache) {
    this.cache = cache;
  }

  /** @param {string} state nonce opaco (UUID) emitido para este login. */
  registrar(state) {
    this.cache.put(this.chave(state), '1', GuardiaoDeEstadoOAuth.TTL_SEGUNDOS);
  }

  /**
   * @param {string} state valor devolvido pelo provedor no callback.
   * @returns {boolean} true se o state foi emitido por nós e ainda não usado.
   */
  validarEConsumir(state) {
    const valor = String(state == null ? '' : state).trim();
    if (!valor) {
      return false;
    }
    const chave = this.chave(valor);
    const achado = this.cache.get(chave);
    if (achado) {
      this.cache.remove(chave);
    }
    return Boolean(achado);
  }

  /**
   * @param {string} state
   * @returns {string} chave namespaced no cache do script.
   */
  chave(state) {
    return 'oauth-state:' + state;
  }
};

// ============================================================================
// ADAPTERS — VerificadorDeCredencialLegado.js (ex-src/adapters/VerificadorDeCredencialLegado.js)
// ============================================================================

/**
 * ADAPTADOR: VerificadorDeCredencialLegado — mecanismo legado de credencial
 * atrás da porta do Autenticador (SPEC-025 §6.3; RN-16).
 *
 * PROVISÓRIO (🟠 P5/Q-07 — modelo de autenticação aguarda PO): implementa a
 * herança legada — identificador = cupom; segredo = 5 primeiros dígitos do
 * CNPJ. Este arquivo é o ÚNICO lugar que conhece essa regra: trocar o
 * modelo de autenticação significa trocar este adaptador na composição,
 * sem tocar Domínio/Service/Controller.
 *
 * Fail-closed: Parceira inexistente, CNPJ ausente/curto ou segredo
 * divergente → null (credencial inválida). Nada é registrado em log
 * (RN-04/INV-03 — credencial e PII nunca em claro).
 *
 * @param {ParceiraACL} parceiraACL porta do Cadastro (obterAcessoLegado).
 */

this.VerificadorDeCredencialLegado = class VerificadorDeCredencialLegado {
  constructor(parceiraACL) {
    this.parceiraACL = parceiraACL;
  }

  /**
   * Porta do Autenticador: resolve credencial → parceiraId.
   * @param {Credencial} credencial
   * @returns {string|null} parceiraId autenticada, ou null se inválida.
   */
  verificar(credencial) {
    const acesso = this.parceiraACL.obterAcessoLegado(credencial.identificador);
    if (!acesso) {
      return null;
    }
    const digitos = String(acesso.cnpj).replace(/\D/g, '');
    if (digitos.length < 5) {
      return null;
    }
    return digitos.slice(0, 5) === credencial.segredo ? acesso.parceiraId : null;
  }
};

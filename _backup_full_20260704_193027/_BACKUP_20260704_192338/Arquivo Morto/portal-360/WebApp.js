/**
 * Backend do Portal de Influenciadoras Jescri
 * Publicado como Web App direto na planilha mãe [JESCRI] INFLUÊNCIA 360º.
 * Reaproveita SETUP.ABAS e getHeaderMap() já definidos em Código.js —
 * não existe mapeamento de colunas próprio (fim do MAP duplicado do antigo Portal).
 */

const SCRIPT_PROP_PASTA_RAIZ = "PASTA_RAIZ_ENTREGAS";
const PASTA_MAE_ID = "1X7BSY9R7dUUNYXgYnmnCIACVMFcqBUPH";
const MAX_TENTATIVAS_LOGIN = 5;
const JANELA_BLOQUEIO_LOGIN_SEGUNDOS = 300; // janela pra contar tentativas antes de atingir o máximo
const COOLDOWN_LOGIN_BASE_SEGUNDOS = 60;         // 1o bloqueio completo: 1 min
const COOLDOWN_LOGIN_MAX_SEGUNDOS = 3600;        // teto: 1h
const TTL_ESCALACAO_LOGIN_SEGUNDOS = 21600;      // "memória" de reincidência: 6h
const CACHE_TTL_BASE_SEGUNDOS = 90;
const CHAVE_CACHE_BASE = "CACHE_BASE_DADOS";

// Valores aceitos pela validação de dados configurada na coluna
// STATUS_CONTEUDO (F) da aba ATIVAÇÕES. Qualquer escrita nessa coluna
// PRECISA passar por normalizarStatus() antes do .setValue() — ver função
// abaixo — pra nunca disparar "dados inseridos violam regra de validação".
const STATUS_CONTEUDO_VALIDOS = ['em aberto', 'falta drive', 'aprovado', 'ajustes', 'postado'];

// Normaliza qualquer valor (literal usado no código, entrada externa, etc.)
// para um dos STATUS_CONTEUDO_VALIDOS. Usar SEMPRE antes de escrever na
// coluna STATUS_CONTEUDO — em qualquer fluxo (Portal ou ERP).
function normalizarStatus(status) {
  const s = (status || '').toString().trim().toLowerCase();
  if (STATUS_CONTEUDO_VALIDOS.indexOf(s) !== -1) return s;

  if (s.includes('falta') && s.includes('drive')) return 'falta drive';
  if (s.includes('postado') || s.includes('publicado')) return 'postado';
  if (s.includes('aprovado')) return 'aprovado';
  if (s.includes('revis') || s.includes('ajuste')) return 'ajustes';
  if (s.includes('aberto')) return 'em aberto';

  // Sem correspondência conhecida: cai no estado inicial, que sempre passa
  // na validação, em vez de arriscar rejeitar a escrita.
  return 'em aberto';
}

// Cache de leitura da aba BASE DE DADOS (a mais lida do Portal: login,
// getPerfil, updatePerfil, getInfluKeyByCupom e obterOuCriarPastaDestino
// leem ela em quase toda chamada). TTL curto (90s) para não atrasar demais
// mudanças feitas pelo time no ERP. Se a planilha for grande demais para o
// limite de 100KB por chave do CacheService, cai de volta pra leitura direta.
//
// Hardening de concorrência: o LockService só é adquirido no cache MISS
// (quando é preciso ler a planilha de verdade — o caso em que ler no meio
// de um organizarEPintarBase()/sort do ERP seria arriscado). Um cache HIT
// não trava lock nenhum, já que CacheService.get() já é seguro pra leitura
// concorrente por si só. Isso reduz bastante a contenção entre leituras,
// mantendo a proteção só onde o risco real está.
function getDadosBaseCache(abaBase) {
  const cache = CacheService.getScriptCache();
  const cacheado = cache.get(CHAVE_CACHE_BASE);
  if (cacheado) {
    try {
      return JSON.parse(cacheado);
    } catch (e) {
      // cache corrompido/formato inesperado: cai pro caminho com lock
    }
  }
  return lerEPopularCacheBaseComLock(abaBase, cache);
}

function lerEPopularCacheBaseComLock(abaBase, cache) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    // Re-checa: outra execução pode ter povoado o cache enquanto esperávamos o lock.
    const cacheado = cache.get(CHAVE_CACHE_BASE);
    if (cacheado) {
      try {
        return JSON.parse(cacheado);
      } catch (e) {
        // segue pra releitura da planilha
      }
    }
    return lerEPopularCacheBaseSemLock(abaBase, cache);
  } finally {
    lock.releaseLock();
  }
}

// Só chamar isto de dentro de uma seção que JÁ segura o LockService.getScriptLock()
// (hoje só updatePerfil, que já trava pra escrever) — evita tentar adquirir o
// lock global duas vezes na mesma execução.
function getDadosBaseCacheSemLock(abaBase) {
  const cache = CacheService.getScriptCache();
  const cacheado = cache.get(CHAVE_CACHE_BASE);
  if (cacheado) {
    try {
      return JSON.parse(cacheado);
    } catch (e) {
      // cache corrompido/formato inesperado: recarrega da planilha
    }
  }
  return lerEPopularCacheBaseSemLock(abaBase, cache);
}

function lerEPopularCacheBaseSemLock(abaBase, cache) {
  const dados = abaBase.getDataRange().getValues();
  try {
    cache.put(CHAVE_CACHE_BASE, JSON.stringify(dados), CACHE_TTL_BASE_SEGUNDOS);
  } catch (e) {
    // payload > 100KB ou outro erro do CacheService: segue sem cache
  }
  return dados;
}

function invalidarCacheBase() {
  CacheService.getScriptCache().remove(CHAVE_CACHE_BASE);
}

// Mesmo padrão de cache da BASE (lock só no MISS, nunca no HIT), reaproveitado
// para as demais abas de leitura pesada do Portal: ATIVAÇÕES, BRIEFING,
// PAGAMENTOS e HISTÓRICO_*. Antes, getPendencias/getBriefing/getPagamentos/
// getHistorico seguravam LockService.getScriptLock() em TODA chamada só para
// ler — isso é o que criava a contenção global identificada como gargalo.
// Com cache, a leitura comum (HIT) não toca lock nenhum; só o MISS (uma vez
// a cada TTL, compartilhado entre todas as requisições concorrentes) trava.
const CACHE_TTL_LEITURA_SEGUNDOS = 60;
const CHAVE_CACHE_ATIVACOES = "CACHE_ATIVACOES";
const CHAVE_CACHE_BRIEFING = "CACHE_BRIEFING";
const CHAVE_CACHE_PAGAMENTOS = "CACHE_PAGAMENTOS";
const CHAVE_CACHE_HIST_CONT = "CACHE_HISTORICO_CONT";
const CHAVE_CACHE_HIST_PAG = "CACHE_HISTORICO_PAG";

function getDadosAbaCache(aba, chaveCache) {
  const cache = CacheService.getScriptCache();
  const cacheado = cache.get(chaveCache);
  if (cacheado) {
    try { return JSON.parse(cacheado); } catch (e) {}
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const recheck = cache.get(chaveCache);
    if (recheck) {
      try { return JSON.parse(recheck); } catch (e) {}
    }
    const dados = aba.getDataRange().getValues();
    try { cache.put(chaveCache, JSON.stringify(dados), CACHE_TTL_LEITURA_SEGUNDOS); } catch (e) {}
    return dados;
  } finally {
    lock.releaseLock();
  }
}

function invalidarCacheAba(chaveCache) {
  CacheService.getScriptCache().remove(chaveCache);
}

// Roteia a invalidação certa a partir do nome da aba — usado pelos pontos de
// escrita genéricos do ERP (arquivarGenerico, etc.) que operam por nome.
function invalidarCachePorAba(nomeAba) {
  if (nomeAba === SETUP.ABAS.ATIVACOES) invalidarCacheAba(CHAVE_CACHE_ATIVACOES);
  else if (nomeAba === SETUP.ABAS.BRIEFING) invalidarCacheAba(CHAVE_CACHE_BRIEFING);
  else if (nomeAba === SETUP.ABAS.PAGAMENTOS) invalidarCacheAba(CHAVE_CACHE_PAGAMENTOS);
  else if (nomeAba === SETUP.ABAS.HISTORICO_CONT) invalidarCacheAba(CHAVE_CACHE_HIST_CONT);
  else if (nomeAba === SETUP.ABAS.HISTORICO_PAG) invalidarCacheAba(CHAVE_CACHE_HIST_PAG);
}

// ======================================================
// FUNÇÕES PRINCIPAIS DO WEB APP
// ======================================================

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Portal Influenciadoras Jescri')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ======================================================
// AUTENTICAÇÃO E SESSÃO
// ======================================================

function login(cupom, senha) {
  try {
    if (!cupom || !senha) return { ok: false, erro: "CREDENCIAIS_INVALIDAS" };

    const cupomLimpo = cupom.toString().trim().toUpperCase();
    const senhaLimpa = senha.toString().trim();

    const cache = CacheService.getScriptCache();
    const chaveTentativas = "LOGIN_TENTATIVAS_" + cupomLimpo;
    const chaveEscalacao = "LOGIN_ESCALACAO_" + cupomLimpo;
    const tentativas = parseInt(cache.get(chaveTentativas) || "0", 10);
    if (tentativas >= MAX_TENTATIVAS_LOGIN) {
      return { ok: false, erro: "MUITAS_TENTATIVAS" };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaBase = ss.getSheetByName(SETUP.ABAS.BASE);
    if (!abaBase) return { ok: false, erro: "ERRO_INTERNO" };

    // Sem lock aqui: getDadosBaseCache() só trava internamente se precisar
    // reler a planilha (cache miss). Ler a estrutura de cabeçalho é seguro
    // sem lock (nunca muda em runtime).
    const h = getHeaderMap(abaBase);
    const dados = getDadosBaseCache(abaBase);

    for (let i = 1; i < dados.length; i++) {
      let cupomPlanilha = (dados[i][h['CUPOM'] - 1] || "").toString().trim().toUpperCase();
      let cnpjPlanilha = (dados[i][h['INFLUENCIADORA_CNPJ'] - 1] || "").toString().replace(/\D/g, "");

      if (cupomPlanilha === cupomLimpo) {
        let senhaCorreta = cnpjPlanilha.substring(0, 5);
        if (senhaLimpa === senhaCorreta) {
          // Segunda checagem, além da senha: só influenciadora com status ON
          // consegue autenticar (mesmo critério usado em Código.js pra filtrar
          // quem está ativo). Bloqueia login de cadastro OFF/inativo/incompleto
          // sem exigir nenhum campo novo na UI.
          const statusOn = isInfluenciadoraOn(dados[i][0]);
          if (!statusOn) {
            return { ok: false, erro: "CREDENCIAIS_INVALIDAS" };
          }

          cache.remove(chaveTentativas); // login OK: zera contador e histórico de reincidência
          cache.remove(chaveEscalacao);

          const token = Utilities.getUuid();
          cache.put(token, cupomLimpo, 21600); // 6 horas

          return {
            ok: true,
            token: token,
            nome: dados[i][h['INFLU_KEY'] - 1]
          };
        }
      }
    }

    // Bloqueio progressivo: cada CICLO completo de MAX_TENTATIVAS_LOGIN erradas
    // dobra o cooldown (1min, 2min, 4min... até o teto), e o histórico de
    // quantos ciclos já ocorreram fica "lembrado" por TTL_ESCALACAO_SEGUNDOS.
    // Isso torna automação repetida cada vez mais cara, sem penalizar um
    // usuário que só errou a senha uma ou duas vezes.
    const novasTentativas = tentativas + 1;
    if (novasTentativas >= MAX_TENTATIVAS_LOGIN) {
      const escalacao = parseInt(cache.get(chaveEscalacao) || "0", 10);
      const cooldown = Math.min(COOLDOWN_LOGIN_BASE_SEGUNDOS * Math.pow(2, escalacao), COOLDOWN_LOGIN_MAX_SEGUNDOS);
      cache.put(chaveTentativas, String(novasTentativas), cooldown);
      cache.put(chaveEscalacao, String(escalacao + 1), TTL_ESCALACAO_LOGIN_SEGUNDOS);
    } else {
      cache.put(chaveTentativas, String(novasTentativas), JANELA_BLOQUEIO_LOGIN_SEGUNDOS);
    }
    return { ok: false, erro: "CREDENCIAIS_INVALIDAS" };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function validarToken(token) {
  if (!token) return null;
  const cache = CacheService.getScriptCache();
  const cupom = cache.get(token);

  if (cupom) {
    cache.put(token, cupom, 21600); // renovação deslizante
    return cupom;
  }
  return null;
}

// ======================================================
// FUNÇÕES DE DADOS (CONTRATOS)
// ======================================================

function getPendencias(token, mesAno) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaAtivacoes = ss.getSheetByName(SETUP.ABAS.ATIVACOES);

    // Fora do lock abaixo de propósito: getInfluKeyByCupom() já gerencia seu
    // próprio lock (via cache da BASE), evitando lock aninhado na mesma
    // execução. O lock a seguir protege só a leitura de ATIVAÇÕES.
    const influKey = getInfluKeyByCupom(ss, cupom);
    if (!influKey) return { ok: false, erro: "USUARIO_NAO_ENCONTRADO" };
    if (!abaAtivacoes) return { ok: true, itens: [] };

    // Leitura pura: sem lock. getDadosAbaCache só trava internamente no
    // cache MISS (ver comentário na declaração da função).
    const h = getHeaderMap(abaAtivacoes);
    const dados = getDadosAbaCache(abaAtivacoes, CHAVE_CACHE_ATIVACOES);

    const itens = [];

    for (let i = 1; i < dados.length; i++) {
      let rowInfluKey = (dados[i][h['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
      let rowMes = (dados[i][h['MES_REFERENCIA'] - 1] || "").toString().trim().toUpperCase();

      if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
        let statusBruto = (dados[i][h['STATUS_CONTEUDO'] - 1] || "").toString().toLowerCase();
        let statusNormalizado = normalizarStatusAtivacao(statusBruto);

        itens.push({
          idAtivacao: i + 1, // número da linha na aba ATIVAÇÕES
          formato: dados[i][h['FORMATO'] - 1],
          campanha: rowMes,
          dataEntrega: formatarDataPortal(dados[i][h['DATA_APROVACAO'] - 1]),
          dataAprovacao: formatarDataPortal(dados[i][h['DATA_ATIVACAO'] - 1]),
          status: statusNormalizado,
          temBriefing: true
        });
      }
    }

    return { ok: true, itens: itens };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function getBriefing(token, idAtivacao) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaAtivacoes = ss.getSheetByName(SETUP.ABAS.ATIVACOES);
    const abaBriefing = ss.getSheetByName(SETUP.ABAS.BRIEFING);

    // Leitura pura: sem lock. O acesso à linha de ATIVAÇÕES é direto (getRange
    // de uma única linha já é atômico); a leitura completa de BRIEFING usa
    // cache (mesmo padrão de getDadosAbaCache — trava só no MISS).
    const influKey = getInfluKeyByCupom(ss, cupom);

    const hAtiv = getHeaderMap(abaAtivacoes);
    const linhaAtivacao = parseInt(idAtivacao);

    if (linhaAtivacao < 2 || linhaAtivacao > abaAtivacoes.getLastRow()) {
      return { ok: false, erro: "ATIVACAO_NAO_ENCONTRADA" };
    }

    const dadosAtivacao = abaAtivacoes.getRange(linhaAtivacao, 1, 1, abaAtivacoes.getLastColumn()).getValues()[0];
    const rowInfluKey = (dadosAtivacao[hAtiv['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();

    if (rowInfluKey !== influKey) {
      return { ok: false, erro: "ACESSO_NEGADO" };
    }

    const mes = (dadosAtivacao[hAtiv['MES_REFERENCIA'] - 1] || "").toString().trim().toUpperCase();
    const formato = (dadosAtivacao[hAtiv['FORMATO'] - 1] || "").toString().trim().toUpperCase();

    if (!abaBriefing) return { ok: false, erro: "ABA_BRIEFING_NAO_ENCONTRADA" };

    const hBrief = getHeaderMap(abaBriefing);
    const dadosBriefing = getDadosAbaCache(abaBriefing, CHAVE_CACHE_BRIEFING);

    let textoBriefing = "Briefing não encontrado para este formato/mês.";

    for (let i = 1; i < dadosBriefing.length; i++) {
      let bInfluKey = (dadosBriefing[i][hBrief['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
      let bMes = (dadosBriefing[i][hBrief['MES'] - 1] || "").toString().trim().toUpperCase();

      if (bInfluKey === influKey && bMes === mes) {
        let colBriefing = null;
        if (formato.includes("REEL")) colBriefing = hBrief['SOBRE_REEL'];
        else if (formato.includes("CARROSSEL")) colBriefing = hBrief['SOBRE_CARROSSEL'];
        else if (formato.includes("STORIES_1") || formato === "STORIES") colBriefing = hBrief['SOBRE_STORIES_1'];
        else if (formato.includes("STORIES_2")) colBriefing = hBrief['SOBRE_STORIES_2'];

        if (colBriefing) textoBriefing = dadosBriefing[i][colBriefing - 1];
        break;
      }
    }

    return {
      ok: true,
      campanha: mes,
      formato: formato,
      dataEntrega: formatarDataPortal(dadosAtivacao[hAtiv['DATA_APROVACAO'] - 1]),
      dataAprovacao: formatarDataPortal(dadosAtivacao[hAtiv['DATA_ATIVACAO'] - 1]),
      textoBriefing: textoBriefing
    };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function getPagamentos(token, mesAno) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPagamentos = ss.getSheetByName(SETUP.ABAS.PAGAMENTOS);

    // Leitura pura: sem lock (ver comentário equivalente em getPendencias).
    const influKey = getInfluKeyByCupom(ss, cupom);
    if (!abaPagamentos) return { ok: true, totalPrevisto: 0, totalPago: 0, itens: [] };

    const h = getHeaderMap(abaPagamentos);
    const dados = getDadosAbaCache(abaPagamentos, CHAVE_CACHE_PAGAMENTOS);

    const itens = [];
    let totalPrevisto = 0;
    let totalPago = 0;

    for (let i = 1; i < dados.length; i++) {
      let rowInfluKey = (dados[i][h['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
      let rowMes = (dados[i][h['MES_REFERENCIA'] - 1] || "").toString().trim().toUpperCase();

      if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
        let statusBruto = (dados[i][h['STATUS_PAGAMENTO'] - 1] || "").toString().toLowerCase();
        let etapa = normalizarStatusPagamento(statusBruto);
        let valor = extrairValorNumerico(dados[i][h['VALOR_TOTAL'] - 1]);

        if (etapa === "PAGO") {
          totalPago += valor;
        } else {
          totalPrevisto += valor;
        }

        itens.push({
          idPagamento: i + 1,
          referencia: rowMes,
          valor: dados[i][h['VALOR_TOTAL'] - 1],
          etapa: etapa,
          dataPrevista: "",
          dataPagamento: formatarDataPortal(dados[i][h['DATA_PAGAMENTO'] - 1])
        });
      }
    }

    return {
      ok: true,
      totalPrevisto: totalPrevisto,
      totalPago: totalPago,
      itens: itens
    };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function getHistorico(token, mesAno) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaHistCont = ss.getSheetByName(SETUP.ABAS.HISTORICO_CONT);
    const abaHistPag = ss.getSheetByName(SETUP.ABAS.HISTORICO_PAG);

    // Leitura pura: sem lock (ver comentário equivalente em getPendencias).
    const influKey = getInfluKeyByCupom(ss, cupom);

    let hCont, dadosCont, hPag, dadosPag;
    if (abaHistCont) {
      hCont = getHeaderMap(abaHistCont);
      dadosCont = getDadosAbaCache(abaHistCont, CHAVE_CACHE_HIST_CONT);
    }
    if (abaHistPag) {
      hPag = getHeaderMap(abaHistPag);
      dadosPag = getDadosAbaCache(abaHistPag, CHAVE_CACHE_HIST_PAG);
    }

    const ativacoes = [];
    const pagamentos = [];

    if (dadosCont) {
      const h = hCont;
      for (let i = 1; i < dadosCont.length; i++) {
        let rowInfluKey = (dadosCont[i][h['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
        let rowMes = (dadosCont[i][h['MES_REFERENCIA'] - 1] || "").toString().trim().toUpperCase();

        if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
          ativacoes.push({
            idAtivacao: "H" + (i + 1),
            formato: dadosCont[i][h['FORMATO'] - 1],
            campanha: rowMes,
            dataEntrega: formatarDataPortal(dadosCont[i][h['DATA_APROVACAO'] - 1]),
            dataAprovacao: formatarDataPortal(dadosCont[i][h['DATA_ATIVACAO'] - 1]),
            status: "PUBLICADO",
            temBriefing: false
          });
        }
      }
    }

    if (dadosPag) {
      const h = hPag;
      for (let i = 1; i < dadosPag.length; i++) {
        let rowInfluKey = (dadosPag[i][h['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
        let rowMes = (dadosPag[i][h['MES_REFERENCIA'] - 1] || "").toString().trim().toUpperCase();

        if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
          pagamentos.push({
            idPagamento: "H" + (i + 1),
            referencia: rowMes,
            valor: dadosPag[i][h['VALOR_TOTAL'] - 1],
            etapa: "PAGO",
            dataPrevista: "",
            dataPagamento: formatarDataPortal(dadosPag[i][h['DATA_PAGAMENTO'] - 1])
          });
        }
      }
    }

    return { ok: true, ativacoes: ativacoes, pagamentos: pagamentos };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

// Cache dedicado do banner "Resumo do Mês", por mês (RESUMO_MES é o mesmo
// texto/link em todas as linhas de um mesmo mês na BRIEFING — não é um dado
// por influenciadora). Chave própria porque o valor a cachear (texto + link
// já extraídos) não é o mesmo formato tabular de getDadosAbaCache/
// CHAVE_CACHE_BRIEFING; usa o mesmo TTL de leitura do resto do sistema.
function chaveCacheResumoMes(mesAno) {
  return "CACHE_RESUMO_MES_" + (mesAno || "").toString().trim().toUpperCase();
}

function invalidarCacheResumoMes(mesAno) {
  CacheService.getScriptCache().remove(chaveCacheResumoMes(mesAno));
}

// Banner de topo do Portal: título + link de RESUMO_MES (coluna D da aba
// BRIEFING), lido via getRichTextValue() pra cobrir tanto texto simples
// quanto uma célula com link (HYPERLINK ou link inserido manualmente) —
// funciona nos dois formatos sem precisar de convenção extra na planilha.
function getResumoMes(token, mesAno) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const mesAlvo = (mesAno || "").toString().trim().toUpperCase();
    const chaveCache = chaveCacheResumoMes(mesAlvo);
    const cache = CacheService.getScriptCache();
    const cacheado = cache.get(chaveCache);
    if (cacheado) {
      try { return JSON.parse(cacheado); } catch (e) {}
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaBriefing = ss.getSheetByName(SETUP.ABAS.BRIEFING);
    if (!abaBriefing) return { ok: true, titulo: "", link: "" };

    const influKey = getInfluKeyByCupom(ss, cupom);
    const hBrief = getHeaderMap(abaBriefing);
    if (!hBrief['RESUMO_MES'] || !hBrief['MES']) return { ok: true, titulo: "", link: "" };

    const dados = getDadosAbaCache(abaBriefing, CHAVE_CACHE_BRIEFING);

    for (let i = 1; i < dados.length; i++) {
      let bInfluKey = (dados[i][hBrief['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
      let bMes = (dados[i][hBrief['MES'] - 1] || "").toString().trim().toUpperCase();

      if (bInfluKey === influKey && (!mesAlvo || bMes === mesAlvo)) {
        const rich = abaBriefing.getRange(i + 1, hBrief['RESUMO_MES']).getRichTextValue();
        const resultado = { ok: true, titulo: (rich ? rich.getText() : "") || "", link: (rich ? rich.getLinkUrl() : "") || "" };
        try { cache.put(chaveCache, JSON.stringify(resultado), CACHE_TTL_LEITURA_SEGUNDOS); } catch (e) {}
        return resultado;
      }
    }

    const vazio = { ok: true, titulo: "", link: "" };
    try { cache.put(chaveCache, JSON.stringify(vazio), CACHE_TTL_LEITURA_SEGUNDOS); } catch (e) {}
    return vazio;
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function getPerfil(token) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaBase = ss.getSheetByName(SETUP.ABAS.BASE);

    // Sem lock aqui pelo mesmo motivo de login(): getDadosBaseCache() só
    // trava se precisar reler a planilha de verdade (cache miss).
    const h = getHeaderMap(abaBase);
    const dados = getDadosBaseCache(abaBase);

    for (let i = 1; i < dados.length; i++) {
      let cupomPlanilha = (dados[i][h['CUPOM'] - 1] || "").toString().trim().toUpperCase();

      if (cupomPlanilha === cupom) {
        return {
          ok: true,
          dados: {
            nome: dados[i][h['INFLU_KEY'] - 1],
            cnpj: dados[i][h['INFLUENCIADORA_CNPJ'] - 1],
            chavePix: dados[i][h['CHAVE_PIX'] - 1],
            email: dados[i][h['EMAIL'] - 1],
            telefone: "",
            cep: dados[i][h['CEP'] - 1],
            rua: dados[i][h['RUA'] - 1],
            numero: dados[i][h['NUMERO'] - 1],
            complemento: dados[i][h['COMPLEMENTO'] - 1],
            cidade: dados[i][h['CIDADE'] - 1],
            estado: dados[i][h['UF'] - 1]
          },
          somenteLeitura: {
            cupom: cupom,
            valorTotal: dados[i][h['VALOR_TOTAL'] - 1]
          }
        };
      }
    }

    return { ok: false, erro: "PERFIL_NAO_ENCONTRADO" };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function updatePerfil(token, dadosAtualizados) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaBase = ss.getSheetByName(SETUP.ABAS.BASE);
    const h = getHeaderMap(abaBase);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Versão sem lock próprio: esta seção já segura o LockService global
      // pra escrever, então usar getDadosBaseCache() aqui dentro tentaria
      // adquirir o mesmo lock de novo numa eventual releitura por cache miss.
      const dados = getDadosBaseCacheSemLock(abaBase);

      for (let i = 1; i < dados.length; i++) {
        let cupomPlanilha = (dados[i][h['CUPOM'] - 1] || "").toString().trim().toUpperCase();

        if (cupomPlanilha === cupom) {
          const linha = i + 1;
          let mudouEndereco = false;

          if (dadosAtualizados.chavePix !== undefined) abaBase.getRange(linha, h['CHAVE_PIX']).setValue(dadosAtualizados.chavePix);
          if (dadosAtualizados.email !== undefined) abaBase.getRange(linha, h['EMAIL']).setValue(dadosAtualizados.email);
          if (dadosAtualizados.cep !== undefined) { abaBase.getRange(linha, h['CEP']).setValue(dadosAtualizados.cep); mudouEndereco = true; }
          if (dadosAtualizados.numero !== undefined) { abaBase.getRange(linha, h['NUMERO']).setValue(dadosAtualizados.numero); mudouEndereco = true; }
          if (dadosAtualizados.complemento !== undefined) { abaBase.getRange(linha, h['COMPLEMENTO']).setValue(dadosAtualizados.complemento); mudouEndereco = true; }

          // Edições feitas pelo script não disparam onEdit(): recalcula o endereço composto na hora.
          if (mudouEndereco && h['CEP']) {
            SpreadsheetApp.flush();
            preencherEnderecoPorCEP(abaBase, linha, abaBase.getRange(linha, h['CEP']).getValue(), h);
          }

          // Evita servir dado desatualizado (até 90s) pra próxima leitura após esta escrita.
          invalidarCacheBase();
          return { ok: true };
        }
      }

      return { ok: false, erro: "PERFIL_NAO_ENCONTRADO" };
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

// ======================================================
// FUNÇÕES AUXILIARES DO PORTAL
// ======================================================

function getInfluKeyByCupom(ss, cupom) {
  const abaBase = ss.getSheetByName(SETUP.ABAS.BASE);
  const h = getHeaderMap(abaBase);
  const dados = getDadosBaseCache(abaBase);

  for (let i = 1; i < dados.length; i++) {
    if ((dados[i][h['CUPOM'] - 1] || "").toString().trim().toUpperCase() === cupom) {
      return (dados[i][h['INFLU_KEY'] - 1] || "").toString().trim().toUpperCase();
    }
  }
  return null;
}

function normalizarStatusAtivacao(statusBruto) {
  if (statusBruto.includes("falta") || statusBruto.includes("aberto")) return "AGUARDANDO_MATERIAL";
  // "aprovado" precisa ser checado antes do "aprova" genérico: senão o
  // status já aprovado nunca chega a essa linha (toda string "aprovado"
  // também contém "aprova") e o Portal nunca mostra o selo de aprovado.
  if (statusBruto.includes("aprovado")) return "APROVADO";
  if (statusBruto.includes("aprova") || statusBruto.includes("revis") || statusBruto.includes("ajuste")) return "EM_APROVACAO";
  if (statusBruto.includes("postado") || statusBruto.includes("publicado")) return "PUBLICADO";
  return "AGUARDANDO_MATERIAL";
}

function normalizarStatusPagamento(statusBruto) {
  if (statusBruto.includes("pago")) return "PAGO";
  if (statusBruto.includes("nota")) return "NOTA_FISCAL";
  return "MATERIAL_ENVIADO";
}

function formatarDataPortal(data) {
  if (!data) return "";
  if (data instanceof Date) {
    return Utilities.formatDate(data, "GMT-3", "dd/MM/yyyy");
  }
  return data.toString();
}

function extrairValorNumerico(valorStr) {
  if (typeof valorStr === 'number') return valorStr;
  if (!valorStr) return 0;
  let limpo = valorStr.toString().replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  let num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

// ======================================================
// UPLOAD DE ARQUIVOS (RESUMABLE) E PASTAS DO DRIVE
// ======================================================

function getOuCriarSubpasta(pastaPai, nome) {
  var it = pastaPai.getFoldersByName(nome);
  if (it.hasNext()) return it.next();
  return pastaPai.createFolder(nome);
}

function nomeFormatoPasta(formato) {
  var f = (formato || "").toString().trim().toUpperCase();
  if (f.includes("STORIES_1") || f === "STORIES 1") return "STORIES 1";
  if (f.includes("STORIES_2") || f === "STORIES 2") return "STORIES 2";
  if (f.includes("STORIES")) return "STORIES 1";
  if (f.includes("REEL")) return "REEL";
  if (f.includes("CARROSSEL")) return "CARROSSEL";
  return f || "OUTROS";
}

// Aceita tanto um ID puro quanto uma URL completa de pasta do Drive.
function extrairIdPastaDrive(valor) {
  if (!valor) return null;
  const texto = valor.toString().trim();
  const match = texto.match(/[-\w]{25,}/);
  return match ? match[0] : (texto || null);
}

/**
 * Resolve a pasta MES > FORMATO dentro da pasta mãe da influenciadora
 * (coluna PASTA_DRIVE_LINK da BASE DE DADOS), criando o que faltar.
 * Se a influenciadora ainda não tiver pasta cadastrada, cria uma nova
 * dentro da pasta raiz de entregas e grava o link de volta na BASE.
 */
function obterOuCriarPastaDestino(ss, cupom, abaAtivacoes, linhaAtivacao) {
  const abaBase = ss.getSheetByName(SETUP.ABAS.BASE);
  const hBase = getHeaderMap(abaBase);
  const dadosBase = getDadosBaseCache(abaBase);

  let pastaInfluenciadoraId = null, linhaInflu = -1, nomeInflu = cupom;
  for (let i = 1; i < dadosBase.length; i++) {
    if ((dadosBase[i][hBase['CUPOM'] - 1] || "").toString().trim().toUpperCase() === cupom) {
      linhaInflu = i + 1;
      pastaInfluenciadoraId = extrairIdPastaDrive(dadosBase[i][hBase['PASTA_DRIVE_LINK'] - 1]);
      nomeInflu = (dadosBase[i][hBase['INFLU_KEY'] - 1] || cupom).toString().trim();
      break;
    }
  }
  if (linhaInflu === -1) throw new Error("USUARIO_NAO_ENCONTRADO");

  let pastaInfluenciadora;
  try {
    pastaInfluenciadora = pastaInfluenciadoraId ? DriveApp.getFolderById(pastaInfluenciadoraId) : null;
  } catch (e) {
    pastaInfluenciadora = null;
  }
  if (!pastaInfluenciadora) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Re-checa após obter o lock: outra requisição concorrente pode já ter criado a pasta.
      const idRecente = extrairIdPastaDrive(abaBase.getRange(linhaInflu, hBase['PASTA_DRIVE_LINK']).getValue());
      try {
        pastaInfluenciadora = idRecente ? DriveApp.getFolderById(idRecente) : null;
      } catch (e) {
        pastaInfluenciadora = null;
      }

      if (!pastaInfluenciadora) {
        const propRaiz = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROP_PASTA_RAIZ);
        let pastaRaiz;
        try { pastaRaiz = DriveApp.getFolderById(propRaiz || PASTA_MAE_ID); }
        catch (e) { pastaRaiz = DriveApp.getFolderById(PASTA_MAE_ID); }
        pastaInfluenciadora = getOuCriarSubpasta(pastaRaiz, nomeInflu);
        pastaInfluenciadoraId = pastaInfluenciadora.getId();
        abaBase.getRange(linhaInflu, hBase['PASTA_DRIVE_LINK']).setValue(pastaInfluenciadora.getUrl());
        invalidarCacheBase();
      }
    } finally {
      lock.releaseLock();
    }
  }

  const hAtiv = getHeaderMap(abaAtivacoes);
  const mesAtivacao = (abaAtivacoes.getRange(linhaAtivacao, hAtiv['MES_REFERENCIA']).getValue() || "").toString().trim() || "SEM_MES";
  const formatoAtivacao = abaAtivacoes.getRange(linhaAtivacao, hAtiv['FORMATO']).getValue();

  const pastaMes = getOuCriarSubpasta(pastaInfluenciadora, mesAtivacao);
  return getOuCriarSubpasta(pastaMes, nomeFormatoPasta(formatoAtivacao));
}

function iniciarEnvioResumable(token, idAtivacao, nomeArquivo, mimeType, tamanhoBytes) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const influKey = getInfluKeyByCupom(ss, cupom);

    const abaAtivacoes = ss.getSheetByName(SETUP.ABAS.ATIVACOES);
    const hAtiv = getHeaderMap(abaAtivacoes);
    const linhaAtivacao = parseInt(idAtivacao);
    if (linhaAtivacao < 2 || linhaAtivacao > abaAtivacoes.getLastRow()) {
      return { ok: false, erro: "ATIVACAO_NAO_ENCONTRADA" };
    }
    const rowInfluKey = (abaAtivacoes.getRange(linhaAtivacao, hAtiv['INFLU_KEY']).getValue() || "").toString().trim().toUpperCase();
    if (rowInfluKey !== influKey) return { ok: false, erro: "ACESSO_NEGADO" };

    const pastaFormato = obterOuCriarPastaDestino(ss, cupom, abaAtivacoes, linhaAtivacao);

    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
    const resposta = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({ name: nomeArquivo, parents: [pastaFormato.getId()] }),
      muteHttpExceptions: true
    });

    if (resposta.getResponseCode() !== 200) {
      return { ok: false, erro: "FALHA_INICIAR_UPLOAD", detalhes: resposta.getContentText() };
    }
    const headers = resposta.getHeaders();
    const uploadUrl = headers["Location"] || headers["location"];
    return { ok: true, uploadUrl: uploadUrl };
  } catch (e) {
    Logger.log("iniciarEnvioResumable: EXCEPTION message=%s stack=%s", e.message, e.stack);
    return { ok: false, erro: e.message };
  }
}

function enviarPedacoResumable(token, uploadUrl, base64Chunk, inicio, fim, total) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const bytes = Utilities.base64Decode(base64Chunk);
    const resposta = UrlFetchApp.fetch(uploadUrl, {
      method: "put",
      headers: { "Content-Range": "bytes " + inicio + "-" + fim + "/" + total },
      payload: bytes,
      muteHttpExceptions: true
    });

    const status = resposta.getResponseCode();
    if (status === 200 || status === 201) {
      const arquivo = JSON.parse(resposta.getContentText());
      return { ok: true, completo: true, fileId: arquivo.id };
    }
    if (status === 308) {
      return { ok: true, completo: false };
    }
    return { ok: false, erro: "FALHA_ENVIO_PEDACO", detalhes: resposta.getContentText() };
  } catch (e) {
    Logger.log("enviarPedacoResumable: EXCEPTION message=%s stack=%s", e.message, e.stack);
    return { ok: false, erro: e.message };
  }
}

function finalizarEnvioResumable(token, idAtivacao, fileId) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const influKey = getInfluKeyByCupom(ss, cupom);
    const abaAtivacoes = ss.getSheetByName(SETUP.ABAS.ATIVACOES);
    const h = getHeaderMap(abaAtivacoes);
    const linhaAtivacao = parseInt(idAtivacao);
    const rowInfluKey = (abaAtivacoes.getRange(linhaAtivacao, h['INFLU_KEY']).getValue() || "").toString().trim().toUpperCase();
    if (rowInfluKey !== influKey) return { ok: false, erro: "ACESSO_NEGADO" };

    // Resolvida fora do lock de escrita abaixo (a pasta já existe a esta
    // altura, criada em iniciarEnvioResumable) para não arriscar lock
    // aninhado caso obterOuCriarPastaDestino precise recriá-la.
    const pastaFormato = obterOuCriarPastaDestino(ss, cupom, abaAtivacoes, linhaAtivacao);
    const linkPasta = pastaFormato.getUrl();

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Coluna G (LINK_ARQUIVO) guarda o link da PASTA da ativação no Drive,
      // não links de arquivos individuais: todos os arquivos enviados caem na
      // mesma pasta, então o valor não acumula entre uploads da mesma ativação.
      abaAtivacoes.getRange(linhaAtivacao, h['LINK_ARQUIVO']).setValue(linkPasta);
      abaAtivacoes.getRange(linhaAtivacao, h['STATUS_CONTEUDO']).setValue(normalizarStatus("em revisão"));
      invalidarCacheAba(CHAVE_CACHE_ATIVACOES);
    } finally {
      lock.releaseLock();
    }

    return { ok: true, link: linkPasta };
  } catch (e) {
    Logger.log("finalizarEnvioResumable: EXCEPTION message=%s stack=%s", e.message, e.stack);
    return { ok: false, erro: e.message };
  }
}

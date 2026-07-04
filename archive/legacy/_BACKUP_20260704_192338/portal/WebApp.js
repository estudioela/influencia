/**
 * Backend do Portal de Influenciadoras Jescri
 * Arquivo: WebApp.gs
 * Publicado como Web App na Planilha de Apoio
 */

const SCRIPT_PROP_PASTA_RAIZ = "PASTA_RAIZ_ENTREGAS";

// ======================================================
// CONFIGURAÇÕES E MAPEAMENTO DE COLUNAS
// ======================================================
const MAP = {
  BASE: {
    NOME_ABA: "BASE DE APOIO", // Corrigido: era "BASE", a aba real se chama "BASE DE APOIO"
    INFLU_KEY: 2, // B (faltava, quebrava getInfluKeyByCupom)
    CUPOM: 3, // C
    NOME: 4, // D
    EMAIL: 5, // E
    CHAVE_PIX: 6, // F
    CNPJ: 7, // G
    CEP: 8, // H
    RUA: 9, // I
    NUMERO: 10, // J
    COMPLEMENTO: 11, // K
    CIDADE: 13, // M
    UF: 14, // N
    VALOR: 16, // P - VALOR_TOTAL (faltava, quebrava getPerfil)
    ID_PASTA_DRIVE: 32 // AF (Nova coluna, livre. A planilha real usa até a coluna 31 hoje;
                        // era 25, que colidia com CIDADE_ASSINATURA já existente)
  },
  ATIVACOES: {
    NOME_ABA: "ATIVAÇÕES",
    INFLU_KEY: 1, // A
    MES: 2, // B
    FORMATO: 3, // C
    DATA_APROVACAO: 4, // D
    DATA_ATIVACAO: 5, // E
    STATUS: 6, // F
    LINK_ARQUIVO: 7 // G (Nova coluna)
  },
  PAGAMENTOS: {
    NOME_ABA: "PAGAMENTOS",
    INFLU_KEY: 1, // A
    MES: 2, // B
    VALOR: 3, // C
    STATUS: 5, // E
    DATA_PAGAMENTO: 6 // F
  },
  BRIEFING: {
    NOME_ABA: "BRIEFING",
    INFLU_KEY: 1, // A
    CUPOM: 2, // B
    MES: 3, // C
    RESUMO: 4, // D
    // Mapeamento dinâmico baseado no formato
  },
  HISTORICO_CONT: {
    NOME_ABA: "HISTÓRICO DE CONTEÚDOS",
    INFLU_KEY: 1,
    MES: 2,
    FORMATO: 3,
    DATA_APROVACAO: 4,
    DATA_ATIVACAO: 5,
    STATUS: 6
  },
  HISTORICO_PAG: {
    NOME_ABA: "HISTÓRICO DE PAGAMENTOS",
    INFLU_KEY: 1,
    MES: 2,
    VALOR: 3,
    STATUS: 5,
    DATA_PAGAMENTO: 6
  }
};

// ======================================================
// FUNÇÕES PRINCIPAIS DO WEB APP
// ======================================================

function doGet(e) {
  // Alterado de 'test' para 'Index' conforme solicitado
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
// API JSON (para o SPA hospedado separadamente)
// ======================================================
// Shim aditivo: expõe as mesmas funções já usadas via google.script.run
// (login, getPendencias, etc.) como um endpoint JSON, sem alterar nenhuma
// delas. O corpo da requisição deve ser enviado como texto puro
// (Content-Type: text/plain) para evitar preflight de CORS; o conteúdo em
// si é sempre JSON: {"action": "...", ...params}.
var API_ACOES = {
  login: function (p) { return login(p.cupom, p.senha); },
  getPendencias: function (p) { return getPendencias(p.token, p.mesAno); },
  getBriefing: function (p) { return getBriefing(p.token, p.idAtivacao); },
  getPagamentos: function (p) { return getPagamentos(p.token, p.mesAno); },
  getHistorico: function (p) { return getHistorico(p.token, p.mesAno); },
  getPerfil: function (p) { return getPerfil(p.token); },
  updatePerfil: function (p) { return updatePerfil(p.token, p.dadosAtualizados); }
};

function doPost(e) {
  var resposta;
  try {
    var corpo = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var acao = corpo.action;
    if (!acao || !API_ACOES[acao]) {
      resposta = { ok: false, erro: "ACAO_INVALIDA" };
    } else {
      resposta = API_ACOES[acao](corpo);
    }
  } catch (err) {
    resposta = { ok: false, erro: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(resposta))
    .setMimeType(ContentService.MimeType.JSON);
}

// ======================================================
// AUTENTICAÇÃO E SESSÃO
// ======================================================

function login(cupom, senha) {
  try {
    if (!cupom || !senha) return { ok: false, erro: "CREDENCIAIS_INVALIDAS" };

    const cupomLimpo = cupom.toString().trim().toUpperCase();
    const senhaLimpa = senha.toString().trim();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaBase = ss.getSheetByName(MAP.BASE.NOME_ABA);
    if (!abaBase) return { ok: false, erro: "ERRO_INTERNO" };

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let dados;
    try {
      dados = abaBase.getDataRange().getValues();
    } finally {
      lock.releaseLock();
    }

    for (let i = 1; i < dados.length; i++) {
      let cupomPlanilha = (dados[i][MAP.BASE.CUPOM - 1] || "").toString().trim().toUpperCase();
      let cnpjPlanilha = (dados[i][MAP.BASE.CNPJ - 1] || "").toString().replace(/\D/g, "");

      if (cupomPlanilha === cupomLimpo) {
        let senhaCorreta = cnpjPlanilha.substring(0, 5);
        if (senhaLimpa === senhaCorreta) {
          // Login sucesso
          const token = Utilities.getUuid();
          const cache = CacheService.getScriptCache();
          cache.put(token, cupomLimpo, 21600); // 6 horas (21600 segundos)

          return {
            ok: true,
            token: token,
            nome: dados[i][MAP.BASE.NOME - 1]
          };
        }
      }
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
    // Renovação deslizante
    cache.put(token, cupom, 21600);
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
    const abaAtivacoes = ss.getSheetByName(MAP.ATIVACOES.NOME_ABA);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let influKey, dados;
    try {
      influKey = getInfluKeyByCupom(ss, cupom);
      if (!influKey) return { ok: false, erro: "USUARIO_NAO_ENCONTRADO" };
      if (!abaAtivacoes) return { ok: true, itens: [] };
      dados = abaAtivacoes.getDataRange().getValues();
    } finally {
      lock.releaseLock();
    }

    const itens = [];

    for (let i = 1; i < dados.length; i++) {
      let rowInfluKey = (dados[i][MAP.ATIVACOES.INFLU_KEY - 1] || "").toString().trim().toUpperCase();
      let rowMes = (dados[i][MAP.ATIVACOES.MES - 1] || "").toString().trim().toUpperCase();

      // Filtra por influenciadora e mês (se fornecido)
      if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
        let statusBruto = (dados[i][MAP.ATIVACOES.STATUS - 1] || "").toString().toLowerCase();
        let statusNormalizado = normalizarStatusAtivacao(statusBruto);

        itens.push({
          idAtivacao: i + 1, // Usando o número da linha como ID
          formato: dados[i][MAP.ATIVACOES.FORMATO - 1],
          campanha: rowMes,
          dataEntrega: formatarData(dados[i][MAP.ATIVACOES.DATA_APROVACAO - 1]),
          dataAprovacao: formatarData(dados[i][MAP.ATIVACOES.DATA_ATIVACAO - 1]),
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
    const abaAtivacoes = ss.getSheetByName(MAP.ATIVACOES.NOME_ABA);
    const abaBriefing = ss.getSheetByName(MAP.BRIEFING.NOME_ABA);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let influKey, dadosAtivacao, rowInfluKey, mes, formato, dadosBriefing;
    try {
      influKey = getInfluKeyByCupom(ss, cupom);

      // 1. Buscar detalhes da ativação
      const linhaAtivacao = parseInt(idAtivacao);

      if (linhaAtivacao < 2 || linhaAtivacao > abaAtivacoes.getLastRow()) {
        return { ok: false, erro: "ATIVACAO_NAO_ENCONTRADA" };
      }

      dadosAtivacao = abaAtivacoes.getRange(linhaAtivacao, 1, 1, abaAtivacoes.getLastColumn()).getValues()[0];
      rowInfluKey = (dadosAtivacao[MAP.ATIVACOES.INFLU_KEY - 1] || "").toString().trim().toUpperCase();

      if (rowInfluKey !== influKey) {
        return { ok: false, erro: "ACESSO_NEGADO" };
      }

      mes = (dadosAtivacao[MAP.ATIVACOES.MES - 1] || "").toString().trim().toUpperCase();
      formato = (dadosAtivacao[MAP.ATIVACOES.FORMATO - 1] || "").toString().trim().toUpperCase();

      // 2. Buscar o briefing correspondente
      if (!abaBriefing) return { ok: false, erro: "ABA_BRIEFING_NAO_ENCONTRADA" };

      dadosBriefing = abaBriefing.getDataRange().getValues();
    } finally {
      lock.releaseLock();
    }

    let textoBriefing = "Briefing não encontrado para este formato/mês.";

    for (let i = 1; i < dadosBriefing.length; i++) {
      let bInfluKey = (dadosBriefing[i][MAP.BRIEFING.INFLU_KEY - 1] || "").toString().trim().toUpperCase();
      let bMes = (dadosBriefing[i][MAP.BRIEFING.MES - 1] || "").toString().trim().toUpperCase();

      if (bInfluKey === influKey && bMes === mes) {
        // Encontrou a linha do briefing, agora extrai o texto baseado no formato
        if (formato.includes("REEL")) {
          textoBriefing = dadosBriefing[i][12]; // M - SOBRE_REEL
        } else if (formato.includes("CARROSSEL")) {
          textoBriefing = dadosBriefing[i][13]; // N - SOBRE_CARROSSEL
        } else if (formato.includes("STORIES_1") || formato === "STORIES") {
          textoBriefing = dadosBriefing[i][14]; // O - SOBRE_STORIES_1
        } else if (formato.includes("STORIES_2")) {
          textoBriefing = dadosBriefing[i][15]; // P - SOBRE_STORIES_2
        }
        break;
      }
    }

    return {
      ok: true,
      campanha: mes,
      formato: formato,
      dataEntrega: formatarData(dadosAtivacao[MAP.ATIVACOES.DATA_APROVACAO - 1]),
      dataAprovacao: formatarData(dadosAtivacao[MAP.ATIVACOES.DATA_ATIVACAO - 1]),
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
    const abaPagamentos = ss.getSheetByName(MAP.PAGAMENTOS.NOME_ABA);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let influKey, dados;
    try {
      influKey = getInfluKeyByCupom(ss, cupom);
      if (!abaPagamentos) return { ok: true, totalPrevisto: 0, totalPago: 0, itens: [] };
      dados = abaPagamentos.getDataRange().getValues();
    } finally {
      lock.releaseLock();
    }

    const itens = [];
    let totalPrevisto = 0;
    let totalPago = 0;

    for (let i = 1; i < dados.length; i++) {
      let rowInfluKey = (dados[i][MAP.PAGAMENTOS.INFLU_KEY - 1] || "").toString().trim().toUpperCase();
      let rowMes = (dados[i][MAP.PAGAMENTOS.MES - 1] || "").toString().trim().toUpperCase();

      if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
        let statusBruto = (dados[i][MAP.PAGAMENTOS.STATUS - 1] || "").toString().toLowerCase();
        let etapa = normalizarStatusPagamento(statusBruto);
        let valor = extrairValorNumerico(dados[i][MAP.PAGAMENTOS.VALOR - 1]);

        if (etapa === "PAGO") {
          totalPago += valor;
        } else {
          totalPrevisto += valor;
        }

        itens.push({
          idPagamento: i + 1,
          referencia: rowMes,
          valor: dados[i][MAP.PAGAMENTOS.VALOR - 1],
          etapa: etapa,
          dataPrevista: "",
          dataPagamento: formatarData(dados[i][MAP.PAGAMENTOS.DATA_PAGAMENTO - 1])
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
    const abaHistCont = ss.getSheetByName(MAP.HISTORICO_CONT.NOME_ABA);
    const abaHistPag = ss.getSheetByName(MAP.HISTORICO_PAG.NOME_ABA);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let influKey, dadosCont, dadosPag;
    try {
      influKey = getInfluKeyByCupom(ss, cupom);
      if (abaHistCont) dadosCont = abaHistCont.getDataRange().getValues();
      if (abaHistPag) dadosPag = abaHistPag.getDataRange().getValues();
    } finally {
      lock.releaseLock();
    }

    const ativacoes = [];
    const pagamentos = [];

    // Histórico de Conteúdos
    if (dadosCont) {
      for (let i = 1; i < dadosCont.length; i++) {
        let rowInfluKey = (dadosCont[i][MAP.HISTORICO_CONT.INFLU_KEY - 1] || "").toString().trim().toUpperCase();
        let rowMes = (dadosCont[i][MAP.HISTORICO_CONT.MES - 1] || "").toString().trim().toUpperCase();

        if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
          ativacoes.push({
            idAtivacao: "H" + (i + 1),
            formato: dadosCont[i][MAP.HISTORICO_CONT.FORMATO - 1],
            campanha: rowMes,
            dataEntrega: formatarData(dadosCont[i][MAP.HISTORICO_CONT.DATA_APROVACAO - 1]),
            dataAprovacao: formatarData(dadosCont[i][MAP.HISTORICO_CONT.DATA_ATIVACAO - 1]),
            status: "PUBLICADO",
            temBriefing: false
          });
        }
      }
    }

    // Histórico de Pagamentos
    if (dadosPag) {
      for (let i = 1; i < dadosPag.length; i++) {
        let rowInfluKey = (dadosPag[i][MAP.HISTORICO_PAG.INFLU_KEY - 1] || "").toString().trim().toUpperCase();
        let rowMes = (dadosPag[i][MAP.HISTORICO_PAG.MES - 1] || "").toString().trim().toUpperCase();

        if (rowInfluKey === influKey && (!mesAno || rowMes === mesAno.toUpperCase())) {
          pagamentos.push({
            idPagamento: "H" + (i + 1),
            referencia: rowMes,
            valor: dadosPag[i][MAP.HISTORICO_PAG.VALOR - 1],
            etapa: "PAGO",
            dataPrevista: "",
            dataPagamento: formatarData(dadosPag[i][MAP.HISTORICO_PAG.DATA_PAGAMENTO - 1])
          });
        }
      }
    }

    return { ok: true, ativacoes: ativacoes, pagamentos: pagamentos };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

function getPerfil(token) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaBase = ss.getSheetByName(MAP.BASE.NOME_ABA);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let dados;
    try {
      dados = abaBase.getDataRange().getValues();
    } finally {
      lock.releaseLock();
    }

    for (let i = 1; i < dados.length; i++) {
      let cupomPlanilha = (dados[i][MAP.BASE.CUPOM - 1] || "").toString().trim().toUpperCase();

      if (cupomPlanilha === cupom) {
        return {
          ok: true,
          dados: {
            nome: dados[i][MAP.BASE.NOME - 1],
            cnpj: dados[i][MAP.BASE.CNPJ - 1],
            chavePix: dados[i][MAP.BASE.CHAVE_PIX - 1],
            email: dados[i][MAP.BASE.EMAIL - 1],
            telefone: "",
            cep: dados[i][MAP.BASE.CEP - 1],
            rua: dados[i][MAP.BASE.RUA - 1],
            numero: dados[i][MAP.BASE.NUMERO - 1],
            complemento: dados[i][MAP.BASE.COMPLEMENTO - 1],
            cidade: dados[i][MAP.BASE.CIDADE - 1],
            estado: dados[i][MAP.BASE.UF - 1]
          },
          somenteLeitura: {
            cupom: cupom,
            valorTotal: dados[i][MAP.BASE.VALOR - 1]
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
    const abaBase = ss.getSheetByName(MAP.BASE.NOME_ABA);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const dados = abaBase.getDataRange().getValues();

      for (let i = 1; i < dados.length; i++) {
        let cupomPlanilha = (dados[i][MAP.BASE.CUPOM - 1] || "").toString().trim().toUpperCase();

        if (cupomPlanilha === cupom) {
          const linha = i + 1;

          // Atualiza apenas os campos permitidos
          if (dadosAtualizados.chavePix !== undefined) abaBase.getRange(linha, MAP.BASE.CHAVE_PIX).setValue(dadosAtualizados.chavePix);
          if (dadosAtualizados.email !== undefined) abaBase.getRange(linha, MAP.BASE.EMAIL).setValue(dadosAtualizados.email);
          if (dadosAtualizados.cep !== undefined) abaBase.getRange(linha, MAP.BASE.CEP).setValue(dadosAtualizados.cep);
          if (dadosAtualizados.numero !== undefined) abaBase.getRange(linha, MAP.BASE.NUMERO).setValue(dadosAtualizados.numero);
          if (dadosAtualizados.complemento !== undefined) abaBase.getRange(linha, MAP.BASE.COMPLEMENTO).setValue(dadosAtualizados.complemento);

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
// FUNÇÕES AUXILIARES
// ======================================================

function getInfluKeyByCupom(ss, cupom) {
  const abaBase = ss.getSheetByName(MAP.BASE.NOME_ABA);
  const dados = abaBase.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    if ((dados[i][MAP.BASE.CUPOM - 1] || "").toString().trim().toUpperCase() === cupom) {
      return (dados[i][MAP.BASE.INFLU_KEY - 1] || "").toString().trim().toUpperCase();
    }
  }
  return null;
}

function normalizarStatusAtivacao(statusBruto) {
  if (statusBruto.includes("falta") || statusBruto.includes("aberto")) return "AGUARDANDO_MATERIAL";
  if (statusBruto.includes("aprova") || statusBruto.includes("revis")) return "EM_APROVACAO";
  if (statusBruto.includes("aprovado")) return "APROVADO";
  if (statusBruto.includes("postado") || statusBruto.includes("publicado")) return "PUBLICADO";
  return "AGUARDANDO_MATERIAL";
}

function normalizarStatusPagamento(statusBruto) {
  if (statusBruto.includes("pago")) return "PAGO";
  if (statusBruto.includes("nota")) return "NOTA_FISCAL";
  return "MATERIAL_ENVIADO";
}

function formatarData(data) {
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

const PASTA_MAE_ID = "1X7BSY9R7dUUNYXgYnmnCIACVMFcqBUPH";

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

function obterOuCriarPastaDestino(ss, cupom, abaAtivacoes, linhaAtivacao) {
  const abaBase = ss.getSheetByName(MAP.BASE.NOME_ABA);
  const dadosBase = abaBase.getDataRange().getValues();
  let pastaInfluenciadoraId = null, linhaInflu = -1, nomeInflu = cupom;
  for (let i = 1; i < dadosBase.length; i++) {
    if ((dadosBase[i][MAP.BASE.CUPOM - 1] || "").toString().trim().toUpperCase() === cupom) {
      linhaInflu = i + 1;
      pastaInfluenciadoraId = dadosBase[i][MAP.BASE.ID_PASTA_DRIVE - 1];
      nomeInflu = (dadosBase[i][MAP.BASE.NOME - 1] || cupom).toString().trim();
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
      const idRecente = abaBase.getRange(linhaInflu, MAP.BASE.ID_PASTA_DRIVE).getValue();
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
        abaBase.getRange(linhaInflu, MAP.BASE.ID_PASTA_DRIVE).setValue(pastaInfluenciadoraId);
      }
    } finally {
      lock.releaseLock();
    }
  }

  const mesAtivacao = (abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.MES).getValue() || "").toString().trim() || "SEM_MES";
  const formatoAtivacao = abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.FORMATO).getValue();

  const pastaMes = getOuCriarSubpasta(pastaInfluenciadora, mesAtivacao);
  return getOuCriarSubpasta(pastaMes, nomeFormatoPasta(formatoAtivacao));
}

function iniciarEnvioResumable(token, idAtivacao, nomeArquivo, mimeType, tamanhoBytes) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const influKey = getInfluKeyByCupom(ss, cupom);

    const abaAtivacoes = ss.getSheetByName(MAP.ATIVACOES.NOME_ABA);
    const linhaAtivacao = parseInt(idAtivacao);
    if (linhaAtivacao < 2 || linhaAtivacao > abaAtivacoes.getLastRow()) {
      return { ok: false, erro: "ATIVACAO_NAO_ENCONTRADA" };
    }
    const rowInfluKey = (abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.INFLU_KEY).getValue() || "").toString().trim().toUpperCase();
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

function finalizarEnvioResumable(token, idAtivacao, fileId) {
  try {
    const cupom = validarToken(token);
    if (!cupom) return { ok: false, erro: "SESSAO_EXPIRADA" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const influKey = getInfluKeyByCupom(ss, cupom);
    const abaAtivacoes = ss.getSheetByName(MAP.ATIVACOES.NOME_ABA);
    const linhaAtivacao = parseInt(idAtivacao);
    const rowInfluKey = (abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.INFLU_KEY).getValue() || "").toString().trim().toUpperCase();
    if (rowInfluKey !== influKey) return { ok: false, erro: "ACESSO_NEGADO" };

    const linkArquivo = "https://drive.google.com/file/d/" + fileId + "/view";

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const linkAnterior = abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.LINK_ARQUIVO).getValue();
      const novoLink = linkAnterior ? (linkAnterior + "\n" + linkArquivo) : linkArquivo;
      abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.LINK_ARQUIVO).setValue(novoLink);
      abaAtivacoes.getRange(linhaAtivacao, MAP.ATIVACOES.STATUS).setValue("EM_APROVACAO");
    } finally {
      lock.releaseLock();
    }

    return { ok: true, link: linkArquivo };
  } catch (e) {
    Logger.log("finalizarEnvioResumable: EXCEPTION message=%s stack=%s", e.message, e.stack);
    return { ok: false, erro: e.message };
  }
}
/**
 * ERP INFLUÊNCIA 360º - V 7.0 (ARQUITETURA UNIFICADA: ERP + PORTAL)
 * Módulos: Automação Baseada em Eventos, Espelhamento Ativações -> Briefing, Menu Otimizado, Inteligência de CEP, Rastreio, Web App do Portal de Influenciadoras.
 */

const SETUP = {
  ABAS: {
    CADASTROS: "CADASTROS",
    BASE: "BASE DE DADOS",
    BRIEFING: "BRIEFING",
    FLUXO: "FLUXO LOGÍSTICO",
    ATIVACOES: "ATIVAÇÕES", 
    PAGAMENTOS: "PAGAMENTOS",
    HISTORICO_CONT: "HISTÓRICO DE CONTEÚDOS",
    HISTORICO_PAG: "HISTÓRICO DE PAGAMENTOS",
    HISTORICO_FLUXO: "HISTÓRICO LOGÍSTICO"
  },
  CORES: { ON: "#D9EAD3", OFF: "#F4CCCC", CABECALHO: "#cd0005", TEXTO_CABECALHO: "#ffffff" }
};

// ======================================================
// 1. MENU DO SISTEMA (INTERFACES E LOGICA VISUAL CORRIGIDA)
// ======================================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Correção estrutural: encadeamento direto para evitar falha de variável 'menu' não declarada
  ui.createMenu(" ERP ELÃ 6.2")
    .addSubMenu(ui.createMenu(" Planejamento & Campanhas")
      .addItem(" 1. Iniciar Novo Mês (Gerar Rascunhos e Tarefas)", "gerarNovoMesCompleto")
      .addItem(" 2. Puxar Looks da Planilha Externa para Briefing", "sincronizarLooks"))
    
    .addSubMenu(ui.createMenu(" Financeiro & PIX")
      .addItem(" 1. Lançar Pagamentos Avulsos do Mês", "lancarPagamentosDoMes")
      .addItem(" 2. Copiar Mensagem de PIX (Aba Pagamentos)", "gerarSolicitacaoPagamento"))
    
    .addSubMenu(ui.createMenu(" Logística & Envios")
      .addItem(" 1. Atualizar Rastreios Automáticos (BRComerce)", "atualizarRastreiosBRComerce")
      .addItem(" 2. Copiar Dados de Confirmação (WhatsApp)", "gerarMensagemRevisao"))
    
    .addSeparator()
    
    .addSubMenu(ui.createMenu(" Cadastros & Configurações")
      .addItem(" 1. Abrir Formulário de Cadastro", "abrirPaginaCadastro")
      .addItem(" 2. Preencher Endereço por CEP (Aba Base)", "atualizarEnderecoLinhaSelecionada")
      .addItem(" 3. Executar Limpeza e Arquivamento Geral", "menuArquivarTudo")
      .addItem(" 4. Estruturar Planilha (Setup Inicial)", "setupERP"))

    .addToUi();
}

function abrirPaginaCadastro() {
  const html = HtmlService.createHtmlOutput(`<script>window.open('https://estudioela.com/cliente/jescri-cadastro/', '_blank');google.script.host.close();</script>`);
  SpreadsheetApp.getUi().showModalDialog(html, 'Redirecionando para o Formulário...');
}

// ======================================================
// 2. MOTOR PRINCIPAL: CRIAÇÃO DO MÊS INTEGRADO
// ======================================================
function gerarNovoMesCompleto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const baseSheet = ss.getSheetByName(SETUP.ABAS.BASE);
  const ativSheet = ss.getSheetByName(SETUP.ABAS.ATIVACOES);
  const fluxoSheet = ss.getSheetByName(SETUP.ABAS.FLUXO);
  const pagSheet = ss.getSheetByName(SETUP.ABAS.PAGAMENTOS);

  const res = ui.prompt(' Iniciar Planejameno Mensal', 'Digite o nome do MÊS da Nova Campanha? (Ex: AGOSTO)\nNota: o Briefing do mês anterior será arquivado em uma aba própria e uma nova aba BRIEFING (mesmo layout, fórmulas e formatação) será criada para o novo mês.', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() != ui.Button.OK) return;
  const mesTarget = res.getResponseText().trim().toUpperCase();
  if (!mesTarget) return;

  // Proteção contra execução acidental duplicada: se este mês já foi gerado
  // antes (mesma referência já presente no FLUXO LOGÍSTICO), confirma com o
  // usuário antes de duplicar linhas em FLUXO, ATIVAÇÕES e PAGAMENTOS — os
  // três são populados juntos nesta mesma função, então checar um já cobre
  // os três.
  if (mesJaGeradoNoFluxo(fluxoSheet, mesTarget)) {
    const confirmar = ui.alert(
      'Mês já gerado',
      `Já existem registros de ${mesTarget} na aba ${SETUP.ABAS.FLUXO}. Rodar de novo vai DUPLICAR linhas em Fluxo, Ativações e Pagamentos para esse mês.\n\nDeseja continuar mesmo assim?`,
      ui.ButtonSet.YES_NO
    );
    if (confirmar !== ui.Button.YES) return;
  }

  const briefingSheet = arquivarEcriarNovaBriefing(ss);

  const hBase = getHeaderMap(baseSheet);
  const hBrief = getHeaderMap(briefingSheet);
  let baseData = baseSheet.getDataRange().getValues();

  let influON = baseData.filter(r => isInfluenciadoraOn(r[0])).map(r => ({
    nome: r[hBase['INFLU_KEY']-1],
    cupom: r[hBase['CUPOM']-1],
    pasta: r[hBase['PASTA_DRIVE_LINK']-1],
    endereco: r[hBase['INFLUENCIADORA_ENDERECO']-1],
    valor: r[hBase['VALOR_TOTAL']-1],
    pix: r[hBase['CHAVE_PIX']-1],
    qReels: textToNumber(r[hBase['REELS_TEXTO']-1]),
    qCarrosel: textToNumber(r[hBase['CARROSSEL_TEXTO']-1]),
    qStories: textToNumber(r[hBase['STORIES_TEXTO']-1])
  }));

  if (!influON.length) return ui.alert('Aviso', 'Nenhuma influenciadora ativa (ON) encontrada na base.', ui.ButtonSet.OK);

  let listaAtiv = [], listaFluxo = [], listaPag = [];

  influON.forEach((inf, i) => {
    let rowBrief = i + 2;
    if (hBrief['INFLU_KEY']) briefingSheet.getRange(rowBrief, hBrief['INFLU_KEY']).setValue(inf.nome); 
    if (hBrief['CUPOM']) briefingSheet.getRange(rowBrief, hBrief['CUPOM']).setValue(inf.cupom);
    if (hBrief['MES']) briefingSheet.getRange(rowBrief, hBrief['MES']).setValue(mesTarget); 
    if (hBrief['PASTA_DRIVE_LINK']) briefingSheet.getRange(rowBrief, hBrief['PASTA_DRIVE_LINK']).setValue(inf.pasta);

    listaFluxo.push([inf.nome, inf.endereco || "", "Aguardando Confirmação", mesTarget, '', '', 'pendente']);
    listaPag.push([inf.nome, mesTarget, inf.valor, inf.pix, 'em aberto', '', '']);

    for(let r=1; r<=inf.qReels; r++) listaAtiv.push([inf.nome, mesTarget, 'REEL', '', '', 'em aberto']);
    for(let c=1; c<=inf.qCarrosel; c++) listaAtiv.push([inf.nome, mesTarget, 'CARROSSEL', '', '', 'em aberto']);
    for(let s=1; s<=inf.qStories; s++) {
      let fmt = inf.qStories > 1 ? 'STORIES_'+s : 'STORIES';
      listaAtiv.push([inf.nome, mesTarget, fmt, '', '', 'em aberto']);
    }
  });
  
  if(listaFluxo.length) fluxoSheet.getRange(fluxoSheet.getLastRow()+1, 1, listaFluxo.length, 7).setValues(listaFluxo);
  if(listaPag.length) pagSheet.getRange(pagSheet.getLastRow()+1, 1, listaPag.length, 7).setValues(listaPag);
  if(listaAtiv.length) ativSheet.getRange(ativSheet.getLastRow()+1, 1, listaAtiv.length, 6).setValues(listaAtiv);

  invalidarCacheAba(CHAVE_CACHE_BRIEFING);
  invalidarCacheAba(CHAVE_CACHE_PAGAMENTOS);
  invalidarCacheAba(CHAVE_CACHE_ATIVACOES);
  ordenarAbaAtivacoesCronologico();
  ui.alert('Sucesso!', `O planejamento de ${mesTarget} foi gerado!\n\n- Briefing do mês anterior arquivado e nova aba BRIEFING criada.\n- Linhas de Ativações, Fluxo e Pagamentos injetadas com sucesso!`, ui.ButtonSet.OK);
}

// Retorna true se a aba FLUXO LOGÍSTICO já tem alguma linha com essa
// referência de mês — usado só para alertar antes de uma segunda geração
// acidental do mesmo mês (ver gerarNovoMesCompleto).
function mesJaGeradoNoFluxo(fluxoSheet, mesTarget) {
  if (!fluxoSheet || fluxoSheet.getLastRow() < 2) return false;
  const h = getHeaderMap(fluxoSheet);
  if (!h['MES_REFERENCIA']) return false;
  const valores = fluxoSheet.getRange(2, h['MES_REFERENCIA'], fluxoSheet.getLastRow() - 1, 1).getValues();
  return valores.some(r => String(r[0]).trim().toUpperCase() === mesTarget);
}

// Arquiva a aba BRIEFING atual (preservando todo o histórico do mês anterior
// como uma aba própria) e cria uma nova aba "BRIEFING" clonada dela via
// copyTo() — que já preserva nativamente fórmulas, validações de dados,
// formatação condicional e formatação de célula (negrito/itálico/cor/
// alinhamento/mesclagens/largura de coluna/altura de linha). Só o conteúdo
// das linhas de dados da nova aba é limpo; o cabeçalho e a formatação
// continuam intactos. copyTo() NÃO replica proteções de intervalo/aba —
// isso é feito à parte por copiarProtecoes().
function arquivarEcriarNovaBriefing(ss) {
  const briefingAntiga = ss.getSheetByName(SETUP.ABAS.BRIEFING);
  if (!briefingAntiga) return ss.insertSheet(SETUP.ABAS.BRIEFING);

  const idxOriginal = briefingAntiga.getIndex();
  briefingAntiga.setName(nomeArquivoMensal(SETUP.ABAS.BRIEFING, ss));

  const novaBriefing = briefingAntiga.copyTo(ss);
  novaBriefing.setName(SETUP.ABAS.BRIEFING);
  ss.setActiveSheet(novaBriefing);
  ss.moveActiveSheet(idxOriginal);

  copiarProtecoes(briefingAntiga, novaBriefing);
  limparDadosOperacionaisBriefing(novaBriefing);
  return novaBriefing;
}

// Limpa só os DADOS ESTÁTICOS das linhas operacionais (2..última) da nova
// BRIEFING, coluna por coluna. Qualquer coluna cuja linha 2 já contenha uma
// fórmula é preservada integralmente (a fórmula se recalcula sozinha
// conforme as demais colunas são preenchidas de novo) — clearContent()
// apaga fórmula junto com valor, e ela não reaparece sozinha, então nunca
// aplicamos clearContent() numa coluna que já tinha fórmula.
function limparDadosOperacionaisBriefing(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;

  const formulasLinha2 = sheet.getRange(2, 1, 1, lastCol).getFormulas()[0];
  for (let c = 0; c < lastCol; c++) {
    if (!formulasLinha2[c]) {
      sheet.getRange(2, c + 1, lastRow - 1, 1).clearContent();
    }
  }
}

// copyTo() duplica valores, fórmulas, formatação, validação de dados,
// formatação condicional, mesclagens e dimensões de linha/coluna — mas NÃO
// replica proteções de intervalo nem de aba inteira (limitação conhecida do
// Apps Script). Esta função fecha essa lacuna, recriando na aba de destino
// as mesmas proteções (descrição + editores) que existiam na aba de origem.
// Falhas pontuais (limite de proteções, editor sem permissão de ser
// adicionado, etc.) são ignoradas por proteção individual, sem interromper
// a geração do mês.
function copiarProtecoes(origem, destino) {
  origem.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(p => {
    try {
      const nova = destino.getRange(p.getRange().getA1Notation()).protect();
      nova.setDescription(p.getDescription());
      const editores = p.getEditors();
      if (editores && editores.length) nova.addEditors(editores);
    } catch (e) {}
  });

  origem.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(p => {
    try {
      const nova = destino.protect();
      nova.setDescription(p.getDescription());
      const semProtecao = p.getUnprotectedRanges();
      if (semProtecao && semProtecao.length) {
        nova.setUnprotectedRanges(semProtecao.map(r => destino.getRange(r.getA1Notation())));
      }
      const editores = p.getEditors();
      if (editores && editores.length) nova.addEditors(editores);
    } catch (e) {}
  });
}

// Nome padronizado para abas de arquivamento mensal: PREFIXO_AAAA_MM (ex.:
// BRIEFING_2026_07). Evita ambiguidade de nomes livres, facilita busca e
// ordenação por período. Reutilizável por qualquer futuro arquivamento
// mensal em aba própria — hoje só arquivarEcriarNovaBriefing() usa isso.
function nomeArquivoMensal(prefixo, ss) {
  const base = prefixo + "_" + Utilities.formatDate(new Date(), "GMT-3", "yyyy_MM");
  let nome = base;
  let contador = 2;
  while (ss.getSheetByName(nome)) {
    nome = base + "_" + contador;
    contador++;
  }
  return nome;
}

// ======================================================
// 3. EVENTOS EM TEMPO REAL (GATILHO ONEDIT INTEGRADO)
// ======================================================
function onEdit(e) {
  if (!e || !e.range) return;
  try {
    const sh = e.range.getSheet(); 
    const name = sh.getName(); 
    const h = getHeaderMap(sh);
    const row = e.range.getRow(); 
    const col = e.range.getColumn();
    if (row < 2) return;

    if (name === SETUP.ABAS.BRIEFING) {
      let colHeader = sh.getRange(1, col).getValue().toString().trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_");
      let colDestino = null;
      
      if (colHeader.includes("REEL") && !colHeader.includes("APROVACAO")) {
        colDestino = h['APROVACAO_REEL'] || 17;
      } else if (colHeader.includes("CARROSSEL") && !colHeader.includes("APROVACAO")) {
        colDestino = h['APROVACAO_CARROSSEL'] || 18;
      } else if ((colHeader.includes("STORIES_1") || (colHeader.includes("STORIES") && !colHeader.includes("2"))) && !colHeader.includes("APROVACAO")) {
        colDestino = h['APROVACAO_STORIES_1'] || h['APROVACAO_STORIES'] || 19;
      } else if (colHeader.includes("STORIES_2") && !colHeader.includes("APROVACAO")) {
        colDestino = h['APROVACAO_STORIES_2'] || 20;
      }
      
      if (colDestino) {
        let valorCelula = sh.getRange(row, col).getValue();
        if (valorCelula instanceof Date || (typeof valorCelula === 'string' && valorCelula.trim() !== "")) {
          let calcAprovacao = calcularDataAprovacao(valorCelula);
          if (calcAprovacao !== "") sh.getRange(row, colDestino).setValue(calcAprovacao);
        } else if (valorCelula === "") {
          sh.getRange(row, colDestino).clearContent();
        }
        invalidarCacheAba(CHAVE_CACHE_BRIEFING);
      } else if (h['RESUMO_MES'] && col === h['RESUMO_MES']) {
        // Edição direta no resumo do mês: invalida o cache geral da BRIEFING
        // e também o cache dedicado do banner do Portal (getResumoMes), que
        // é o único ponto de leitura que não depende só de CHAVE_CACHE_BRIEFING.
        invalidarCacheAba(CHAVE_CACHE_BRIEFING);
        let mesEditado = h['MES'] ? String(sh.getRange(row, h['MES']).getValue() || "").trim().toUpperCase() : "";
        if (mesEditado) invalidarCacheResumoMes(mesEditado);
      }
      return;
    }

    if (name === SETUP.ABAS.ATIVACOES) {
      if (col === h['STATUS_CONTEUDO'] && String(e.value).toLowerCase().includes("postado")) {
        arquivarGenerico(SETUP.ABAS.ATIVACOES, SETUP.ABAS.HISTORICO_CONT, 'STATUS_CONTEUDO', ['postado'], true);
        ordenarAbaAtivacoesCronologico();
        return;
      }
      
      if (col === h['DATA_ATIVACAO']) {
        let valorCelula = sh.getRange(row, col).getValue();
        
        if (valorCelula instanceof Date || (typeof valorCelula === 'string' && valorCelula.trim() !== "")) {
          let calcAprovacao = calcularDataAprovacao(valorCelula);
          if (calcAprovacao !== "") sh.getRange(row, h['DATA_APROVACAO']).setValue(calcAprovacao);
          
          let influKey = String(sh.getRange(row, h['INFLU_KEY']).getValue()).trim().toUpperCase();
          let mesRef = String(sh.getRange(row, h['MES_REFERENCIA']).getValue()).trim().toUpperCase();
          let formato = String(sh.getRange(row, h['FORMATO']).getValue()).trim().toUpperCase();
          
          let briefSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETUP.ABAS.BRIEFING);
          if (briefSheet) {
            let hBrief = getHeaderMap(briefSheet);
            let dataBrief = briefSheet.getDataRange().getValues();
            
            let idxBrief = dataBrief.findIndex(rb => {
              let rowInflu = (hBrief['INFLU_KEY'] ? rb[hBrief['INFLU_KEY']-1] : rb[0]) || "";
              let rowMes = (hBrief['MES'] ? rb[hBrief['MES']-1] : rb[2]) || "";
              return String(rowInflu).trim().toUpperCase() === influKey && String(rowMes).trim().toUpperCase() === mesRef;
            });
            
            if (idxBrief !== -1) {
              let rowTargetBrief = idxBrief + 1;
              if (formato === 'STORIES') formato = 'STORIES_1'; 
              let nomeColBrief = 'APROVACAO_' + formato; 
              
              let colBriefDest = hBrief[nomeColBrief];
              if (!colBriefDest) {
                if (formato.includes("REEL")) colBriefDest = 17;
                else if (formato.includes("CARROSSEL")) colBriefDest = 18;
                else if (formato.includes("STORIES_1") || formato === "STORIES") colBriefDest = 19;
                else if (formato.includes("STORIES_2")) colBriefDest = 20;
              }
              
              if (colBriefDest && calcAprovacao !== "") {
                briefSheet.getRange(rowTargetBrief, colBriefDest).setValue(calcAprovacao);
                invalidarCacheAba(CHAVE_CACHE_BRIEFING);
              }
            }
          }
        } else if (valorCelula === "") {
          sh.getRange(row, h['DATA_APROVACAO']).clearContent();
        }
        
        SpreadsheetApp.flush();
        ordenarAbaAtivacoesCronologico();
      }
    }
    
    if (name === SETUP.ABAS.BASE) {
      // Qualquer edição manual na BASE (feita pelo time do ERP direto na
      // planilha) invalida o cache de leitura usado pelo Portal, pra não
      // servir dado desatualizado até o TTL de 90s expirar sozinho.
      invalidarCacheBase();
      if (col === 1) organizarEPintarBase();
      if ((h['CEP'] && col === h['CEP']) || (h['NUMERO'] && col === h['NUMERO']) || (h['COMPLEMENTO'] && col === h['COMPLEMENTO'])) {
        preencherEnderecoPorCEP(sh, row, sh.getRange(row, h['CEP']).getValue(), h);
      }
    }
    
    if (name === SETUP.ABAS.PAGAMENTOS && col === h['STATUS_PAGAMENTO'] && String(e.value).toLowerCase().includes("pago")) {
      arquivarGenerico(SETUP.ABAS.PAGAMENTOS, SETUP.ABAS.HISTORICO_PAG, 'STATUS_PAGAMENTO', ['pago'], true);
    }
    
    if (name === SETUP.ABAS.FLUXO && h['RASTREIO'] && col === h['RASTREIO'] && String(e.value).includes("http")) {
      if(!sh.getRange(row, h['DATA_DE_ENVIO']).getValue()) {
        sh.getRange(row, h['DATA_DE_ENVIO']).setValue(Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy"));
      }
    }
  } catch(err) {}
}

// ======================================================
// 4. REGRAS DE DATA AUTOMÁTICA
// ======================================================
function calcularDataAprovacao(dataInput) {
  let d;
  if (dataInput instanceof Date) {
    d = new Date(dataInput.getTime());
  } else if (typeof dataInput === 'string' && dataInput.length >= 8) {
    let partes = dataInput.split(/[\/\-\s]/);
    if (partes.length >= 3 && partes[2].length >= 4) {
      d = new Date(partes[2].substring(0,4), parseInt(partes[1]) - 1, parseInt(partes[0]));
    } else {
      d = new Date(dataInput);
    }
  } else {
    return "";
  }
  if (isNaN(d.getTime())) return "";
  
  d.setDate(d.getDate() - 7);
  
  if (d.getDay() === 5) {
    d.setDate(d.getDate() + 3);
  } else if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1); 
  } else if (d.getDay() === 6) {
    d.setDate(d.getDate() + 2); 
  } 
  
  d.setHours(12, 0, 0, 0);
  return d;
}

function ordenarAbaAtivacoesCronologico() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETUP.ABAS.ATIVACOES);
  if (!sh || sh.getLastRow() < 2) return;
  const h = getHeaderMap(sh);
  if (h['DATA_ATIVACAO']) {
    sh.getRange(2, 1, sh.getLastRow()-1, sh.getLastColumn()).sort({column: h['DATA_ATIVACAO'], ascending: true});
    invalidarCacheAba(CHAVE_CACHE_ATIVACOES); // sort muda a posição das linhas: cache do Portal fica desatualizado
  }
}

// ======================================================
// 5. FINANCEIRO: GERADOR DE LANÇAMENTOS ADICIONAIS
// ======================================================
function lancarPagamentosDoMes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const baseSheet = ss.getSheetByName(SETUP.ABAS.BASE);
  const pagSheet = ss.getSheetByName(SETUP.ABAS.PAGAMENTOS);

  const res = ui.prompt(' Pagamentos Avulsos', 'Qual o mês de referência para essa injeção de pagamentos? (Ex: AGOSTO)', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() != ui.Button.OK) return;
  const mesTarget = res.getResponseText().trim().toUpperCase();
  if (!mesTarget) return;

  const hBase = getHeaderMap(baseSheet);
  const dataBase = baseSheet.getDataRange().getValues();
  let influON = dataBase.filter(r => isInfluenciadoraOn(r[0]));

  if (influON.length === 0) return ui.alert('Nenhuma influenciadora ativa (ON) para faturar.');

  let lPag = [];
  influON.forEach(r => {
    let nome = r[hBase['INFLU_KEY']-1];
    let valor = r[hBase['VALOR_TOTAL']-1];
    let pix = r[hBase['CHAVE_PIX']-1];
    if (nome) lPag.push([nome, mesTarget, valor, pix, 'em aberto', '', '']);
  });

  if (lPag.length > 0) {
    pagSheet.getRange(pagSheet.getLastRow() + 1, 1, lPag.length, 7).setValues(lPag);
    invalidarCacheAba(CHAVE_CACHE_PAGAMENTOS);
    ui.alert('Concluído', `${lPag.length} pagamentos avulsos de ${mesTarget} foram lançados!`, ui.ButtonSet.OK);
  }
}

// ======================================================
// 6. ADOBE/WHATSAPP: MENSAGENS E RELATÓRIOS
// ======================================================
function gerarSolicitacaoPagamento() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sh.getName() !== SETUP.ABAS.PAGAMENTOS) { SpreadsheetApp.getUi().alert("Atenção", "Use esta função apenas dentro da aba PAGAMENTOS.", SpreadsheetApp.getUi().ButtonSet.OK); return; }
  const h = getHeaderMap(sh); 
  const r = sh.getActiveCell().getRow();
  if (r < 2) return;
  
  const valor = sh.getRange(r, h['VALOR_TOTAL']).getValue();
  const vF = (typeof valor === 'number') ? "R$ " + valor.toFixed(2).replace('.', ',') : valor;
  const msg = `*SOLICITAÇÃO DE PAGAMENTO*\n*Ref:* ${sh.getRange(r, h['MES_REFERENCIA']).getValue()}\n*Influ:* ${formatarTitleCase(sh.getRange(r, h['INFLU_KEY']).getValue())}\n*Valor:* ${vF}\n*PIX:* ${sh.getRange(r, h['CHAVE_PIX']).getValue()}`;
  
  sh.getRange(r, h['MENSAGEM_PIX']).setValue(msg);
  invalidarCacheAba(CHAVE_CACHE_PAGAMENTOS);
  SpreadsheetApp.getUi().prompt('Copie a mensagem de cobrança (Ctrl+C ou Cmd+C):', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function gerarMensagemRevisao() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  
  if (sh.getName() !== SETUP.ABAS.FLUXO) {
    ui.alert("Atenção", "Use esta função dentro da aba " + SETUP.ABAS.FLUXO + ".", ui.ButtonSet.OK);
    return;
  }
  
  const row = sh.getActiveCell().getRow();
  if (row < 2) return;
  const influName = sh.getRange(row, 1).getValue();
  if (!influName) return;
  
  const shBase = ss.getSheetByName(SETUP.ABAS.BASE);
  const hBase = getHeaderMap(shBase);
  const dataBase = shBase.getDataRange().getValues();
  const rowBase = dataBase.find(r => String(r[hBase['INFLU_KEY'] - 1]).toUpperCase().trim() === String(influName).toUpperCase().trim());
  
  if (!rowBase) return;
  
  const endereco = rowBase[hBase['INFLUENCIADORA_ENDERECO'] - 1] || "NÃO CADASTRADO";
  const pix = rowBase[hBase['CHAVE_PIX'] - 1] || "NÃO CADASTRADA";
  const msg = `*CONFIRMAÇÃO DE DADOS (ESTÚDIO ELÃ)*\n\nOi, linda! Tudo bem? Passando para confirmar seus dados para o envio dos looks e agendamento financeiro:\n\n *ENDEREÇO:* ${endereco}\n *CHAVE PIX:* ${pix}\n\nEstá certinho? Conseguir me dar o ok? `;
  
  ui.prompt('Copie a mensagem abaixo para enviar no WhatsApp:', msg, ui.ButtonSet.OK);
}

// ======================================================
// 7. INTEGRAÇÕES: LOOKS EXTERNOS & TRACKING DE LOGÍSTICA
// ======================================================
function sincronizarLooks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shBase = ss.getSheetByName(SETUP.ABAS.BASE);
  const shB = ss.getSheetByName(SETUP.ABAS.BRIEFING);
  if (!shBase || !shB) return;
  const hBase = getHeaderMap(shBase);
  const hB = getHeaderMap(shB);
  const dataBase = shBase.getDataRange().getValues();
  const dataB = shB.getDataRange().getValues();
  let contagemSucesso = 0;

  dataBase.forEach(r => {
    let url = r[hBase['INFLU_SHEET_URL']-1];
    if (url && url.toString().includes("docs.google.com") && isInfluenciadoraOn(r[0])) {
      try {
        let ssExterno = SpreadsheetApp.openByUrl(url.toString().trim());
        let shLooks = ssExterno.getSheetByName("LOOKS BRIEFING") || ssExterno.getSheets()[0];
        if (!shLooks) return;
        
        let dadosEx = shLooks.getDataRange().getValues();
        let looks = {};
        dadosEx.forEach(l => { if(l[0]) looks[l[0].toString().toUpperCase().trim()] = l[1]; });
        
        dataB.forEach((rb, idx) => {
          if (rb[0] === r[hBase['INFLU_KEY']-1]) {
            let row = idx + 1;
            if(hB['LOOK_REEL']) shB.getRange(row, hB['LOOK_REEL']).setValue(formatarTitleCase(looks['LOOK_REEL']));
            if(hB['LOOK_CARROSSEL']) shB.getRange(row, hB['LOOK_CARROSSEL']).setValue(formatarTitleCase(looks['LOOK_CARROSSEL']));
            if(hB['LOOK_STORIES_1']) shB.getRange(row, hB['LOOK_STORIES_1']).setValue(formatarTitleCase(looks['LOOK_STORIES_1']));
            if(hB['LOOK_STORIES_2']) shB.getRange(row, hB['LOOK_STORIES_2']).setValue(formatarTitleCase(looks['LOOK_STORIES_2']));
            contagemSucesso++;
          }
        });
      } catch(e){}
    }
  });
  invalidarCacheAba(CHAVE_CACHE_BRIEFING);
  ss.toast(` Sucesso: ${contagemSucesso} influenciadoras tiveram seus looks updated!`);
}

function atualizarRastreiosBRComerce() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SETUP.ABAS.FLUXO);
  if(!sh || sh.getLastRow() < 2) return;
  
  const h = getHeaderMap(sh);
  if(!h['RASTREIO'] || !h['STATUS_LOGISTICA']) return;
  
  const data = sh.getDataRange().getValues();
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    let link = data[i][h['RASTREIO']-1];
    if (!link || !String(link).includes("rastreio/")) continue;
    
    let codigo = String(link).split("rastreio/")[1].trim();
    try {
      let res = UrlFetchApp.fetch("https://api.brcomerce.com.br/tracking/" + codigo, {muteHttpExceptions: true});
      if (res.getResponseCode() === 200) {
        let json = JSON.parse(res.getContentText());
        if (json.correiosRastreio && json.correiosRastreio.length > 0) {
          let last = json.correiosRastreio[json.correiosRastreio.length - 1];
          let txtStatus = (last[0] === "OUTROS" || !last[0]) ? last[1].descricao.toUpperCase() : last[0].toUpperCase();
          
          sh.getRange(i+1, h['STATUS_LOGISTICA']).setValue(txtStatus);
          count++;
        }
      }
    } catch(e) {}
  }
  
  SpreadsheetApp.flush(); 
  arquivarFluxo(true); 
  const hF = getHeaderMap(sh);
  if (hF['DATA_DE_ENVIO']) sh.getRange(2, 1, sh.getLastRow()-1, sh.getLastColumn()).sort({column: hF['DATA_DE_ENVIO'], ascending: true});
  
  ss.toast(` API BRComerce: ${count} objetos rastreados.`, "Logística");
}

// ======================================================
// 8. MOTOR DE ARQUIVAMENTO E LIMPEZA (HISTÓRICOS)
// ======================================================
function menuArquivarTudo() { 
  let m1 = arquivarGenerico(SETUP.ABAS.ATIVACOES, SETUP.ABAS.HISTORICO_CONT, 'STATUS_CONTEUDO', ['postado'], false);
  let m2 = arquivarGenerico(SETUP.ABAS.PAGAMENTOS, SETUP.ABAS.HISTORICO_PAG, 'STATUS_PAGAMENTO', ['pago'], false);
  let m3 = arquivarGenerico(SETUP.ABAS.FLUXO, SETUP.ABAS.HISTORICO_FLUXO, 'STATUS_LOGISTICA', ['entregue', 'entrega realizada', 'objeto entregue'], false);

  let total = m1 + m2 + m3;
  if(total > 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast(` Faxina concluída! ${total} linhas arquivadas.`, "Limpeza");
  } else {
    SpreadsheetApp.getUi().alert("Nenhum item com status concluído foi encontrado para arquivamento.");
  }
}

function arquivarFluxo(silent) {
  arquivarGenerico(SETUP.ABAS.FLUXO, SETUP.ABAS.HISTORICO_FLUXO, 'STATUS_LOGISTICA', ['entregue', 'entrega realizada', 'objeto entregue'], silent);
}

function arquivarGenerico(orig, dest, colNome, chavesArray, silent) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shO = ss.getSheetByName(orig); const shD = ss.getSheetByName(dest);
  if(!shO || !shD || shO.getLastRow() < 2) return 0;
  
  SpreadsheetApp.flush(); 
  const h = getHeaderMap(shO);
  if(!h[colNome]) return 0; 
  
  const data = shO.getDataRange().getValues();
  let movidos = 0;

  for(let i = data.length - 1; i >= 1; i--) {
    let valorCelula = data[i][h[colNome]-1] ? String(data[i][h[colNome]-1]).toLowerCase() : "";
    let deveArquivar = chavesArray.some(k => valorCelula.includes(k.toLowerCase()));

    if(deveArquivar) {
      let linha = [...data[i]];
      if(h['DATA_PAGAMENTO'] && !linha[h['DATA_PAGAMENTO']-1]) {
        linha[h['DATA_PAGAMENTO']-1] = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm");
      }
      linha.push(Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm")); 
      
      shD.appendRow(linha); 
      shO.deleteRow(i + 1); 
      movidos++;
    }
  }
  if (movidos > 0) {
    invalidarCachePorAba(orig);
    invalidarCachePorAba(dest);
  }
  if(movidos > 0 && !silent) ss.toast(`${movidos} itens salvos no histórico de ${orig}.`);
  return movidos;
}

// ======================================================
// 9. AUTOMATIZAÇÃO DE CADASTROS (WEBHOOK FORM / ONFORMSUBMIT)
// ======================================================
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetBase = ss.getSheetByName(SETUP.ABAS.BASE); 
    const sheetCadastros = ss.getSheetByName(SETUP.ABAS.CADASTROS);
    if (!sheetBase || !sheetCadastros) return;
    
    const hBase = getHeaderMap(sheetBase); 
    const hCad = getHeaderMap(sheetCadastros);
    let rowData = (e && e.range) ? e.range.getValues()[0] : sheetCadastros.getRange(sheetCadastros.getLastRow(), 1, 1, sheetCadastros.getLastColumn()).getValues()[0];
    const nova = new Array(sheetBase.getLastColumn()).fill("");
    
    const getV = (str) => { for(let k in hCad) if(k.includes(str)) return rowData[hCad[k]-1] ? String(rowData[hCad[k]-1]).trim() : ""; return ""; };
    
    let [vN, vE, vP, vR, vC, vCep, vNum, vComp] = [getV("CHAMADA"), getV("MAIL"), getV("PIX"), getV("RAZAO"), getV("CNPJ"), getV("CEP"), getV("NUMERO"), getV("COMPLEMENTO")];
    
    if(hBase['INFLU_KEY']) nova[hBase['INFLU_KEY']-1] = vN.toUpperCase();
    if(hBase['EMAIL']) nova[hBase['EMAIL']-1] = vE.toLowerCase();
    if(hBase['INFLUENCIADORA_RAZAO_SOCIAL']) nova[hBase['INFLUENCIADORA_RAZAO_SOCIAL']-1] = vR.toUpperCase();
    if(hBase['INFLUENCIADORA_CNPJ']) nova[hBase['INFLUENCIADORA_CNPJ']-1] = vC ? "'" + vC : "";
    if(hBase['CHAVE_PIX']) nova[hBase['CHAVE_PIX']-1] = vP ? "'" + vP : "";
    
    let rawCep = vCep ? vCep.replace(/\D/g, "") : "";
    if(hBase['CEP']) nova[hBase['CEP']-1] = rawCep ? "'" + rawCep : "";
    if(hBase['NUMERO']) nova[hBase['NUMERO']-1] = vNum ? "'" + vNum : "";
    if(hBase['COMPLEMENTO']) nova[hBase['COMPLEMENTO']-1] = vComp;
    
    if (rawCep && rawCep.length === 8) {
      try {
        let resCep = JSON.parse(UrlFetchApp.fetch("https://brasilapi.com.br/api/cep/v1/" + rawCep, {muteHttpExceptions: true}).getContentText());
        if (resCep.city) {
          if(hBase['RUA']) nova[hBase['RUA']-1] = (resCep.street || "").toUpperCase();
          if(hBase['BAIRRO']) nova[hBase['BAIRRO']-1] = (resCep.neighborhood || "").toUpperCase();
          if(hBase['CIDADE']) nova[hBase['CIDADE']-1] = (resCep.city || "").toUpperCase();
          if(hBase['UF']) nova[hBase['UF']-1] = (resCep.state || "").toUpperCase();
          
          if(hBase['INFLUENCIADORA_ENDERECO']) {
            let cepF = rawCep.substring(0,5) + "-" + rawCep.substring(5);
            let compT = vComp ? ", " + vComp : "";
            nova[hBase['INFLUENCIADORA_ENDERECO']-1] = `${resCep.street || ""}, ${vNum || "S/N"}${compT}, ${resCep.neighborhood || ""} - ${resCep.city || ""}/${resCep.state || ""}, ${cepF}`.toUpperCase();
          }
        }
      } catch(err){}
    }
    nova[0] = "OFF"; 
    sheetBase.appendRow(nova);
    organizarEPintarBase();
  } catch(fatalError) {}
}

// ======================================================
// 12. METODOS AUXILIARES (ENDEREÇOS, CORES E CONVERSÕES)
// ======================================================
function atualizarEnderecoLinhaSelecionada() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  if (sh.getName() !== SETUP.ABAS.BASE) { ui.alert('Use esta função apenas na aba BASE DE DADOS.'); return; }
  const row = sh.getActiveCell().getRow();
  if (row < 2) return;
  const h = getHeaderMap(sh);
  if(!h['CEP']) return;
  preencherEnderecoPorCEP(sh, row, sh.getRange(row, h['CEP']).getValue(), h);
  SpreadsheetApp.flush();
  ui.alert('Endereço atualizado com sucesso via BrasilAPI!');
}

function preencherEnderecoPorCEP(sh, row, cep, h) {
  if (!cep) return;
  let cleanCep = cep.toString().replace(/\D/g, "");
  if (cleanCep.length !== 8) return;

  try {
    let resp = UrlFetchApp.fetch("https://brasilapi.com.br/api/cep/v1/" + cleanCep, {muteHttpExceptions: true});
    if (resp.getResponseCode() === 200) {
      let res = JSON.parse(resp.getContentText());
      if (res.city) {
        let num = h['NUMERO'] ? sh.getRange(row, h['NUMERO']).getValue() : "S/N";
        if (!num) num = "S/N";
        let comp = h['COMPLEMENTO'] ? sh.getRange(row, h['COMPLEMENTO']).getValue() : "";

        if(h['RUA']) sh.getRange(row, h['RUA']).setValue((res.street || "").toUpperCase());
        if(h['BAIRRO']) sh.getRange(row, h['BAIRRO']).setValue((res.neighborhood || "").toUpperCase());
        if(h['CIDADE']) sh.getRange(row, h['CIDADE']).setValue((res.city || "").toUpperCase());
        if(h['UF']) sh.getRange(row, h['UF']).setValue((res.state || "").toUpperCase());

        let cepFormatado = cleanCep.substring(0,5) + "-" + cleanCep.substring(5);
        let compText = comp ? ", " + comp : "";
        let full = `${res.street || ""}, ${num}${compText}, ${res.neighborhood || ""} - ${res.city || ""}/${res.state || ""}, ${cepFormatado}`;

        if(h['INFLUENCIADORA_ENDERECO']) sh.getRange(row, h['INFLUENCIADORA_ENDERECO']).setValue(full.toUpperCase());

        // Cobre onEdit() (CEP/NUMERO/COMPLEMENTO) e o menu manual
        // atualizarEnderecoLinhaSelecionada() — os dois pontos do ERP que
        // chamam esta função.
        invalidarCacheBase();
      }
    }
  } catch(e) {}
}

function organizarEPintarBase() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETUP.ABAS.BASE);
  if (!sh || sh.getLastRow() < 2) return;
  const h = getHeaderMap(sh);

  // Cobre onFormSubmit() (cadastro novo) e onEdit() (col 1) — os dois
  // pontos que chamam esta função — sem depender só da invalidação feita
  // no próprio onEdit.
  invalidarCacheBase();
  
  // Ordenação: Status (ON no topo) e depois Nome da Influenciadora
  sh.getRange(2, 1, sh.getLastRow()-1, sh.getLastColumn()).sort([
    {column: 1, ascending: false}, 
    {column: h['INFLU_KEY'] || 2, ascending: true}
  ]);
  
  SpreadsheetApp.flush();
  
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  const data = sh.getRange(2, 1, lastRow - 1, 1).getValues(); // Pega a Coluna A (Status)
  
  // Mapeia as cores linha por linha
  const colors = data.map(r => {
    const color = isInfluenciadoraOn(r[0]) ? SETUP.CORES.ON : SETUP.CORES.OFF;
    return new Array(lastCol).fill(color);
  });
  
  sh.getRange(2, 1, colors.length, lastCol).setBackgrounds(colors);
}

// Única fonte de verdade para "influenciadora ativa": cobre o checkbox
// (true), o texto "ON" e o caso em que a coluna guarda "TRUE" como string
// em vez de booleano. Usada por login (WebApp.js), pelos geradores de mês/
// pagamento e pela pintura da BASE — antes cada um repetia sua própria
// variação dessa checagem.
function isInfluenciadoraOn(valor) {
  if (valor === true) return true;
  const s = (valor || "").toString().trim().toUpperCase();
  return s === 'ON' || s === 'TRUE';
}

function getHeaderMap(sh) {
  const m = {};
  sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].forEach((v, i) => {
    if (v) m[v.toString().trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_")] = i + 1;
  });
  return m;
}

function textToNumber(t) {
  if (t === "" || t === null || t === undefined) return 0;
  if (typeof t === 'number') return Math.floor(t);
  let s = String(t).toLowerCase().trim();
  let apenasNumeros = s.replace(/\D/g, "");
  if (apenasNumeros !== "") return parseInt(apenasNumeros, 10);
  if (s.includes("um")) return 1;
  if (s.includes("dois")) return 2;
  if (s.includes("tres") || s.includes("três")) return 3;
  if (s.includes("quatro")) return 4;
  if (s.includes("cinco")) return 5;
  return 0;
}

function formatarTitleCase(t) { 
  return (!t) ? "" : String(t).toLowerCase().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : "").join(' '); 
}

function setupERP() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert("Setup Estrutural", "Deseja verificar e criar abas de histórico faltantes?", ui.ButtonSet.YES_NO);
  if(response !== ui.Button.YES) return;

  const estruturas = [
    { nome: SETUP.ABAS.FLUXO, colunas: ["INFLU_KEY", "ENDERECO", "STATUS_REVISAO", "MES_REFERENCIA", "RASTREIO", "DATA_DE_ENVIO", "STATUS_LOGISTICA"] },
    { nome: SETUP.ABAS.HISTORICO_FLUXO, colunas: ["INFLU_KEY", "ENDERECO", "STATUS_REVISAO", "MES_REFERENCIA", "RASTREIO", "DATA_DE_ENVIO", "STATUS_LOGISTICA", "DATA_ARQUIVAMENTO"] },
    { nome: SETUP.ABAS.ATIVACOES, colunas: ["INFLU_KEY", "MES_REFERENCIA", "FORMATO", "DATA_APROVACAO", "DATA_ATIVACAO", "STATUS_CONTEUDO", "LINK_ARQUIVO"] },
    { nome: SETUP.ABAS.HISTORICO_CONT, colunas: ["INFLU_KEY", "MES_REFERENCIA", "FORMATO", "DATA_APROVACAO", "DATA_ATIVACAO", "STATUS_CONTEUDO", "LINK_ARQUIVO", "DATA_ARQUIVAMENTO"] },
    { nome: SETUP.ABAS.PAGAMENTOS, colunas: ["INFLU_KEY", "MES_REFERENCIA", "VALOR_TOTAL", "CHAVE_PIX", "STATUS_PAGAMENTO", "DATA_PAGAMENTO", "MENSAGEM_PIX"] },
    { nome: SETUP.ABAS.HISTORICO_PAG, colunas: ["INFLU_KEY", "MES_REFERENCIA", "VALOR_TOTAL", "CHAVE_PIX", "STATUS_PAGAMENTO", "DATA_PAGAMENTO", "MENSAGEM_PIX", "DATA_ARQUIVAMENTO"] }
  ];

  estruturas.forEach(est => {
    let sheet = ss.getSheetByName(est.nome);
    if (!sheet) {
      sheet = ss.insertSheet(est.nome);
      sheet.getRange(1, 1, 1, est.colunas.length).setValues([est.colunas]).setBackground(SETUP.CORES.CABECALHO).setFontColor(SETUP.CORES.TEXTO_CABECALHO).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });
  ui.alert("Sucesso", "Todas as abas operacionais e históricos mapeados foram verificados!", ui.ButtonSet.OK);
}

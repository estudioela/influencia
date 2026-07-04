/**
 * ERP INFLUÊNCIA 360º - V 6.2 (SISTEMA DE GESTÃO INTEGRADA)
 * Módulos: Automação Baseada em Eventos, Espelhamento Ativações -> Briefing, Menu Otimizado, Inteligência de CEP, Rastreio e Sincronização Portal Reversa.
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
      .addItem(" 4. Estruturar Planilha (Setup Inicial)", "setupERP")
      .addSeparator()
      .addItem(" 5. Editar Dados da Influenciadora (Sidebar)", "abrirSidebarInflu")
      .addItem(" 6. Lançar Pagamento Extra/UGC (Sidebar)", "abrirSidebarPagamento"))

    .addSeparator()

    .addSubMenu(ui.createMenu(" 🖥️ Portal de Apoio")
      .addItem(" 1. Enviar Dados para o Portal (Ativações/Pagamentos)", "lancarParaPortal")
      .addItem(" 2. Puxar Atualizações de Cadastro do Portal", "puxarAtualizacoesDoPortal")
      .addSeparator()
      .addItem(" 3. Puxar Base de Dados da Mãe (Sync Down)", "puxarDadosDaMae")
      .addItem(" 4. Puxar Históricos da Mãe (Sync Down)", "puxarHistoricosDaMae")
      .addItem(" 5. Testar Conexão com a Mãe", "testarConexaoMae")
      .addSeparator()
      .addItem(" 6. Abrir Portal (Modal)", "abrirPortalModal")
    )

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
  const briefingSheet = ss.getSheetByName(SETUP.ABAS.BRIEFING);
  const ativSheet = ss.getSheetByName(SETUP.ABAS.ATIVACOES);
  const fluxoSheet = ss.getSheetByName(SETUP.ABAS.FLUXO);
  const pagSheet = ss.getSheetByName(SETUP.ABAS.PAGAMENTOS);

  const res = ui.prompt(' Iniciar Planejameno Mensal', 'Digite o nome do MÊS da Nova Campanha? (Ex: AGOSTO)\nNota: O Briefing atual será limpo para o rascunho.', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() != ui.Button.OK) return;
  const mesTarget = res.getResponseText().trim().toUpperCase();
  if (!mesTarget) return;

  const hBase = getHeaderMap(baseSheet);
  const hBrief = getHeaderMap(briefingSheet);
  let baseData = baseSheet.getDataRange().getValues();
  
  let influON = baseData.filter(r => r[0] === true || r[0].toString().toUpperCase() === 'ON').map(r => ({
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

  const lastRowBrief = briefingSheet.getLastRow();
  if (lastRowBrief > 1) {
    briefingSheet.getRange(2, 1, lastRowBrief - 1, briefingSheet.getLastColumn()).clearContent();
  }

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

  ordenarAbaAtivacoesCronologico();
  ui.alert('Sucesso!', `O planejamento de ${mesTarget} foi gerado!\n\n- Briefing limpo e preparado.\n- Linhas de Ativações, Fluxo e Pagamentos injetadas com sucesso!`, ui.ButtonSet.OK);
}

// Cria um trigger instalável onOpen para garantir que o menu seja registrado
function createOnOpenTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Remove triggers onOpen existentes deste projeto para evitar duplicatas
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    try {
      if (t.getHandlerFunction && t.getHandlerFunction() === 'onOpen' && t.getEventType && t.getEventType() === ScriptApp.EventType.ON_OPEN) {
        ScriptApp.deleteTrigger(t);
      }
    } catch (e) {}
  });

  ScriptApp.newTrigger('onOpen').forSpreadsheet(ss).onOpen().create();
  SpreadsheetApp.getUi().alert('Trigger onOpen instalável criado. Recarregue a planilha para ver o menu.');
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
  let influON = dataBase.filter(r => r[0] === true || r[0].toString().toUpperCase() === 'ON');

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
    if (url && url.toString().includes("docs.google.com") && (r[0] === true || r[0].toString().toUpperCase() === 'ON')) {
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
// 11. NOVO MOTOR DE SINCRONIZAÇÃO REVERSA (PORTAL -> MÃE)
// ======================================================
function puxarAtualizacoesDoPortal() {
  const ssMae = SpreadsheetApp.getActiveSpreadsheet();
  const shMae = ssMae.getSheetByName(SETUP.ABAS.BASE); 
  
  if (!shMae) {
    ssMae.toast("Aba 'BASE DE DADOS' não encontrada na planilha mãe.", "Erro");
    return;
  }
  
  let ssPortal;
  try {
    // Conexão fixa com a sua Planilha de Apoio externa
    ssPortal = SpreadsheetApp.openById("1289Eu3hk-L3GnHbNwAfxgHy3UfVnjfB0LnlHEMoOg1M");
  } catch(e) {
    ssMae.toast("Não foi possível conectar à planilha do Portal. Verifique as permissões de acesso.", "Erro");
    return;
  }
  
  // Procura pela aba ativa de cadastros no Portal
  const shPortal = ssPortal.getSheetByName("BASE DE APOIO") || ssPortal.getSheetByName("CADASTROS") || ssPortal.getSheets()[0];
  if (!shPortal || shPortal.getLastRow() < 2) {
    ssMae.toast("Aba do portal vazia ou sem registros para processar.", "Aviso");
    return;
  }
  
  const hMae = getHeaderMap(shMae);
  const hPortal = getHeaderMap(shPortal);
  const dataMae = shMae.getDataRange().getValues();
  const dataPortal = shPortal.getDataRange().getValues();
  
  let contagemAtualizacoes = 0;
  let contagemNovos = 0;
  ssMae.toast("Buscando atualizações e novos cadastros no portal...", "Integração");
  
  // Mapeia as influenciadoras que já existem na Planilha Mãe
  const mapaMae = {};
  for (let i = 1; i < dataMae.length; i++) {
    let chave = dataMae[i][hMae['INFLU_KEY'] - 1];
    if (chave) {
      mapaMae[chave.toString().trim().toUpperCase()] = i + 1;
    }
  }
  
  // Campos operacionais que serão importados/sincronizados
  const camposParaSync = [
    'INFLUENCIADORA_RAZAO_SOCIAL',
    'EMAIL',
    'CHAVE_PIX',
    'INFLUENCIADORA_CNPJ',
    'CEP',
    'NUMERO',
    'COMPLEMENTO'
  ];
  
  for (let j = 1; j < dataPortal.length; j++) {
    // Fallback inteligente: aceita colunas chamadas 'INFLU_KEY', 'NOME' ou a primeira coluna da planilha de apoio
    let chavePortal = dataPortal[j][hPortal['INFLU_KEY'] - 1] || dataPortal[j][hPortal['NOME'] - 1] || dataPortal[j][0];
    if (!chavePortal) continue;
    
    let chaveLookup = chavePortal.toString().trim().toUpperCase();
    let linhaMae = mapaMae[chaveLookup];
    
    if (linhaMae) {
      // --------------------------------------------------
      // REVISÃO DE EXISTENTE: Atualiza dados caso tenham mudado
      // --------------------------------------------------
      let mudouAlgo = false;
      let mudouEndereco = false;
      
      camposParaSync.forEach(campo => {
        if (hPortal[campo] && hMae[campo]) {
          let valorPortal = dataPortal[j][hPortal[campo] - 1];
          let valorMae = dataMae[linhaMae - 1][hMae[campo] - 1];
          
          if (valorPortal !== undefined && valorPortal.toString().trim() !== valorMae.toString().trim()) {
            shMae.getRange(linhaMae, hMae[campo]).setValue(valorPortal);
            mudouAlgo = true;
            
            if (campo === 'CEP' || campo === 'NUMERO' || campo === 'COMPLEMENTO') {
              mudouEndereco = true;
            }
          }
        }
      });
      
      if (mudouAlgo) {
        contagemAtualizacoes++;
        
        // Se alterou o bloco de endereço, limpa o composto e força revalidação da API
        if (mudouEndereco) {
          if (hMae['INFLUENCIADORA_ENDERECO']) shMae.getRange(linhaMae, hMae['INFLUENCIADORA_ENDERECO']).setValue("");
          let novoCep = shMae.getRange(linhaMae, hMae['CEP']).getValue();
          preencherEnderecoPorCEP(shMae, linhaMae, novoCep, hMae);
        }
      }
      
    } else {
      // --------------------------------------------------
      // NOVO CADASTRO: Cria uma nova linha na planilha mãe
      // --------------------------------------------------
      const novaLinha = new Array(shMae.getLastColumn()).fill("");
      
      // 1. Define o status padrão de segurança como OFF
      novaLinha[0] = "OFF"; 
      
      // 2. Insere o Nome/Chave da Influenciadora
      if (hMae['INFLU_KEY']) {
        novaLinha[hMae['INFLU_KEY'] - 1] = chaveLookup;
      }
      
      // 3. Mapeia e injeta as informações dinamicamente nas colunas certas da Mãe
      camposParaSync.forEach(campo => {
        if (hPortal[campo] && hMae[campo]) {
          novaLinha[hMae[campo] - 1] = dataPortal[j][hPortal[campo] - 1];
        }
      });
      
      // 4. Salva a nova linha de forma limpa na base
      shMae.appendRow(novaLinha);
      let ultimaLinhaMae = shMae.getLastRow();
      
      // 5. Dispara a API de CEP imediatamente para estruturar o endereço completo da nova linha
      if (hMae['CEP']) {
        let novoCep = shMae.getRange(ultimaLinhaMae, hMae['CEP']).getValue();
        preencherEnderecoPorCEP(shMae, ultimaLinhaMae, novoCep, hMae);
      }
      
      contagemNovos++;
    }
  }
  
  // --------------------------------------------------
  // RETORNO VISUAL AO USUÁRIO
  // --------------------------------------------------
  if (contagemAtualizacoes > 0 || contagemNovos > 0) {
    SpreadsheetApp.flush();
    organizarEPintarBase(); // Executa ordenação alfabética e formatação de cores (Verde/Vermelho)
    
    let relatório = "Sincronização com o Portal Concluída!\n\n";
    if (contagemNovos > 0) relatório += `🔹 ${contagemNovos} novos cadastros adicionados.\n`;
    if (contagemAtualizacoes > 0) relatório += `🔄 ${contagemAtualizacoes} fichas de dados atualizadas.\n`;
    
    SpreadsheetApp.getUi().alert("Sincronização Reversa", relatório, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert("Portal Sincronizado", "Nenhum dado novo ou alteração foi encontrada no Portal.", SpreadsheetApp.getUi().ButtonSet.OK);
  }
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
      }
    }
  } catch(e) {}
}

function organizarEPintarBase() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETUP.ABAS.BASE);
  if (!sh || sh.getLastRow() < 2) return; 
  const h = getHeaderMap(sh);
  
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
    const status = String(r[0]).toUpperCase().trim();
    const isON = (status === 'ON' || status === 'TRUE' || r[0] === true);
    const color = isON ? SETUP.CORES.ON : SETUP.CORES.OFF;
    return new Array(lastCol).fill(color);
  });
  
  sh.getRange(2, 1, colors.length, lastCol).setBackgrounds(colors);
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
    { nome: SETUP.ABAS.ATIVACOES, colunas: ["INFLU_KEY", "MES_REFERENCIA", "FORMATO", "DATA_APROVACAO", "DATA_ATIVACAO", "STATUS_CONTEUDO"] },
    { nome: SETUP.ABAS.HISTORICO_CONT, colunas: ["INFLU_KEY", "MES_REFERENCIA", "FORMATO", "DATA_APROVACAO", "DATA_ATIVACAO", "STATUS_CONTEUDO", "DATA_ARQUIVAMENTO"] },
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
  Logger.log("setupERP concluído: estrutura inicial criada");
  ui.alert("Sucesso", "Todas as abas operacionais e históricos mapeados foram verificados!", ui.ButtonSet.OK);
}

// ======================================================
// FASE 1: CONFIGURAÇÃO VISUAL REMOTA DO PORTAL
// ======================================================
function configurarVisualDoPortal() {
  const ssMae = SpreadsheetApp.getActiveSpreadsheet();
  const PORTAL_ID = "1289Eu3hk-L3GnHbNwAfxgHy3UfVnjfB0LnlHEMoOg1M";
  
  let ssPortal;
  try {
    ssPortal = SpreadsheetApp.openById(PORTAL_ID);
  } catch(e) {
    ssMae.toast("❌ Erro: Não foi possível acessar o Portal. Verifique as permissões.", "Fase 1");
    return;
  }
  
  let shPortal = ssPortal.getSheetByName("BASE DE APOIO") || ssPortal.getSheets()[0];
  let headers = shPortal.getRange(1, 1, 1, shPortal.getLastColumn() || 1).getValues()[0];
  
  // 1. Localizar colunas chave e criar a coluna de Confirmação, se não existir
  let colPix = headers.indexOf("CHAVE_PIX") + 1;
  let colCep = headers.indexOf("CEP") + 1;
  let colRevisados = headers.indexOf("DADOS_REVISADOS") + 1;
  
  if (colRevisados === 0) {
    colRevisados = headers.length + 1;
    shPortal.getRange(1, colRevisados).setValue("DADOS_REVISADOS")
      .setBackground("#cd0005").setFontColor("#ffffff").setFontWeight("bold");
  }
  
  const maxRows = shPortal.getMaxRows();
  if (maxRows > 1) {
    // 2. Inserir Caixas de Seleção (Checkboxes) na coluna inteira
    shPortal.getRange(2, colRevisados, maxRows - 1, 1).insertCheckboxes();
  }
  
  // 3. Inserir Notas de Responsabilidade nos Cabeçalhos
  if (colPix > 0) {
    shPortal.getRange(1, colPix).setNote("ATENÇÃO: Revise sua chave com cuidado.\nPagamentos enviados para chaves incorretas cadastradas aqui não poderão ser estornados.");
  }
  if (colCep > 0) {
    shPortal.getRange(1, colCep).setNote("ATENÇÃO: A alteração de endereço implica no redirecionamento imediato dos próximos envios logísticos.");
  }
  shPortal.getRange(1, colRevisados).setNote("Obrigatório: Marque esta caixa para confirmar que os dados sensíveis (PIX/Endereço) estão corretos para a próxima campanha.");
  
  // 4. Configurar Alerta Visual (Formatação Condicional)
  shPortal.clearConditionalFormatRules(); 
  
  const converterParaLetra = (coluna) => {
    let temp, letra = '';
    while (coluna > 0) {
      temp = (coluna - 1) % 26;
      letra = String.fromCharCode(temp + 65) + letra;
      coluna = (coluna - temp - 1) / 26;
    }
    return letra;
  };
  
  if (colPix > 0 && colRevisados > 0) {
    let letraPix = converterParaLetra(colPix);
    let letraRev = converterParaLetra(colRevisados);
    
    // Regra injetada usando sintaxe pt-BR nativa conforme padrão local
    const formulaRegra = `=E($${letraPix}2<>""; $${letraRev}2=FALSO)`;
    const rangeAlerta = shPortal.getRange(2, colPix, maxRows - 1, 1); 
    
    let regraAlerta = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(formulaRegra)
      .setBackground("#F4CCCC") // Fundo vermelho
      .setFontColor("#CC0000") // Texto vermelho escuro
      .setRanges([rangeAlerta])
      .build();
      
    let regrasAtuais = shPortal.getConditionalFormatRules();
    regrasAtuais.push(regraAlerta);
    shPortal.setConditionalFormatRules(regrasAtuais);
  }
  
  SpreadsheetApp.flush();
  ssMae.toast("🚀 Fase 1 Concluída: Layout, checkboxes e alertas aplicados no Portal com sucesso!", "Setup Automatizado");
}
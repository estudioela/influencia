/**
 * SincronizarPortal.gs
 * Vai no editor da PLANILHA MAE (JESCRI INFLUENCIA 360).
 *
 * Copia os dados da mae para a planilha de apoio, que alimenta o portal.
 * Cria as abas que faltam na apoio (inclusive BRIEFING) com cabecalho.
 * Independente do codigo existente. Nao altera nada da mae.
 *
 * Uso: rodar sincronizarPortal() manualmente ou por gatilho de tempo.
 */

// ID da planilha de apoio (destino).
const APOIO_ID = "1289Eu3hk-L3GnHbNwAfxgHy3UfVnjfB0LnlHEMoOg1M";

/**
 * Mapa de sincronizacao.
 * origem: nome da aba na planilha mae.
 * destino: nome da aba na planilha de apoio.
 * A ordem e o conteudo das colunas sao copiados exatamente como estao na mae.
 */
const SYNC_MAP = [
  { origem: "BASE DE DADOS",            destino: "BASE DE APOIO",           isBase: true  },
  { origem: "ATIVAÇÕES",                destino: "ATIVAÇÕES",               isBase: false },
  { origem: "PAGAMENTOS",               destino: "PAGAMENTOS",              isBase: false },
  { origem: "BRIEFING",                 destino: "BRIEFING",                isBase: false },
  { origem: "HISTÓRICO DE CONTEÚDOS",   destino: "HISTÓRICO DE CONTEÚDOS",  isBase: false },
  { origem: "HISTÓRICO DE PAGAMENTOS",  destino: "HISTÓRICO DE PAGAMENTOS", isBase: false }
];

function sincronizarPortal() {
  const mae = SpreadsheetApp.getActiveSpreadsheet();
  const apoio = SpreadsheetApp.openById(APOIO_ID);

  const relatorio = [];

  SYNC_MAP.forEach(function(item) {
    const abaOrigem = mae.getSheetByName(item.origem);
    if (!abaOrigem) {
      relatorio.push("PULADA (origem nao encontrada): " + item.origem);
      return;
    }

    // Le todos os valores da aba de origem (inclui cabecalho na linha 1).
    const valores = abaOrigem.getDataRange().getValues();
    if (valores.length === 0) {
      relatorio.push("PULADA (origem vazia): " + item.origem);
      return;
    }

    // Garante que a aba de destino existe na apoio.
    let abaDestino = apoio.getSheetByName(item.destino);
    if (!abaDestino) {
      abaDestino = apoio.insertSheet(item.destino);
    }

    if (item.isBase) {
      sincronizarBase(abaOrigem, abaDestino, valores);
      relatorio.push("BASE sincronizada (preserva edicoes do portal): " + item.destino);
    } else {
      // Espelho simples: limpa o destino e regrava tudo.
      abaDestino.clearContents();
      abaDestino
        .getRange(1, 1, valores.length, valores[0].length)
        .setValues(valores);
      relatorio.push("Sincronizada " + (valores.length - 1) + " linhas: " + item.destino);
    }
  });

  Logger.log(relatorio.join("\n"));
  return relatorio.join("\n");
}

/**
 * Sincronizacao da BASE com preservacao das edicoes vindas do portal.
 *
 * A influenciadora edita cadastro no portal, que escreve na BASE DE APOIO.
 * A sincronizacao reversa (na mae) leva isso de volta para a BASE DE DADOS.
 * Se este espelho sobrescrevesse a BASE DE APOIO cegamente, poderia apagar
 * uma edicao feita pela influenciadora antes de ela ser puxada de volta.
 *
 * Para evitar isso: a BASE so recebe linhas NOVAS (cupons que ainda nao
 * existem na apoio) e mantem intactas as linhas ja existentes. Assim os
 * dados cadastrais que vem da mae entram, mas nada digitado no portal e
 * perdido. A atualizacao de valores existentes fica a cargo da sua
 * sincronizacao reversa, que ja trata isso.
 */
function sincronizarBase(abaOrigem, abaDestino, valoresOrigem) {
  const cabecalho = valoresOrigem[0];
  const COL_CUPOM = 3; // C, mesma posicao na mae e na apoio

  // Se o destino esta vazio, grava tudo de uma vez (primeira carga).
  const dadosDestino = abaDestino.getDataRange().getValues();
  if (dadosDestino.length <= 1) {
    abaDestino.clearContents();
    abaDestino
      .getRange(1, 1, valoresOrigem.length, cabecalho.length)
      .setValues(valoresOrigem);
    return;
  }

  // Monta o conjunto de cupons ja presentes no destino.
  const cuponsDestino = {};
  for (let i = 1; i < dadosDestino.length; i++) {
    const cupom = (dadosDestino[i][COL_CUPOM - 1] || "").toString().trim().toUpperCase();
    if (cupom) cuponsDestino[cupom] = true;
  }

  // Coleta apenas as linhas da origem cujo cupom ainda nao existe no destino.
  const novas = [];
  for (let i = 1; i < valoresOrigem.length; i++) {
    const cupom = (valoresOrigem[i][COL_CUPOM - 1] || "").toString().trim().toUpperCase();
    if (cupom && !cuponsDestino[cupom]) {
      novas.push(valoresOrigem[i]);
    }
  }

  if (novas.length > 0) {
    const primeiraLinhaLivre = abaDestino.getLastRow() + 1;
    abaDestino
      .getRange(primeiraLinhaLivre, 1, novas.length, cabecalho.length)
      .setValues(novas);
  }
}
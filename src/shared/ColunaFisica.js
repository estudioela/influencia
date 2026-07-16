/**
 * ColunaFisica — utilitários compartilhados de acesso físico às abas,
 * usados pelas ACLs (Contrato §7: uma ACL por aba, resolução SEMPRE por
 * cabeçalho, nunca por índice fixo).
 *
 * Extraído para eliminar a duplicação byte-idêntica (exceto o nome da aba
 * física na mensagem de erro) que existia como métodos locais
 * `resolvedorDeColuna`/`dataParaCanonica`/`reescrever` repetidos em
 * BloqueioACL, BriefingACL, DocumentoACL, ParceiraACL, EntregaACL, SessaoACL,
 * EnvioACL e ColaboracaoMensalACL (FASE 1 pós-SPECs: eliminar código
 * duplicado). Mesmo padrão de extração já aplicado a `erroComCodigo`
 * (ver src/shared/ErroComCodigo.js).
 *
 * Camada: shared (infraestrutura transversal). Sem regra de negócio, sem
 * acesso a Sheets/HTTP além do `sheet` recebido por parâmetro.
 */

/**
 * @param {Array} cabecalho
 * @param {string} nomeDaAba nome físico da aba, para a mensagem de erro.
 * @returns {function(string): number} resolve nome → índice, fail-fast.
 */
function criarResolvedorDeColuna(cabecalho, nomeDaAba) {
  return (nome) => {
    const indice = cabecalho.indexOf(nome);
    if (indice === -1) {
      throw new Error("Coluna '" + nome + "' ausente em '" + nomeDaAba + "'.");
    }
    return indice;
  };
}

/**
 * Coage valor cru de célula de data → Date canônica (fail-fast).
 * @param {*} cru valor lido da célula.
 * @param {string} colunaNome para a mensagem de erro.
 * @param {string} nomeDaAba nome físico da aba, para a mensagem de erro.
 * @returns {Date|null} null quando a célula está vazia.
 */
function celulaParaData(cru, colunaNome, nomeDaAba) {
  if (cru == null || cru === '') {
    return null;
  }
  const data =
    typeof cru.getTime === 'function' ? new Date(cru.getTime()) : new Date(cru);
  if (isNaN(data.getTime())) {
    throw new Error(
      "Valor de data inválido em '" + nomeDaAba + "'." + colunaNome + ": '" + cru + "'."
    );
  }
  return data;
}

/**
 * Regrava a aba inteira (cabeçalho + linhas) num único setValues.
 * @param {object} sheet Sheet do SpreadsheetApp (ou fake com a mesma API).
 * @param {Array} cabecalho
 * @param {Array[]} linhas
 */
function reescreverAba(sheet, cabecalho, linhas) {
  const matriz = [cabecalho].concat(linhas);
  sheet.clearContents();
  sheet.getRange(1, 1, matriz.length, cabecalho.length).setValues(matriz);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { criarResolvedorDeColuna, celulaParaData, reescreverAba };
}

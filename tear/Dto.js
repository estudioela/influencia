/**
 * Serialização de valor de célula → DTO, compartilhada pelos Services.
 *
 * Os quatro Services repetiam `_texto`/`_data` idênticos. A planilha devolve
 * `Date` para coluna de data e `''` para célula vazia; `google.script.run` não
 * preserva `Date` de forma confiável, então tudo sai como string.
 *
 * `function` declarations, não classe nem `const`: sofrem hoisting e não
 * dependem da ordem de carga entre arquivos do Apps Script (CLAUDE.md §13),
 * como Planilha.js e Senha.js.
 */

function textoDeCelula(valor) {
  return valor === null || valor === undefined ? '' : String(valor);
}

/** `Date` vira ISO 8601; qualquer outro valor cai em `textoDeCelula`. */
function dataIsoDeCelula(valor) {
  if (valor instanceof Date) {
    return valor.toISOString();
  }

  return textoDeCelula(valor);
}

/**
 * Hash de senha da V2.
 *
 * A V1 usa o prefixo do CNPJ como senha — baixa entropia por design, e o CNPJ
 * fica em texto puro na planilha. A V2 abandona isso: guarda `salt$hash`, com
 * salt aleatório por parceira, e nunca a senha.
 *
 * `function` declarations, não classe: sofrem hoisting e não dependem da ordem
 * de carga entre arquivos do Apps Script (CLAUDE.md §13).
 */

const SEPARADOR_SENHA = '$';

function _bytesParaHex(bytes) {
  return bytes
    .map(byte => ('0' + (byte & 0xff).toString(16)).slice(-2))
    .join('');
}

function calcularHashDeSenha(salt, senha) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + senha,
    Utilities.Charset.UTF_8
  );

  return _bytesParaHex(digest);
}

/** Salt novo a cada senha: duas parceiras com a mesma senha têm hashes distintos. */
function criarSenhaHash(senha) {
  const salt = Utilities.getUuid();

  return salt + SEPARADOR_SENHA + calcularHashDeSenha(salt, senha);
}

/**
 * Compara em tempo constante. Um `===` de string sai no primeiro byte diferente,
 * e a diferença de tempo vaza informação sobre o hash correto.
 */
function _comparacaoEmTempoConstante(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let diferenca = 0;

  for (let i = 0; i < a.length; i++) {
    diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diferenca === 0;
}

function senhaConfere(senha, armazenado) {
  if (!senha || !armazenado) {
    return false;
  }

  const partes = String(armazenado).split(SEPARADOR_SENHA);

  if (partes.length !== 2 || !partes[0] || !partes[1]) {
    return false;
  }

  return _comparacaoEmTempoConstante(calcularHashDeSenha(partes[0], senha), partes[1]);
}

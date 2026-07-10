/**
 * Sessões e bloqueio por tentativas, sobre `CacheService`.
 *
 * Existe para que o `AuthService` não toque infraestrutura direto — mesma razão
 * pela qual o `AtivacaoService` não toca `SpreadsheetApp`. Trocar `CacheService`
 * por outra coisa na V3 muda só este arquivo.
 *
 * Todo TTL é explícito, como exige o CLAUDE.md §11.2.
 */
const SESSAO_TTL_SEGUNDOS = 21600;      // 6h, como na V1
const LOGIN_MAX_TENTATIVAS = 5;
const LOGIN_BLOQUEIO_SEGUNDOS = 900;    // 15min

class SessaoRepository {
  constructor(cache) {
    this.cache = cache || CacheService.getScriptCache();
  }

  /**
   * O token é um bearer puro: quem o tiver, é a parceira. Por isso ele mora em
   * `sessionStorage` no cliente, nunca em `localStorage` — persistir além da aba
   * transforma token esquecido em sequestro de sessão.
   */
  criar(idInfluenciadora) {
    const token = Utilities.getUuid();

    this.cache.put(this._chaveSessao(token), String(idInfluenciadora), SESSAO_TTL_SEGUNDOS);

    return token;
  }

  /** Renovação deslizante: a sessão morre por inatividade, não por relógio. */
  resolver(token) {
    if (!token) {
      return null;
    }

    const chave = this._chaveSessao(token);
    const idInfluenciadora = this.cache.get(chave);

    if (!idInfluenciadora) {
      return null;
    }

    this.cache.put(chave, idInfluenciadora, SESSAO_TTL_SEGUNDOS);

    return idInfluenciadora;
  }

  destruir(token) {
    if (token) {
      this.cache.remove(this._chaveSessao(token));
    }
  }

  estaBloqueado(cupom) {
    return this._tentativas(cupom) >= LOGIN_MAX_TENTATIVAS;
  }

  registrarTentativa(cupom) {
    const total = this._tentativas(cupom) + 1;

    // O TTL é reiniciado a cada tentativa: insistir mantém o bloqueio de pé.
    this.cache.put(this._chaveTentativas(cupom), String(total), LOGIN_BLOQUEIO_SEGUNDOS);

    return total;
  }

  limparTentativas(cupom) {
    this.cache.remove(this._chaveTentativas(cupom));
  }

  _tentativas(cupom) {
    const bruto = this.cache.get(this._chaveTentativas(cupom));

    return bruto ? Number(bruto) : 0;
  }

  _chaveSessao(token) {
    return 'sessao:' + token;
  }

  _chaveTentativas(cupom) {
    return 'tentativas:' + String(cupom).trim().toUpperCase();
  }
}

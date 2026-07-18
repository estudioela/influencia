const { loadGas } = require('./helpers/gasHarness');

// AdaptadorOAuthGoogle (ADR-013, condição 4): URL de autorização e troca do
// authorization code por id_token, fail-closed, sobre fake de UrlFetchApp
// (mesmo princípio de test/cep-adapter.test.js).

const CLIENT_ID = 'tear-v2.apps.googleusercontent.com';
const CLIENT_SECRET = 'segredo-teste';
const REDIRECT_URI = 'https://script.google.com/macros/s/FAKE/exec';

function montar(respostaToken) {
  const chamadas = [];
  const gas = loadGas(['src/adapters/AdaptadorOAuthGoogle.js'], {
    UrlFetchApp: {
      fetch: (url, opcoes) => {
        chamadas.push({ url, opcoes });
        return respostaToken;
      },
    },
  });
  return {
    adaptador: new gas.AdaptadorOAuthGoogle(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI),
    chamadas,
  };
}

describe('AdaptadorOAuthGoogle (ADR-013, condição 4)', () => {
  test('construirUrlDeAutorizacao monta a URL do endpoint oficial com state', () => {
    const { adaptador } = montar();
    const url = adaptador.construirUrlDeAutorizacao('state-1');
    expect(url.startsWith('https://accounts.google.com/o/oauth2/v2/auth?')).toBe(true);
    expect(url).toContain('client_id=' + encodeURIComponent(CLIENT_ID));
    expect(url).toContain('redirect_uri=' + encodeURIComponent(REDIRECT_URI));
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=' + encodeURIComponent('openid email profile'));
    expect(url).toContain('state=state-1');
    expect(url).not.toContain(CLIENT_SECRET); // segredo jamais na URL
  });

  test('trocarCodigoPorIdToken faz POST correto e devolve o id_token', () => {
    const { adaptador, chamadas } = montar({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ id_token: 'id-token-1' }),
    });
    expect(adaptador.trocarCodigoPorIdToken('code-1')).toBe('id-token-1');
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0].url).toBe('https://oauth2.googleapis.com/token');
    expect(chamadas[0].opcoes.method).toBe('post');
    expect(chamadas[0].opcoes.muteHttpExceptions).toBe(true);
    expect(chamadas[0].opcoes.payload).toEqual({
      grant_type: 'authorization_code',
      code: 'code-1',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });
  });

  test.each([
    [
      'código vazio',
      () => montar(),
      '',
    ],
    [
      'HTTP != 200',
      () => montar({ getResponseCode: () => 400, getContentText: () => '{}' }),
      'code-1',
    ],
    [
      'JSON malformado',
      () => montar({ getResponseCode: () => 200, getContentText: () => 'x' }),
      'code-1',
    ],
    [
      'resposta sem id_token',
      () => montar({ getResponseCode: () => 200, getContentText: () => '{}' }),
      'code-1',
    ],
  ])('fail-closed: %s lança ERR_AUTH_INVALID_TOKEN', (_nome, montarCaso, code) => {
    const { adaptador } = montarCaso();
    expect(() => adaptador.trocarCodigoPorIdToken(code)).toThrow(
      expect.objectContaining({ codigo: 'ERR_AUTH_INVALID_TOKEN' })
    );
  });

  test('mensagem de erro nunca contém o code nem o client_secret', () => {
    const { adaptador } = montar({ getResponseCode: () => 400, getContentText: () => '{}' });
    expect.assertions(2);
    try {
      adaptador.trocarCodigoPorIdToken('code-super-secreto');
    } catch (erro) {
      expect(erro.message).not.toContain('code-super-secreto');
      expect(erro.message).not.toContain(CLIENT_SECRET);
    }
  });
});

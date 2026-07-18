const { loadGas } = require('./helpers/gasHarness');

// GuardiaoDeEstadoOAuth (ADR-013, condição 3): state anti-CSRF com consumo
// único sobre um cache injetado (fake em memória — o CacheService real só
// aparece na composição do entrypoint).

function fakeCache() {
  const dados = {};
  return {
    put: (k, v, ttl) => {
      dados[k] = { v, ttl };
    },
    get: (k) => (dados[k] ? dados[k].v : null),
    remove: (k) => {
      delete dados[k];
    },
    _dados: dados,
  };
}

function montar() {
  const gas = loadGas(['src/adapters/GuardiaoDeEstadoOAuth.js']);
  const cache = fakeCache();
  return { guardiao: new gas.GuardiaoDeEstadoOAuth(cache), cache };
}

describe('GuardiaoDeEstadoOAuth (ADR-013, anti-CSRF)', () => {
  test('registrar grava o state com TTL de 600s', () => {
    const { guardiao, cache } = montar();
    guardiao.registrar('state-1');
    const chaves = Object.keys(cache._dados);
    expect(chaves).toHaveLength(1);
    expect(chaves[0]).toContain('state-1');
    expect(cache._dados[chaves[0]].ttl).toBe(600);
  });

  test('validarEConsumir aceita uma única vez (consumo)', () => {
    const { guardiao } = montar();
    guardiao.registrar('state-1');
    expect(guardiao.validarEConsumir('state-1')).toBe(true);
    expect(guardiao.validarEConsumir('state-1')).toBe(false);
  });

  test('state desconhecido, vazio ou null é recusado', () => {
    const { guardiao } = montar();
    expect(guardiao.validarEConsumir('inexistente')).toBe(false);
    expect(guardiao.validarEConsumir('')).toBe(false);
    expect(guardiao.validarEConsumir(null)).toBe(false);
    expect(guardiao.validarEConsumir(undefined)).toBe(false);
  });

  test('states diferentes não interferem entre si', () => {
    const { guardiao } = montar();
    guardiao.registrar('state-a');
    guardiao.registrar('state-b');
    expect(guardiao.validarEConsumir('state-a')).toBe(true);
    expect(guardiao.validarEConsumir('state-b')).toBe(true);
  });
});

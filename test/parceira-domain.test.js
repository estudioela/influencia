const { loadGas } = require('./helpers/gasHarness');

describe('Entidade Parceira', () => {
  test('deve carregar a entidade Parceira', () => {
    const gas = loadGas(['src/domain/Parceira.js']);

    expect(gas.Parceira).toBeDefined();
  });
});

test('deve criar uma parceira ativa', () => {
  const gas = loadGas(['src/domain/Parceira.js']);

  const parceira = new gas.Parceira('Maria');

  expect(parceira.nome).toBe('Maria');
  expect(parceira.ativa).toBe(true);
});
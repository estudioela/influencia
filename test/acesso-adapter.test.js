const { loadGas } = require('./helpers/gasHarness');

// Stub da porta do Cadastro (ParceiraACL.obterAcessoLegado) em memória:
// o adaptador legado só conhece essa projeção {parceiraId, cnpj}.
function stubParceiraACL(acessoPorCupom) {
  return {
    obterAcessoLegado: (identificador) => acessoPorCupom[identificador] || null,
  };
}

function carregar(stub) {
  const gas = loadGas([
    'src/modulos/Autenticacao.js',
  ]);
  return { gas, verificador: new gas.VerificadorDeCredencialLegado(stub) };
}

describe('VerificadorDeCredencialLegado — RN-16 (segredo = 5 primeiros dígitos do CNPJ)', () => {
  test('credencial válida com CNPJ mascarado resolve a parceiraId (máscara ignorada)', () => {
    const { gas, verificador } = carregar(
      stubParceiraACL({ CUPOMMARIA: { parceiraId: 'Maria', cnpj: '12.345.678/0001-90' } })
    );

    const parceiraId = verificador.verificar(new gas.Credencial('CUPOMMARIA', '12345'));

    expect(parceiraId).toBe('Maria');
  });

  test('parceira inexistente devolve null (fail-closed)', () => {
    const { gas, verificador } = carregar(stubParceiraACL({}));

    expect(verificador.verificar(new gas.Credencial('CUPOMANA', '12345'))).toBeNull();
  });

  test('CNPJ com menos de 5 dígitos devolve null (fail-closed)', () => {
    const { gas, verificador } = carregar(
      stubParceiraACL({ CUPOMMARIA: { parceiraId: 'Maria', cnpj: '12.34' } })
    );

    expect(verificador.verificar(new gas.Credencial('CUPOMMARIA', '12345'))).toBeNull();
  });

  test('CNPJ vazio devolve null (fail-closed)', () => {
    const { gas, verificador } = carregar(
      stubParceiraACL({ CUPOMMARIA: { parceiraId: 'Maria', cnpj: '' } })
    );

    expect(verificador.verificar(new gas.Credencial('CUPOMMARIA', '12345'))).toBeNull();
  });

  test('segredo divergente devolve null (fail-closed)', () => {
    const { gas, verificador } = carregar(
      stubParceiraACL({ CUPOMMARIA: { parceiraId: 'Maria', cnpj: '12.345.678/0001-90' } })
    );

    expect(verificador.verificar(new gas.Credencial('CUPOMMARIA', '99999'))).toBeNull();
  });
});

const { loadGas } = require('./helpers/gasHarness');

function carregar() {
  return loadGas(['src/shared/Nucleo.js', 'src/modulos/Autenticacao.js']);
}

// Projeção mínima de Sessao para o stub do service: o controller só lê
// token.valor, parceiraId e expiraEm.
const EXPIRA_EM = new Date('2026-07-16T18:00:00.000Z');
const sessaoStub = {
  token: { valor: 'tok-1' },
  parceiraId: 'Maria',
  expiraEm: EXPIRA_EM,
};

function erroComCodigo(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

describe('AcessoController — envelope padrão (§3.3) e contrato de erros (§17)', () => {
  test('entrar com sucesso devolve envelope ok com projeção token/parceiraId/expiraEm ISO', () => {
    const gas = carregar();
    const controller = new gas.AcessoController({ entrar: () => sessaoStub });

    const resposta = controller.entrar({ identificador: 'CUPOMMARIA', segredo: '12345' });

    expect(resposta.success).toBe(true);
    expect(resposta.data).toEqual({
      token: 'tok-1',
      parceiraId: 'Maria',
      expiraEm: EXPIRA_EM.toISOString(),
    });
  });

  test('renovar com sucesso devolve a mesma projeção serializável (nunca a instância)', () => {
    const gas = carregar();
    const controller = new gas.AcessoController({ renovar: () => sessaoStub });

    const resposta = controller.renovar({ token: 'tok-1' });

    expect(resposta.success).toBe(true);
    expect(resposta.data.expiraEm).toBe(EXPIRA_EM.toISOString());
  });

  test('falha AC-01 (credencial inválida) propaga codigo e mensagem no envelope', () => {
    const gas = carregar();
    const controller = new gas.AcessoController({
      entrar: () => {
        throw erroComCodigo('AC-01', 'Credencial inválida.');
      },
    });

    const resposta = controller.entrar({});

    expect(resposta.success).toBe(false);
    expect(resposta.error).toEqual({ codigo: 'AC-01', mensagem: 'Credencial inválida.' });
  });

  test('falha AC-02 (acesso bloqueado, CB-01/CB-03) propaga o codigo', () => {
    const gas = carregar();
    const controller = new gas.AcessoController({
      entrar: () => {
        throw erroComCodigo('AC-02', 'Acesso bloqueado. Tente novamente mais tarde.');
      },
    });

    const resposta = controller.entrar({});

    expect(resposta.success).toBe(false);
    expect(resposta.error.codigo).toBe('AC-02');
  });

  test('falha AC-03 (sessão expirada, CB-02) propaga o codigo em renovar', () => {
    const gas = carregar();
    const controller = new gas.AcessoController({
      renovar: () => {
        throw erroComCodigo('AC-03', 'Sessão expirada. Autentique-se novamente.');
      },
    });

    const resposta = controller.renovar({ token: 'tok-1' });

    expect(resposta.success).toBe(false);
    expect(resposta.error.codigo).toBe('AC-03');
  });

  // §17: código só para erros do contrato — infraestrutura nunca vira AC-01.
  test('erro sem codigo (infraestrutura) devolve envelope só com mensagem', () => {
    const gas = carregar();
    const controller = new gas.AcessoController({
      entrar: () => {
        throw new Error('Falha inesperada de infraestrutura.');
      },
    });

    const resposta = controller.entrar({});

    expect(resposta.success).toBe(false);
    expect(resposta.error.codigo).toBeUndefined();
    expect(resposta.error.mensagem).toMatch(/inesperada/);
  });

  test('sair com sucesso devolve envelope ok vazio (logout §9)', () => {
    const gas = carregar();
    const chamadas = [];
    const controller = new gas.AcessoController({
      sair: (dados) => {
        chamadas.push(dados);
      },
    });

    const resposta = controller.sair({ token: 'tok-1' });

    expect(resposta.success).toBe(true);
    expect(resposta.data).toEqual({});
    expect(chamadas).toEqual([{ token: 'tok-1' }]);
  });
});

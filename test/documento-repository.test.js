const { loadGas } = require('./helpers/gasHarness');

function carregar() {
  return loadGas([, 'src/modulos/Documento.js']);
}

// Fake da porta da ACL do Documento: upsert pela identidade e leitura completa.
function fakeAcl() {
  let registros = [];
  return {
    get registros() {
      return registros;
    },
    substituir(documento) {
      registros = registros
        .filter(
          (d) =>
            !(
              d.parceiraId === documento.parceiraId &&
              d.tipo === documento.tipo &&
              d.mesReferencia === documento.mesReferencia
            )
        )
        .concat([documento]);
    },
    listarTodos() {
      return registros.slice();
    },
  };
}

describe('DocumentoRepository — persistência da referência (SPEC-023 §14.2, CB-03)', () => {
  test('salvar delega o upsert à ACL e obterPor devolve o documento gerado', () => {
    const gas = carregar();
    const repo = new gas.DocumentoRepository(fakeAcl());

    repo.salvar(new gas.Documento('Maria', 'Contrato', null).gerar('v1'));
    repo.salvar(new gas.Documento('Maria', 'Contrato', null).gerar('v2'));

    const salvo = repo.obterPor('Maria', 'Contrato', null);
    expect(salvo.referencia).toBe('v2');
  });

  test('obterPor sem documento devolve null', () => {
    const gas = carregar();
    const repo = new gas.DocumentoRepository(fakeAcl());

    expect(repo.obterPor('Maria', 'BriefingFormal', '2026-07')).toBeNull();
  });
});

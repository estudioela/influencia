const { loadGas } = require('./helpers/gasHarness');

const CABECALHO = ['INFLU_KEY', 'TIPO_DOCUMENTO', 'MES_REFERENCIA', 'REFERENCIA'];

// Fake da aba DOCUMENTOS com a API exercida pela ACL (padrão EnvioACL):
// leitura completa + reescrita da aba num único setValues.
function fakeAba() {
  let rows = [CABECALHO.slice()];
  return {
    get _rows() {
      return rows;
    },
    getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()) }),
    clearContents() {
      rows = [];
    },
    getRange(linha, _coluna, numLinhas, numColunas) {
      return {
        setValues(valores) {
          if (valores.length !== numLinhas || valores[0].length !== numColunas) {
            throw new Error('fake: range incompatível.');
          }
          valores.forEach((v, i) => {
            rows[linha - 1 + i] = v.slice();
          });
        },
      };
    },
  };
}

function carregar(sheet) {
  const gas = loadGas([, 'src/modulos/Documento.js']);
  return { gas, acl: new gas.DocumentoACL(sheet) };
}

describe('DocumentoACL — substituir e reidratar (SPEC-023 §9, CB-03)', () => {
  test('substituir grava por cabeçalho e regenerar substitui a linha anterior', () => {
    const aba = fakeAba();
    const { gas, acl } = carregar(aba);

    acl.substituir(new gas.Documento('Maria', 'Contrato', null).gerar('v1'));
    acl.substituir(new gas.Documento('Maria', 'Contrato', null).gerar('v2'));

    const linhas = aba._rows.slice(1);
    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toEqual(['Maria', 'CONTRATO', '', 'v2']);
  });

  test('identidades distintas (tipo × competência) convivem; listarTodos reidrata Gerado', () => {
    const aba = fakeAba();
    const { gas, acl } = carregar(aba);
    acl.substituir(new gas.Documento('Maria', 'Contrato', null).gerar('c1'));
    acl.substituir(new gas.Documento('Maria', 'BriefingFormal', '2026-07').gerar('b1'));

    const documentos = acl.listarTodos();

    expect(documentos).toHaveLength(2);
    const briefingFormal = documentos.find((d) => d.tipo === 'BriefingFormal');
    expect(briefingFormal.mesReferencia).toBe('2026-07');
    expect(briefingFormal.estaGerado()).toBe(true);
    expect(briefingFormal.referencia).toBe('b1');
  });

  test('TIPO_DOCUMENTO cru desconhecido falha barulhento (fail-fast, ADR-001)', () => {
    const aba = fakeAba();
    const { acl } = carregar(aba);
    aba.getRange(2, 1, 1, 4).setValues([['Maria', 'RECIBO', '', 'x']]);

    expect(() => acl.listarTodos()).toThrow(/RECIBO/);
  });
});

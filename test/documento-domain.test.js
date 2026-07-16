const { loadGas } = require('./helpers/gasHarness');

function carregar() {
  return loadGas(['src/domain/CamposDeMesclagem.js', 'src/domain/Documento.js']);
}

// Conjunto completo de campos de mesclagem (SPEC-023 §6.1).
function camposValidos(extra) {
  return Object.assign(
    {
      razaoSocial: 'Maria Conteúdo LTDA',
      cnpj: '12.345.678/0001-99',
      endereco: 'Rua das Flores, 123 — São Paulo/SP',
      quantidades: { Reels: '2 reels', Stories: '4 stories' },
      valorNumero: 3500,
      valorExtenso: 'três mil e quinhentos reais',
      canaisUsoImagem: 'Instagram e site da marca',
      prazoUsoImagem: '12 meses',
      cidadeAssinatura: 'São Paulo',
      dataAssinatura: '2026-07-16',
    },
    extra || {}
  );
}

describe('CamposDeMesclagem — VO de mesclagem (SPEC-023 §6.1, DC-02)', () => {
  test('nasce imutável com todos os campos de mesclagem', () => {
    const gas = carregar();

    const campos = new gas.CamposDeMesclagem(camposValidos());

    expect(campos.razaoSocial).toBe('Maria Conteúdo LTDA');
    expect(campos.valorExtenso).toBe('três mil e quinhentos reais');
    expect(Object.isFrozen(campos)).toBe(true);
  });

  test('campo obrigatório ausente falha barulhento com DC-02 e o nome do campo', () => {
    const gas = carregar();

    expect(() => new gas.CamposDeMesclagem(camposValidos({ cnpj: '' }))).toThrow(
      /DC-02.*cnpj/i
    );
    expect(
      () => new gas.CamposDeMesclagem(camposValidos({ valorNumero: NaN }))
    ).toThrow(/DC-02/);
  });
});

describe('Documento — máquina de estados (SPEC-023 §9, CB-03)', () => {
  test('nasce NaoGerado e gerar() o leva a Gerado com a referência', () => {
    const gas = carregar();

    const documento = new gas.Documento('Maria', 'Contrato', null);
    expect(documento.estado).toBe('NaoGerado');
    expect(documento.estaGerado()).toBe(false);

    documento.gerar('contrato-maria-v1');

    expect(documento.estado).toBe('Gerado');
    expect(documento.estaGerado()).toBe(true);
    expect(documento.referencia).toBe('contrato-maria-v1');
  });

  test('a única transição é NaoGerado → Gerado; gerar de novo falha barulhento', () => {
    const gas = carregar();
    const documento = new gas.Documento('Maria', 'Contrato', null).gerar('v1');

    expect(() => documento.gerar('v2')).toThrow();
  });

  test('tipo fechado: desconhecido falha; BriefingFormal exige competência (INV-02)', () => {
    const gas = carregar();

    expect(() => new gas.Documento('Maria', 'Recibo', null)).toThrow(/Recibo/);
    expect(() => new gas.Documento('Maria', 'BriefingFormal', null)).toThrow();
    expect(() => new gas.Documento('', 'Contrato', null)).toThrow();
    expect(
      new gas.Documento('Maria', 'BriefingFormal', '2026-07').mesReferencia
    ).toBe('2026-07');
  });
});

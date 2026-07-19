const { loadGas } = require('./helpers/gasHarness');

function carregar() {
  return loadGas([
    'src/modulos/Documento.js',
  ]);
}

function campos(gas) {
  return new gas.CamposDeMesclagem({
    razaoSocial: 'Maria Conteúdo LTDA',
    cnpj: '12.345.678/0001-99',
    endereco: 'Rua das Flores, 123 — São Paulo/SP',
    quantidades: { Reels: '2 reels' },
    valorNumero: 3500,
    valorExtenso: 'três mil e quinhentos reais',
    canaisUsoImagem: 'Instagram e site da marca',
    prazoUsoImagem: '12 meses',
    cidadeAssinatura: 'São Paulo',
    dataAssinatura: '2026-07-16',
  });
}

describe('GeradorDeDocumentosTexto — porta do motor documental (RNF-01/RNF-02, D-01)', () => {
  test('contrato: conteúdo mescla os campos; referência é opaca, sem PII', () => {
    const gas = carregar();

    const { referencia, conteudo } = new gas.GeradorDeDocumentosTexto().gerarContrato(
      campos(gas)
    );

    expect(conteudo).toContain('Maria Conteúdo LTDA');
    expect(conteudo).toContain('12.345.678/0001-99');
    expect(conteudo).toContain('três mil e quinhentos reais');
    expect(referencia).not.toBe('');
    expect(referencia).not.toContain('12.345.678');
    expect(referencia).not.toContain('Rua das Flores');
  });

  test('briefing formal: referência opaca com competência; conteúdo traz os blocos', () => {
    const gas = carregar();
    const briefing = {
      parceiraId: 'Maria',
      mesReferencia: '2026-07',
      blocos: [{ rotulo: 'Reels' }, { rotulo: 'Stories 1' }],
    };

    const { referencia, conteudo } = new gas.GeradorDeDocumentosTexto().gerarBriefingFormal(
      campos(gas),
      briefing
    );

    expect(referencia).toMatch(/^BRIEFING_FORMAL:.*2026-07/);
    expect(referencia).not.toContain('12.345.678');
    expect(conteudo).toContain('Reels');
    expect(conteudo).toContain('Stories 1');
  });
});

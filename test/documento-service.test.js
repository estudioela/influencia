const { loadGas } = require('./helpers/gasHarness');

function carregar() {
  return loadGas([
    'src/domain/MesReferencia.js',
    'src/domain/CamposDeMesclagem.js',
    'src/domain/Documento.js',
    'src/service/DocumentoService.js',
  ]);
}

function camposValidos() {
  return {
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
  };
}

// Porta do Cadastro (ParceiraACL.obterParaDocumentos) — projeção por Parceira.
function fakeCadastro(porParceira) {
  return {
    obterParaDocumentos: (id) =>
      Object.prototype.hasOwnProperty.call(porParceira, id) ? porParceira[id] : null,
  };
}

function fakeBriefingRepository(briefing) {
  return { obterPor: () => (briefing === undefined ? null : briefing) };
}

function fakeDocumentoRepository() {
  const salvos = [];
  return {
    salvos,
    salvar(documento) {
      salvos.push(documento);
      return documento;
    },
  };
}

function fakeGerador() {
  return {
    gerarContrato: () => ({
      referencia: 'CONTRATO:Maria',
      conteudo: 'contrato-mesclado com razão social e CNPJ',
    }),
    gerarBriefingFormal: () => ({
      referencia: 'BRIEFING_FORMAL:Maria:2026-07',
      conteudo: 'briefing-formal-mesclado',
    }),
  };
}

function fakePublicador() {
  const eventos = [];
  return { eventos, publicar: (e) => eventos.push(e) };
}

function montar({ cadastro, briefing, gerador } = {}) {
  const gas = carregar();
  const documentoRepository = fakeDocumentoRepository();
  const publicador = fakePublicador();
  const service = new gas.DocumentoService(
    cadastro || fakeCadastro({}),
    fakeBriefingRepository(briefing),
    documentoRepository,
    gerador || fakeGerador(),
    publicador
  );
  return { gas, service, documentoRepository, publicador };
}

const ativa = () => ({ estado: 'Ativa', sinalizada: true, campos: camposValidos() });
const inativa = () => ({ estado: 'Inativa', sinalizada: false, campos: camposValidos() });

describe('DocumentoService — UC-023.01 Gerar Contrato (RN-01, §20)', () => {
  test('Parceira Ativa → contrato gerado, persistido e evento sem PII após a persistência', () => {
    const { service, documentoRepository, publicador } = montar({
      cadastro: fakeCadastro({ Maria: ativa() }),
    });

    const { documento, conteudo } = service.gerarContrato({ parceiraId: 'Maria' });

    expect(documento.tipo).toBe('Contrato');
    expect(documento.estaGerado()).toBe(true);
    // RNF-01: a referência persistida é opaca; o conteúdo mesclado (com PII)
    // é apenas devolvido ao operador, nunca persistido.
    expect(documento.referencia).toBe('CONTRATO:Maria');
    expect(conteudo).toMatch(/mesclado/);
    expect(documentoRepository.salvos).toHaveLength(1);
    expect(publicador.eventos).toHaveLength(1);
    expect(publicador.eventos[0]).toEqual({
      nome: 'DocumentoGerado',
      parceiraId: 'Maria',
      tipoDocumento: 'Contrato',
    });
  });

  test('Parceira Inativa → nenhum contrato gerado nem persistido (RN-01/INV-01/CB-01)', () => {
    const { service, documentoRepository, publicador } = montar({
      cadastro: fakeCadastro({ Maria: inativa() }),
    });

    expect(() => service.gerarContrato({ parceiraId: 'Maria' })).toThrow(/RN-01/);
    expect(documentoRepository.salvos).toHaveLength(0);
    expect(publicador.eventos).toHaveLength(0);
  });

  test('Parceira inexistente é recusada com DC-01', () => {
    const { service } = montar();

    expect(() => service.gerarContrato({ parceiraId: 'Fantasma' })).toThrow(/DC-01/);
  });

  test('falha na persistência não publica evento (§12)', () => {
    const { service, documentoRepository, publicador } = montar({
      cadastro: fakeCadastro({ Maria: ativa() }),
    });
    documentoRepository.salvar = () => {
      throw new Error('falha física de escrita');
    };

    expect(() => service.gerarContrato({ parceiraId: 'Maria' })).toThrow(/falha física/);
    expect(publicador.eventos).toHaveLength(0);
  });
});

describe('DocumentoService — UC-023.02 Gerar Briefing formal (RN-02, §20)', () => {
  test('Parceira sinalizada SIM → briefing formal gerado com a competência', () => {
    const { service, publicador } = montar({
      cadastro: fakeCadastro({ Maria: ativa() }),
      briefing: { parceiraId: 'Maria', blocos: [{ rotulo: 'Reels' }] },
    });

    const { documento, conteudo } = service.gerarBriefingFormal({
      parceiraId: 'Maria',
      mesReferencia: '2026-07',
    });

    expect(documento.tipo).toBe('BriefingFormal');
    expect(documento.mesReferencia).toBe('2026-07');
    expect(documento.estaGerado()).toBe(true);
    expect(conteudo).toMatch(/mesclado/);
    expect(publicador.eventos[0].tipoDocumento).toBe('BriefingFormal');
  });

  test('Parceira sem sinalização SIM → nenhum briefing formal (RN-02/CB-02)', () => {
    const { service, publicador } = montar({
      cadastro: fakeCadastro({ Maria: inativa() }),
      briefing: { parceiraId: 'Maria', blocos: [{ rotulo: 'Reels' }] },
    });

    expect(() =>
      service.gerarBriefingFormal({ parceiraId: 'Maria', mesReferencia: '2026-07' })
    ).toThrow(/RN-02/);
    expect(publicador.eventos).toHaveLength(0);
  });

  test('briefing ausente na competência → dados de mesclagem ausentes (DC-02)', () => {
    const { service } = montar({ cadastro: fakeCadastro({ Maria: ativa() }) });

    expect(() =>
      service.gerarBriefingFormal({ parceiraId: 'Maria', mesReferencia: '2026-07' })
    ).toThrow(/DC-02/);
  });
});

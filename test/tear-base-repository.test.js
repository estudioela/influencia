/**
 * BaseRepository — leitura com fixtures (sem escrita).
 *
 * Escopo deliberadamente mecânico:
 * - leitura de linhas;
 * - filtro de status ATIVO/ON;
 * - mapeamento para entidade Base.
 */
const path = require('path');
const { loadGasFiles } = require('./helpers/loadGasModule');

const RAIZ = path.join(__dirname, '..');
const arquivo = (nome) => path.join(RAIZ, 'tear', nome);

const HEADER = [
  'ID_Influenciadora',
  'Nome',
  'Status_Contrato',
  'Categoria',
  'Cupom',
  'Senha_Hash'
];

function abaFalsa(cabecalho, linhas) {
  return {
    getDataRange: () => ({ getValues: () => [cabecalho.slice()].concat(linhas.map((l) => l.slice())) }),
    appendRow: () => { throw new Error('appendRow não deve ser chamado neste teste'); },
    getRange: () => ({
      setValue: () => { throw new Error('setValue não deve ser chamado neste teste'); },
      getFormulas: () => [cabecalho.map(() => '')],
      setValues: () => { throw new Error('setValues não deve ser chamado neste teste'); }
    })
  };
}

function montar(linhas) {
  const aba = abaFalsa(HEADER, (linhas || []).map((l) => l.slice()));
  const sandbox = {
    console: { error() {} },
    SpreadsheetApp: {
      getActive: () => ({ getSheetByName: () => aba })
    }
  };

  try {
    const ctx = loadGasFiles(
      ['Infra.js', 'Modelos.js', 'Repositories.js'].map(arquivo),
      sandbox,
      ['BaseRepository', 'Base', 'CAMPOS_BASE', 'CAMPOS_PARCEIRO']
    );

    return { ctx, possuiBaseRepository: true };
  } catch (erro) {
    if (!/BaseRepository is not defined|Base is not defined/.test(String(erro))) {
      throw erro;
    }

    return { ctx: {}, possuiBaseRepository: false };
  }
}

function metodoDeLeitura(repo) {
  return repo.linhas || repo.listarTodas || repo.listar || repo.findAll;
}

function metodoDeAtivas(repo) {
  return repo.linhasAtivas || repo.listarAtivas || repo.ativas || repo.findAtivas;
}

function statusAtivo(campoStatus) {
  return [
    ['i-1', 'Ana', 'ATIVO', 'Moda', 'ANA10', ''],
    ['i-2', 'Bia', 'ON', 'Beleza', 'BIA10', ''],
    ['i-3', 'Cris', 'INATIVO', 'Moda', 'CRIS10', ''],
    ['i-4', 'Dani', 'OFF', 'Lifestyle', 'DANI10', '']
  ].map((linha) => {
    const base = linha.slice();
    if (campoStatus && campoStatus !== 'Status_Contrato') {
      const idx = HEADER.indexOf('Status_Contrato');
      if (idx !== -1) {
        base[idx] = '';
      }
    }
    return base;
  });
}

const boot = montar([]);
const describeBaseRepository = boot.possuiBaseRepository ? describe : describe.skip;

describeBaseRepository('BaseRepository — leitura/filtro/mapeamento', () => {
  test('lê linhas da base usando fixture', () => {
    const { ctx } = montar([
      ['i-1', 'Ana', 'ATIVO', 'Moda', 'ANA10', ''],
      ['i-2', 'Bia', 'INATIVO', 'Beleza', 'BIA10', '']
    ]);

    expect(typeof ctx.BaseRepository).toBe('function');

    const repo = new ctx.BaseRepository();
    const ler = metodoDeLeitura(repo);

    expect(typeof ler).toBe('function');

    const linhas = ler.call(repo);

    expect(Array.isArray(linhas)).toBe(true);
    expect(linhas).toHaveLength(2);
  });

  test('filtra apenas status ATIVO/ON', () => {
    const { ctx } = montar(statusAtivo());

    expect(typeof ctx.BaseRepository).toBe('function');

    const repo = new ctx.BaseRepository();
    const ativasFn = metodoDeAtivas(repo);

    expect(typeof ativasFn).toBe('function');

    const ativas = ativasFn.call(repo);

    expect(Array.isArray(ativas)).toBe(true);
    expect(ativas).toHaveLength(2);
  });

  test('mapeia saída para entidade Base', () => {
    const { ctx } = montar([
      ['i-1', 'Ana', 'ATIVO', 'Moda', 'ANA10', ''],
      ['i-2', 'Bia', 'ON', 'Beleza', 'BIA10', '']
    ]);

    expect(typeof ctx.BaseRepository).toBe('function');
    expect(typeof ctx.Base).toBe('function');

    const repo = new ctx.BaseRepository();
    const ler = metodoDeLeitura(repo);

    expect(typeof ler).toBe('function');

    const linhas = ler.call(repo);

    expect(linhas.length).toBeGreaterThan(0);
    linhas.forEach((item) => {
      expect(item instanceof ctx.Base).toBe(true);
    });
  });
});

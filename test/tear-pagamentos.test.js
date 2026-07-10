/**
 * Pagamento é um modelo de LEITURA derivado: a V2 não tem aba de pagamentos.
 * Cruza `Planos_Colaboracao` (o acordado) com `Ativacoes` (o entregue).
 *
 * A regra de elegibilidade foi derivada da máquina de estados, não de uma
 * especificação de negócio. Estes testes fixam a regra que o código implementa
 * hoje — se o negócio disser outra coisa, é aqui que a mudança aparece.
 */
const path = require('path');
const { loadGasFiles } = require('./helpers/loadGasModule');

const RAIZ = path.join(__dirname, '..');
const arquivo = (nome) => path.join(RAIZ, 'tear', nome);

const ARQUIVOS = [
  'Config.js', 'Planilha.js', 'Ativacao.js', 'AtivacaoRepository.js', 'EventDispatcher.js',
  'AtivacaoService.js', 'WebAppController.js', 'CicloRepository.js', 'CicloService.js',
  'CicloController.js', 'PlanoRepository.js', 'PagamentoService.js', 'PagamentoController.js', 'Api.js'
];

const EXPORTS = ['apiListarPagamentosDoCiclo', 'apiListarHistoricoDoCiclo', 'PagamentoService', 'ESTADOS_ATIVACAO'];

const CAB_ATIVACOES = ['ID_Ativacao', 'ID_Ciclo', 'ID_Influenciadora', 'Tipo_Conteudo', 'Estado_Principal'];
const CAB_PLANOS = ['ID_Plano', 'ID_Influenciadora', 'ID_Ciclo', 'Qtd_Entregaveis', 'Valor_Cache'];

const abaFalsa = (cabecalho, linhas) => ({
  getDataRange: () => ({ getValues: () => [cabecalho.slice()].concat(linhas.map((l) => l.slice())) })
});

function carregar(abas) {
  const SpreadsheetApp = { getActive: () => ({ getSheetByName: (nome) => abas[nome] || null }) };

  return loadGasFiles(ARQUIVOS.map(arquivo), { SpreadsheetApp, console: { error() {} } }, EXPORTS);
}

function comDados(ativacoes, planos) {
  return carregar({
    Ativacoes: abaFalsa(CAB_ATIVACOES, ativacoes),
    Planos_Colaboracao: abaFalsa(CAB_PLANOS, planos)
  });
}

const PLANO_ANA = ['p-1', 'ana', 'c-1', 2, 1500];

describe('PagamentoService — elegibilidade derivada da máquina de estados', () => {
  test('todas as entregas liberadas → Elegível para Pagamento', () => {
    const api = comDados(
      [
        ['a-1', 'c-1', 'ana', 'REEL', 'Elegível para Pagamento'],
        ['a-2', 'c-1', 'ana', 'STORIES', 'Arquivada']
      ],
      [PLANO_ANA]
    );

    const [pagamento] = api.apiListarPagamentosDoCiclo('c-1').data;

    expect(pagamento.estado).toBe('Elegível para Pagamento');
    expect(pagamento.entregaveisConcluidos).toBe(2);
    expect(pagamento.valorCache).toBe('1500');
    expect(pagamento.entregaveisAcordados).toBe('2');
  });

  test('uma entrega ainda em produção → Pendente', () => {
    const api = comDados(
      [
        ['a-1', 'c-1', 'ana', 'REEL', 'Elegível para Pagamento'],
        ['a-2', 'c-1', 'ana', 'STORIES', 'Em Produção']
      ],
      [PLANO_ANA]
    );

    const [pagamento] = api.apiListarPagamentosDoCiclo('c-1').data;

    expect(pagamento.estado).toBe('Pendente');
    expect(pagamento.entregaveisConcluidos).toBe(1);
  });

  // Um plano sem ativação nenhuma é cadastro incompleto, não trabalho pronto.
  test('plano sem ativação nenhuma é Pendente, nunca elegível', () => {
    const api = comDados([], [PLANO_ANA]);

    expect(api.apiListarPagamentosDoCiclo('c-1').data[0].estado).toBe('Pendente');
  });

  test('Concluída conta como entregue, mas não libera o pagamento sozinha', () => {
    const api = comDados([['a-1', 'c-1', 'ana', 'REEL', 'Concluída']], [PLANO_ANA]);

    const [pagamento] = api.apiListarPagamentosDoCiclo('c-1').data;

    expect(pagamento.entregaveisConcluidos).toBe(1);
    expect(pagamento.estado).toBe('Pendente');
  });

  test('não mistura influenciadoras nem ciclos', () => {
    const api = comDados(
      [
        ['a-1', 'c-1', 'ana', 'REEL', 'Arquivada'],
        ['a-2', 'c-1', 'bia', 'REEL', 'Em Produção'],
        ['a-3', 'c-2', 'ana', 'REEL', 'Em Produção']
      ],
      [PLANO_ANA, ['p-2', 'bia', 'c-1', 1, 900], ['p-3', 'ana', 'c-2', 1, 700]]
    );

    const pagamentos = api.apiListarPagamentosDoCiclo('c-1').data;

    expect(pagamentos.map((p) => [p.idInfluenciadora, p.estado])).toEqual([
      ['ana', 'Elegível para Pagamento'],
      ['bia', 'Pendente']
    ]);
  });

  test('valor ausente não vira zero inventado', () => {
    const api = comDados([['a-1', 'c-1', 'ana', 'REEL', 'Arquivada']], [['p-1', 'ana', 'c-1', 1, '']]);

    expect(api.apiListarPagamentosDoCiclo('c-1').data[0].valorCache).toBe('');
  });

  test.each([[''], [null], [undefined]])('ciclo %p vira {success:false}', (vazio) => {
    const api = comDados([], [PLANO_ANA]);

    expect(api.apiListarPagamentosDoCiclo(vazio).success).toBe(false);
  });

  test('aba de planos ausente vira envelope de erro, sem lançar', () => {
    const api = carregar({ Ativacoes: abaFalsa(CAB_ATIVACOES, []) });

    expect(api.apiListarPagamentosDoCiclo('c-1')).toEqual({
      success: false,
      error: expect.stringMatching(/Aba "Planos_Colaboracao" não encontrada/)
    });
  });
});

describe('apiListarHistoricoDoCiclo — histórico é o estado terminal, não uma aba', () => {
  test('devolve só as ativações arquivadas do ciclo', () => {
    const api = comDados(
      [
        ['a-1', 'c-1', 'ana', 'REEL', 'Arquivada'],
        ['a-2', 'c-1', 'ana', 'STORIES', 'Publicada'],
        ['a-3', 'c-2', 'ana', 'REEL', 'Arquivada']
      ],
      []
    );

    const historico = api.apiListarHistoricoDoCiclo('c-1').data;

    expect(historico.map((h) => h.idAtivacao)).toEqual(['a-1']);
  });

  test('ciclo sem arquivadas devolve lista vazia, não erro', () => {
    const api = comDados([['a-1', 'c-1', 'ana', 'REEL', 'Em Produção']], []);

    expect(api.apiListarHistoricoDoCiclo('c-1')).toEqual({ success: true, data: [] });
  });
});

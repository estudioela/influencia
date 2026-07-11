/**
 * Funil de cadastro (Google Forms → aba CADASTROS → Parceiros_Influenciadoras).
 *
 * Cobre o transform puro `parceiroDeCadastro_` (leitura tolerante a acento/caixa/
 * pontuação nos títulos das perguntas) e o upsert SEGURO de
 * `ParceiroService.registrarCadastro`: novo grava Status=PENDENTE; existente
 * atualiza só dados cadastrais, sem tocar Cupom/Status/Autocrat/Senha.
 */
const path = require('path');
const { loadGasFiles } = require('./helpers/loadGasModule');

const RAIZ = path.join(__dirname, '..');
const arquivo = (nome) => path.join(RAIZ, 'tear', nome);

const { parceiroDeCadastro_, ParceiroService, CAMPOS_PARCEIRO } = loadGasFiles(
  ['Infra.js', 'Modelos.js', 'Repositories.js', 'Services.js'].map(arquivo),
  { console: { warn() {}, error() {}, log() {} } },
  ['parceiroDeCadastro_', 'ParceiroService', 'CAMPOS_PARCEIRO']
);

// Respostas cruas do formulário — títulos LITERAIS das perguntas do Google Forms
// (com parênteses e reticências) para provar que a normalização casa com eles.
const RESPOSTA = {
  'como prefere ser chamada (pode ser apelido + sobrenome, por exemplo)': ' Dani Perrut ',
  'razão social': 'Daniela Perrut ME',
  'Rua': 'Rua das Flores',
  'número (prédio, casa, condomínio...)': '120',
  'complemento (se houver: bloco, torre, apto...)': 'Apto 3',
  'CEP': '01000-000'
};

describe('parceiroDeCadastro_ (transform puro)', () => {
  test('apelido vira ID em caixa alta; razão social vira Nome; endereço concatenado', () => {
    const p = parceiroDeCadastro_(RESPOSTA);

    expect(p[CAMPOS_PARCEIRO.ID]).toBe('DANI PERRUT'); // trim das pontas + caixa alta
    expect(p[CAMPOS_PARCEIRO.NOME]).toBe('Daniela Perrut ME');
    expect(p['Endereço_Formatado']).toBe('Rua das Flores, 120 - Apto 3 - 01000000'); // CEP sem hífen
    // Não inventa Cupom/Status/Senha — ficam a cargo do Service/upsert.
    expect(p[CAMPOS_PARCEIRO.CUPOM]).toBeUndefined();
    expect(p[CAMPOS_PARCEIRO.STATUS_CONTRATO]).toBeUndefined();
  });

  test('endereço pula segmentos vazios (sem complemento não deixa separador solto)', () => {
    const semComplemento = Object.assign({}, RESPOSTA, { 'complemento (se houver: bloco, torre, apto...)': '' });
    expect(parceiroDeCadastro_(semComplemento)['Endereço_Formatado']).toBe('Rua das Flores, 120 - 01000000');
  });

  test('sem razão social, o Nome cai para o apelido — nunca vazio', () => {
    const semRazao = Object.assign({}, RESPOSTA, { 'razão social': '' });
    expect(parceiroDeCadastro_(semRazao)[CAMPOS_PARCEIRO.NOME]).toBe('DANI PERRUT');
  });

  test('sem apelido (sem chave primária) devolve null — nada a gravar', () => {
    const semApelido = Object.assign({}, RESPOSTA, { 'como prefere ser chamada (pode ser apelido + sobrenome, por exemplo)': '  ' });
    expect(parceiroDeCadastro_(semApelido)).toBeNull();
  });
});

// Fake mínimo do ParceiroRepository: captura o payload e a chave do upsert.
function repositorioFalso(existentePorId) {
  const existentes = existentePorId || {};
  const chamadas = [];
  return {
    chamadas,
    getById: (id) => existentes[id] || null,
    upsert: (dados, chave) => {
      chamadas.push({ dados, chave });
      return { chave: dados[chave], criado: !existentes[dados[chave]] };
    }
  };
}

describe('ParceiroService.registrarCadastro (upsert seguro)', () => {
  test('registro NOVO: grava Status PENDENTE e não define Cupom', () => {
    const repo = repositorioFalso();
    const r = new ParceiroService(repo).registrarCadastro(RESPOSTA);

    expect(r).toEqual({ ignorado: false, criado: true, chave: 'DANI PERRUT' });
    expect(repo.chamadas).toHaveLength(1);

    const { dados, chave } = repo.chamadas[0];
    expect(chave).toBe(CAMPOS_PARCEIRO.ID);
    expect(dados[CAMPOS_PARCEIRO.STATUS_CONTRATO]).toBe('PENDENTE');
    expect(dados[CAMPOS_PARCEIRO.NOME]).toBe('Daniela Perrut ME');
    expect(dados['Endereço_Formatado']).toBe('Rua das Flores, 120 - Apto 3 - 01000000');
    // Cupom em branco: nem entra no payload → upsert não escreve a coluna.
    expect(CAMPOS_PARCEIRO.CUPOM in dados).toBe(false);
  });

  test('registro EXISTENTE: atualiza cadastro sem tocar Status nem Cupom', () => {
    const repo = repositorioFalso({ 'DANI PERRUT': { [CAMPOS_PARCEIRO.ID]: 'DANI PERRUT' } });
    const r = new ParceiroService(repo).registrarCadastro(RESPOSTA);

    expect(r).toEqual({ ignorado: false, criado: false, chave: 'DANI PERRUT' });

    const { dados } = repo.chamadas[0];
    expect(CAMPOS_PARCEIRO.STATUS_CONTRATO in dados).toBe(false); // preserva contrato
    expect(CAMPOS_PARCEIRO.CUPOM in dados).toBe(false);           // preserva cupom manual
    expect(dados[CAMPOS_PARCEIRO.NOME]).toBe('Daniela Perrut ME'); // dados cadastrais sim
  });

  test('apelido ausente: ignora e não chama o upsert', () => {
    const repo = repositorioFalso();
    const r = new ParceiroService(repo).registrarCadastro({ 'Razão Social': 'Sem apelido' });

    expect(r).toEqual({ ignorado: true, motivo: 'SEM_APELIDO' });
    expect(repo.chamadas).toHaveLength(0);
  });
});

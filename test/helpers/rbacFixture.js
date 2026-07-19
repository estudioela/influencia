/**
 * Fixture compartilhada para os smoke tests de Entrypoint que exercitam
 * rotas agora protegidas por RBAC (papel ADMINISTRADOR — dívida Q-08
 * registrada em SPEC-012/016/020/023/034, fechada reaproveitando o modelo
 * de identidade de SPEC-035 §8.3). Fornece os arquivos-fonte da pilha de
 * identidade e uma Sessão ADMINISTRADOR já ACTIVE, seedada direto na aba
 * SESSOES — evita repetir o fluxo completo de login Google nesses testes,
 * que já é coberto à exaustão por test/portal-usuario.test.js.
 */

const ADMIN_TOKEN = 'tok-admin-rbac-fixture';
const ADMIN_SUB = 'sub-admin-rbac-fixture';

const ARQUIVOS_IDENTIDADE = [
  'src/modulos/Autenticacao.js',
  'src/modulos/Arquivamento.js',
  'src/modulos/Usuario.js',
];

function fakeAbaGravavel(cabecalho, linhas) {
  let rows = [cabecalho.slice()].concat((linhas || []).map((l) => l.slice()));
  return {
    get _rows() {
      return rows;
    },
    getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()) }),
    appendRow: (arr) => rows.push(arr.slice()),
    clearContents() {
      rows = [cabecalho.slice()];
    },
    getRange(linha, coluna, numLinhas) {
      if (numLinhas === undefined) {
        return { setValue: (v) => (rows[linha - 1][coluna - 1] = v) };
      }
      return {
        setValues(valores) {
          valores.forEach((v, i) => {
            rows[linha - 1 + i] = v.slice();
          });
        },
      };
    },
  };
}

/**
 * @param {object} [config]
 * @param {string} [config.papel] papel seedado em SIS_IDENTIDADES (default ADMINISTRADOR).
 * @param {boolean} [config.expirada] true força uma sessão já expirada.
 * @returns {object} abas SESSOES/BLOQUEIOS/SIS_IDENTIDADES/BASE_ADMINISTRADORES.
 */
function abasIdentidade(config) {
  const cfg = config || {};
  const papel = cfg.papel || 'ADMINISTRADOR';
  const expiraEm = new Date(Date.now() + (cfg.expirada ? -1 : 1) * 6 * 60 * 60 * 1000).toISOString();
  return {
    SESSOES: fakeAbaGravavel(
      ['TOKEN', 'PARCEIRA_ID', 'EXPIRA_EM'],
      [[ADMIN_TOKEN, ADMIN_SUB, expiraEm]]
    ),
    BLOQUEIOS: fakeAbaGravavel(['IDENTIFICADOR', 'TENTATIVAS', 'BLOQUEIO_INICIO']),
    SIS_IDENTIDADES: fakeAbaGravavel(
      ['SUB_PROVIDER', 'EMAIL_PERFIL', 'PAPEL_ATOR', 'ESTADO_CONTA', 'DATA_CRIACAO', 'ULTIMO_ACESSO'],
      [[ADMIN_SUB, 'admin@estudioela.com', papel, 'ACTIVE', new Date().toISOString(), '']]
    ),
    BASE_ADMINISTRADORES: fakeAbaGravavel(['SUB_PROVIDER', 'NOME_COMPLETO', 'AREA_RESPONSABILIDADE']),
  };
}

module.exports = { ADMIN_TOKEN, ADMIN_SUB, ARQUIVOS_IDENTIDADE, abasIdentidade };

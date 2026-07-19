/**
 * Teste-fumaça da consolidação de arquivos (ADR-014).
 *
 * Carrega TODOS os .js de src/ num único sandbox — como o runtime real do
 * Apps Script faz (namespace único, ordem de arquivo irrelevante) — e exige
 * que cada global do contrato continue definido. A lista abaixo foi extraída
 * do estado pré-consolidação (109 arquivos) e é FIXA: ela é a rede de
 * segurança que garante que nenhuma classe se perde quando arquivos são
 * concatenados ou movidos. Ao criar uma classe nova, adicione-a aqui.
 */
const fs = require('fs');
const path = require('path');
const { loadGas } = require('./helpers/gasHarness');

const ROOT = path.resolve(__dirname, '..');

function todosOsArquivosJsDeSrc(dir = 'src') {
  const abs = path.resolve(ROOT, dir);
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entrada) => {
    const rel = path.join(dir, entrada.name);
    if (entrada.isDirectory()) return todosOsArquivosJsDeSrc(rel);
    return entrada.name.endsWith('.js') ? [rel] : [];
  });
}

// Extraída em 2026-07-19 de `grep -rhoE "^this\.[A-Za-z0-9_]+ =" src`.
const CLASSES_DO_CONTRATO = [
  'AcessoController', 'AcessoPortalService', 'AdaptadorDeCepBrasilApi',
  'AdaptadorOAuthGoogle', 'AdministradorACL', 'ArquivamentoController',
  'ArquivamentoService', 'Autenticador', 'BlocoDeFormato', 'BloqueioACL',
  'BloqueioRepository', 'Briefing', 'BriefingACL', 'BriefingController',
  'BriefingRepository', 'BriefingService', 'CadastrarParceiraService',
  'CalculadoraDeAprovacao', 'CamposDeMesclagem', 'ChaveInfluenciadora',
  'CodigoRastreio', 'ColaboracaoMensal', 'ColaboracaoMensalACL',
  'ColaboracaoMensalController', 'ColaboracaoMensalRepository',
  'CompiladorDoMes', 'CondicaoComercialSnapshot', 'Credencial', 'Documento',
  'DocumentoACL', 'DocumentoController', 'DocumentoRepository',
  'DocumentoService', 'Endereco', 'EnderecoDeEntrega', 'Entrega',
  'EntregaACL', 'EntregaController', 'EntregaRepository', 'EntregaService',
  'Envio', 'EnvioACL', 'EnvioController', 'EnvioRepository', 'EnvioService',
  'GeradorDeDocumentosTexto', 'GuardiaoDeEstadoOAuth',
  'IdentificadorDeEntrega', 'ImportacaoController', 'ImportadorService',
  'ItemDeHistorico', 'ItemDePendencia', 'JanelaDeBloqueio', 'LegadoACL',
  'LinkDoMaterial', 'MesReferencia', 'ObrigacaoFinanceira', 'PagamentoACL',
  'PagamentoController', 'PagamentoRepository', 'PagamentoService',
  'Parceira', 'ParceiraACL', 'ParceiraController', 'ParceiraRepository',
  'PerfilPortalController', 'PerfilPortalService', 'PIX',
  'PortalDeConteudoController', 'PortalDeConteudoService',
  'PortalFinanceiroController', 'PortalFinanceiroService',
  'ResumoFinanceiro', 'Sessao', 'SessaoACL', 'SessaoRepository',
  'TokenDeSessao', 'Usuario', 'UsuarioACL', 'UsuarioController',
  'UsuarioRepository', 'UsuarioService', 'ValidadorDeTokenGoogle',
  'VerificadorDeCredencialLegado',
];

const FUNCOES_COMPARTILHADAS = [
  'celulaParaData', 'criarResolvedorDeColuna', 'envelopeFail', 'envelopeOk',
  'erroComCodigo', 'falharComCodigo', 'getConfig', 'include', 'reescreverAba',
];

describe('Consolidação (ADR-014) — namespace global íntegro', () => {
  const gas = loadGas(todosOsArquivosJsDeSrc());

  test.each(CLASSES_DO_CONTRATO)('global %s continua definido', (nome) => {
    expect(typeof gas[nome]).toBe('function');
  });

  test.each(FUNCOES_COMPARTILHADAS)('função compartilhada %s continua definida', (nome) => {
    expect(typeof gas[nome]).toBe('function');
  });
});

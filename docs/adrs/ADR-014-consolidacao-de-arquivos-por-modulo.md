# ADR-014 — Consolidação de arquivos por módulo de negócio

- **Status:** aceito (2026-07-19)
- **Contexto:** autorização do responsável ("pode aplicar") sobre proposta de
  reorganização apresentada em 2026-07-19.

> **Nota histórica (2026-07-23):** reorganização de arquivos do Portal
> legado em Google Apps Script (`src/`), removido do repositório —
> substituído por `tear-v2-app/` (Laravel + React, `ADR-015`). Mantido
> como registro histórico; não orienta trabalho vigente.

## Problema

`src/` chegou a 109 arquivos (~12.800 linhas, mediana de ~85 linhas por
arquivo) organizados por camada (`acl/`, `adapters/`, `controller/`,
`domain/`, `repository/`, `service/`). Uma SPEC típica atravessa 5–8 arquivos
em 5 pastas; o custo de navegação e manutenção é por *feature*, mas o layout
é por *camada*.

## Fatos técnicos que habilitam a decisão

1. Vinculação por escopo global (`this.Classe = class ...`), sem
   import/export: o GAS concatena todos os arquivos num namespace único —
   a divisão em arquivos é puramente organizacional.
2. Não há `extends` nem execução em nível de topo fora do entrypoint
   (verificado por grep): a ordem de concatenação é irrelevante.
3. O único acoplamento ao layout são os caminhos em `loadGas([...])` dos
   testes (≈700 referências) e os caminhos literais de HTML
   (`createTemplateFromFile('src/ui/...')`, `include('src/ui/portal-head')`).

## Decisão

Reorganizar `src/` em **fatias verticais**: um arquivo por módulo de negócio,
com as camadas como seções internas demarcadas por banner, sempre na ordem
`DOMAIN → ACL → REPOSITORY → SERVICE → CONTROLLER → ADAPTERS`.

Estrutura resultante (14 `.js` + 13 `.html` = 27 arquivos):

| Arquivo | Conteúdo (classes de origem) |
|---|---|
| `entrypoint/Portal.js` | inalterado (superfície pública `doGet`/`google.script.run`) |
| `shared/Nucleo.js` | Config, Envelope, ErroComCodigo, ColunaFisica, Include |
| `modulos/Parceira.js` | Parceira, ChaveInfluenciadora, Endereco, PIX, CondicaoComercialSnapshot, ParceiraACL, ParceiraRepository, CadastrarParceiraService, ParceiraController, AdaptadorDeCepBrasilApi, LegadoACL, ImportadorService, ImportacaoController |
| `modulos/Autenticacao.js` | Sessao, TokenDeSessao, Credencial, Autenticador, SessaoACL, AdministradorACL, SessaoRepository, AcessoPortalService, AcessoController, AdaptadorOAuthGoogle, ValidadorDeTokenGoogle, GuardiaoDeEstadoOAuth, VerificadorDeCredencialLegado |
| `modulos/Usuario.js` | Usuario, UsuarioACL, UsuarioRepository, UsuarioService, UsuarioController |
| `modulos/ColaboracaoMensal.js` | ColaboracaoMensal, MesReferencia, ColaboracaoMensalACL, ColaboracaoMensalRepository, CompiladorDoMes, ColaboracaoMensalController |
| `modulos/Arquivamento.js` | JanelaDeBloqueio, BloqueioACL, BloqueioRepository, ArquivamentoService, ArquivamentoController |
| `modulos/Briefing.js` | Briefing, BlocoDeFormato, CalculadoraDeAprovacao, BriefingACL, BriefingRepository, BriefingService, BriefingController |
| `modulos/Entrega.js` | Entrega, LinkDoMaterial, IdentificadorDeEntrega, EntregaACL, EntregaRepository, EntregaService, EntregaController |
| `modulos/Envio.js` | Envio, EnderecoDeEntrega, CodigoRastreio, EnvioACL, EnvioRepository, EnvioService, EnvioController |
| `modulos/Financeiro.js` | ObrigacaoFinanceira, ResumoFinanceiro, PagamentoACL, PagamentoRepository, PagamentoService, PagamentoController, PortalFinanceiroService, PortalFinanceiroController |
| `modulos/Documento.js` | Documento, CamposDeMesclagem, DocumentoACL, DocumentoRepository, DocumentoService, DocumentoController, GeradorDeDocumentosTexto |
| `modulos/PortalConteudo.js` | ItemDePendencia, ItemDeHistorico, PortalDeConteudoService, PortalDeConteudoController |
| `modulos/Perfil.js` | PerfilPortalService, PerfilPortalController |

Os 6 `_contract.js` (puro comentário) migram para
`docs/ARQUITETURA_CAMADAS.md` — os contratos de camada continuam valendo
integralmente; muda apenas o endereço.

## O que NÃO muda

- Nenhuma linha de código interno das classes; nenhum nome de classe.
- `src/ui/*.html` (caminhos literais em produção) e `entrypoint/Portal.js`.
- A disciplina de camadas (ACL única, domínio puro etc.) — fiscalizada por
  review e testes, como antes.
- `.clasp.json` (`filePushOrder` permanece vazio) e `appsscript.json`.

## Alternativas rejeitadas

- **Um arquivo por camada** (~9 arquivos): `domain.js` teria 28 entidades
  desconexas (~2.600 linhas); piora navegação e maximiza conflito de merge.
- **Consolidação extrema** (3–5 arquivos): arquivos >1.500 linhas degradam o
  editor do GAS e o diff de PR. Alvo adotado: 300–1.100 linhas.

## Consequências

- Testes: caminhos em `loadGas` reescritos para os módulos novos; o
  teste-fumaça `test/consolidacao-smoke.test.js` fixa os 84 globais do
  contrato e falha se qualquer classe se perder.
- `git log --follow` perde rastreio nas concatenações; o mapa
  classe→arquivo desta ADR é o índice de origem.
- Novos módulos de negócio nascem como UM arquivo em `src/modulos/`.

# API Map

## Objetivo

O documento `API_MAP.md` descreve todas as funções expostas entre frontend e backend do Projeto TEAR V2.

O sistema utiliza a comunicação nativa do Google Apps Script:


Frontend HTML

↓

google.script.run

↓

Funções globais Apps Script

↓

Controllers

↓

Services

↓

Repositories


Este documento representa o contrato atual encontrado no código.

Não descreve APIs futuras.

---

# Modelo de comunicação

A aplicação frontend não chama Services ou Controllers diretamente.

O acesso ocorre através de funções globais disponibilizadas pelo Apps Script.

Exemplo:

```javascript
google.script.run
    .listarEntregas()

Executa:

Frontend

↓

listarEntregas()

↓

Controller

↓

Service

↓

Repository
Funções Públicas Expostas

As seguintes funções são disponibilizadas pelo backend para consumo através de google.script.run.

Autenticação e Sessão
entrarNoPortal()

Responsabilidade:

Realiza entrada inicial no portal.

Fluxo:

Frontend
 ↓
entrarNoPortal
 ↓
AcessoController
 ↓
AcessoPortalService
renovarSessaoDoPortal()

Responsabilidade:

Renova uma sessão existente.

sairDoPortal()

Responsabilidade:

Finaliza sessão ativa.

Autenticação Google OAuth
iniciarLoginComGoogle()

Responsabilidade:

Inicia fluxo OAuth Google.

Entrada:

{}

Retorno:

{
 success: true,
 data: {
   urlDeAutorizacao
 }
}
entrarComCodigoOAuth()

Responsabilidade:

Finaliza Authorization Code Flow.

Entrada:

{
 code,
 state
}

Processo:

Frontend

↓

entrarComCodigoOAuth

↓

Validação state

↓

Troca code por token

↓

Criação de sessão
confirmarVinculacaoDeIdentidade()

Responsabilidade:

Confirma associação entre identidade Google e cadastro existente.

Entrada:

{
 idToken,
 parceiraId
}
completarCadastroDeUsuario()

Responsabilidade:

Completa cadastro inicial.

Entrada:

{
 idToken,
 papel,
 dadosComplementares
}
Administração de Usuários
listarUsuariosPendentes()

Responsabilidade:

Lista usuários aguardando aprovação administrativa.

Entrada:

{
 token
}
aprovarUsuario()

Responsabilidade:

Aprova cadastro pendente.

rejeitarUsuario()

Responsabilidade:

Rejeita cadastro pendente.

inativarUsuario()

Responsabilidade:

Suspende usuário ativo.

reativarUsuario()

Responsabilidade:

Reativa usuário inativo.

Parceiras
cadastrarParceira()

Responsabilidade:

Realiza cadastro de parceira.

importarBaseLegada()

Responsabilidade:

Importa dados históricos.

Ciclo Mensal
compilarMes()

Responsabilidade:

Executa compilação da competência mensal.

selarCompetencia()

Responsabilidade:

Fecha competência.

arquivarLote()

Responsabilidade:

Arquiva lote processado.

Briefing
preencherBriefing()

Responsabilidade:

Preenche dados de briefing.

obterBriefing()

Responsabilidade:

Consulta briefing.

lerBriefingDoItem()

Responsabilidade:

Consulta briefing específico.

gerarBriefingFormal()

Responsabilidade:

Gera documento formal de briefing.

Entregas
listarEntregas()

Responsabilidade:

Lista entregas disponíveis.

enviarMaterial()

Responsabilidade:

Recebe material enviado.

enviarMaterialDoPortal()

Responsabilidade:

Recebe material através do portal.

aprovarEntrega()

Responsabilidade:

Aprova entrega submetida.

publicarEntrega()

Responsabilidade:

Publica entrega aprovada.

atualizarStatus()

Responsabilidade:

Atualiza estado de uma entrega.

Logística
confirmarEndereco()

Responsabilidade:

Confirma endereço para envio.

registrarRastreio()

Responsabilidade:

Registra código de rastreamento.

listarEnvios()

Responsabilidade:

Lista envios existentes.

Financeiro
lancarPagamentoAvulso()

Responsabilidade:

Cria lançamento financeiro.

liberarPagamento()

Responsabilidade:

Libera pagamento.

confirmarPagamento()

Responsabilidade:

Confirma pagamento.

listarPagamentos()

Responsabilidade:

Consulta pagamentos.

verFinanceiroDoPortal()

Responsabilidade:

Exibe informações financeiras no portal.

Documentos
gerarContrato()

Responsabilidade:

Gera contrato.

Portal
verPerfilDoPortal()

Responsabilidade:

Consulta perfil da parceira.

editarPerfilDoPortal()

Responsabilidade:

Atualiza informações do perfil.

listarPeriodosDoPortal()

Responsabilidade:

Lista períodos disponíveis.

verHistoricoDoPortal()

Responsabilidade:

Consulta histórico.

verPendencias()

Responsabilidade:

Consulta pendências existentes.

Inventário Atual

Total de funções públicas identificadas:

40 funções expostas

Domínios cobertos:

✓ Autenticação
✓ Usuários
✓ Parceiras
✓ Briefing
✓ Entregas
✓ Logística
✓ Financeiro
✓ Documentos
✓ Histórico
✓ Arquivamento
Próxima evolução deste documento

Adicionar:

página frontend consumidora;
parâmetros completos;
retorno esperado;
Controller relacionado;
Service relacionado;
regras de autorização;
tratamento de erro.

Esse é o **API_MAP.md — versão inicial oficial**.

Depois da próxima auditoria (`google.script.run` no frontend), apenas complementamos este mesmo arquivo. Não criamos outro.

---

# Matriz Frontend → Backend

Esta seção documenta a relação entre páginas do frontend, funções públicas expostas e módulos responsáveis.

A comunicação ocorre através de:

```text
Página HTML

↓

google.script.run

↓

Função pública Apps Script

↓

Controller

↓

Service
Portal de Autenticação
login.html

Funções utilizadas:

Função	Objetivo
iniciarLoginComGoogle()	Inicia autenticação Google
entrarComCodigoOAuth()	Finaliza autenticação OAuth
entrarNoPortal()	Realiza entrada no sistema
renovarSessaoDoPortal()	Mantém sessão ativa
sairDoPortal()	Encerra sessão

Fluxo:

login.html

↓

google.script.run

↓

Autenticacao.js

↓

AcessoController

↓

AcessoPortalService
Dashboard
dashboard.html

Funções relacionadas:

Função	Objetivo
listarPeriodosDoPortal()	Buscar períodos disponíveis
verPerfilDoPortal()	Carregar perfil
verHistoricoDoPortal()	Carregar histórico
verPendencias()	Buscar pendências

Fluxo:

dashboard.html

↓

PortalController

↓

Serviços de Portal

↓

Repositories
Administração
admin.html

Funções:

Função	Objetivo
listarUsuariosPendentes()	Buscar usuários aguardando aprovação
aprovarUsuario()	Aprovar cadastro
rejeitarUsuario()	Rejeitar cadastro
inativarUsuario()	Suspender usuário
reativarUsuario()	Reativar usuário
cadastrarParceira()	Criar parceira
importarBaseLegada()	Importar dados antigos

Fluxo:

admin.html

↓

Controllers administrativos

↓

Services administrativos

↓

Repositories
Briefing
briefing.html

Funções:

Função	Objetivo
obterBriefing()	Consultar briefing
preencherBriefing()	Atualizar briefing
lerBriefingDoItem()	Consultar item específico
gerarBriefingFormal()	Criar briefing formal

Fluxo:

briefing.html

↓

BriefingController

↓

BriefingService

↓

BriefingRepository
Entregas
entrega.html

Funções:

Função	Objetivo
listarEntregas()	Consultar entregas
enviarMaterial()	Enviar material
enviarMaterialDoPortal()	Upload pelo portal
aprovarEntrega()	Aprovar conteúdo
publicarEntrega()	Publicar entrega
atualizarStatus()	Alterar estado

Fluxo:

entrega.html

↓

EntregaController

↓

EntregaService

↓

EntregaRepository

↓

EntregaACL
Envios
envio.html

Funções:

Função	Objetivo
confirmarEndereco()	Confirmar endereço
registrarRastreio()	Registrar rastreamento
listarEnvios()	Consultar logística

Fluxo:

envio.html

↓

EnvioController

↓

EnvioService

↓

EnvioRepository
Financeiro
financeiro.html

Funções:

Função	Objetivo
verFinanceiroDoPortal()	Exibir financeiro
listarPagamentos()	Consultar pagamentos
lancarPagamentoAvulso()	Criar pagamento
liberarPagamento()	Liberar pagamento
confirmarPagamento()	Confirmar pagamento

Fluxo:

financeiro.html

↓

FinanceiroController

↓

PagamentoService

↓

PagamentoRepository
Documentos
documentos.html

Funções:

Função	Objetivo
gerarContrato()	Criar contrato

Fluxo:

documentos.html

↓

DocumentoController

↓

DocumentoService

↓

DocumentoRepository
Perfil
perfil.html

Funções:

Função	Objetivo
verPerfilDoPortal()	Visualizar dados
editarPerfilDoPortal()	Atualizar dados

Fluxo:

perfil.html

↓

PerfilController

↓

PerfilService

↓

PerfilRepository
Compilação Mensal
compilar-mes.html

Funções:

Função	Objetivo
compilarMes()	Executar compilação
selarCompetencia()	Fechar competência
arquivarLote()	Arquivar lote

Fluxo:

compilar-mes.html

↓

ColaboracaoMensalController

↓

ColaboracaoMensalService

↓

Repositories mensais

---

Próxima será a **PARTE 3/3**, com:

- contratos de entrada e saída;
- padrão de resposta (`success/data/error`);
- tratamento de erros;
- autenticação/RBAC;
- checklist de cobertura da API.

---

# Contrato de Comunicação

As funções expostas pelo backend seguem um padrão de resposta padronizado.

O objetivo é evitar respostas inconsistentes entre módulos.

---

# Estrutura de sucesso

Resposta esperada:

```javascript
{
  success: true,
  data: {}
}

Onde:

success

↓

indica execução concluída com sucesso

e:

data

↓

contém o resultado da operação
Estrutura de erro

Resposta esperada:

{
  success: false,
  error: {
    mensagem: ""
  }
}

O erro é encapsulado pelo backend antes de retornar ao frontend.

Fluxo:

Erro interno

↓

Controller

↓

envelopeFail()

↓

Frontend
Tratamento de exceções

As funções públicas seguem o padrão:

function nomeDaApi(dados) {

  try {

    return executarOperacao();

  } catch (erro) {

    return envelopeFail({
      mensagem: erro.message
    });

  }

}

Responsabilidades:

impedir quebra do frontend;
padronizar mensagens;
evitar exposição de detalhes internos.
Controle de acesso

As APIs utilizam validação de sessão e autorização.

Fluxo:

Frontend

↓

Token/Sessão

↓

Função pública

↓

Controle de acesso

↓

Service

↓

Execução
Funções administrativas protegidas

As seguintes APIs possuem controle RBAC:

Função	Papel necessário
listarUsuariosPendentes()	Administrador
aprovarUsuario()	Administrador
rejeitarUsuario()	Administrador
inativarUsuario()	Administrador
reativarUsuario()	Administrador
Fluxo OAuth

O fluxo de autenticação Google segue:

Usuário

↓

iniciarLoginComGoogle()

↓

Google OAuth

↓

Retorno code/state

↓

entrarComCodigoOAuth()

↓

Validação state

↓

Troca token

↓

Criação sessão
Operações críticas

Algumas APIs possuem controle adicional:

Entregas

Fluxo:

Enviar material

↓

Revisão

↓

Aprovação

↓

Publicação

APIs envolvidas:

enviarMaterial()

aprovarEntrega()

publicarEntrega()

atualizarStatus()
Pagamentos

Fluxo:

Pagamento criado

↓

Liberação

↓

Confirmação

APIs:

lancarPagamentoAvulso()

liberarPagamento()

confirmarPagamento()
Arquivamento

Fluxo:

Competência encerrada

↓

Selagem

↓

Arquivamento

APIs:

selarCompetencia()

arquivarLote()
Inventário Final de APIs

Quantidade de funções públicas identificadas:

40 funções

Distribuição por domínio:

Domínio	Quantidade aproximada
Autenticação	11
Usuários	6
Parceiras	2
Briefing	4
Entregas	6
Logística	3
Financeiro	5
Documentos	1
Portal/Histórico	5
Arquivamento	3
Cobertura do Mapeamento
Identificado
 Funções públicas expostas
 Comunicação frontend/backend
 Domínios da API
 Fluxos principais
 Padrão de resposta
 Controle de acesso
 OAuth
 Operações críticas
Pendências de refinamento futuro

Itens que podem ser adicionados em auditorias futuras:

parâmetros completos de cada função;
schemas de entrada;
schemas de retorno;
páginas frontend consumidoras confirmadas por código;
testes automatizados associados;
permissões detalhadas por endpoint.
Status

Documento criado como referência oficial do contrato frontend/backend do Projeto TEAR V2.

Última atualização baseada no código existente.


Após colar essa parte, o:

```text
API_MAP.md

fica fechado na primeira versão.

Checklist:

[x] Mapeamento das APIs — Documentar todas as funções expostas entre frontend e backend.

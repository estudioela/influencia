# Backend Map

O documento `BACKEND_MAP.md` descreve a arquitetura real do backend do Projeto TEAR V2.

Seu objetivo é registrar os componentes existentes no código-fonte, incluindo:

- Controllers;
- Services;
- Repositories;
- ACLs;
- Entidades;
- Value Objects;
- Fluxos de comunicação entre camadas.

Este documento foi construído através da análise direta do código existente.

Não representa uma arquitetura futura.

Não descreve componentes planejados.

---

# Objetivo

Este documento tem como objetivos:

- identificar todos os componentes backend existentes;
- documentar responsabilidades de cada camada;
- registrar dependências entre módulos;
- mapear o fluxo de execução das operações;
- servir como referência arquitetural para manutenção futura.

---

# Escopo

Este documento contempla:

- arquivos localizados em `src/modulos/`;
- componentes localizados em `src/entrypoint/`;
- componentes compartilhados utilizados pelo backend;
- relacionamentos entre Controllers, Services e Repositories.

Não fazem parte deste documento:

- detalhes de interface;
- estrutura completa de planilhas;
- regras de negócio completas;
- fluxo visual do usuário.

Esses assuntos são tratados em documentos específicos.

---

# Estrutura Backend

O backend do Projeto TEAR V2 está organizado em módulos.

Estrutura identificada:

```text
src/

├── entrypoint/
│
│   └── Portal.js
│
├── modulos/
│
│   ├── Autenticacao.js
│   ├── Usuario.js
│   ├── Parceira.js
│   ├── Perfil.js
│   ├── Briefing.js
│   ├── ColaboracaoMensal.js
│   ├── Entrega.js
│   ├── Envio.js
│   ├── Financeiro.js
│   ├── Documento.js
│   ├── Arquivamento.js
│   └── PortalConteudo.js
│
└── shared/

    └── Nucleo.js

    Arquitetura de Camadas

A estrutura encontrada segue o seguinte fluxo:

Controller

↓

Service

↓

Repository

↓

ACL

↓

Google Sheets / Serviços Google
Controller

Os Controllers representam a camada de entrada das operações.

Responsabilidades:

receber chamadas externas;
validar entrada inicial;
acionar Services;
transformar resultados em respostas para frontend.

Eles são utilizados principalmente pelo mecanismo:

google.script.run
Controllers Identificados
Controller	Arquivo	Responsabilidade
UsuarioController	Usuario.js	Operações relacionadas a usuários
DocumentoController	Documento.js	Operações documentais
ParceiraController	Parceira.js	Operações de parceiras
ImportacaoController	Parceira.js	Importação de dados
PortalDeConteudoController	PortalConteudo.js	Conteúdo do portal
PerfilPortalController	Perfil.js	Perfil do usuário
BriefingController	Briefing.js	Operações de briefing
EnvioController	Envio.js	Operações de envio
ColaboracaoMensalController	ColaboracaoMensal.js	Ciclo mensal
PagamentoController	Financeiro.js	Pagamentos
PortalFinanceiroController	Financeiro.js	Visão financeira
AcessoController	Autenticacao.js	Entrada e sessão
ArquivamentoController	Arquivamento.js	Arquivamento mensal
EntregaController	Entrega.js	Gestão de entregas
Service

Os Services concentram regras de aplicação.

Responsabilidades:

executar casos de uso;
coordenar múltiplos repositories;
aplicar regras operacionais;
controlar transições de fluxo.
Services Identificados
Service	Arquivo	Responsabilidade
UsuarioService	Usuario.js	Gestão de usuários
DocumentoService	Documento.js	Processamento documental
CadastrarParceiraService	Parceira.js	Cadastro de parceiras
ImportadorService	Parceira.js	Importação
PortalDeConteudoService	PortalConteudo.js	Conteúdo do portal
PerfilPortalService	Perfil.js	Dados de perfil
BriefingService	Briefing.js	Gestão de briefing
EnvioService	Envio.js	Gestão logística
PagamentoService	Financeiro.js	Processos financeiros
PortalFinanceiroService	Financeiro.js	Consultas financeiras
AcessoPortalService	Autenticacao.js	Controle de acesso
ArquivamentoService	Arquivamento.js	Fechamento e arquivamento
EntregaService	Entrega.js	Ciclo das entregas

---

# Repository

Os Repositories representam a camada responsável pelo acesso aos dados.

Responsabilidades:

- abstrair persistência;
- consultar registros;
- salvar alterações;
- entregar objetos utilizados pelos Services.

Os Repositories não possuem regras de negócio.

Eles delegam operações de armazenamento para ACLs.

---

# Repositories Identificados

| Repository | Arquivo | Responsabilidade |
|---|---|---|
| `UsuarioRepository` | `Usuario.js` | Persistência de usuários |
| `DocumentoRepository` | `Documento.js` | Persistência documental |
| `ParceiraRepository` | `Parceira.js` | Persistência de parceiras |
| `BriefingRepository` | `Briefing.js` | Persistência de briefings |
| `EnvioRepository` | `Envio.js` | Persistência de envios |
| `ColaboracaoMensalRepository` | `ColaboracaoMensal.js` | Persistência do ciclo mensal |
| `PagamentoRepository` | `Financeiro.js` | Persistência financeira |
| `SessaoRepository` | `Autenticacao.js` | Persistência de sessões |
| `BloqueioRepository` | `Arquivamento.js` | Persistência de bloqueios |
| `EntregaRepository` | `Entrega.js` | Persistência de entregas |

---

# ACL (Access Control Layer)

O projeto utiliza uma camada ACL entre Repository e armazenamento.

A ACL é responsável por:

- interpretar estruturas de armazenamento;
- resolver colunas;
- converter dados crus;
- persistir alterações;
- manter isolamento da infraestrutura.

Fluxo identificado:

```text
Repository

↓

ACL

↓

Google Sheets

ACLs Identificadas
ACL	Arquivo	Responsabilidade
BloqueioACL	Arquivamento.js	Controle de bloqueios
EntregaACL	Entrega.js	Persistência de entregas
Entidades de Domínio

As entidades representam objetos com identidade própria e comportamento.

Diferente de estruturas simples de dados, possuem regras internas.

Entidade Entrega

Arquivo:

src/modulos/Entrega.js

Classe:

Entrega

Responsabilidades:

representar uma entrega de uma parceira;
controlar ciclo de vida;
validar mudanças de estado;
armazenar informações de aprovação e publicação.
Estados da Entrega

A entidade controla os seguintes estados:

AguardandoMaterial

↓

EmRevisao

↓

Aprovado

↓

Publicado
Regras Internas Encontradas

A entidade impede:

publicação sem aprovação;
alteração inválida de estado;
duplicação de identificação;
operações fora da sequência esperada.
Value Objects

Foram encontrados objetos de valor utilizados para representar conceitos específicos.

LinkDoMaterial

Arquivo:

src/modulos/Entrega.js

Responsabilidade:

Representar o endereço do material enviado.

Características:

encapsula URL;
valida representação;
evita manipulação direta da string.
IdentificadorDeEntrega

Arquivo:

src/modulos/Entrega.js

Responsabilidade:

Representar a identificação única de uma entrega.

Composição identificada:

Parceira

+

Mês de referência

+

Rótulo da entrega
JanelaDeBloqueio

Arquivo:

src/modulos/Arquivamento.js

Responsabilidade:

Representar período de bloqueio.

Controla:

início;
fim;
validação temporal.
Módulo de Autenticação

Arquivo:

src/modulos/Autenticacao.js

Possui componentes próprios:

AcessoController

Responsabilidade:

receber solicitações de acesso;
iniciar autenticação;
retornar resultado ao portal.
AcessoPortalService

Responsabilidade:

coordenar fluxo de autenticação;
validar credenciais;
controlar criação de sessão.
SessaoRepository

Responsabilidade:

armazenar sessões;
recuperar sessão existente;
remover sessões expiradas.
Adaptador OAuth Google

Componente:

AdaptadorOAuthGoogle

Responsabilidades:

comunicação com OAuth Google;
troca de código;
tratamento de resposta externa.
ValidadorDeTokenGoogle

Responsabilidades:

validar token recebido;
verificar integridade;
validar informações do provedor.
GuardiaoDeEstadoOAuth

Responsabilidade:

controlar estado OAuth;
evitar inconsistência durante autenticação.

Utiliza:

CacheService
VerificadorDeCredencialLegado

Responsabilidade:

manter compatibilidade com credenciais antigas;
consultar acesso legado.

Dependência:

ParceiraACL
Dependências Entre Módulos
Entrega

Fluxo identificado:

EntregaController

↓

EntregaService

↓

EntregaRepository

↓

EntregaACL

↓

Google Sheets

Dependências adicionais:

EntregaService

├── BriefingRepository
├── ColaboracaoMensalRepository
├── PublicadorDeEventos
└── Relogio
Arquivamento

Fluxo identificado:

ArquivamentoController

↓

ArquivamentoService

↓

Repositories:

├── EntregaService
├── EnvioService
├── PagamentoService
└── ColaboracaoMensalRepository

Com publicação:

PublicadorDeEventos
Autenticação

Fluxo identificado:

AcessoController

↓

AcessoPortalService

↓

SessaoRepository

↓

Persistência

Com suporte:

GuardiaoDeEstadoOAuth

↓

CacheService

---

# Mapa Consolidado de Dependências

A relação geral entre camadas identificada no backend é:

```text
Frontend

↓

google.script.run

↓

Controller

↓

Service

↓

Repository

↓

ACL

↓

Google Sheets / Serviços Google
Matriz Geral Backend
Módulo	Controller	Service	Repository	ACL	Entidade
Autenticação	AcessoController	AcessoPortalService	SessaoRepository	-	Sessão
Usuário	UsuarioController	UsuarioService	UsuarioRepository	-	Usuário
Parceira	ParceiraController	CadastrarParceiraService	ParceiraRepository	-	Parceira
Importação	ImportacaoController	ImportadorService	ParceiraRepository	-	Parceira
Perfil	PerfilPortalController	PerfilPortalService	-	-	Perfil
Briefing	BriefingController	BriefingService	BriefingRepository	-	Briefing
Colaboração Mensal	ColaboracaoMensalController	-	ColaboracaoMensalRepository	-	Colaboração
Entrega	EntregaController	EntregaService	EntregaRepository	EntregaACL	Entrega
Envio	EnvioController	EnvioService	EnvioRepository	-	Envio
Financeiro	PagamentoController	PagamentoService	PagamentoRepository	-	Pagamento
Financeiro Portal	PortalFinanceiroController	PortalFinanceiroService	-	-	Financeiro
Documento	DocumentoController	DocumentoService	DocumentoRepository	-	Documento
Arquivamento	ArquivamentoController	ArquivamentoService	BloqueioRepository	BloqueioACL	Bloqueio
Conteúdo Portal	PortalDeConteudoController	PortalDeConteudoService	-	-	Conteúdo
Eventos e Serviços Compartilhados

O backend possui dependências compartilhadas utilizadas por diferentes módulos.

Componentes identificados:

src/shared/Nucleo.js

Responsabilidades:

fornecer recursos comuns;
compartilhar utilitários;
centralizar comportamentos reutilizados.
Publicação de Eventos

Alguns Services utilizam:

PublicadorDeEventos

Responsabilidade:

comunicar mudanças de estado;
permitir desacoplamento entre módulos;
registrar acontecimentos importantes do sistema.

Exemplos identificados:

entrega enviada;
entrega aprovada;
entrega publicada;
competência arquivada.
Controle de Tempo

Foi identificado o uso de:

Relogio

Responsabilidade:

abstrair data/hora utilizada pelas regras;
evitar dependência direta do relógio do sistema;
permitir testes controlados.
Padrões Arquiteturais Identificados

A análise do código revelou os seguintes padrões:

Separação de Responsabilidades

Cada camada possui responsabilidade específica:

Controller

Entrada e saída

↓

Service

Casos de uso

↓

Repository

Persistência

↓

ACL

Adaptação da infraestrutura
Encapsulamento de Domínio

Algumas regras estão dentro das próprias entidades.

Exemplo:

Entrega

Possui:

estados internos;
validação de transições;
comportamento próprio.
Isolamento da Persistência

Os Services não acessam diretamente:

SpreadsheetApp;
abas;
células;
estruturas físicas.

Esse acesso fica concentrado em ACLs e Repositories.

Pontos de Atenção Encontrados

Durante o mapeamento foram identificados alguns pontos que devem ser observados em futuras evoluções.

Dependência de Google Sheets

Embora exista separação arquitetural, a infraestrutura atual depende de:

SpreadsheetApp

através das ACLs.

Qualquer migração futura de persistência deverá substituir essa camada.

Cobertura Parcial de ACL

Nem todos os módulos possuem ACL explícita.

Alguns Repositories aparentam acessar diretamente estruturas de persistência.

Recomenda-se validar:

UsuarioRepository;
ParceiraRepository;
BriefingRepository;
FinanceiroRepository.
Documentação de Contratos

Os Controllers possuem contratos consumidos pelo frontend.

A documentação detalhada desses contratos deve ser mantida em:

API_MAP.md
Conclusão

O backend do Projeto TEAR V2 apresenta uma arquitetura modular organizada em camadas.

Foram identificados:

14 Controllers;
13 Services;
10 Repositories;
2 ACLs explícitas;
1 entidade principal de domínio documentada;
3 Value Objects;
componentes compartilhados de infraestrutura.

A arquitetura encontrada segue o padrão:

Interface

↓

Controller

↓

Service

↓

Repository

↓

ACL

↓

Infraestrutura Google

Este documento representa o inventário oficial do backend atual do Projeto TEAR V2.

Qualquer alteração estrutural deve atualizar este mapa para manter a rastreabilidade arquitetural.
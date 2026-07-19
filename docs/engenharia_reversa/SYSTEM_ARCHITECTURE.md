# SYSTEM_ARCHITECTURE

## Objetivo

Este documento descreve a arquitetura técnica do Projeto TEAR sob a perspectiva de engenharia reversa.

Seu objetivo é documentar como os componentes do sistema se comunicam, quais são suas responsabilidades e como ocorre o fluxo entre interface, regras de negócio e persistência.

Este documento foi elaborado exclusivamente a partir da análise do código-fonte, da documentação técnica existente e dos artefatos produzidos durante a engenharia reversa.

Não descreve regras de negócio específicas, nem substitui os documentos DATA_FLOW.md, DOMAIN_MAP.md ou SHEETS_MAP.md.

---

# Visão Geral da Arquitetura

O Projeto TEAR utiliza uma arquitetura em camadas implementada sobre Google Apps Script.

A aplicação é composta por uma interface HTML executada no navegador, um backend hospedado no Apps Script e uma camada de persistência baseada em Google Sheets.

Toda comunicação entre frontend e backend ocorre através do mecanismo `google.script.run` ou por requisições HTTP direcionadas ao Web App publicado.

A lógica de negócio permanece isolada da infraestrutura por meio de Controllers, Services, Repositories e ACLs, permitindo que o domínio permaneça independente da estrutura física das planilhas.

De forma simplificada, a arquitetura segue o fluxo:

```
Navegador

↓

Frontend (HTML / CSS / JavaScript)

↓

google.script.run

↓

Entrypoints

↓

Controllers

↓

Services

↓

Repositories

↓

ACLs

↓

Google Sheets
```

Cada camada possui uma única responsabilidade e comunica-se apenas com a camada imediatamente inferior.

---

# Princípios Arquiteturais Observados

Durante a análise do código foram identificados os seguintes princípios arquiteturais.

## Separação de Responsabilidades

Cada camada possui uma função claramente definida.

- Frontend apresenta informações.
- Entrypoints recebem chamadas externas.
- Controllers iniciam casos de uso.
- Services concentram regras de negócio.
- Repositories abstraem persistência.
- ACLs conhecem exclusivamente a estrutura física das planilhas.

Nenhuma camada acumula responsabilidades pertencentes a outra.

---

## Isolamento da Persistência

As regras de negócio não conhecem:

- nomes de abas;
- índices de colunas;
- organização física das planilhas.

Todo acesso físico é encapsulado pelas ACLs.

Essa separação reduz o acoplamento entre domínio e infraestrutura.

---

## Domínio Independente da Infraestrutura

As entidades representam exclusivamente conceitos do domínio.

Elas não executam operações sobre:

- Google Sheets;
- Google Drive;
- APIs externas;
- HtmlService;
- SpreadsheetApp.

A infraestrutura permanece completamente separada do modelo de domínio.

---

## Arquitetura Orientada a Casos de Uso

Cada operação do sistema percorre sempre o mesmo fluxo arquitetural:

```
Frontend

↓

Entrypoint

↓

Controller

↓

Service

↓

Repository

↓

ACL

↓

Persistência
```

Esse padrão foi observado repetidamente nos módulos analisados.

---

# Componentes da Arquitetura

## Frontend

O frontend é responsável exclusivamente pela apresentação da interface ao usuário.

Foi identificado um Design System composto por componentes reutilizáveis implementados em HTML, CSS e JavaScript puro.

Suas responsabilidades incluem:

- renderização das telas;
- captura de eventos do usuário;
- chamadas ao backend utilizando `google.script.run`.

O frontend não implementa regras de negócio.

---

## Backend (Google Apps Script)

O backend executa toda a lógica da aplicação.

Ele é responsável por:

- receber chamadas do frontend;
- iniciar casos de uso;
- validar operações;
- acessar persistência;
- integrar serviços externos.

Toda a execução ocorre dentro do ambiente Google Apps Script.

---

## Entrypoints

Os Entrypoints representam a porta de entrada da aplicação.

São responsáveis por:

- expor funções públicas;
- responder chamadas HTTP;
- encaminhar requisições para os Controllers.

Não executam regras de negócio.

---

## Controllers

Os Controllers iniciam cada caso de uso.

Suas responsabilidades são:

- receber parâmetros;
- construir dependências;
- invocar Services;
- retornar respostas ao chamador.

Funcionam como camada de orquestração.

---

## Services

Os Services concentram toda a lógica de negócio observada.

Entre suas responsabilidades estão:

- validações;
- aplicação das regras do domínio;
- coordenação entre múltiplos repositórios;
- criação de entidades;
- publicação de eventos.

Esta é a principal camada da aplicação.

---

## Repositories

Os Repositories abstraem completamente o mecanismo de persistência.

Eles são responsáveis por:

- localizar registros;
- salvar entidades;
- atualizar informações;
- consultar dados persistidos.

Não conhecem detalhes físicos das planilhas.

---

## ACLs

As ACLs representam a camada de adaptação entre o domínio e a persistência física.

São responsáveis por:

- localizar colunas;
- converter valores canônicos;
- normalizar dados;
- montar matrizes bidimensionais;
- realizar leituras e escritas no Google Sheets.

Esta é a única camada que conhece a estrutura física das planilhas.

---

## Persistência

A persistência é realizada por uma planilha Google Sheets denominada Portal Ela.

A planilha funciona como banco oficial da aplicação e contém onze abas estruturadas, cada uma responsável por um conjunto específico de informações do domínio.

Toda comunicação com essa camada ocorre exclusivamente através das ACLs.

---

# Comunicação entre Componentes

Após a análise do código-fonte foi identificado um padrão arquitetural consistente para praticamente todas as operações executadas pelo Portal.

Independentemente da funcionalidade, as requisições percorrem sempre uma sequência fixa de componentes, preservando a separação entre interface, aplicação, domínio e infraestrutura.

---

# Fluxo Geral de Comunicação

O fluxo arquitetural predominante é:

```
Usuário

↓

Frontend

↓

google.script.run
ou
Requisição HTTP (/exec)

↓

Entrypoint

↓

Controller

↓

Service

↓

Repository

↓

ACL

↓

Google Sheets

↓

ACL

↓

Repository

↓

Service

↓

Controller

↓

Frontend
```

Cada componente possui responsabilidade única e comunica-se apenas com a camada imediatamente inferior.

---

# Comunicação entre Frontend e Backend

A interface executada no navegador não acessa diretamente a camada de persistência.

Toda comunicação ocorre através do ambiente Google Apps Script.

Foram identificadas duas formas principais de entrada:

- chamadas assíncronas utilizando `google.script.run`;
- requisições HTTP ao Web App publicado (`doGet`).

Essas chamadas são recebidas pelos Entrypoints, que iniciam o processamento interno.

---

# Fluxo de Leitura

As operações de consulta seguem o fluxo abaixo.

```
Frontend

↓

Entrypoint

↓

Controller

↓

Service

↓

Repository

↓

ACL

↓

Google Sheets
```

Durante esse processo:

- o Service solicita informações ao Repository;
- o Repository delega o acesso físico à ACL;
- a ACL localiza a aba correspondente;
- identifica dinamicamente os cabeçalhos;
- converte os dados físicos para objetos do domínio;
- retorna o resultado para as camadas superiores.

As regras de negócio nunca acessam diretamente a planilha.

---

# Fluxo de Escrita

As operações de persistência seguem o caminho inverso.

```
Frontend

↓

Entrypoint

↓

Controller

↓

Service

↓

Repository

↓

ACL

↓

Google Sheets
```

Neste fluxo:

- o Service valida a operação;
- cria ou altera entidades;
- solicita persistência ao Repository;
- o Repository encaminha os dados para a ACL;
- a ACL converte objetos canônicos para o formato físico esperado pela planilha;
- realiza a gravação utilizando operações do Google Sheets.

Toda escrita observada permanece encapsulada pela ACL.

---

# Fluxo de Autenticação

O processo de autenticação possui um fluxo específico envolvendo integração externa.

```
Usuário

↓

Frontend

↓

Entrypoint

↓

Controller

↓

UsuarioService

↓

AdaptadorOAuthGoogle

↓

Google OAuth

↓

ValidadorDeTokenGoogle

↓

SessaoRepository

↓

SessaoACL

↓

Google Sheets
```

Após a validação do código OAuth:

- o usuário é identificado;
- uma sessão é criada;
- o token de sessão é persistido;
- as informações retornam ao frontend.

---

# Fluxo de Sessões

As sessões representam o estado autenticado do usuário.

O fluxo observado é:

```
Autenticação válida

↓

UsuarioService

↓

SessaoRepository

↓

SessaoACL

↓

Aba SESSOES

↓

Token de Sessão
```

A persistência da sessão permanece isolada das demais entidades do domínio.

---

# Fluxo de Geração de Documentos

Foi identificado um fluxo específico para geração de documentos.

```
Controller

↓

DocumentoService

↓

GeradorDeDocumentosTexto

↓

CamposDeMesclagem

↓

Documento
```

Durante esse processo:

- os dados são preparados;
- os campos de mesclagem são construídos;
- o documento final é gerado pela camada responsável.

A lógica de montagem permanece separada da lógica de negócio.

---

# Comunicação com APIs Externas

Além da infraestrutura Google, foram identificadas integrações externas.

O fluxo observado é:

```
Service

↓

Adaptador

↓

API Externa

↓

Resposta

↓

Service
```

Os adaptadores isolam completamente:

- endpoints;
- protocolos;
- formatos de resposta.

Essa abordagem impede que regras de negócio dependam diretamente de APIs externas.

---

# Comunicação com o Google Sheets

Toda comunicação com a persistência ocorre através da camada ACL.

O fluxo observado é:

```
Repository

↓

ACL

↓

SpreadsheetApp

↓

Planilha Portal Ela
```

A ACL é responsável por:

- localizar abas;
- localizar cabeçalhos;
- converter dados;
- montar matrizes;
- executar operações de leitura e escrita.

Nenhuma outra camada acessa diretamente `SpreadsheetApp`.

---

# Fluxo de Retorno

Após a conclusão de qualquer operação, o retorno percorre exatamente o caminho inverso.

```
Google Sheets

↓

ACL

↓

Repository

↓

Service

↓

Controller

↓

Entrypoint

↓

Frontend

↓

Usuário
```

Dessa forma, toda resposta enviada à interface já passou pelas camadas de validação, domínio e persistência, mantendo o isolamento arquitetural observado durante a engenharia reversa.

---

# Infraestrutura

## Google Apps Script

Toda a lógica de execução do sistema encontra-se hospedada no ambiente Google Apps Script.

O Apps Script atua como backend da aplicação, sendo responsável por:

- receber requisições do frontend;
- expor Entrypoints públicos;
- executar os Controllers;
- coordenar Services, Repositories e ACLs;
- integrar os serviços disponibilizados pela plataforma Google.

A aplicação foi implementada como um projeto **Standalone**, não vinculado diretamente à planilha de persistência.

A planilha utilizada é obtida dinamicamente por meio das Script Properties.

---

## Google Sheets

O Google Sheets constitui a camada oficial de persistência do Portal.

A planilha denominada **Portal Ela** armazena todas as informações operacionais da aplicação.

A estrutura física encontra-se organizada em onze abas especializadas.

Essas abas representam diferentes agregados do domínio, incluindo:

- Parceiras;
- Colaborações;
- Briefings;
- Entregas;
- Envios;
- Pagamentos;
- Documentos;
- Sessões;
- Identidades.

Nenhuma regra de negócio acessa diretamente essa estrutura.

Todo acesso ocorre exclusivamente através das ACLs.

---

## Configuração da Aplicação

A infraestrutura depende de Script Properties para localizar recursos externos.

Durante a engenharia reversa foram identificadas propriedades como:

- `SPREADSHEET_ID`
- `SPREADSHEET_ID_LEGADO`

Essas propriedades eliminam a necessidade de IDs fixos no código-fonte, permitindo alterar a infraestrutura sem modificar a aplicação.

---

# Dependências Externas

Além da infraestrutura Google, foram identificadas integrações com serviços externos.

Entre elas destacam-se:

- Google OAuth 2.0;
- validação de tokens Google;
- serviço de consulta de CEP.

Essas integrações permanecem encapsuladas por adaptadores específicos.

Nenhuma regra de negócio comunica-se diretamente com APIs externas.

---

# Decisões Arquiteturais Observadas

Durante a análise do código foram identificadas decisões recorrentes de projeto.

## Separação em Camadas

A aplicação mantém separação consistente entre:

- Interface;
- Entrada da aplicação;
- Orquestração;
- Regras de negócio;
- Persistência;
- Infraestrutura.

Essa organização reduz o acoplamento entre componentes.

---

## Persistência Abstraída

Repositories nunca manipulam diretamente:

- abas;
- colunas;
- índices;
- objetos do Google Sheets.

Toda essa responsabilidade permanece concentrada nas ACLs.

Essa decisão protege o domínio contra alterações estruturais na planilha.

---

## Conversão entre Modelo Canônico e Modelo Físico

O domínio trabalha exclusivamente com objetos e estados canônicos.

A conversão entre esses objetos e a representação física persistida ocorre apenas na camada ACL.

Essa separação foi observada repetidamente durante a engenharia reversa.

---

## Localização Dinâmica por Cabeçalhos

As ACLs localizam colunas utilizando os nomes dos cabeçalhos.

Não foram observadas dependências de posições fixas de colunas.

Essa abordagem aumenta a robustez contra alterações manuais na planilha.

---

## Centralização das Regras de Negócio

As regras de negócio encontram-se concentradas nos Services.

Controllers apenas iniciam casos de uso.

Repositories apenas persistem dados.

ACLs apenas traduzem estruturas físicas.

Essa distribuição mantém baixo acoplamento entre as camadas.

---

# Limitações Observadas

A engenharia reversa identificou algumas limitações arquiteturais.

## Dependência da Plataforma Google

Toda a infraestrutura depende do ecossistema Google Apps Script.

Consequentemente:

- autenticação;
- execução;
- persistência;
- serviços internos

estão diretamente vinculados à plataforma.

---

## Persistência Baseada em Planilhas

O Google Sheets atua como banco de dados da aplicação.

Embora adequado ao contexto operacional do projeto, esse modelo apresenta limitações inerentes ao uso de planilhas como mecanismo de persistência.

A arquitetura procura minimizar esse impacto por meio da camada ACL.

---

## Integrações Externas

A disponibilidade de determinados fluxos depende de serviços externos, como autenticação Google e consulta de CEP.

Essas dependências encontram-se parcialmente isoladas pelos adaptadores implementados.

---

# Conclusão

A análise do código-fonte demonstra que o Projeto TEAR adota uma arquitetura em camadas bem definida, baseada na separação entre interface, aplicação, domínio e infraestrutura.

A comunicação entre os componentes segue um fluxo consistente, passando sucessivamente por Entrypoints, Controllers, Services, Repositories e ACLs antes de alcançar a camada de persistência.

A utilização das ACLs como mecanismo de isolamento representa uma das principais decisões arquiteturais observadas, permitindo que o domínio permaneça desacoplado da estrutura física das planilhas.

De forma geral, a arquitetura apresenta elevada coesão entre componentes, responsabilidades bem delimitadas e baixo acoplamento entre as camadas, características que favorecem a manutenção e evolução do sistema.
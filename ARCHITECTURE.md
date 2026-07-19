# Arquitetura do Projeto TEAR V2

## Objetivo

Este documento descreve a arquitetura de alto nível do Projeto TEAR V2.

Seu objetivo é apresentar como o sistema está organizado, quais são seus principais componentes, como eles se comunicam e quais princípios arquiteturais devem ser preservados durante a evolução do projeto.

Este documento não descreve detalhes de implementação. Informações específicas sobre código, fluxos internos e estrutura física encontram-se na documentação técnica localizada em `docs/`.

---

# Visão Geral

O TEAR V2 é uma aplicação desenvolvida sobre a plataforma Google Apps Script utilizando Google Sheets como mecanismo oficial de persistência.

Sua arquitetura foi projetada para manter o domínio desacoplado da infraestrutura, permitindo que regras de negócio evoluam independentemente da tecnologia utilizada para armazenamento dos dados.

A aplicação é organizada em camadas, cada uma possuindo responsabilidades bem definidas e comunicação restrita às camadas adjacentes.

O fluxo geral do sistema é representado pela seguinte sequência:

```text
Usuário

↓

Frontend (HTML Service)

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

Essa separação reduz o acoplamento entre os componentes e facilita manutenção, testes e evolução do sistema.

---

# Princípios Arquiteturais

A arquitetura do Projeto TEAR V2 é baseada nos seguintes princípios.

## Separação de Responsabilidades

Cada camada possui uma responsabilidade única e bem definida.

Nenhum componente deve assumir responsabilidades pertencentes a outra camada.

---

## Isolamento do Domínio

As regras de negócio não possuem conhecimento sobre Google Sheets, cabeçalhos, colunas físicas ou APIs da plataforma Google.

Todo acesso à infraestrutura ocorre através das camadas de persistência.

---

## Persistência Abstraída

O domínio nunca acessa diretamente a planilha.

Toda leitura e escrita ocorre por meio de:

- Repository
- ACL

As ACLs são responsáveis por converter entidades do domínio para a estrutura física utilizada pelo Google Sheets.

---

## Resolução Dinâmica de Cabeçalhos

O acesso às abas da planilha ocorre utilizando nomes de cabeçalhos, nunca índices fixos de colunas.

Essa estratégia reduz o impacto causado por alterações estruturais na planilha.

---

## Arquitetura Modular

O sistema é dividido em módulos de domínio independentes.

Cada módulo concentra seus próprios componentes de aplicação, domínio e persistência, favorecendo isolamento funcional e evolução incremental.

---

# Componentes Principais

A arquitetura é composta pelos seguintes componentes.

| Componente | Responsabilidade |
|------------|------------------|
| Frontend | Interface utilizada pelos usuários |
| Entrypoints | Recebem chamadas externas do Apps Script |
| Controllers | Coordenam os casos de uso |
| Services | Implementam as regras de negócio |
| Repositories | Abstraem o acesso aos dados |
| ACLs | Traduzem objetos do domínio para a estrutura física das planilhas |
| Google Sheets | Persistência oficial do sistema |

Cada componente possui responsabilidades específicas e comunica-se apenas com as camadas imediatamente adjacentes.

---

# Camadas da Aplicação

O Projeto TEAR V2 utiliza uma arquitetura em camadas para separar responsabilidades e reduzir o acoplamento entre os componentes.

Cada camada comunica-se exclusivamente com a camada imediatamente inferior, preservando o isolamento entre domínio e infraestrutura.

## Frontend

O Frontend é responsável pela interação com os usuários do sistema.

Suas responsabilidades incluem:

- renderização das telas;
- coleta de dados;
- validação básica da interface;
- envio de requisições para o backend.

O Frontend não implementa regras de negócio nem acessa diretamente a persistência.

---

## Entrypoints

Os Entrypoints representam o ponto de entrada do Google Apps Script.

São responsáveis por:

- receber chamadas do Frontend;
- inicializar os componentes necessários;
- encaminhar a execução para os Controllers;
- transformar respostas em formatos consumíveis pela interface.

Nenhuma regra de negócio deve permanecer nesta camada.

---

## Controllers

Os Controllers coordenam a execução dos casos de uso.

Suas responsabilidades incluem:

- validar o fluxo da operação;
- invocar os Services necessários;
- converter erros em respostas apropriadas;
- organizar a sequência de execução dos casos de uso.

Os Controllers não implementam lógica de domínio.

---

## Services

Os Services concentram as regras de negócio da aplicação.

São responsáveis por:

- aplicar políticas do domínio;
- validar regras operacionais;
- coordenar múltiplos Repositories quando necessário;
- garantir a consistência das operações.

Toda lógica funcional deve permanecer nesta camada.

---

## Repositories

Os Repositories abstraem o mecanismo de persistência.

Sua função é oferecer uma interface orientada ao domínio para leitura e gravação dos dados.

Os Services nunca manipulam diretamente Google Sheets.

Toda persistência ocorre através dos Repositories.

---

## ACL (Anti-Corruption Layer)

A ACL representa a fronteira entre o domínio da aplicação e a estrutura física da persistência.

Suas responsabilidades incluem:

- localizar colunas pelos cabeçalhos;
- converter linhas em entidades de domínio;
- converter entidades em linhas da planilha;
- proteger o domínio contra mudanças estruturais na persistência.

A ACL é o único componente que possui conhecimento sobre:

- nomes das abas;
- cabeçalhos;
- organização física das planilhas;
- APIs do Google Sheets.

---

## Persistência

A persistência oficial do sistema utiliza Google Sheets.

Os dados encontram-se distribuídos em abas especializadas, cada uma representando um conjunto específico de informações do domínio.

O acesso ocorre exclusivamente através das ACLs e Repositories.

Nenhuma camada superior realiza operações diretas sobre as planilhas.

---

# Fluxo Arquitetural

O fluxo principal da aplicação ocorre conforme a sequência abaixo.

```text
Usuário
        │
        ▼
Frontend
        │
        ▼
Entrypoint
        │
        ▼
Controller
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
ACL
        │
        ▼
Google Sheets
```

Durante operações de leitura, o fluxo retorna pelo mesmo caminho até a interface.

```text
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

---

# Dependências entre Camadas

A arquitetura estabelece dependências unidirecionais.

Cada camada conhece apenas a camada imediatamente inferior.

```text
Frontend
        │
        ▼
Entrypoint
        │
        ▼
Controller
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
ACL
        │
        ▼
Google Sheets
```

Não são permitidas dependências inversas ou acessos diretos que violem essa estrutura.

---

# Invariantes Arquiteturais

Os seguintes princípios devem ser preservados em toda evolução do sistema.

- O domínio não conhece Google Sheets.
- O domínio não conhece cabeçalhos de colunas.
- O domínio não conhece nomes de abas.
- Apenas a ACL acessa a estrutura física da persistência.
- Toda regra de negócio reside nos Services.
- Controllers apenas coordenam casos de uso.
- Entrypoints apenas recebem chamadas externas.
- O acesso aos dados ocorre exclusivamente através dos Repositories.
- A comunicação entre camadas é sempre unidirecional.

Esses invariantes constituem a base arquitetural do Projeto TEAR V2 e devem ser mantidos durante toda a evolução do sistema.

---

# Infraestrutura

O Projeto TEAR V2 utiliza exclusivamente serviços do ecossistema Google como infraestrutura de execução.

## Plataforma de Execução

A aplicação é executada em **Google Apps Script**, responsável por hospedar toda a lógica de negócio e disponibilizar a Web App utilizada pelos usuários.

As configurações do ambiente são mantidas através de Script Properties, permitindo que informações específicas da implantação permaneçam fora do código-fonte.

---

## Persistência

A persistência oficial do sistema utiliza uma única planilha Google Sheets.

A estrutura física da planilha é organizada em abas especializadas, cada uma responsável por armazenar um conjunto específico de informações do domínio.

A aplicação nunca depende da posição física das colunas, utilizando resolução dinâmica por cabeçalhos através da camada ACL.

---

## Interface

A interface do sistema é construída utilizando HTML Service do Google Apps Script.

O Frontend comunica-se exclusivamente com os Entrypoints da aplicação, sem acesso direto às regras de negócio ou à persistência.

---

## Autenticação

O sistema utiliza autenticação baseada no ecossistema Google.

A gestão de identidades, sessões e permissões é realizada pelos módulos responsáveis por autenticação, mantendo separação entre identidade do usuário e regras de negócio.

---

# Decisões Arquiteturais

A evolução da arquitetura é registrada formalmente através de **Architecture Decision Records (ADRs)**.

Cada ADR documenta:

- o contexto da decisão;
- o problema identificado;
- as alternativas consideradas;
- a decisão adotada;
- as consequências para o projeto.

Esse processo preserva o histórico arquitetural e facilita futuras evoluções do sistema.

---

# Limitações Arquiteturais

A arquitetura atual considera as características e limitações da plataforma Google Apps Script.

Entre elas:

- ambiente de execução gerenciado pelo Google;
- dependência da disponibilidade dos serviços Google;
- limites operacionais da plataforma;
- persistência baseada em Google Sheets.

Essas limitações foram consideradas durante o desenho arquitetural e fazem parte das decisões técnicas do projeto.

---

# Evolução da Arquitetura

A arquitetura do Projeto TEAR V2 foi concebida para permitir evolução incremental.

Mudanças na implementação devem preservar os princípios definidos neste documento, especialmente:

- separação entre domínio e infraestrutura;
- isolamento das regras de negócio;
- independência da persistência;
- modularização dos componentes;
- comunicação unidirecional entre camadas.

Novas funcionalidades devem integrar-se à arquitetura existente, evitando acoplamentos desnecessários ou violações das responsabilidades de cada camada.

---

# Documentação Relacionada

Este documento apresenta apenas a visão arquitetural de alto nível.

Os detalhes técnicos encontram-se distribuídos na documentação oficial do projeto.

| Documento | Conteúdo |
|-----------|----------|
| `README.md` | Visão geral do projeto |
| `docs/engenharia_reversa/SYSTEM_ARCHITECTURE.md` | Arquitetura detalhada da implementação |
| `docs/engenharia_reversa/DOMAIN_MAP.md` | Modelo de domínio |
| `docs/engenharia_reversa/DATA_FLOW.md` | Fluxo dos dados |
| `docs/engenharia_reversa/SHEETS_MAP.md` | Estrutura da persistência |
| `docs/engenharia_reversa/PORTAL_FLOW.md` | Fluxo operacional |
| `docs/adrs/` | Registro das decisões arquiteturais |

---

# Manutenção

O `ARCHITECTURE.md` é um documento vivo e deve ser atualizado sempre que houver mudanças significativas na arquitetura do sistema. Seu objetivo é registrar decisões duradouras, responsabilidades das camadas e limites arquiteturais, servindo como referência para novos desenvolvedores e para a evolução do projeto. Informações voláteis ou detalhes de implementação devem permanecer na documentação técnica específica.  [oai_citation:0‡qt.io](https://www.qt.io/software-insights/best-practices-for-architecture-documentation?utm_source=chatgpt.com)
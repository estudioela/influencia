# System Context

O **System Context** apresenta uma visão de alto nível do ecossistema do Projeto TEAR V2, mostrando como o sistema se relaciona com seus usuários e com os sistemas externos dos quais depende.

Seu objetivo é fornecer uma compreensão rápida dos limites do sistema, dos principais atores envolvidos e das integrações existentes, sem entrar em detalhes internos de implementação. Conforme o C4 Model, um diagrama de contexto mostra o sistema em foco, seus usuários e os sistemas externos diretamente conectados a ele.  [oai_citation:0‡C4 model](https://c4model.com/diagrams/system-context?utm_source=chatgpt.com)

---

# Objetivo

Este documento tem como objetivos:

- definir o limite do Projeto TEAR V2;
- identificar os principais usuários do sistema;
- identificar os sistemas externos utilizados;
- documentar as responsabilidades de cada participante do ecossistema;
- servir como ponto de entrada para o entendimento da arquitetura.

Este documento complementa o `ARCHITECTURE.md`, oferecendo uma visão mais ampla do ambiente em que o sistema está inserido.

---

# Escopo

Este documento descreve exclusivamente:

- os usuários do sistema;
- os sistemas externos;
- as principais interações entre eles;
- o limite de responsabilidade do Projeto TEAR V2.

Não fazem parte deste documento:

- componentes internos;
- organização do código;
- regras de negócio;
- modelo de domínio;
- estrutura das planilhas;
- detalhes de implementação.

Esses assuntos são tratados em seus respectivos documentos.

---

# Visão Geral

O Projeto TEAR V2 é uma plataforma de gestão do programa de parcerias da Estúdio Elã.

O sistema centraliza as operações administrativas e operacionais relacionadas às parceiras, permitindo o gerenciamento de campanhas, briefings, entregas, documentos, pagamentos e demais processos envolvidos no ciclo de colaboração.

Embora o Portal seja a interface utilizada pelos usuários, sua operação depende de uma integração contínua com serviços do ecossistema Google, responsáveis pelo armazenamento e persistência das informações.

---

# Princípios

A definição do contexto do sistema segue os seguintes princípios arquiteturais:

## Limites Claros

Cada sistema possui responsabilidades bem definidas.

O Projeto TEAR V2 integra serviços externos, mas não assume responsabilidade por seu funcionamento interno.

---

## Baixo Acoplamento

Integrações externas devem ocorrer por meio de interfaces controladas, reduzindo o impacto de mudanças em serviços de terceiros.

---

## Fonte Única da Verdade

As informações persistentes do sistema são armazenadas na base operacional oficial.

Os demais componentes apenas consultam ou manipulam esses dados conforme suas responsabilidades.

---

## Separação entre Negócio e Infraestrutura

As regras de negócio pertencem ao domínio da aplicação.

Os serviços externos são utilizados apenas como mecanismos de persistência, armazenamento ou infraestrutura.

---

# Principais Atores

## Parceira

Pessoa responsável por participar das campanhas promovidas pela marca.

Utiliza o Portal para:

- acessar briefings;
- enviar conteúdos;
- consultar pagamentos;
- visualizar documentos;
- acompanhar seu histórico.

---

## Administrador

Responsável pela administração operacional do programa.

Realiza atividades como:

- gerenciamento de parceiras;
- configuração de campanhas;
- acompanhamento das entregas;
- aprovação de conteúdos;
- controle operacional.

---

## Operador

Responsável pela manutenção técnica e operacional do sistema.

Entre suas responsabilidades estão:

- deploy da aplicação;
- configuração do ambiente;
- gerenciamento das integrações;
- manutenção da infraestrutura.

---

# Sistemas Externos

O Projeto TEAR V2 depende de serviços externos para executar parte de suas funcionalidades.

Os principais sistemas integrados são:

| Sistema | Responsabilidade |
|----------|------------------|
| Google Sheets | Persistência dos dados operacionais |
| Google Drive | Armazenamento de arquivos e documentos |
| Google Apps Script | Execução do backend e automações |
| Navegador Web | Execução da interface do Portal |

Esses serviços fazem parte do contexto do sistema, mas não pertencem ao Projeto TEAR V2.

---

# Diagrama de Contexto

```text
                    +----------------------+
                    |      Parceira        |
                    +----------+-----------+
                               |
                               |
                               ▼
                    +----------------------+
                    |     Projeto TEAR     |
                    |         V2           |
                    +----------+-----------+
                               |
        +-----------+----------+-----------+-----------+
        |           |                      |           |
        ▼           ▼                      ▼           ▼
+---------------+ +---------------+ +---------------+ +---------------+
| Google Sheets | | Google Drive  | | Apps Script   | | Administrador |
+---------------+ +---------------+ +---------------+ +---------------+
```

O diagrama apresenta apenas o contexto do sistema, destacando seus principais usuários e dependências externas, sem detalhar a arquitetura interna ou as tecnologias empregadas em cada componente. Essa é a finalidade do nível **System Context** do C4 Model.  [oai_citation:1‡C4 model](https://c4model.com/diagrams/system-context?utm_source=chatgpt.com)

---

# Comunicação entre Componentes

O Projeto TEAR V2 é composto por um conjunto reduzido de componentes que trabalham de forma integrada para oferecer uma experiência única ao usuário.

Cada componente possui responsabilidades específicas e comunica-se apenas quando necessário, preservando baixo acoplamento e alta coesão.

O objetivo desta seção é documentar essas interações em nível de contexto, sem detalhar a implementação interna de cada componente. No C4 Model, esse tipo de descrição complementa a visão de contexto mostrando as principais relações entre o sistema e seus elementos externos.  [oai_citation:0‡C4 model](https://c4model.com/diagrams/system-context?utm_source=chatgpt.com)

---

# Componentes do Ecossistema

O ambiente operacional do Projeto TEAR V2 é composto pelos seguintes componentes:

| Componente | Responsabilidade |
|------------|------------------|
| Portal Web | Interface utilizada pelos usuários |
| Google Apps Script | Backend da aplicação |
| Google Sheets | Persistência dos dados operacionais |
| Google Drive | Armazenamento de arquivos |
| Usuários | Interagem com o sistema através do Portal |

Cada componente possui uma responsabilidade única dentro da arquitetura.

---

# Portal Web

O Portal Web representa a interface principal do sistema.

É através dele que as Parceiras e os Administradores realizam suas atividades diárias.

Entre suas responsabilidades estão:

- autenticação dos usuários;
- exibição de informações;
- envio de formulários;
- upload de arquivos;
- acompanhamento das campanhas;
- consulta de documentos;
- visualização de pagamentos.

O Portal não realiza persistência direta de dados.

Toda comunicação ocorre por intermédio do backend da aplicação.

---

# Google Apps Script

O Google Apps Script constitui o backend do Projeto TEAR V2.

É responsável por:

- executar as regras de negócio;
- validar solicitações;
- controlar autenticação;
- acessar os repositórios;
- manipular documentos;
- integrar os serviços do Google;
- retornar respostas ao Portal.

O Apps Script atua como intermediário entre a interface e os serviços de armazenamento.

---

# Google Sheets

O Google Sheets é utilizado como banco de dados operacional do sistema.

Sua responsabilidade é armazenar informações estruturadas relacionadas ao funcionamento do Projeto TEAR V2.

Entre os dados persistidos estão:

- parceiras;
- campanhas;
- briefings;
- entregas;
- pagamentos;
- documentos;
- configurações operacionais.

O acesso às planilhas ocorre exclusivamente através das camadas internas da aplicação.

Nenhum componente externo deve acessar diretamente a estrutura física dos dados.

---

# Google Drive

O Google Drive é responsável pelo armazenamento de arquivos utilizados pelo sistema.

Exemplos:

- documentos;
- contratos;
- imagens;
- vídeos;
- materiais enviados pelas parceiras;
- demais arquivos operacionais.

O Drive atua apenas como serviço de armazenamento.

As regras de negócio permanecem concentradas na aplicação.

---

# Fluxo Geral de Comunicação

O fluxo principal de comunicação ocorre conforme ilustrado abaixo.

```text
Usuário
    │
    ▼
Portal Web
    │
    ▼
Google Apps Script
    │
    ├──────────────► Google Sheets
    │                     │
    │                     ▼
    │              Dados Operacionais
    │
    └──────────────► Google Drive
                          │
                          ▼
                     Arquivos
```

Todo acesso aos dados passa obrigatoriamente pelo backend.

Essa arquitetura evita que a interface conheça detalhes de persistência e mantém as responsabilidades claramente separadas.

---

# Fluxo de Requisições

De forma simplificada, uma operação do sistema segue as etapas abaixo.

```text
Usuário

↓

Portal Web

↓

Google Apps Script

↓

Camada de Aplicação

↓

Domínio

↓

Repositórios

↓

Persistência
(Google Sheets / Google Drive)

↓

Resposta

↓

Portal Web

↓

Usuário
```

Cada camada possui responsabilidades específicas e comunica-se apenas com os elementos necessários para executar sua função.

---

# Princípios de Comunicação

A comunicação entre os componentes do Projeto TEAR V2 segue os seguintes princípios:

- toda solicitação parte da interface do usuário;
- o backend centraliza a lógica de negócio;
- serviços externos não contêm regras de negócio;
- dados são acessados exclusivamente pelas camadas responsáveis;
- integrações permanecem desacopladas da interface;
- componentes comunicam-se através de responsabilidades bem definidas.

Esses princípios contribuem para uma arquitetura mais previsível, de fácil manutenção e alinhada às boas práticas de separação de responsabilidades.

---

# Limites do Sistema

O Projeto TEAR V2 possui responsabilidades claramente definidas dentro do ecossistema em que está inserido.

Fazem parte do escopo do sistema:

- autenticação dos usuários;
- gerenciamento de parceiras;
- gerenciamento de campanhas;
- administração de briefings;
- recebimento de entregas;
- geração de documentos;
- acompanhamento de pagamentos;
- gerenciamento do histórico operacional.

Não fazem parte do escopo do sistema:

- funcionamento interno dos serviços Google;
- infraestrutura do navegador utilizado pelo usuário;
- gerenciamento físico dos arquivos armazenados no Google Drive;
- gerenciamento da infraestrutura da plataforma Google Apps Script.

O objetivo é manter uma separação clara entre a aplicação e os serviços que ela utiliza como infraestrutura. O System Context deve evidenciar esses limites de responsabilidade, deixando claro o que pertence ao sistema e o que é uma dependência externa.  [oai_citation:0‡C4 model](https://c4model.com/diagrams/system-context?utm_source=chatgpt.com)

---

# Responsabilidades dos Componentes

Cada componente do ecossistema possui uma responsabilidade específica.

| Componente | Responsabilidade |
|------------|------------------|
| Portal Web | Interface utilizada pelos usuários |
| Google Apps Script | Backend, regras de negócio e integração entre os componentes |
| Google Sheets | Persistência dos dados operacionais |
| Google Drive | Armazenamento de arquivos e documentos |
| Usuários | Interação com as funcionalidades disponibilizadas pelo Portal |

Essa separação reduz o acoplamento entre os componentes e facilita a evolução da arquitetura.

---

# Premissas Arquiteturais

A comunicação entre os componentes do Projeto TEAR V2 baseia-se nas seguintes premissas:

- o Portal nunca acessa diretamente a camada de persistência;
- toda comunicação passa pelo backend da aplicação;
- as regras de negócio permanecem centralizadas na aplicação;
- serviços externos são utilizados apenas como infraestrutura;
- cada componente possui responsabilidades bem definidas;
- a arquitetura deve favorecer simplicidade, baixo acoplamento e facilidade de manutenção.

Essas premissas orientam a evolução da arquitetura e ajudam a preservar a consistência técnica do sistema ao longo do tempo.

---

# Relação com os Demais Documentos

Este documento apresenta apenas a visão de contexto do sistema.

Os demais níveis de detalhamento encontram-se distribuídos na documentação oficial do projeto.

| Documento | Finalidade |
|-----------|------------|
| `README.md` | Visão geral do projeto |
| `ARCHITECTURE.md` | Arquitetura interna da aplicação |
| `DOMAIN.md` | Modelo de domínio e regras de negócio |
| `DEVELOPMENT_GUIDE.md` | Processo de desenvolvimento |
| `CONTRIBUTING.md` | Processo de contribuição |
| `docs/adrs/` | Decisões arquiteturais registradas |

Em conjunto, esses documentos fornecem uma visão completa da arquitetura, desde o contexto geral até as decisões técnicas que orientam a evolução do Projeto TEAR V2.

---

# Evolução do Contexto

O contexto do sistema deve ser revisado sempre que ocorrerem mudanças significativas no ecossistema da aplicação, como:

- inclusão de novos sistemas externos;
- remoção de integrações existentes;
- alteração dos principais atores do sistema;
- redefinição dos limites de responsabilidade da aplicação.

Alterações internas de implementação normalmente não exigem mudanças neste documento, pois seu objetivo é representar apenas a visão macro do sistema.

---

# Considerações Finais

O `SYSTEM_CONTEXT.md` representa o nível mais alto da documentação arquitetural do Projeto TEAR V2.

Seu propósito é permitir que qualquer pessoa compreenda rapidamente:

- qual é o sistema;
- quem utiliza o sistema;
- quais serviços externos participam de sua operação;
- quais são os limites de responsabilidade da aplicação.

A partir desta visão geral, os demais documentos aprofundam gradualmente os aspectos internos da arquitetura, do domínio e da implementação, mantendo uma documentação organizada, consistente e alinhada às boas práticas propostas pelo C4 Model.  [oai_citation:1‡C4 model](https://c4model.com/diagrams/system-context?utm_source=chatgpt.com)
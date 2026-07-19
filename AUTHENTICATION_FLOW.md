# Authentication Flow

O Fluxo de Autenticação (Authentication Flow) descreve como usuários são identificados, autenticados, autorizados e mantêm uma sessão ativa dentro do Projeto TEAR V2.

Seu objetivo é documentar toda a arquitetura de autenticação da aplicação, incluindo a integração com OAuth, o gerenciamento de sessões, a autorização de acesso e o ciclo de vida completo da identidade do usuário.

Este documento representa a referência oficial para todos os mecanismos de autenticação do sistema.

---

# Objetivo

Este documento tem como objetivos:

- documentar o fluxo completo de autenticação;
- documentar a integração OAuth;
- definir como sessões são criadas, utilizadas e encerradas;
- estabelecer responsabilidades entre Portal, Backend e Provedor de Identidade;
- servir como referência para futuras evoluções da arquitetura de autenticação.

---

# Escopo

Este documento contempla:

- autenticação do usuário;
- fluxo OAuth;
- gerenciamento de sessão;
- autorização das requisições;
- renovação da sessão;
- logout;
- tratamento de sessões expiradas;
- responsabilidades dos componentes envolvidos.

Não fazem parte deste documento:

- regras de negócio;
- modelo de domínio;
- persistência operacional;
- arquitetura geral do sistema;
- componentes da interface.

---

# Visão Geral

O Projeto TEAR V2 utiliza autenticação centralizada.

Todo acesso protegido passa obrigatoriamente pelo backend, responsável por validar a identidade do usuário, estabelecer sua sessão e autorizar o acesso aos recursos disponíveis.

Após autenticado, o usuário passa a operar através de uma sessão válida, cuja existência é verificada em todas as requisições protegidas.

A interface do Portal nunca toma decisões relacionadas à autenticação, atuando apenas como consumidora das informações fornecidas pelo backend.

---

# Componentes Envolvidos

O fluxo de autenticação envolve quatro componentes principais.

| Componente | Responsabilidade |
|------------|------------------|
| Portal | Inicia o processo de autenticação e envia as requisições protegidas |
| Backend (Apps Script) | Orquestra o fluxo OAuth, valida sessões e aplica regras de autorização |
| Provedor de Identidade | Autentica o usuário e emite as credenciais necessárias |
| Sessão | Representa o estado autenticado do usuário durante sua utilização do sistema |

Cada componente possui responsabilidades claramente definidas, evitando acoplamento entre autenticação, autorização e interface.

---

# Princípios da Autenticação

A arquitetura de autenticação segue os seguintes princípios.

## Autenticação Centralizada

Toda validação de identidade ocorre exclusivamente no backend.

Nenhuma decisão de autenticação é tomada pelo frontend.

---

## Sessões Controladas

Toda sessão possui um ciclo de vida definido.

A aplicação controla sua criação, utilização, renovação, expiração e encerramento.

---

## Menor Privilégio

Cada usuário possui acesso apenas aos recursos compatíveis com suas permissões.

Permissões adicionais somente podem ser concedidas explicitamente.

---

## Separação entre Autenticação e Autorização

Autenticar um usuário significa comprovar sua identidade.

Autorizar um usuário significa verificar quais recursos ele pode acessar.

Esses processos permanecem separados durante toda a arquitetura.

---

## Segurança por Padrão

O sistema adota uma postura de negação por padrão.

Toda requisição é considerada não autorizada até que a identidade e a sessão sejam devidamente validadas.

---

# Visão Geral do Fluxo

O processo de autenticação pode ser representado de forma simplificada pelo fluxo abaixo.

```text
Usuário

↓

Portal

↓

Backend (Apps Script)

↓

OAuth Provider

↓

Validação da Identidade

↓

Criação da Sessão

↓

Portal Autenticado
```

A partir desse momento, todas as requisições protegidas utilizam a sessão criada para validar a identidade do usuário antes da execução de qualquer operação.

Este modelo segue as recomendações modernas para OAuth 2.0 e gerenciamento de sessões, mantendo a autenticação centralizada no servidor e separando autenticação, autorização e estado de sessão.  [oai_citation:0‡developers.google.com](https://developers.google.com/identity/protocols/oauth2/resources/best-practices?utm_source=chatgpt.com)

---

# Fluxo OAuth

O Projeto TEAR V2 utiliza o protocolo OAuth como mecanismo para delegar a autenticação ao Provedor de Identidade, evitando que o Portal manipule diretamente credenciais do usuário.

O Backend atua como intermediador entre o Portal e o Provedor de Identidade, sendo responsável por validar os tokens recebidos e estabelecer a sessão da aplicação.

O fluxo ocorre conforme a sequência abaixo.

```text
Usuário

↓

Portal

↓

Solicitação de Login

↓

Provedor OAuth

↓

Autenticação do Usuário

↓

Token de Autenticação

↓

Backend (Apps Script)

↓

Validação

↓

Criação da Sessão

↓

Portal Autenticado
```

Durante esse processo, o Portal nunca acessa diretamente informações sensíveis relacionadas à autenticação.

---

# Criação da Sessão

Após a validação da identidade, o Backend cria uma sessão autenticada para o usuário.

Essa sessão representa o estado autenticado da aplicação e será utilizada para validar todas as requisições protegidas.

A criação da sessão envolve:

- identificação do usuário;
- carregamento das permissões;
- registro do momento de autenticação;
- definição do tempo de expiração;
- disponibilização da sessão para o Portal.

A implementação da sessão permanece totalmente sob responsabilidade do Backend.

---

# Validação das Requisições

Toda requisição protegida executa o mesmo processo de validação.

```text
Requisição

↓

Verificar Sessão

↓

Sessão válida?

├── Sim → Executar operação
│
└── Não → Retornar acesso negado
```

Nenhuma funcionalidade protegida é executada antes da validação completa da sessão.

---

# Renovação da Sessão

Sessões possuem duração limitada.

Antes do encerramento definitivo, o sistema pode renová-las de acordo com a política de autenticação definida pela aplicação.

A renovação pode ocorrer:

- automaticamente;
- mediante nova autenticação;
- conforme regras do Provedor de Identidade.

A estratégia utilizada deve preservar a segurança sem comprometer a experiência do usuário.

---

# Expiração

Toda sessão possui um prazo máximo de validade.

Quando esse prazo é atingido:

- a sessão deixa de ser considerada válida;
- novas requisições protegidas são recusadas;
- o usuário é redirecionado para um novo processo de autenticação.

O encerramento automático reduz riscos relacionados ao uso prolongado de credenciais válidas.

---

# Logout

O encerramento da sessão pode ocorrer de duas formas.

## Logout iniciado pelo usuário

Quando solicitado pelo usuário:

- a sessão é invalidada;
- os dados temporários são removidos;
- o Portal retorna ao estado não autenticado.

---

## Logout automático

Pode ocorrer quando:

- a sessão expira;
- a autenticação torna-se inválida;
- ocorre revogação das credenciais;
- é detectada alguma inconsistência de segurança.

Em qualquer uma dessas situações, o usuário deverá realizar uma nova autenticação.

---

# Tratamento de Erros

Durante o fluxo de autenticação podem ocorrer diferentes tipos de falhas.

Entre elas:

- autenticação recusada;
- token inválido;
- token expirado;
- sessão inexistente;
- sessão expirada;
- permissões insuficientes;
- falha de comunicação com o Provedor OAuth.

Sempre que possível, o Backend deve retornar respostas padronizadas, permitindo que o Portal trate cada situação de forma consistente.

---

# Fluxos Alternativos

Além do fluxo principal, o sistema deve prever cenários excepcionais.

Entre eles:

- cancelamento do login pelo usuário;
- perda da sessão durante a navegação;
- expiração do token OAuth;
- indisponibilidade temporária do Provedor de Identidade;
- tentativa de acesso com sessão inválida.

Todos esses cenários devem resultar em um estado seguro, preservando a integridade da autenticação e impedindo acesso não autorizado.

A utilização do OAuth 2.0 combinada com uma camada própria de gerenciamento de sessão segue as recomendações atuais para aplicações web, permitindo separar autenticação, autorização e controle de sessão de maneira segura e escalável. ([developers.google.com](https://developers.google.com/identity/protocols/oauth2/resources/best-practices?utm_source=chatgpt.com))

---

# Controle de Acesso

Após a autenticação, todas as operações executadas pelo usuário passam pelo processo de autorização.

A autorização determina quais recursos podem ser acessados pela sessão autenticada, garantindo que cada usuário visualize e execute apenas as funcionalidades compatíveis com seu perfil.

O fluxo de autorização ocorre em todas as requisições protegidas antes da execução da lógica de negócio.

```text
Requisição

↓

Sessão válida?

↓

Permissão suficiente?

↓

Executar operação

↓

Resposta
```

Caso qualquer uma das verificações falhe, a operação é interrompida imediatamente.

---

# Responsabilidades

Cada componente possui responsabilidades específicas dentro do processo de autenticação.

| Componente | Responsabilidade |
|------------|------------------|
| Portal | Solicitar autenticação, armazenar apenas o estado necessário da interface e encaminhar requisições autenticadas |
| Backend (Apps Script) | Validar identidade, controlar sessões, aplicar autorização e proteger os recursos |
| Provedor OAuth | Autenticar o usuário e emitir credenciais conforme o protocolo OAuth |
| Sessão | Representar o estado autenticado do usuário durante sua permanência na aplicação |

Essa divisão reduz o acoplamento e facilita futuras mudanças no mecanismo de autenticação.

---

# Boas Práticas de Segurança

A arquitetura de autenticação deve seguir princípios consolidados de segurança.

- nunca armazenar credenciais em código-fonte;
- proteger credenciais e tokens em armazenamento seguro;
- utilizar apenas conexões seguras (HTTPS);
- solicitar apenas os escopos OAuth realmente necessários;
- validar toda requisição protegida;
- invalidar sessões expiradas;
- revogar credenciais quando não forem mais necessárias;
- registrar eventos relevantes de autenticação para auditoria.

Além disso, a aplicação deve tratar falhas de autenticação sempre assumindo um estado seguro, negando acesso quando houver qualquer inconsistência.  [oai_citation:0‡Google for Developers](https://developers.google.com/identity/protocols/oauth2/resources/best-practices?utm_source=chatgpt.com)

---

# Auditoria

Eventos relacionados à autenticação devem ser registrados para facilitar rastreabilidade e diagnóstico.

Entre eles:

- login realizado;
- logout;
- criação de sessão;
- renovação de sessão;
- expiração de sessão;
- falhas de autenticação;
- tentativas de acesso não autorizado.

Os registros de auditoria não devem armazenar informações sensíveis como senhas, tokens ou credenciais completas.

---

# Relação com os Demais Documentos

O fluxo de autenticação complementa os demais documentos arquiteturais do Projeto TEAR V2.

| Documento | Finalidade |
|-----------|------------|
| `README.md` | Visão geral do projeto |
| `SYSTEM_CONTEXT.md` | Comunicação entre os componentes do sistema |
| `ARCHITECTURE.md` | Arquitetura em camadas da aplicação |
| `DOMAIN.md` | Regras e conceitos do domínio |
| `DATA_MODEL.md` | Modelo lógico de dados |
| `UI_ARCHITECTURE.md` | Organização da interface do Portal |
| `DEVELOPMENT_GUIDE.md` | Processo de desenvolvimento |
| `CONTRIBUTING.md` | Processo de contribuição |

Em conjunto, esses documentos descrevem a arquitetura completa da aplicação, incluindo sua estratégia de autenticação e autorização.

---

# Evolução

O mecanismo de autenticação deve poder evoluir sem impactar as demais camadas da aplicação.

Mudanças como:

- substituição do provedor OAuth;
- adoção de OpenID Connect;
- novos mecanismos de autenticação multifator (MFA);
- alterações na política de sessão;
- inclusão de novos perfis de acesso;

devem ocorrer preservando a interface pública do sistema e mantendo a separação entre autenticação, autorização e regras de negócio.

---

# Considerações Finais

O `AUTHENTICATION_FLOW.md` documenta a arquitetura de autenticação do Projeto TEAR V2.

Seu objetivo é definir como usuários são autenticados, como sessões são gerenciadas e como o acesso aos recursos é autorizado de forma consistente e segura.

Ao centralizar a autenticação no backend, utilizar OAuth como protocolo de identidade e separar claramente autenticação, autorização e gerenciamento de sessão, o projeto estabelece uma base sólida para evolução futura, manutenção simplificada e conformidade com boas práticas modernas de segurança para aplicações web.  [oai_citation:1‡Google for Developers](https://developers.google.com/identity/protocols/oauth2?utm_source=chatgpt.com)
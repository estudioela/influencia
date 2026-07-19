````markdown
# Navigation

O documento `NAVIGATION.md` descreve a estrutura real de navegação do Portal TEAR V2.

Seu objetivo é documentar as páginas existentes, o mecanismo de entrada, os layouts compartilhados e a relação entre interface e backend.

Este documento foi construído através da análise do código-fonte existente.

Não descreve uma arquitetura futura ou desejada.

---

# Objetivo

Este documento tem como objetivos:

- listar todas as páginas existentes no Portal;
- documentar o mecanismo real de carregamento das telas;
- identificar layouts compartilhados;
- mapear a relação entre páginas e componentes;
- registrar como o usuário percorre a aplicação.

---

# Escopo

Este documento contempla:

- páginas HTML existentes;
- entrada principal da aplicação;
- carregamento de templates;
- layouts compartilhados;
- comunicação frontend/backend;
- organização da navegação.

Não fazem parte deste documento:

- regras de negócio;
- modelo de dados;
- autenticação detalhada;
- arquitetura interna dos módulos;
- persistência.

Esses assuntos são tratados nos documentos específicos.

---

# Arquitetura de Navegação

O Portal TEAR V2 utiliza o sistema de templates do Google Apps Script HTML Service.

A aplicação não utiliza uma arquitetura tradicional baseada em múltiplas rotas HTTP independentes.

O ponto central de entrada é o endpoint do Web App.

O fluxo real é:

```text
Usuário

↓

/exec

↓

doGet(e)

↓

src/entrypoint/Portal.js

↓

HtmlService.createTemplateFromFile()

↓

src/ui/*.html

↓

Interface renderizada
````

---

# Entrada Principal

## Entrypoint

Arquivo responsável pela entrada da aplicação:

```text
src/entrypoint/Portal.js
```

Responsabilidades:

* receber solicitações do Web App;
* interpretar parâmetros recebidos;
* selecionar a página correta;
* retornar o template HTML correspondente;
* disponibilizar funções públicas utilizadas pelo frontend.

---

# Função Principal

A entrada principal do Portal é:

```javascript
doGet(e)
```

Essa função atua como roteador inicial da aplicação.

Responsabilidades:

* receber a requisição HTTP;
* identificar o conteúdo solicitado;
* carregar o template correspondente;
* preparar a renderização da interface.

---

# Comunicação Frontend e Backend

A comunicação entre as páginas HTML e o backend ocorre através de:

```javascript
google.script.run
```

O fluxo de comunicação é:

```text
Página HTML

↓

google.script.run

↓

Função pública Apps Script

↓

src/entrypoint/Portal.js

↓

Módulo responsável

↓

Resposta para interface
```

As páginas frontend não acessam diretamente:

* Google Sheets;
* Google Drive;
* regras de negócio;
* entidades internas.

Toda comunicação passa pelo backend.

---

# Estrutura Geral

A estrutura relacionada à navegação está organizada da seguinte forma:

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
└── ui/
    │
    ├── login.html
    ├── dashboard.html
    ├── admin.html
    ├── briefing.html
    ├── compilar-mes.html
    ├── documentos.html
    ├── entrega.html
    ├── envio.html
    ├── financeiro.html
    ├── pagamentos.html
    ├── pendencias.html
    ├── perfil.html
    └── portal-head.html
```

---

# Layout Compartilhado

O layout compartilhado identificado no projeto é:

```text
src/ui/portal-head.html
```

As páginas utilizam:

```html
<?!= include('src/ui/portal-head') ?>
```

Esse arquivo funciona como base comum da interface.

Responsabilidades:

* disponibilizar estrutura compartilhada;
* carregar elementos comuns;
* manter consistência visual entre páginas;
* evitar duplicação de código HTML.

---

# Modelo de Página

Cada página segue o padrão:

```text
Página HTML

↓

portal-head.html

↓

HTML específico da funcionalidade

↓

JavaScript da página

↓

google.script.run

↓

Backend Apps Script
```

As páginas são responsáveis pela camada de apresentação e interação.

As regras de negócio permanecem nos módulos backend.

```
```
````markdown
---

# Inventário Completo das Páginas

Esta seção apresenta todas as páginas HTML existentes identificadas no código-fonte do Portal TEAR V2.

As páginas são carregadas através do mecanismo:

```text
/exec

↓

doGet(e)

↓

src/entrypoint/Portal.js

↓

HtmlService.createTemplateFromFile()

↓

src/ui/*.html
````

---

# Páginas Identificadas

| Página        | Arquivo                    | Entrada        | Layout             | Responsabilidade                      |
| ------------- | -------------------------- | -------------- | ------------------ | ------------------------------------- |
| Login         | `src/ui/login.html`        | `login`        | `portal-head.html` | Autenticação e entrada no Portal      |
| Dashboard     | `src/ui/dashboard.html`    | `dashboard`    | `portal-head.html` | Página principal da aplicação         |
| Administração | `src/ui/admin.html`        | `admin`        | `portal-head.html` | Operações administrativas             |
| Briefing      | `src/ui/briefing.html`     | `briefing`     | `portal-head.html` | Consulta e gerenciamento de briefings |
| Compilar Mês  | `src/ui/compilar-mes.html` | `compilar-mes` | `portal-head.html` | Execução do fechamento mensal         |
| Documentos    | `src/ui/documentos.html`   | `documentos`   | `portal-head.html` | Geração e consulta de documentos      |
| Entrega       | `src/ui/entrega.html`      | `entrega`      | `portal-head.html` | Gestão de entregas                    |
| Envio         | `src/ui/envio.html`        | `envio`        | `portal-head.html` | Controle de envios logísticos         |
| Financeiro    | `src/ui/financeiro.html`   | `financeiro`   | `portal-head.html` | Visão financeira                      |
| Pagamentos    | `src/ui/pagamentos.html`   | `pagamentos`   | `portal-head.html` | Controle de pagamentos                |
| Pendências    | `src/ui/pendencias.html`   | `pendencias`   | `portal-head.html` | Controle de pendências                |
| Perfil        | `src/ui/perfil.html`       | `perfil`       | `portal-head.html` | Dados do perfil autenticado           |

---

# Login

Arquivo:

```text
src/ui/login.html
```

Responsabilidade:

* iniciar o fluxo de autenticação;
* validar entrada do usuário;
* iniciar sessão;
* encaminhar usuário autenticado para o Portal.

Comunicação principal:

```javascript
google.script.run
```

Módulo relacionado:

```text
src/modulos/Autenticacao.js
src/modulos/Usuario.js
```

---

# Dashboard

Arquivo:

```text
src/ui/dashboard.html
```

Responsabilidade:

* apresentar a visão principal do Portal;
* concentrar acesso aos módulos disponíveis;
* exibir informações gerais do usuário.

Comunicação principal:

```javascript
google.script.run
```

---

# Administração

Arquivo:

```text
src/ui/admin.html
```

Responsabilidade:

* disponibilizar operações administrativas;
* gerenciar ações restritas;
* operar fluxos internos do Portal.

Módulos relacionados:

```text
src/modulos/Usuario.js
src/modulos/Autenticacao.js
src/modulos/Parceira.js
```

---

# Briefing

Arquivo:

```text
src/ui/briefing.html
```

Responsabilidade:

* consultar informações de briefing;
* apresentar dados da colaboração;
* permitir operações relacionadas ao briefing.

Módulo relacionado:

```text
src/modulos/Briefing.js
```

---

# Compilar Mês

Arquivo:

```text
src/ui/compilar-mes.html
```

Responsabilidade:

* executar processos relacionados ao ciclo mensal;
* iniciar a compilação de uma colaboração.

Módulo relacionado:

```text
src/modulos/ColaboracaoMensal.js
```

---

# Documentos

Arquivo:

```text
src/ui/documentos.html
```

Responsabilidade:

* gerar documentos;
* consultar documentos produzidos;
* apresentar resultados gerados pelo sistema.

Módulo relacionado:

```text
src/modulos/Documento.js
```

---

# Entrega

Arquivo:

```text
src/ui/entrega.html
```

Responsabilidade:

* acompanhar entregas;
* enviar materiais;
* consultar status de produção.

Módulo relacionado:

```text
src/modulos/Entrega.js
```

---

# Envio

Arquivo:

```text
src/ui/envio.html
```

Responsabilidade:

* controlar informações logísticas;
* acompanhar envios;
* atualizar dados relacionados ao transporte.

Módulo relacionado:

```text
src/modulos/Envio.js
```

---

# Financeiro

Arquivo:

```text
src/ui/financeiro.html
```

Responsabilidade:

* apresentar informações financeiras;
* consultar dados consolidados.

Módulo relacionado:

```text
src/modulos/Financeiro.js
```

---

# Pagamentos

Arquivo:

```text
src/ui/pagamentos.html
```

Responsabilidade:

* listar pagamentos;
* liberar cobranças;
* confirmar pagamentos.

Módulo relacionado:

```text
src/modulos/Financeiro.js
```

---

# Pendências

Arquivo:

```text
src/ui/pendencias.html
```

Responsabilidade:

* apresentar pendências existentes;
* auxiliar acompanhamento operacional.

Módulo relacionado:

```text
src/modulos/PortalConteudo.js
```

---

# Perfil

Arquivo:

```text
src/ui/perfil.html
```

Responsabilidade:

* exibir informações do usuário;
* atualizar dados cadastrais permitidos.

Módulo relacionado:

```text
src/modulos/Perfil.js
```

---

# Páginas Não Encontradas

Durante a análise do código-fonte não foram encontradas páginas HTML específicas para:

| Conceito      | Situação                                                              |
| ------------- | --------------------------------------------------------------------- |
| Parceiras     | Existe como módulo backend, sem página própria identificada           |
| Colaborações  | Existe como módulo backend, sem página própria identificada           |
| Configurações | Nenhuma página encontrada                                             |
| Usuários      | Gerenciado por módulos administrativos, sem tela própria identificada |

Esses conceitos fazem parte da lógica interna do sistema, mas não representam destinos navegáveis independentes.

```
```

````markdown id="8r7m2k"
---

# Mapeamento Página → Backend

As páginas do Portal TEAR V2 funcionam como camadas de apresentação.

A comunicação com regras de negócio ocorre através do backend, utilizando chamadas:

```javascript
google.script.run
````

O relacionamento identificado entre interface e módulos backend é:

| Página              | Backend relacionado                            |
| ------------------- | ---------------------------------------------- |
| `login.html`        | `Autenticacao.js`, `Usuario.js`                |
| `dashboard.html`    | `PortalConteudo.js`                            |
| `admin.html`        | `Usuario.js`, `Autenticacao.js`, `Parceira.js` |
| `briefing.html`     | `Briefing.js`                                  |
| `compilar-mes.html` | `ColaboracaoMensal.js`                         |
| `documentos.html`   | `Documento.js`                                 |
| `entrega.html`      | `Entrega.js`                                   |
| `envio.html`        | `Envio.js`                                     |
| `financeiro.html`   | `Financeiro.js`                                |
| `pagamentos.html`   | `Financeiro.js`                                |
| `pendencias.html`   | `PortalConteudo.js`                            |
| `perfil.html`       | `Perfil.js`                                    |

---

# Inventário de Layouts

O projeto possui um layout compartilhado identificado:

| Layout      | Arquivo                   | Responsabilidade                        |
| ----------- | ------------------------- | --------------------------------------- |
| Portal Head | `src/ui/portal-head.html` | Estrutura comum carregada pelas páginas |

Todas as páginas utilizam:

```html
<?!= include('src/ui/portal-head') ?>
```

O layout compartilhado tem como objetivo:

* evitar repetição de estrutura HTML;
* centralizar elementos comuns;
* manter consistência visual;
* facilitar manutenção da interface.

---

# Inventário de Componentes

A análise do código-fonte não identificou uma biblioteca isolada de componentes frontend.

Não foram encontradas estruturas como:

```text
components/
design-system/
primitives/
tokens/
```

no código ativo da aplicação.

Os componentes estão implementados diretamente dentro das páginas HTML.

---

# Componentes Identificados

| Componente             | Localização                          | Tipo                 |
| ---------------------- | ------------------------------------ | -------------------- |
| Portal Head            | `src/ui/portal-head.html`            | Layout compartilhado |
| Formulários            | Arquivos individuais `src/ui/*.html` | Interface            |
| Botões de ação         | Arquivos individuais `src/ui/*.html` | Interface            |
| Tabelas                | Arquivos individuais `src/ui/*.html` | Exibição de dados    |
| Mensagens de feedback  | Arquivos individuais `src/ui/*.html` | Comunicação visual   |
| Controles de navegação | Arquivos individuais `src/ui/*.html` | Navegação            |

---

# Fluxo Completo de Navegação

O fluxo geral identificado é:

```text
Usuário

↓

Web App (/exec)

↓

doGet(e)

↓

Portal.js

↓

Template HTML

↓

portal-head.html

↓

Página específica

↓

google.script.run

↓

Função pública Backend

↓

Módulo responsável

↓

Resposta para Interface
```

---

# Convenções de Navegação

A navegação do Portal TEAR V2 segue as seguintes convenções:

* o carregamento inicial ocorre sempre através do Web App;
* o roteamento é controlado pelo `doGet(e)`;
* páginas são armazenadas em `src/ui/`;
* funcionalidades de negócio permanecem em `src/modulos/`;
* páginas não acessam diretamente dados persistidos;
* comunicação frontend/backend ocorre via `google.script.run`;
* layouts compartilhados são reutilizados através de `include()`.

---

# Evolução da Navegação

Novas páginas devem seguir o padrão existente.

Ao criar uma nova página:

1. adicionar o arquivo em:

```text
src/ui/
```

2. registrar o carregamento no:

```text
src/entrypoint/Portal.js
```

3. utilizar o layout compartilhado:

```html
<?!= include('src/ui/portal-head') ?>
```

4. comunicar-se com o backend através de:

```javascript
google.script.run
```

5. atualizar este documento.

---

# Relação com Outros Documentos

O `NAVIGATION.md` complementa:

| Documento                | Relação                                   |
| ------------------------ | ----------------------------------------- |
| `SYSTEM_CONTEXT.md`      | Contexto de comunicação entre componentes |
| `ARCHITECTURE.md`        | Estrutura geral da aplicação              |
| `UI_ARCHITECTURE.md`     | Organização visual da interface           |
| `DATA_MODEL.md`          | Estrutura dos dados persistidos           |
| `DOMAIN.md`              | Conceitos do negócio                      |
| `AUTHENTICATION_FLOW.md` | Processo de autenticação                  |
| `SECURITY.md`            | Controles de segurança                    |
| `DEVELOPMENT_GUIDE.md`   | Desenvolvimento e manutenção              |

---

# Conclusão

O `NAVIGATION.md` documenta a estrutura real de navegação do Portal TEAR V2.

Foram identificados:

* 12 páginas HTML;
* 1 layout compartilhado;
* 1 mecanismo central de entrada;
* comunicação via `google.script.run`;
* relacionamento entre páginas e módulos backend.

A arquitetura atual utiliza Google Apps Script HTML Service como camada de apresentação, mantendo separação entre interface, entrada da aplicação e módulos responsáveis pela lógica do sistema.

Este documento representa o inventário oficial da navegação do Portal TEAR V2.

```
```

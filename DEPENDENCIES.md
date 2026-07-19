# Dependencies

## Objetivo

O documento `DEPENDENCIES.md` descreve todas as dependências técnicas utilizadas pelo Projeto TEAR V2.

O objetivo é registrar:

- serviços Google utilizados;
- APIs externas;
- bibliotecas;
- runtime;
- ferramentas de desenvolvimento;
- integrações externas;
- dependências internas entre módulos.

Este documento representa exclusivamente as dependências encontradas no código atual.

Não representa dependências planejadas ou futuras.

---

# Visão Geral

O Projeto TEAR V2 é uma aplicação baseada em:

```
Google Apps Script

+

Google Sheets

+

HTML Service

+

JavaScript V8
```

A arquitetura utiliza:

```
Frontend HTML

↓

google.script.run

↓

Apps Script Backend

↓

Serviços Google

↓

Persistência
```

---

# Runtime

## Google Apps Script V8

O sistema executa sobre:

```
Google Apps Script Runtime V8
```

Permite utilização de:

- classes JavaScript;
- const/let;
- módulos internos;
- sintaxe moderna ECMAScript.

---

# Dependências Google Apps Script

## SpreadsheetApp

## Status

🟢 Utilizado

---

## Localização

Principalmente:

```
src/entrypoint/Portal.js
```

---

## Responsabilidade

Gerenciar acesso às planilhas do sistema.

Uso identificado:

```
SpreadsheetApp.openById()
```

---

## Fluxo

```
Portal.js

↓

SpreadsheetApp

↓

Planilha principal

↓

Repositories / ACL
```

---

## Dependência relacionada

Configuração:

```
SPREADSHEET_ID
```

---

# HtmlService

## Status

🟢 Utilizado

---

## Localização

```
src/entrypoint/Portal.js

src/shared/Nucleo.js
```

---

## Responsabilidade

Renderização das páginas frontend.

Uso identificado:

```
HtmlService.createTemplateFromFile()
```

e:

```
HtmlService.createHtmlOutputFromFile()
```

---

## Fluxo

```
/exec

↓

doGet()

↓

HtmlService

↓

src/ui/*.html
```

---

# PropertiesService

## Status

🟢 Utilizado

---

## Localização

```
src/shared/Nucleo.js
```

---

## Responsabilidade

Armazenamento de configurações externas.

Uso:

```
PropertiesService
    .getScriptProperties()
```

---

## Configurações armazenadas

Exemplos:

```
SPREADSHEET_ID

SPREADSHEET_ID_LEGADO

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET
```

---

## Fluxo

```
Script Properties

↓

getConfig()

↓

Módulos
```

---

# ScriptApp

## Status

🟢 Utilizado

---

## Localização

```
src/entrypoint/Portal.js
```

---

## Responsabilidade

Obter informações do deployment atual.

Uso identificado:

```
ScriptApp.getService().getUrl()
```

---

## Aplicação

Utilizado no fluxo OAuth:

```
Deployment Web App

↓

URL /exec

↓

redirectUri
```

---

# UrlFetchApp

## Status

🟢 Utilizado

---

## Responsabilidade

Realizar chamadas HTTP externas.

---

## Integrações identificadas

Foram encontradas três utilizações principais.

---

# Integração BrasilAPI

## Localização

```
src/modulos/Parceira.js
```

---

## Endpoint

```
https://brasilapi.com.br/api/cep/v1/
```

---

## Objetivo

Consulta de dados através de CEP.

---

## Fluxo

```
Parceira.js

↓

UrlFetchApp

↓

BrasilAPI

↓

Dados de endereço
```

---

# Integração Google OAuth

## Localização

```
src/modulos/Autenticacao.js
```

---

## Endpoints utilizados

```
https://oauth2.googleapis.com/token
```

e:

```
https://oauth2.googleapis.com/tokeninfo
```

---

## Objetivo

- troca de authorization code;
- validação de identidade Google;
- autenticação de usuários.

---

## Fluxo

```
Usuário

↓

Google OAuth

↓

UrlFetchApp

↓

Token Google

↓

Sessão TEAR
```

---

# DriveApp

## Status

⚪ Não utilizado

---

## Observação

A auditoria não encontrou:

```
DriveApp

createFile()

createFolder()

getFolderById()

getFiles()
```

---

## Impacto

O sistema atualmente trabalha com referências externas de arquivos.

Não existe gerenciamento automático de Google Drive.

---

# Bibliotecas externas

## npm

## Status

🟢 Utilizado para desenvolvimento

---

## package.json

Dependências encontradas:

```json
{
  "devDependencies": {
    "eslint": "^9.13.0",
    "jest": "^29.7.0"
  }
}
```

---

# ESLint

## Responsabilidade

Padronização e análise estática do código.

---

## Uso

Comando:

```
npm run lint
```

---

# Jest

## Responsabilidade

Execução dos testes automatizados.

---

## Uso

Comando:

```
npm test
```

---

# Dependências externas identificadas

| Dependência | Tipo | Uso |
|-|-|-|
| Google Apps Script | Runtime | Execução principal |
| Google Sheets API interna | Persistência | Dados |
| HtmlService | Frontend | Renderização |
| BrasilAPI | API externa | Consulta CEP |
| Google OAuth | Serviço externo | Autenticação |
| ESLint | Desenvolvimento | Qualidade |
| Jest | Desenvolvimento | Testes |

---

# Estado Atual

Dependências identificadas:

- [x] Runtime Google Apps Script
- [x] Serviços Google
- [x] APIs externas
- [x] Bibliotecas npm
- [x] Ferramentas de desenvolvimento
- [x] Integrações HTTP

---

# Matriz de Dependências

Esta seção relaciona cada dependência utilizada com os arquivos responsáveis pelo consumo.

Fluxo:

```
Dependência

↓

Arquivo consumidor

↓

Função

↓

Impacto no sistema
```

---

# SpreadsheetApp

## Arquivo consumidor

```
src/entrypoint/Portal.js
```

---

## Funções relacionadas

```javascript
abrirBaseDeDados()

abrirBaseLegada()
```

---

## Uso

```javascript
SpreadsheetApp.openById()
```

---

## Impacto

Responsável por conectar o sistema à camada de persistência.

Sem esta dependência:

- planilhas não são carregadas;
- repositories não conseguem acessar dados;
- serviços ficam sem persistência.

---

# HtmlService

## Arquivos consumidores

```
src/entrypoint/Portal.js

src/shared/Nucleo.js
```

---

## Funções relacionadas

```javascript
doGet()

include()
```

---

## Uso

Renderização das interfaces:

```
src/ui/*.html
```

---

## Impacto

Responsável pelo frontend executado no navegador.

---

# PropertiesService

## Arquivo consumidor

```
src/shared/Nucleo.js
```

---

## Função relacionada

```javascript
getConfig()
```

---

## Uso

```javascript
PropertiesService
    .getScriptProperties()
    .getProperty(key)
```

---

## Impacto

Centraliza configurações externas.

Sem esta dependência:

- IDs de planilhas não seriam carregados;
- OAuth não funcionaria;
- ambiente perderia configuração.

---

# ScriptApp

## Arquivo consumidor

```
src/entrypoint/Portal.js
```

---

## Função relacionada

```javascript
ScriptApp.getService().getUrl()
```

---

## Uso

Obtenção da URL do Web App.

---

## Impacto

Necessário para o fluxo OAuth:

```
Google OAuth

↓

redirectUri

↓

Web App TEAR
```

---

# UrlFetchApp

## Arquivo consumidor

```
src/modulos/Parceira.js

src/modulos/Autenticacao.js
```

---

# BrasilAPI

## Arquivo

```
src/modulos/Parceira.js
```

---

## Função relacionada

Consulta de endereço:

```javascript
UrlFetchApp.fetch()
```

---

## Endpoint

```
https://brasilapi.com.br/api/cep/v1/
```

---

## Impacto

Permite enriquecimento de dados cadastrais.

---

# Google OAuth API

## Arquivo

```
src/modulos/Autenticacao.js
```

---

## Funções relacionadas

```javascript
iniciarLoginComGoogle()

entrarComCodigoOAuth()
```

---

## Endpoints

```
https://accounts.google.com/o/oauth2/v2/auth

https://oauth2.googleapis.com/token

https://oauth2.googleapis.com/tokeninfo
```

---

## Impacto

Responsável por:

- autenticação Google;
- validação de identidade;
- criação de sessão.

---

# ESLint

## Origem

```
package.json
```

---

## Tipo

Dependência de desenvolvimento.

---

## Uso

Comando:

```
npm run lint
```

---

## Impacto

Executa análise estática do código.

Valida:

- padrões;
- erros sintáticos;
- qualidade.

---

# Jest

## Origem

```
package.json
```

---

## Tipo

Dependência de desenvolvimento.

---

## Uso

Comando:

```
npm test
```

---

## Impacto

Executa testes automatizados.

Configuração:

```json
{
  "testEnvironment": "node",
  "testMatch": [
    "<rootDir>/test/**/*.test.js"
  ]
}
```

---

# Dependências Internas

Além dos serviços externos, o sistema possui dependências entre módulos internos.

---

# Backend

Fluxo:

```
Entrypoint

↓

Controllers

↓

Services

↓

Repositories

↓

ACL

↓

Google Services
```

---

# Frontend

Dependências:

```
HtmlService

↓

src/ui/*.html

↓

google.script.run

↓

Funções públicas Apps Script
```

---

# Persistência

Dependência:

```
SpreadsheetApp

↓

Repositories

↓

Abas Google Sheets
```

---

# Autenticação

Dependências:

```
PropertiesService

+

ScriptApp

+

UrlFetchApp

+

Google OAuth
```

---

# Integrações Externas

| Serviço | Arquivo | Finalidade |
|-|-|-|
| Google OAuth | Autenticacao.js | Login |
| BrasilAPI | Parceira.js | CEP |
| Google Sheets | Portal.js | Persistência |
| HtmlService | Portal.js | Interface |

---

# Dependências Ausentes

Não foram encontradas:

- bibliotecas frontend externas;
- frameworks JavaScript;
- React;
- Vue;
- Angular;
- Axios;
- ORMs;
- bancos externos;
- APIs REST próprias.

---

# Diagnóstico

A arquitetura atual possui baixa dependência externa.

O núcleo depende principalmente de:

```
Google Apps Script

+

Google Workspace

+

Poucas integrações HTTP
```

---

# Risco Arquitetural

Dependência crítica:

```
Google Apps Script
```

Motivo:

- runtime proprietário;
- APIs específicas Google;
- persistência acoplada ao Sheets.

---

# Status Parcial

Mapeamento realizado:

- [x] Dependências Google
- [x] Dependências HTTP
- [x] Dependências npm
- [x] Arquivos consumidores
- [x] Impactos identificados

---

# Ferramentas de Desenvolvimento

O projeto possui ferramentas locais para validação, testes e manutenção.

---

# Node.js

## Status

🟢 Utilizado

---

## Responsabilidade

Executar ferramentas auxiliares de desenvolvimento.

Uso:

```
npm scripts
```

---

## Scripts disponíveis

```json
{
  "test": "jest",
  "lint": "eslint .",
  "check": "npm run lint && npm test",
  "preview": "node scripts/preview-server.mjs"
}
```

---

# ESLint

## Tipo

Dependência de desenvolvimento.

---

## Responsabilidade

Garantir qualidade e padronização do código JavaScript.

---

## Configuração

Arquivo:

```
eslint.config.js
```

---

## Execução

```bash
npm run lint
```

---

## Impacto

Detecta:

- erros sintáticos;
- padrões inconsistentes;
- problemas de qualidade.

---

# Jest

## Tipo

Dependência de desenvolvimento.

---

## Responsabilidade

Executar testes automatizados.

---

## Configuração

Arquivo:

```
package.json
```

Configuração:

```json
{
  "testEnvironment": "node",
  "testMatch": [
    "<rootDir>/test/**/*.test.js"
  ]
}
```

---

## Execução

```bash
npm test
```

---

# Preview Server

## Status

🟡 Ferramenta auxiliar

---

## Script

```
scripts/preview-server.mjs
```

---

## Responsabilidade

Disponibilizar ambiente local de visualização.

---

## Execução

```bash
npm run preview
```

---

# Dependências Internas

Além dos serviços externos, o TEAR V2 possui dependências entre módulos internos.

---

# Camada de Entrada

## Dependências

```
Portal.js

↓

HtmlService

↓

src/ui/*.html
```

---

## Responsabilidade

Disponibilizar o frontend.

---

# Comunicação Frontend

## Dependências

```
google.script.run

↓

Funções globais Apps Script

↓

Controllers
```

---

## Responsabilidade

Permitir chamadas assíncronas entre navegador e backend.

---

# Camada de Domínio

## Dependências

```
Services

↓

Modelos

↓

Value Objects
```

---

## Responsabilidade

Executar regras de negócio sem depender da infraestrutura.

---

# Camada de Persistência

## Dependências

```
Repositories

↓

ACLs

↓

SpreadsheetApp
```

---

## Responsabilidade

Isolar o acesso ao Google Sheets.

---

# Dependências Não Encontradas

A auditoria não identificou:

| Tecnologia | Status |
|-|-|
| React | Não utilizado |
| Vue | Não utilizado |
| Angular | Não utilizado |
| Axios | Não utilizado |
| Express | Não utilizado |
| Banco SQL externo | Não utilizado |
| Firebase | Não utilizado |
| ORM | Não utilizado |
| API REST própria | Não utilizada |

---

# Riscos de Dependência

## Google Apps Script

Nível:

```
ALTO
```

Motivo:

O sistema depende diretamente de:

- runtime Google;
- APIs proprietárias;
- limites de execução;
- modelo Web App.

---

## Google Sheets

Nível:

```
ALTO
```

Motivo:

A persistência principal está acoplada às planilhas.

Impactos:

- limites de volume;
- concorrência;
- performance;
- estrutura de abas.

---

## APIs Externas

Nível:

```
MÉDIO
```

Serviços:

- BrasilAPI;
- Google OAuth.

---

## Dependência de URL Externa

A entidade:

```
LinkDoMaterial
```

depende de URLs válidas.

Regra:

```
Somente URLs http/https são aceitas.
```

---

# Princípios Arquiteturais Observados

O projeto segue:

```
Domínio

↓

não conhece infraestrutura

↓

Infraestrutura implementa acesso externo
```

---

# Manutenção de Dependências

Ao adicionar uma nova dependência:

1. Registrar neste documento.
2. Identificar o módulo consumidor.
3. Documentar impacto.
4. Avaliar necessidade arquitetural.
5. Criar testes quando aplicável.

---

# Checklist Final

## Dependências

- [x] Runtime documentado
- [x] Serviços Google documentados
- [x] APIs externas documentadas
- [x] Bibliotecas npm documentadas
- [x] Ferramentas de desenvolvimento documentadas
- [x] Dependências internas documentadas
- [x] Dependências ausentes registradas
- [x] Riscos identificados

---

# Status

Documento concluído como referência oficial das dependências técnicas do Projeto TEAR V2.

O conteúdo representa o estado atual encontrado no código e ferramentas do projeto.
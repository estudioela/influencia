Arquivos principais encontrados:

src/shared/Nucleo.js

src/entrypoint/Portal.js

src/modulos/Autenticacao.js

appsscript.json
1. Camada de configuração central

Arquivo:

src/shared/Nucleo.js

O sistema possui uma camada centralizada de configuração.

Fluxo:

Script Properties

↓

getConfig()

↓

CONFIG_KEYS

↓

Módulos do sistema
2. Script Properties identificadas

O sistema utiliza:

PropertiesService.getScriptProperties()

Local:

src/shared/Nucleo.js

Função responsável:

getConfig(key)
Chaves identificadas

Encontradas em:

CONFIG_KEYS
Chave	Uso	Sensibilidade
SPREADSHEET_ID	Planilha principal V2	Alta
SPREADSHEET_ID_LEGADO	Planilha histórica/legada	Alta
GOOGLE_CLIENT_ID	OAuth Google	Alta
GOOGLE_CLIENT_SECRET	OAuth Google	Crítica
3. IDs Google
Planilha principal

Configuração:

SPREADSHEET_ID

Uso:

Arquivo:

src/entrypoint/Portal.js

Fluxo:

SpreadsheetApp.openById(
    getConfig(CONFIG_KEYS.SPREADSHEET_ID)
)

Responsabilidade:

Abrir a base operacional principal.

Planilha legada

Configuração:

SPREADSHEET_ID_LEGADO

Uso:

Arquivo:

src/entrypoint/Portal.js

Fluxo:

SpreadsheetApp.openById(
    getConfig(CONFIG_KEYS.SPREADSHEET_ID_LEGADO)
)

Responsabilidade:

Acesso a dados históricos/compatibilidade.

4. Configurações OAuth
Google Client ID

Chave:

GOOGLE_CLIENT_ID

Origem:

Script Properties

Uso:

Arquivo:

src/entrypoint/Portal.js

Responsabilidade:

validação de token Google;
identificação do cliente OAuth.
Google Client Secret

Chave:

GOOGLE_CLIENT_SECRET

Origem:

Script Properties

Sensibilidade:

CRÍTICA

Uso:

Arquivo:

src/entrypoint/Portal.js
src/modulos/Autenticacao.js

Responsabilidade:

troca authorization code;
autenticação OAuth.
5. Fluxo OAuth identificado

Arquitetura:

Usuário

↓

Google OAuth

↓

authorization code

↓

entrarComCodigoOAuth()

↓

AdaptadorOAuthGoogle

↓

GOOGLE_CLIENT_ID

+

GOOGLE_CLIENT_SECRET

↓

Sessão
6. Manifesto Apps Script

Arquivo:

appsscript.json

Configuração encontrada:

{
  "timeZone": "America/Sao_Paulo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
Runtime

Configurado:

"runtimeVersion": "V8"

Ambiente:

Google Apps Script V8
Timezone

Configurado:

"timeZone": "America/Sao_Paulo"

Impacto:

datas;
competências;
registros financeiros;
logs.
Logging

Configurado:

"exceptionLogging": "STACKDRIVER"

Responsabilidade:

Enviar exceções para infraestrutura de logs Google.

7. OAuth Scopes

Manifesto:

"oauthScopes"

Encontrados:

Google Sheets
https://www.googleapis.com/auth/spreadsheets

Uso:

leitura;
escrita;
manipulação de planilhas.
External Request
https://www.googleapis.com/auth/script.external_request

Uso:

chamadas externas;
OAuth;
integrações HTTP.
8. Web App Deployment

Configuração encontrada:

"webapp": {
  "executeAs": "USER_DEPLOYING",
  "access": "ANYONE"
}
Execução
USER_DEPLOYING

Significado:

O aplicativo executa com a identidade do usuário que realizou o deploy.

Acesso
ANYONE

Significado:

O Web App aceita acesso público.

9. URLs / Redirects

O sistema utiliza:

redirectUri

No OAuth.

Origem:

URL /exec do deployment

Fluxo:

Google OAuth

↓

redirectUri

↓

Portal Apps Script

↓

sessão
10. Inventário resumido
Categoria	Item	Status
Script Properties	SPREADSHEET_ID	Encontrado
Script Properties	SPREADSHEET_ID_LEGADO	Encontrado
Script Properties	GOOGLE_CLIENT_ID	Encontrado
Script Properties	GOOGLE_CLIENT_SECRET	Encontrado
OAuth	Client ID	Encontrado
OAuth	Client Secret	Encontrado
OAuth	Redirect URI	Utilizado
Manifest	Runtime V8	Encontrado
Manifest	Timezone	Encontrado
Manifest	Scopes	Encontrado
Deployment	Web App	Encontrado
Diagnóstico

O TEAR V2 possui uma configuração centralizada e relativamente segura:

Código

↓

CONFIG_KEYS

↓

Script Properties

↓

Valores sensíveis

Não foram encontrados:

IDs hardcoded no código;
secrets expostos;
variáveis .env;
arquivos de configuração locais.

---

# Matriz de Configurações

Esta seção relaciona cada configuração externa com os componentes responsáveis pelo seu consumo.

Fluxo:


Configuração

↓

Script Properties / Manifest

↓

Arquivo consumidor

↓

Função

↓

Comportamento do sistema


---

# SPREADSHEET_ID

## Origem

```text
Script Properties
Arquivo consumidor
src/entrypoint/Portal.js
Função consumidora
abrirBaseDeDados()
Uso
SpreadsheetApp.openById(
    getConfig(CONFIG_KEYS.SPREADSHEET_ID)
)
Impacto

Define a planilha principal utilizada pelo sistema.

Responsável por disponibilizar:

dados operacionais;
abas V2;
persistência principal.
Dependência

Utilizado por:

Portal.js

↓

Repositories

↓

Services
SPREADSHEET_ID_LEGADO
Origem
Script Properties
Arquivo consumidor
src/entrypoint/Portal.js
Função consumidora
abrirBaseLegada()
Uso
SpreadsheetApp.openById(
    getConfig(CONFIG_KEYS.SPREADSHEET_ID_LEGADO)
)
Impacto

Permite compatibilidade com estruturas antigas.

Utilizado para:

migrações;
consultas históricas;
suporte ao legado.
GOOGLE_CLIENT_ID
Origem
Script Properties
Arquivos consumidores
src/entrypoint/Portal.js

src/modulos/Autenticacao.js
Uso

Validação OAuth:

new ValidadorDeTokenGoogle(
    getConfig(CONFIG_KEYS.GOOGLE_CLIENT_ID)
)
Impacto

Define qual aplicação Google OAuth está autenticando usuários.

GOOGLE_CLIENT_SECRET
Origem
Script Properties
Arquivos consumidores
src/entrypoint/Portal.js

src/modulos/Autenticacao.js
Uso

Troca de authorization code:

AdaptadorOAuthGoogle

↓

client_secret
Impacto

Permite:

troca de código OAuth;
obtenção de tokens;
autenticação segura.
REDIRECT_URI
Origem

Não armazenado como Script Property.

Obtido dinamicamente pelo deployment.

Arquivo consumidor
src/modulos/Autenticacao.js
Função
AdaptadorOAuthGoogle()
Uso

Parâmetro:

redirectUri
Impacto

Controla o retorno do fluxo OAuth.

Fluxo:

Google OAuth

↓

redirect_uri

↓

/exec Apps Script

↓

sessão
TIMEZONE
Origem
appsscript.json
Configuração
"timeZone": "America/Sao_Paulo"
Impacto

Afeta:

datas;
competências;
registros financeiros;
logs.
RUNTIME_VERSION
Origem
appsscript.json
Configuração
"runtimeVersion": "V8"
Impacto

Define o ambiente JavaScript utilizado pelo Apps Script.

Permite:

classes;
const/let;
sintaxe moderna;
recursos ES6+.
EXCEPTION_LOGGING
Origem
appsscript.json
Configuração
"exceptionLogging": "STACKDRIVER"
Impacto

Controla envio de erros para logs Google.

OAUTH_SCOPES
Origem
appsscript.json
Escopo Sheets
https://www.googleapis.com/auth/spreadsheets

Uso:

leitura;
escrita;
atualização de abas.
Escopo External Request
https://www.googleapis.com/auth/script.external_request

Uso:

chamadas HTTP;
integração OAuth;
comunicação externa.
WEBAPP_EXECUTION
Origem
appsscript.json
Configuração
"executeAs": "USER_DEPLOYING"
Impacto

Define a identidade utilizada na execução do Web App.

WEBAPP_ACCESS
Origem
appsscript.json
Configuração
"access": "ANYONE"
Impacto

Define disponibilidade pública do Web App.

Fluxo Geral de Configuração
appsscript.json

        +

Script Properties

        ↓

Portal.js

        ↓

Configuração carregada

        ↓

Serviços autenticados

        ↓

Operação do sistema
Segurança

Configurações sensíveis não devem ser armazenadas em:

código-fonte;
arquivos Markdown;
commits públicos.

Itens críticos:

Configuração	Risco
GOOGLE_CLIENT_SECRET	Crítico
GOOGLE_CLIENT_ID	Alto
SPREADSHEET_ID	Alto
SPREADSHEET_ID_LEGADO	Médio
Estado Atual

A arquitetura atual segue o princípio:

Código

↓

Chave de configuração

↓

Script Properties

↓

Valor secreto

---

# Ambientes

O Projeto TEAR V2 utiliza o modelo de configuração baseado em propriedades externas.

As configurações sensíveis não ficam armazenadas no código-fonte.

Fluxo:


Código

↓

CONFIG_KEYS

↓

Script Properties

↓

Ambiente de execução


---

# Ambientes Identificados

## Ambiente Google Apps Script

Ambiente principal de execução.

Características:

| Item | Valor |
|-|-|
| Runtime | Google Apps Script V8 |
| Timezone | America/Sao_Paulo |
| Execução Web App | USER_DEPLOYING |
| Acesso Web App | ANYONE |

---

# Desenvolvimento

O ambiente de desenvolvimento utiliza:

- código local sincronizado com Apps Script;
- arquivos `.js` versionados;
- testes automatizados locais;
- configurações externas via Script Properties.

Configurações sensíveis devem ser provisionadas manualmente.

---

# Produção

O ambiente de produção depende de:

- deployment ativo do Web App;
- Script Properties configuradas;
- OAuth configurado;
- planilhas vinculadas corretamente.

---

# Fluxo de Deploy

Fluxo identificado:


Código local

↓

clasp push

↓

Google Apps Script

↓

Deployment Web App

↓

/exec

↓

Portal.js

↓

Sistema em execução


---

# Dependências de Configuração para Funcionamento

O sistema necessita das seguintes configurações:

| Item | Obrigatório | Motivo |
|-|-|-|
| SPREADSHEET_ID | Sim | Base principal |
| SPREADSHEET_ID_LEGADO | Sim | Compatibilidade histórica |
| GOOGLE_CLIENT_ID | Sim | OAuth |
| GOOGLE_CLIENT_SECRET | Sim | OAuth |
| Deployment Web App | Sim | Entrada do sistema |
| OAuth Redirect URI | Sim | Retorno autenticação |

---

# Segurança de Configuração

## Princípios encontrados

O sistema segue:

- nenhum segredo hardcoded;
- configuração externa;
- acesso centralizado;
- separação entre código e credenciais.

---

# Configurações Críticas

## GOOGLE_CLIENT_SECRET

Nível:


CRÍTICO


Nunca deve ser:

- commitado;
- enviado em documentação;
- armazenado em arquivos públicos.

---

## GOOGLE_CLIENT_ID

Nível:


ALTO


Embora não seja secreto, identifica a aplicação OAuth.

---

## IDs de Planilhas

Nível:


ALTO


Motivo:

Permitem acesso direto aos dados caso combinados com permissões adequadas.

---

# Pontos de Atenção

## Ausência de ambientes isolados

Não foram encontrados:

- arquivos `.env`;
- múltiplos manifests;
- configuração automática por ambiente.

---

## Dependência manual

A troca entre ambientes depende de:

- atualização de Script Properties;
- novo deployment;
- validação das permissões Google.

---

# Pendências Identificadas

Itens que podem evoluir futuramente:

- [ ] Documentar matriz completa dev/staging/prod;
- [ ] Automatizar provisionamento de Script Properties;
- [ ] Criar checklist formal de deploy;
- [ ] Versionar configurações não sensíveis;
- [ ] Criar validação automática de ambiente;
- [ ] Documentar responsáveis pelos segredos OAuth.

---

# Checklist Final

## Configurações

- [x] Script Properties identificadas
- [x] IDs Google mapeados
- [x] OAuth documentado
- [x] Manifest analisado
- [x] Scopes identificados
- [x] Web App documentado
- [x] Runtime identificado
- [x] Timezone identificado
- [x] Segurança documentada

---

# Status

Documento concluído como referência oficial das configurações operacionais do Projeto TEAR V2.

O documento representa o estado atual encontrado no código e infraestrutura.
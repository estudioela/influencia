# Sheets Map

## Objetivo

O documento `SHEETS_MAP.md` descreve a estrutura de persistência em Google Sheets utilizada pelo Projeto TEAR V2.

Seu objetivo é mapear:

- planilhas utilizadas;
- abas existentes;
- responsabilidade de cada aba;
- repositories responsáveis pelo acesso;
- entidades persistidas;
- dependências entre dados;
- regras relacionadas ao armazenamento.

Este documento representa a estrutura encontrada no código atual.

Não representa uma arquitetura futura.

---

# Arquitetura de Persistência

O Projeto TEAR V2 utiliza Google Sheets como camada de persistência.

A comunicação segue o fluxo:


Service

↓

Repository

↓

ACL

↓

Google Sheets

↓

Aba

↓

Linhas e colunas


As regras de negócio não acessam diretamente planilhas.

O acesso ocorre através de camadas intermediárias.

---

# Controle de Acesso às Planilhas

O ponto de entrada autorizado para abertura das planilhas é:

```text
src/entrypoint/Portal.js

Responsabilidades:

abrir planilha principal;
abrir planilha legada;
disponibilizar abas para os módulos.

Fluxo identificado:

Portal.js

↓

SpreadsheetApp.openById()

↓

getSheetByName()

↓

ACL / Repository

↓

Serviço
Planilhas Identificadas
Planilha principal V2

Identificada através de:

SpreadsheetApp.openById(
    getConfig(CONFIG_KEYS.SPREADSHEET_ID)
)

Responsabilidade:

Armazenar os dados operacionais atuais do TEAR V2.

Planilha legada

Identificada através de:

SpreadsheetApp.openById(
    getConfig(CONFIG_KEYS.SPREADSHEET_ID_LEGADO)
)

Responsabilidade:

Consultar dados históricos e compatibilidade com estruturas antigas.

Abas Identificadas

As seguintes abas foram identificadas através do código:

Aba	Origem	Responsabilidade
BASE DE DADOS	V2	Base principal de dados
ENTREGAS	V2	Controle de entregas
ENVIOS	V2	Controle logístico
BRIEFING	V2	Dados de briefing
PAGAMENTOS	V2	Controle financeiro
DOCUMENTOS	V2	Controle documental
USUARIOS	V2	Dados de usuários
PARCEIRAS	V2	Cadastro de parceiras
PERFIS	V2	Dados de perfil
COLABORACAO_MENSAL	V2	Controle de competências
BLOQUEIOS	V2	Controle de bloqueios
BASE DE DADOS
Responsabilidade

A aba BASE DE DADOS representa a fonte principal de informações cadastrais.

É utilizada para:

identificação de usuários;
consulta de parceiras;
autenticação legada;
dados principais do portal.
Referências encontradas

Arquivo:

src/entrypoint/Portal.js

Uso identificado:

getSheetByName('BASE DE DADOS')
ENTREGAS
Responsabilidade

Armazena registros de entregas realizadas pelas parceiras.

Utilizada pelo módulo:

src/modulos/Entrega.js
Campos identificados

O código utiliza as seguintes colunas:

Campo	Uso
INFLU_KEY	Identificação da parceira
ANO_REFERENCIA	Ano da competência
MES_REFERENCIA	Mês da competência
ROTULO	Identificação da entrega
ESTADO	Estado atual
LINK_MATERIAL	Material enviado
DATA_APROVACAO_INTERNA	Data aprovação
DATA_ARQUIVAMENTO	Data arquivamento
Regras identificadas

A busca de entregas considera:

parceira;
competência;
rótulo da entrega.

Exemplo:

INFLU_KEY

+

ANO_REFERENCIA

+

MES_REFERENCIA

+

ROTULO

↓

Entrega única
ENVIOS
Responsabilidade

Controla o fluxo logístico de materiais.

Arquivo relacionado:

src/modulos/Envio.js

A estrutura V2 utiliza:

ENVIOS

como aba oficial.

O termo legado:

FLUXO LOGÍSTICO

não representa a estrutura atual.


---

Essa é a **PARTE 1/3**.

A **PARTE 2/3** vai entrar no detalhe de:

- BRIEFING;
- PAGAMENTOS;
- PARCEIRAS;
- USUÁRIOS;
- DOCUMENTOS;
- COLABORAÇÃO MENSAL;
- relacionamento Repository → Aba.

---

# BRIEFING

## Responsabilidade

A aba `BRIEFING` armazena informações relacionadas às atividades mensais das parceiras.

Utilizada pelo módulo:

```text
src/modulos/Briefing.js
Operações identificadas

Leitura:

consulta de briefing;
leitura de itens;
recuperação de dados por competência.

Escrita:

atualização de informações;
substituição completa da aba através de setValues.
Persistência

Fluxo:

BriefingService

↓

BriefingRepository

↓

ACL

↓

BRIEFING
PAGAMENTOS
Responsabilidade

A aba PAGAMENTOS armazena informações financeiras das parceiras.

Utilizada pelo módulo:

src/modulos/Financeiro.js
Operações identificadas
criação de pagamentos;
consulta financeira;
liberação;
confirmação.
Dados principais identificados
Campo	Uso
INFLU_KEY	Identificação da parceira
COMPETENCIA	Referência mensal
VALOR	Valor financeiro
STATUS	Estado do pagamento
Fluxo
PagamentoService

↓

PagamentoRepository

↓

PAGAMENTOS
PARCEIRAS
Responsabilidade

A aba PARCEIRAS mantém o cadastro principal das parceiras do programa.

Utilizada pelo módulo:

src/modulos/Parceira.js
Operações identificadas
cadastro;
atualização;
consulta;
importação de base legada.
Identificação principal

O sistema utiliza:

INFLU_KEY

como identificador da parceira.

Campos identificados
Campo	Uso
INFLU_KEY	Identificador único
NOME	Nome da parceira
EMAIL	Comunicação
STATUS	Situação cadastral
CUPOM	Identificação comercial
Fluxo
ParceiraService

↓

ParceiraRepository

↓

PARCEIRAS
USUARIOS
Responsabilidade

A aba USUARIOS controla identidades e permissões de acesso.

Utilizada pelo módulo:

src/modulos/Usuario.js
src/modulos/Autenticacao.js
Dados armazenados
Campo	Uso
ID	Identificação interna
EMAIL	Identidade
PAPEL	Perfil de acesso
STATUS	Estado do usuário
Estados identificados

Exemplos:

PENDENTE

ATIVO

INATIVO
Fluxo
AcessoPortalService

↓

UsuarioRepository

↓

USUARIOS
DOCUMENTOS
Responsabilidade

A aba DOCUMENTOS controla registros documentais gerados pelo sistema.

Utilizada pelo módulo:

src/modulos/Documento.js
Operações identificadas
criação;
consulta;
substituição;
atualização.
Dados relacionados
Campo	Uso
INFLU_KEY	Parceira relacionada
TIPO_DOCUMENTO	Categoria
LINK	Localização do arquivo
DATA_GERACAO	Controle temporal
Fluxo
DocumentoService

↓

DocumentoRepository

↓

DOCUMENTOS
PERFIS
Responsabilidade

A aba PERFIS mantém informações complementares de perfil.

Utilizada pelo módulo:

src/modulos/Perfil.js
Dados relacionados
Campo	Uso
INFLU_KEY	Parceira
DADOS_PERFIL	Informações complementares
Fluxo
PerfilService

↓

PerfilRepository

↓

PERFIS
COLABORACAO_MENSAL
Responsabilidade

Controla registros relacionados ao ciclo mensal de operação.

Utilizada pelo módulo:

src/modulos/ColaboracaoMensal.js
Operações identificadas
criação de competência;
consulta mensal;
atualização de ciclo.
Dados principais
Campo	Uso
INFLU_KEY	Parceira
ANO_REFERENCIA	Ano
MES_REFERENCIA	Mês
STATUS	Estado da competência
Fluxo
ColaboracaoMensalService

↓

ColaboracaoMensalRepository

↓

COLABORACAO_MENSAL
BLOQUEIOS
Responsabilidade

Controla bloqueios relacionados ao acesso.

Utilizada pelo módulo:

src/modulos/Autenticacao.js
src/modulos/Arquivamento.js
Dados relacionados
Campo	Uso
IDENTIFICADOR	Usuário ou sessão
MOTIVO	Razão do bloqueio
DATA	Registro temporal
Fluxo
BloqueioRepository

↓

BLOQUEIOS

---

Próxima:

**PARTE 3/3**

Vai fechar o `SHEETS_MAP.md` com:

- matriz Repository → Aba;
- relacionamentos entre abas;
- regras de negócio;
- dependências;
- limitações atuais;
- checklist final de auditoria.

---

# Matriz Repository → Aba

Esta seção relaciona as camadas de persistência do backend com as abas físicas utilizadas no Google Sheets.

| Repository | Módulo | Aba utilizada |
|---|---|---|
| UsuarioRepository | Usuario.js | USUARIOS |
| SessaoRepository | Autenticacao.js | USUARIOS / controle de sessão |
| BloqueioRepository | Autenticacao.js / Arquivamento.js | BLOQUEIOS |
| ParceiraRepository | Parceira.js | PARCEIRAS |
| PerfilRepository | Perfil.js | PERFIS |
| BriefingRepository | Briefing.js | BRIEFING |
| EntregaRepository | Entrega.js | ENTREGAS |
| EnvioRepository | Envio.js | ENVIOS |
| PagamentoRepository | Financeiro.js | PAGAMENTOS |
| DocumentoRepository | Documento.js | DOCUMENTOS |
| ColaboracaoMensalRepository | ColaboracaoMensal.js | COLABORACAO_MENSAL |

---

# Relacionamentos entre Abas

A estrutura de dados utiliza identificadores compartilhados para relacionar informações.

O principal identificador encontrado é:

```text
INFLU_KEY
Relacionamento principal
PARCEIRAS

    |

    | INFLU_KEY

    ↓


PERFIS

    |

    ↓


BRIEFING

    |

    ↓


ENTREGAS

    |

    ↓


ENVIOS

    |

    ↓


PAGAMENTOS
Relacionamento por competência

Os módulos mensais utilizam:

ANO_REFERENCIA

+

MES_REFERENCIA

para identificar ciclos.

Aplicado principalmente em:

ENTREGAS;
BRIEFING;
COLABORACAO_MENSAL;
PAGAMENTOS.
Regras de Persistência Identificadas
Leitura

O padrão encontrado é:

getDataRange()
    .getValues()

A leitura ocorre sempre através da camada Repository/ACL.

Escrita

Foram identificados dois padrões:

Upsert completo

A aba é reconstruída:

dados atuais

↓

alteração

↓

clearContents()

↓

setValues()

Utilizado em:

Entregas;
Briefings;
Documentos;
Financeiro;
Envio.
Inserção incremental

Novas linhas são adicionadas:

appendRow()

Utilizado em:

cadastros;
registros novos.
Resolução de Colunas

O sistema não utiliza índices físicos fixos.

A resolução ocorre através do cabeçalho:

Nome da coluna

↓

Resolvedor de coluna

↓

Índice físico

Exemplo:

coluna('INFLU_KEY')

Benefícios:

maior segurança contra alteração de ordem;
menor acoplamento com planilha;
manutenção facilitada.
Regras de Integridade
Entregas

Uma entrega é identificada por:

INFLU_KEY

+

ANO_REFERENCIA

+

MES_REFERENCIA

+

ROTULO
Competências

Uma competência é definida por:

ANO_REFERENCIA

+

MES_REFERENCIA
Usuários

Estados encontrados:

PENDENTE

ATIVO

INATIVO
Pagamentos

Estados financeiros utilizam controle por status.

Fluxo esperado:

Criado

↓

Liberado

↓

Confirmado
Dependências Externas

Além das planilhas, o sistema utiliza serviços Google:

Google Drive

Responsável por:

armazenamento de documentos;
materiais enviados;
arquivos gerados.
Google Apps Script Properties

Responsável por:

IDs de planilhas;
configurações;
parâmetros de ambiente.
Pontos de Atenção
Planilha legada

Existe separação entre:

BASE DE DADOS

(V2)

e:

BASE DE DADOS LEGADA

O código mantém compatibilidade histórica.

Termos legados

Alguns nomes antigos ainda aparecem em documentação ou comentários.

Exemplo:

FLUXO LOGÍSTICO

Foi substituído por:

ENVIOS
Cobertura do Mapeamento
Identificado
 Planilhas utilizadas
 Abas principais
 Responsabilidades
 Repositories relacionados
 Entidades persistidas
 Relacionamentos
 Regras de persistência
 Dependências
Pendências futuras

Possíveis complementos:

catálogo completo de todas as colunas por aba;
validações de dados das colunas;
fórmulas existentes;
proteções de intervalo;
permissões de edição;
IDs reais das planilhas em ambiente seguro.
Status

Documento criado como referência oficial da camada de dados em Google Sheets do Projeto TEAR V2.
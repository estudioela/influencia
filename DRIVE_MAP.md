Arquitetura atual de arquivos

O armazenamento de arquivos ainda funciona baseado em referência externa.

O padrão encontrado é:

Arquivo externo

↓

URL

↓

Persistência da URL na planilha

↓

Consulta pelo Portal
Entregas

Arquivo:

src/modulos/Entrega.js

A entidade utiliza:

LinkDoMaterial

como Value Object.

Campo persistido

Identificado:

LINK_MATERIAL

Representa:

URL do material enviado;
referência para arquivo externo;
localização do conteúdo entregue.

Fluxo atual:

Parceira

↓

envia link do material

↓

EntregaService

↓

EntregaRepository

↓

ENTREGAS

↓

LINK_MATERIAL
Restrições encontradas

No código existe uma regra explícita:

Entrega não conhece DriveApp

A camada de domínio não possui responsabilidade sobre armazenamento físico.

Encontrado:

Entrega.js

Não pode conhecer:

- SpreadsheetApp
- HTML
- HTTP
- Repository
- ACL
- DriveApp
Documentos

Arquivo:

src/modulos/Documento.js

Existe preparação para integração futura.

Encontrado:

referência passa a ser o link/id do arquivo gerado

Porém:

não existe geração física;
não existe criação do arquivo;
não existe upload;
não existe pasta associada.

Estado atual:

Documento

↓

Link/ID esperado

↓

Implementação Drive futura
Portal Conteúdo

Arquivo:

src/modulos/PortalConteudo.js

Utiliza:

link

como referência.

Entrada esperada:

{
 token,
 rotulo,
 link
}

O sistema apenas transporta o endereço informado.

Inventário atual
Recurso	Status
Google Drive API	Não encontrado
DriveApp	Não utilizado
Upload automático	Não implementado
Criação de pastas	Não implementada
Controle de permissões Drive	Não implementado
Links externos	Implementado
Persistência de URLs	Implementada
Módulos relacionados a arquivos
Módulo	Relação
Entrega.js	Armazena URL do material
Documento.js	Prevê link/id futuro
PortalConteudo.js	Trabalha com links
Diagnóstico arquitetural

O estado atual é:

Google Sheets

↓

Armazena metadados

↓

URL externa

↓

Arquivo físico fora do controle do sistema

Não existe atualmente:

Google Sheets

↓

Google Drive

↓

Pasta por parceira

↓

Pasta por competência

↓

Arquivos controlados
Status da auditoria Drive

🟡 Parcialmente implementado

Motivo:

A arquitetura possui suporte conceitual para links de arquivos, porém a camada de armazenamento físico ainda não foi construída.

ENTREGA 2 — Mapeamento Módulo → Referência de Arquivo → Persistência

Com base na auditoria atual, o mapeamento real do TEAR V2 é:

Módulo

↓

Campo / referência persistida

↓

Localização do arquivo

↓

Status da implementação

Importante:

Este documento não deve inventar uma estrutura Drive inexistente.

Abaixo está somente o que o código suporta atualmente.

Entregas
Módulo
src/modulos/Entrega.js
Referência persistida

Campo:

LINK_MATERIAL

Modelo:

LinkDoMaterial
Fluxo atual
Usuário

↓

Envia URL do material

↓

EntregaService

↓

EntregaRepository

↓

ENTREGAS

↓

LINK_MATERIAL
Armazenamento físico

Status:

🟡 Externo ao sistema

O TEAR V2 não controla:

pasta;
arquivo;
proprietário;
permissão;
movimentação.
Documentos
Módulo
src/modulos/Documento.js
Referência prevista

O código prevê:

link/id do arquivo gerado
Fluxo esperado pelo domínio
Documento

↓

Identificador do arquivo

↓

Persistência
Estado atual

Não encontrado:

DriveApp

createFile()

makeCopy()

Folder

Status:

🟡 Preparado para integração futura

Portal Conteúdo
Módulo
src/modulos/PortalConteudo.js
Dados utilizados

Entrada:

{
 token,
 rotulo,
 link
}
Fluxo
Conteúdo

↓

URL informada

↓

Portal

↓

Exibição
Armazenamento

Apenas referência:

link

Status:

🟢 Implementado

Autenticação OAuth
Módulo
src/modulos/Autenticacao.js
URLs utilizadas

O módulo trabalha com:

urlDeAutorizacao
Origem

Google OAuth.

Observação

Essas URLs não representam arquivos.

São apenas endpoints de autenticação.

Matriz Geral
Módulo	Campo	Tipo de referência	Drive controlado
Entrega	LINK_MATERIAL	URL externa	❌
Documento	LINK / ID futuro	Referência planejada	❌
PortalConteudo	link	URL externa	❌
Autenticacao	urlDeAutorizacao	OAuth	❌
Estrutura Drive futura (não implementada)

Caso a integração seja construída posteriormente, o desenho provável seria:

Google Drive

├── TEAR
│
├── Parceiras
│
│   └── INFLU_KEY
│
│       └── Competência
│
│           ├── Briefings
│           ├── Entregas
│           ├── Documentos
│           └── Comprovantes

Porém:

⚠️ Esta estrutura não existe no código atual.

Ela deve ser tratada como proposta futura e não como documentação do sistema atual.

Conclusão

O estado real encontrado:

Google Sheets

↓

Guarda metadados

↓

Guarda URLs

↓

Arquivos permanecem externos

A camada Drive ainda não faz parte da arquitetura operacional.

# Drive Map

## Objetivo

O documento `DRIVE_MAP.md` descreve como o Projeto TEAR V2 utiliza arquivos, links e referências externas.

Seu objetivo é documentar:

- integração com Google Drive;
- armazenamento de arquivos;
- uploads;
- referências persistidas;
- permissões;
- relacionamento entre arquivos e dados do sistema.

Este documento representa exclusivamente o comportamento encontrado no código atual.

Não descreve uma implementação futura.

---

# Arquitetura Atual de Arquivos

O TEAR V2 atualmente não possui uma camada de gerenciamento físico de arquivos.

O sistema trabalha com referências externas.

Fluxo encontrado:


Arquivo externo

↓

URL / LINK

↓

Persistência em Google Sheets

↓

Consulta pelo Portal


---

# Integração Google Drive

## Status atual

A auditoria do código identificou:

| Recurso | Status |
|---|---|
| DriveApp | Não utilizado |
| getFolderById | Não utilizado |
| createFile | Não utilizado |
| createFolder | Não utilizado |
| getFiles | Não utilizado |
| Upload automático | Não implementado |
| Estrutura de pastas via código | Não implementada |
| Permissões Drive via código | Não implementadas |

---

# Restrição Arquitetural

O domínio possui isolamento explícito da infraestrutura.

Exemplo encontrado:

```text
Entrega.js

Não pode conhecer:

- SpreadsheetApp
- HTML
- HTTP
- Repository
- ACL
- DriveApp

Isso indica que:

entidades não manipulam arquivos;
regras de negócio não dependem do Drive;
armazenamento físico deve existir em uma camada externa.
Entregas
Módulo
src/modulos/Entrega.js
Modelo utilizado

A entidade utiliza:

LinkDoMaterial

como Value Object.

Responsabilidade:

Representar uma referência válida para um material enviado.

Campo persistido

Campo:

LINK_MATERIAL

Representa:

URL do material enviado;
referência externa do arquivo;
localização do conteúdo.
Fluxo atual
Parceira

↓

Envia URL do material

↓

EntregaService

↓

EntregaRepository

↓

ENTREGAS

↓

LINK_MATERIAL
Documentos
Módulo
src/modulos/Documento.js
Estado atual

O módulo possui preparação para referência documental.

Encontrado:

link/id do arquivo gerado

Porém não existe:

geração automática;
criação de arquivo;
cópia de modelo;
criação de pasta;
armazenamento no Drive.
Fluxo previsto pelo domínio
Documento

↓

Identificador do arquivo

↓

Persistência
Portal Conteúdo
Módulo
src/modulos/PortalConteudo.js
Referência utilizada

O módulo trabalha com:

{
 token,
 rotulo,
 link
}
Comportamento

O sistema:

recebe o link;
transporta a referência;
disponibiliza para consulta.

Não realiza:

upload;
validação do arquivo;
movimentação;
controle de acesso Drive.
Autenticação
Módulo
src/modulos/Autenticacao.js
URLs utilizadas

O módulo utiliza URLs relacionadas ao OAuth:

urlDeAutorizacao

Essas URLs representam:

endpoints de autenticação;
redirecionamentos OAuth.

Não representam arquivos.

Relação Drive → Sheets

O modelo atual é:

Google Sheets

↓

Metadados

↓

URL

↓

Arquivo externo

Exemplo:

ENTREGAS

LINK_MATERIAL

↓

URL do material
Estrutura de arquivos futura

Uma possível evolução seria:

Google Drive

└── TEAR

    └── Parceiras

        └── INFLU_KEY

            └── Competência

                ├── Briefings
                ├── Entregas
                ├── Documentos
                └── Comprovantes

Porém:

⚠️ Essa estrutura não existe no código atual.

Ela deve ser tratada como proposta futura.

Módulos relacionados a arquivos
Módulo	Relação
Entrega.js	Armazena referência do material
Documento.js	Prevê referência documental futura
PortalConteudo.js	Trabalha com links externos
Diagnóstico Arquitetural

Estado atual:

Google Sheets

↓

Metadados

↓

Links externos

↓

Arquivos fora do controle do sistema

O TEAR V2 atualmente não possui:

Google Sheets

↓

Google Drive

↓

Pastas organizadas

↓

Arquivos controlados

↓

Permissões automatizadas
Cobertura do Mapeamento
 Integração Google Drive auditada
 Uso de arquivos identificado
 Referências persistidas identificadas
 Uploads avaliados
 Permissões avaliadas
 Relação Drive → Sheets documentada
 Limitações registradas
Status

🟡 Parcialmente implementado

Motivo:

O sistema possui suporte conceitual para referências de arquivos, porém a camada de armazenamento físico e gerenciamento do Google Drive ainda não faz parte da implementação atual.
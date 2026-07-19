# Business Rules

## Objetivo

O documento `BUSINESS_RULES.md` descreve as regras de negócio implementadas atualmente no Projeto TEAR V2.

O objetivo é registrar:

- estados do sistema;
- validações;
- transições permitidas;
- regras operacionais;
- restrições existentes no código;
- comportamentos que representam decisões de negócio.

Este documento representa regras encontradas no código atual.

Não representa regras futuras ou propostas.

---

# Arquitetura das Regras de Negócio

As regras estão distribuídas nas camadas:

```
Controller

↓

Service

↓

Domain Model

↓

Repository / ACL

↓

Persistência
```

A camada Service concentra os casos de uso.

As entidades e Value Objects representam invariantes do domínio.

---

# Conceito de Competência

A unidade principal de organização operacional é a competência mensal.

Uma competência é definida por:

```
ANO_REFERENCIA

+

MES_REFERENCIA
```

---

# Regra RN-01 — Identificação por Competência

## Descrição

Os registros operacionais devem possuir referência temporal.

Aplicado em:

- Briefing;
- Entregas;
- Envios;
- Pagamentos;
- Colaboração Mensal;
- Documentos.

---

## Exemplo

```
INFLU_KEY

+

ANO_REFERENCIA

+

MES_REFERENCIA
```

representam uma unidade operacional.

---

# Regra RN-02 — Materialização Mensal

## Descrição

O sistema possui processos de criação/materialização de dados para uma competência.

Fluxo:

```
Competência criada

↓

Serviços geram registros

↓

Repositories persistem

↓

Portal consulta dados
```

---

## Módulos envolvidos

- BriefingService;
- EntregaService;
- EnvioService;
- PagamentoService.

---

# Regra RN-03 — Idempotência de Competência

## Descrição

Antes de materializar uma competência, o sistema verifica se ela já existe.

Padrão:

```
Existe competência?

↓

Sim

↓

Não recriar

```

ou:

```
Existe competência?

↓

Não

↓

Materializar
```

---

## Aplicações

Encontrado em:

- BriefingRepository;
- EntregaRepository;
- EnvioRepository;
- PagamentoRepository;
- ColaboracaoMensalRepository.

---

# Regra RN-04 — Isolamento de Legado

## Descrição

Estruturas antigas não devem contaminar o modelo V2.

O código diferencia:

```
Modelo V2

↓

Novo contrato

```

de:

```
Estrutura legada

↓

Compatibilidade histórica
```

---

# Regra RN-05 — Identidade da Parceira

## Descrição

A parceira é identificada pelo campo:

```
INFLU_KEY
```

---

## Aplicações

Utilizado em:

- perfil;
- briefing;
- entrega;
- envio;
- pagamento;
- documentos.

---

# Regra RN-06 — Estados de Usuário

## Estados encontrados

```
PENDENTE

ATIVO

INATIVO
```

---

## Fluxo esperado

```
Cadastro

↓

PENDENTE

↓

Aprovação

↓

ATIVO

```

ou:

```
PENDENTE

↓

Rejeição
```

---

# Regra RN-07 — Controle de Acesso

O acesso depende de:

```
Sessão válida

+

Identidade

+

Permissão
```

---

## Usuários administrativos

Possuem acesso a operações como:

- aprovação;
- rejeição;
- ativação;
- inativação.

---

# Regra RN-08 — Bloqueios

## Descrição

O sistema possui controle de bloqueios.

Utilizado para impedir operações quando necessário.

---

## Persistência

Relacionada ao módulo:

```
BloqueioRepository
```

---

# Regra RN-09 — Pagamentos Dependem de Competência

## Descrição

Pagamentos mensais possuem vínculo com uma competência.

Identificação:

```
INFLU_KEY

+

TIPO_PAGAMENTO

+

ANO_REFERENCIA

+

MES_REFERENCIA
```

---

# Regra RN-10 — Ciclo Financeiro

## Estados encontrados

Fluxo:

```
Criado

↓

Liberado

↓

Pago
```

---

## Eventos associados

Encontrados:

```
PagamentoLiberado

PagamentoConfirmado
```

---

# Regra RN-11 — Entrega Possui Ciclo de Estado

## Descrição

Entregas passam por estados operacionais.

Fluxo identificado:

```
Enviado

↓

Revisado

↓

Aprovado

↓

Publicado
```

---

# Regra RN-12 — Materiais Externos

## Descrição

O sistema trabalha com referências de materiais.

A entrega armazena:

```
LINK_MATERIAL
```

---

## Restrição

A entidade não controla:

- arquivo físico;
- Drive;
- upload;
- permissões externas.

---

# Regra RN-13 — Documento Possui Referência Temporal

Documentos podem estar relacionados a:

```
INFLU_KEY

+

TIPO_DOCUMENTO

+

MES_REFERENCIA
```

---

# Estado Atual

Regras identificadas:

- [x] Competência mensal
- [x] Materialização
- [x] Idempotência
- [x] Identidade de parceira
- [x] Estados de usuário
- [x] Controle de acesso
- [x] Pagamentos
- [x] Entregas
- [x] Documentos
- [x] Legado

---

# Matriz de Regras de Negócio

Esta seção relaciona cada regra identificada com os módulos responsáveis pela implementação.

Fluxo:

```
Regra

↓

Módulo

↓

Função

↓

Impacto operacional
```

---

# RN-01 — Identificação por Competência

## Módulos relacionados

| Módulo | Responsabilidade |
|-|-|
| Briefing.js | Controla briefing mensal |
| Entrega.js | Controla entregas mensais |
| Envio.js | Controla logística mensal |
| Financeiro.js | Controla pagamentos |
| ColaboracaoMensal.js | Controla ciclo mensal |

---

## Funções relacionadas

```text
substituirCompetencia()

existeParaCompetencia()

materializarParaCompetencia()
```

---

## Impacto

Garante que os dados estejam vinculados ao período correto.

---

# RN-02 — Materialização Mensal

## Módulos relacionados

| Módulo | Função |
|-|-|
| Briefing.js | recriarParaCompetencia() |
| Entrega.js | materializarParaCompetencia() |
| Envio.js | materializarParaCompetencia() |
| Financeiro.js | materializarCompetencia() |

---

## Impacto

Permite gerar a estrutura operacional de uma nova competência.

---

# RN-03 — Idempotência

## Módulos relacionados

| Módulo | Verificação |
|-|-|
| BriefingRepository | existeParaCompetencia() |
| EntregaRepository | existeParaCompetencia() |
| EnvioRepository | existeParaCompetencia() |
| PagamentoRepository | existeParaCompetencia() |
| ColaboracaoMensalRepository | existeCompetencia() |

---

## Impacto

Evita duplicação de registros.

---

# RN-04 — Isolamento de Legado

## Módulos relacionados

| Módulo | Responsabilidade |
|-|-|
| Portal.js | acesso a bases |
| Repositories | adaptação de dados |
| ACLs | proteção contra acoplamento |

---

## Impacto

Permite evolução do modelo sem depender da estrutura antiga.

---

# RN-05 — Identidade da Parceira

## Módulos relacionados

| Módulo | Uso |
|-|-|
| Parceira.js | Cadastro |
| Perfil.js | Dados pessoais |
| Briefing.js | Relação mensal |
| Entrega.js | Entregas |
| Envio.js | Logística |
| Financeiro.js | Pagamentos |

---

## Função principal

```text
INFLU_KEY
```

---

## Impacto

Mantém relacionamento entre os domínios.

---

# RN-06 — Estados de Usuário

## Módulo responsável

```text
Autenticacao.js

Usuario.js
```

---

## Funções relacionadas

```text
aprovarUsuario()

rejeitarUsuario()

inativarUsuario()

reativarUsuario()
```

---

## Impacto

Controla entrada e permanência dos usuários no sistema.

---

# RN-07 — Controle de Acesso

## Módulos relacionados

| Módulo | Responsabilidade |
|-|-|
| Autenticacao.js | Sessão |
| Usuario.js | Identidade |
| Perfil.js | Dados associados |

---

## Impacto

Impede acesso sem contexto autorizado.

---

# RN-08 — Bloqueios

## Módulo responsável

```text
Autenticacao.js

Arquivamento.js
```

---

## Repository

```text
BloqueioRepository
```

---

## Impacto

Permite impedir operações específicas.

---

# RN-09 — Pagamentos por Competência

## Módulo responsável

```text
Financeiro.js
```

---

## Service

```text
PagamentoService
```

---

## Funções relacionadas

```text
materializarCompetencia()

listarPagamentos()

liberar()

pagar()
```

---

## Impacto

Mantém controle financeiro por ciclo.

---

# RN-10 — Ciclo Financeiro

## Estados

```
Criado

↓

Liberado

↓

Pago
```

---

## Eventos

```text
PagamentoLiberado

PagamentoConfirmado
```

---

## Módulo

```text
PagamentoService
```

---

## Impacto

Controla evolução da obrigação financeira.

---

# RN-11 — Ciclo de Entrega

## Módulo

```text
Entrega.js
```

---

## Funções relacionadas

```text
enviarMaterial()

aprovarEntrega()

publicarEntrega()

atualizarStatus()
```

---

## Impacto

Controla produção e aprovação de conteúdo.

---

# RN-12 — Referência de Material

## Módulos

| Módulo | Uso |
|-|-|
| Entrega.js | LINK_MATERIAL |
| PortalConteudo.js | link |

---

## Impacto

Permite acesso aos materiais sem acoplamento ao armazenamento físico.

---

# RN-13 — Documentos por Competência

## Módulo

```text
Documento.js
```

---

## Funções relacionadas

```text
gerarDocumento()

listarDocumentos()
```

---

## Impacto

Mantém documentos associados ao contexto correto.

---

# Regras de Validação

## Validação de competência

Antes de operações mensais:

```
Competência válida?

↓

Executa operação

```

---

## Validação de existência

Antes de criar:

```
Registro existe?

↓

Sim:
bloquear duplicação

Não:
criar
```

---

## Validação de sessão

Antes de operações protegidas:

```
Sessão válida?

↓

Permitir

```

ou:

```
Sessão inválida

↓

Negar acesso
```

---

# Resumo Operacional

| Domínio | Principais regras |
|-|-|
| Usuários | Estados e permissões |
| Parceiras | Identificação única |
| Briefing | Competência mensal |
| Entregas | Fluxo de aprovação |
| Envios | Controle logístico |
| Financeiro | Ciclo financeiro |
| Documentos | Associação temporal |
| Arquivamento | Fechamento de competência |

---

# Estados e Transições

Esta seção consolida os estados identificados no sistema e suas transições permitidas.

---

# Usuário

## Estados

```
PENDENTE

ATIVO

INATIVO
```

---

## Transições

Cadastro:

```
Novo usuário

↓

PENDENTE
```

Aprovação:

```
PENDENTE

↓

ATIVO
```

Rejeição:

```
PENDENTE

↓

Rejeitado
```

Inativação:

```
ATIVO

↓

INATIVO
```

Reativação:

```
INATIVO

↓

ATIVO
```

---

# Entrega

## Ciclo operacional

Estados identificados:

```
Criada

↓

Enviada

↓

Revisada

↓

Aprovada

↓

Publicada
```

---

## Regras

Uma entrega:

- deve estar associada a uma parceira;
- deve possuir competência;
- deve possuir identificação por rótulo;
- deve manter histórico de estado.

---

## Identidade da entrega

Chave lógica:

```
INFLU_KEY

+

ANO_REFERENCIA

+

MES_REFERENCIA

+

ROTULO
```

---

# Pagamento

## Ciclo financeiro

Estados:

```
Criado

↓

Liberado

↓

Pago
```

---

## Regras

Um pagamento:

- deve estar associado a uma parceira;
- deve possuir competência quando mensal;
- deve respeitar o fluxo financeiro.

---

## Eventos gerados

Após liberação:

```
PagamentoLiberado
```

Após confirmação:

```
PagamentoConfirmado
```

---

# Briefing

## Regras

Um briefing:

- pertence a uma competência;
- pertence a uma parceira;
- pode ser recriado para uma competência específica.

---

## Identificação

```
INFLU_KEY

+

ANO_REFERENCIA

+

MES_REFERENCIA
```

---

# Envio Logístico

## Regras

Um envio:

- pertence a uma competência;
- está relacionado a uma parceira;
- possui informações logísticas associadas.

---

## Identificação

```
INFLU_KEY

+

ANO_REFERENCIA

+

MES_REFERENCIA
```

---

# Documento

## Regras

Um documento:

- deve possuir tipo;
- deve possuir referência da parceira;
- pode possuir competência associada.

---

## Identificação

```
INFLU_KEY

+

TIPO_DOCUMENTO

+

MES_REFERENCIA
```

---

# Arquivamento

## Regra RN-14 — Selagem de Competência

## Descrição

Uma competência pode ser encerrada através do processo de arquivamento.

Fluxo:

```
Competência ativa

↓

Selagem

↓

Competência arquivada
```

---

## Módulo responsável

```
Arquivamento.js
```

---

## Evento gerado

```
CompetenciaArquivada
```

---

# Regra RN-15 — Operações Arquivadas Não Devem Sofrer Alteração

Após o fechamento:

```
Competência arquivada

↓

Somente consulta
```

---

# Regra RN-16 — Validação Antes de Persistência

Antes de salvar dados:

```
Receber comando

↓

Validar dados obrigatórios

↓

Executar regra de domínio

↓

Persistir
```

---

# Regra RN-17 — Separação de Responsabilidades

O domínio não deve conhecer infraestrutura.

Entidades não podem depender de:

```
SpreadsheetApp

DriveApp

HTML

HTTP

Repository

ACL
```

---

# Regra RN-18 — Persistência Protegida

Toda alteração de dados deve passar por:

```
Service

↓

Repository

↓

ACL

↓

Persistência
```

---

# Regras de Segurança

## Sessão

Operações protegidas exigem:

```
Token válido

+

Sessão ativa

+

Permissão adequada
```

---

## Administração

Operações administrativas exigem perfil autorizado.

Exemplos:

- aprovar usuário;
- rejeitar usuário;
- alterar estados administrativos.

---

# Regras Não Implementadas

Itens identificados como possíveis evoluções:

- [ ] Controle automático de arquivos no Drive;
- [ ] Permissões granulares por recurso;
- [ ] Workflow visual de aprovação;
- [ ] Auditoria completa de alterações;
- [ ] Histórico de mudanças por entidade.

---

# Checklist Final

## Regras de negócio

- [x] Competências mensais
- [x] Identificação por INFLU_KEY
- [x] Estados de usuário
- [x] Fluxo de entrega
- [x] Fluxo financeiro
- [x] Briefings
- [x] Envios
- [x] Documentos
- [x] Arquivamento
- [x] Validações
- [x] Segurança
- [x] Separação de domínio

---

# Status

Documento concluído como referência oficial das regras de negócio implementadas no Projeto TEAR V2.

O conteúdo representa o comportamento encontrado no código atual.
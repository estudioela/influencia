# SHEETS_MAP.md

## Objetivo

Este documento descreve a estrutura física da planilha oficial utilizada pelo Portal TEAR V2 como camada de persistência.

O objetivo é documentar exclusivamente a organização das abas, seus relacionamentos estruturais e os esquemas de dados observados durante a engenharia reversa.

Este documento não descreve regras de negócio, fluxos de execução ou detalhes de implementação das camadas da aplicação.

---

# 1. Banco Oficial

Durante a engenharia reversa foi identificado que o Portal TEAR V2 utiliza uma planilha Google Sheets como banco oficial de persistência.

Foi observado o uso de uma planilha composta por onze abas responsáveis pelo armazenamento dos dados do sistema.

---

# 2. Inventário das Abas

Foram identificadas as seguintes abas na planilha oficial.

| Aba | Colunas | Finalidade observada |
|------|---------:|----------------------|
| BASE DE DADOS | 26 | Cadastro principal das Parceiras |
| COLABORACOES | 7 | Registro das colaborações mensais |
| BRIEFING | 10 | Briefings das colaborações |
| ENTREGAS | 8 | Controle das entregas |
| ENVIOS | 8 | Controle logístico |
| PAGAMENTOS | 8 | Controle financeiro |
| DOCUMENTOS | 4 | Referências de documentos |
| SESSOES | 3 | Sessões autenticadas |
| BLOQUEIOS | 3 | Controle de bloqueios |
| SIS_IDENTIDADES | 6 | Identidades autenticadas |
| BASE_ADMINISTRADORES | 3 | Cadastro de administradores |

---

# 3. Organização Física

A estrutura física observada pode ser representada da seguinte forma.

```text
BASE DE DADOS
        │
        ├──────────────┐
        │              │
        ▼              ▼
COLABORACOES      SIS_IDENTIDADES
        │
        ▼
BRIEFING
        │
        ▼
ENTREGAS
        │
        ▼
ENVIOS
        │
        ▼
PAGAMENTOS
        │
        ▼
DOCUMENTOS

SESSOES

BLOQUEIOS

BASE_ADMINISTRADORES
```

O diagrama representa apenas a organização física das informações persistidas.

---

# 4. Responsabilidade das Abas

Cada aba possui uma responsabilidade específica dentro da estrutura de persistência observada.

| Aba | Responsabilidade |
|------|------------------|
| BASE DE DADOS | Cadastro principal das Parceiras |
| COLABORACOES | Persistência das colaborações mensais |
| BRIEFING | Armazenamento dos briefings |
| ENTREGAS | Registro das entregas realizadas |
| ENVIOS | Controle do fluxo logístico |
| PAGAMENTOS | Persistência dos pagamentos |
| DOCUMENTOS | Referências para documentos |
| SESSOES | Sessões autenticadas |
| BLOQUEIOS | Controle de bloqueios de acesso |
| SIS_IDENTIDADES | Identidades do Portal |
| BASE_ADMINISTRADORES | Cadastro de administradores |

---

# 5. Escopo

Este documento descreve exclusivamente:

- a estrutura física da planilha;
- as abas existentes;
- os cabeçalhos persistidos;
- os relacionamentos estruturais observados;
- a finalidade aparente de cada aba.

Não fazem parte deste documento:

- regras de negócio;
- validações;
- fluxos da aplicação;
- implementação das camadas de software.

Esses assuntos são documentados em artefatos específicos da engenharia reversa.

---

# 6. BASE DE DADOS

## Objetivo

A aba **BASE DE DADOS** concentra o cadastro principal das Parceiras do Portal.

Nela estão armazenadas informações cadastrais, fiscais, financeiras, contratuais e operacionais utilizadas pelo sistema.

É a estrutura com maior quantidade de informações persistidas da planilha.

---

## Estrutura

Foram identificadas as seguintes colunas.

| Nº | Campo |
|---:|--------|
| 1 | INFLU_KEY |
| 2 | STATUS |
| 3 | CUPOM |
| 4 | INFLUENCIADORA_CNPJ |
| 5 | INFLUENCIADORA_RAZAO_SOCIAL |
| 6 | INFLUENCIADORA_ENDERECO |
| 7 | RUA |
| 8 | NUMERO |
| 9 | COMPLEMENTO |
| 10 | BAIRRO |
| 11 | CIDADE |
| 12 | CEP |
| 13 | EMAIL |
| 14 | CHAVE_PIX |
| 15 | VALOR_TOTAL |
| 16 | VALOR_TOTAL_EXTENSO |
| 17 | LOOKS_QTD |
| 18 | LOOKS_QTD_TEXTO |
| 19 | STORIES_TEXTO |
| 20 | REELS_TEXTO |
| 21 | CARROSSEL_TEXTO |
| 22 | CANAIS_USO_IMAGEM |
| 23 | PRAZO_USO_IMAGEM |
| 24 | CIDADE_ASSINATURA |
| 25 | DATA_ASSINATURA |
| 26 | SUB_PROVIDER |

---

## Organização dos Dados

Os campos observados podem ser agrupados conforme sua finalidade.

### Identificação

- INFLU_KEY
- STATUS
- CUPOM
- SUB_PROVIDER

### Dados fiscais

- INFLUENCIADORA_CNPJ
- INFLUENCIADORA_RAZAO_SOCIAL

### Endereço

- INFLUENCIADORA_ENDERECO
- RUA
- NUMERO
- COMPLEMENTO
- BAIRRO
- CIDADE
- CEP

### Contato

- EMAIL

### Dados financeiros

- CHAVE_PIX
- VALOR_TOTAL
- VALOR_TOTAL_EXTENSO

### Informações da colaboração

- LOOKS_QTD
- LOOKS_QTD_TEXTO
- STORIES_TEXTO
- REELS_TEXTO
- CARROSSEL_TEXTO

### Direitos de uso

- CANAIS_USO_IMAGEM
- PRAZO_USO_IMAGEM

### Assinatura

- CIDADE_ASSINATURA
- DATA_ASSINATURA

---

## Observações

Durante a inspeção da planilha foi observado que:

- cada registro representa uma Parceira;
- o campo `INFLU_KEY` identifica o registro da Parceira nas demais abas;
- o campo `SUB_PROVIDER` também está presente em outras estruturas da planilha.

O significado funcional desses campos é tratado em documentos específicos da engenharia reversa.

---

# 7. SIS_IDENTIDADES

## Objetivo

A aba **SIS_IDENTIDADES** armazena as identidades utilizadas pelo Portal.

Sua estrutura é separada da aba **BASE DE DADOS**, mantendo informações relacionadas à autenticação e ao perfil de acesso.

---

## Estrutura

Foram identificadas as seguintes colunas.

| Nº | Campo |
|---:|--------|
| 1 | SUB_PROVIDER |
| 2 | EMAIL_PERFIL |
| 3 | PAPEL_ATOR |
| 4 | ESTADO_CONTA |
| 5 | DATA_CRIACAO |
| 6 | ULTIMO_ACESSO |

---

## Organização dos Dados

### Identificação

- SUB_PROVIDER

### Perfil

- EMAIL_PERFIL
- PAPEL_ATOR

### Estado da Conta

- ESTADO_CONTA

### Auditoria

- DATA_CRIACAO
- ULTIMO_ACESSO

---

## Observações

Foi observado que:

- `SUB_PROVIDER` também existe na aba **BASE DE DADOS**;
- a aba possui estrutura própria e independente do cadastro principal;
- os registros armazenam informações distintas das informações cadastrais das Parceiras.

---

# 8. Relação Estrutural

Considerando apenas a estrutura física observada na planilha, a principal relação identificada é:

```text
SIS_IDENTIDADES
        │
        │ SUB_PROVIDER
        ▼
BASE DE DADOS
        │
        │ INFLU_KEY
        ▼
COLABORACOES
```

As demais abas também utilizam o campo `INFLU_KEY` como referência para os registros relacionados às Parceiras.

---

# 9. COLABORACOES

## Objetivo

A aba **COLABORACOES** registra as colaborações associadas às Parceiras.

Cada registro utiliza a coluna `INFLU_KEY` para referência ao cadastro principal.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | INFLU_KEY |
| 2 | MES_REFERENCIA |
| 3 | ANO_REFERENCIA |
| 4 | ESTADO |
| 5 | SNAPSHOT_VALOR |
| 6 | SNAPSHOT_FORMATOS |
| 7 | SNAPSHOT_QTD_POR_FORMATO |

---

# 10. BRIEFING

## Objetivo

A aba **BRIEFING** armazena informações relacionadas aos briefings das colaborações.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | INFLU_KEY |
| 2 | MES_REFERENCIA |
| 3 | ANO_REFERENCIA |
| 4 | ESTADO |
| 5 | BLOCO_ROTULO |
| 6 | LOOK |
| 7 | DATA_ENTREGA |
| 8 | DATA_POSTAGEM |
| 9 | ORIENTACAO |
| 10 | DATA_APROVACAO_INTERNA |

---

# 11. ENTREGAS

## Objetivo

A aba **ENTREGAS** registra informações relacionadas às entregas realizadas pelas Parceiras.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | INFLU_KEY |
| 2 | ANO_REFERENCIA |
| 3 | MES_REFERENCIA |
| 4 | ROTULO |
| 5 | ESTADO |
| 6 | LINK_MATERIAL |
| 7 | DATA_APROVACAO_INTERNA |
| 8 | DATA_ARQUIVAMENTO |

---

# 12. ENVIOS

## Objetivo

A aba **ENVIOS** armazena informações relacionadas ao fluxo logístico.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | INFLU_KEY |
| 2 | ANO_REFERENCIA |
| 3 | MES_REFERENCIA |
| 4 | STATUS_REVISAO |
| 5 | STATUS_LOGISTICA |
| 6 | RASTREIO |
| 7 | DATA_ENVIO |
| 8 | DATA_ARQUIVAMENTO |

---

# 13. PAGAMENTOS

## Objetivo

A aba **PAGAMENTOS** registra os pagamentos associados às Parceiras.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | ID_OBRIGACAO |
| 2 | INFLU_KEY |
| 3 | TIPO_PAGAMENTO |
| 4 | ANO_REFERENCIA |
| 5 | MES_REFERENCIA |
| 6 | VALOR |
| 7 | ESTADO |
| 8 | DATA_ARQUIVAMENTO |

---

# 14. DOCUMENTOS

## Objetivo

A aba **DOCUMENTOS** registra referências para documentos associados às Parceiras.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | INFLU_KEY |
| 2 | TIPO_DOCUMENTO |
| 3 | MES_REFERENCIA |
| 4 | REFERENCIA |

---

# 15. SESSOES

## Objetivo

A aba **SESSOES** armazena informações relacionadas às sessões registradas.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | TOKEN |
| 2 | PARCEIRA_ID |
| 3 | EXPIRA_EM |

---

# 16. BLOQUEIOS

## Objetivo

A aba **BLOQUEIOS** registra informações relacionadas ao controle de bloqueios.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | IDENTIFICADOR |
| 2 | TENTATIVAS |
| 3 | BLOQUEIO_INICIO |

---

# 17. BASE_ADMINISTRADORES

## Objetivo

A aba **BASE_ADMINISTRADORES** mantém o cadastro dos administradores do Portal.

---

## Estrutura

| Nº | Campo |
|---:|--------|
| 1 | SUB_PROVIDER |
| 2 | NOME_COMPLETO |
| 3 | AREA_RESPONSABILIDADE |

---

# 18. Resumo Estrutural

Durante a engenharia reversa foram identificadas onze abas físicas na planilha oficial.

As estruturas podem ser resumidas da seguinte forma.

| Aba | Colunas |
|------|---------:|
| BASE DE DADOS | 26 |
| COLABORACOES | 7 |
| BRIEFING | 10 |
| ENTREGAS | 8 |
| ENVIOS | 8 |
| PAGAMENTOS | 8 |
| DOCUMENTOS | 4 |
| SESSOES | 3 |
| BLOQUEIOS | 3 |
| SIS_IDENTIDADES | 6 |
| BASE_ADMINISTRADORES | 3 |

---

# 19. Conclusão

A engenharia reversa permitiu mapear integralmente a estrutura física da planilha oficial utilizada pelo Portal TEAR V2.

Foram identificadas todas as abas existentes, seus respectivos cabeçalhos e a organização geral dos dados persistidos.

Este documento limita-se à documentação da estrutura física observada, servindo como referência para consultas sobre o esquema da planilha oficial e complementando os demais documentos de engenharia reversa do projeto.
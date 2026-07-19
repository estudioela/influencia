# Pending Issues

## Objetivo

O documento `PENDING_ISSUES.md` consolida:

- bugs conhecidos;
- inconsistências encontradas;
- funcionalidades incompletas;
- débitos técnicos;
- pontos de atenção arquitetural.

Este documento representa o estado atual encontrado na auditoria do código.

Não representa um backlog futuro completo.

---

# Critério de Classificação

| Status | Significado |
|-|-|
| 🔴 Crítico | Bloqueia operação ou produção |
| 🟠 Alto | Afeta fluxo importante |
| 🟡 Médio | Necessita melhoria |
| 🟢 Baixo | Ajuste ou evolução futura |

---

# Pendências Identificadas

---

# P-001 — Dependência forte do Google Sheets

## Status

🟡 Médio

---

## Descrição

O sistema utiliza Google Sheets como camada principal de persistência.

Fluxo atual:

```
Services

↓

Repositories

↓

ACL

↓

Google Sheets
```

---

## Impacto

Possíveis limitações:

- concorrência;
- volume de dados;
- performance;
- manutenção das abas.

---

## Local relacionado

```
src/entrypoint/Portal.js

src/modulos/*
```

---

# P-002 — Portal.js concentra muitas responsabilidades

## Status

🟡 Médio

---

## Descrição

O arquivo:

```
src/entrypoint/Portal.js
```

atua como:

- Web App entrypoint;
- API pública;
- composição de serviços;
- adaptação de infraestrutura;
- autenticação.

---

## Impacto

Pode aumentar:

- dificuldade de manutenção;
- acoplamento;
- complexidade de testes.

---

# P-003 — Ausência de camada Drive automatizada

## Status

🟡 Médio

---

## Descrição

O sistema trabalha com referências:

```
LINK_MATERIAL

link
```

mas não possui:

- criação automática de pastas;
- upload controlado;
- permissões Drive;
- arquivamento físico.

---

## Impacto

Arquivos dependem de operação externa.

---

# P-004 — Ambientes não isolados

## Status

🟡 Médio

---

## Descrição

Não foram identificados ambientes formais:

```
development

staging

production
```

---

## Impacto

Mudanças dependem de configuração manual.

---

# P-005 — Configuração manual de Script Properties

## Status

🟡 Médio

---

## Descrição

Configurações críticas dependem de:

```
Script Properties
```

Exemplos:

```
SPREADSHEET_ID

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET
```

---

## Impacto

Provisionamento de novos ambientes exige intervenção manual.

---

# P-006 — Dependência de APIs externas

## Status

🟡 Médio

---

## Descrição

O sistema possui integrações externas:

```
Google OAuth

BrasilAPI
```

---

## Impacto

Indisponibilidade externa pode afetar funcionalidades.

---

# P-007 — Falta de documentação operacional de deploy

## Status

🟡 Médio

---

## Descrição

Existe documentação técnica, porém ainda necessita consolidar:

- sequência de deploy;
- validações pós-deploy;
- rollback;
- checklist operacional.

---

# P-008 — Auditoria automática de código morto

## Status

🟢 Baixo

---

## Descrição

A auditoria atual foi realizada manualmente.

Não existe ferramenta automática para:

- detectar funções sem referência;
- detectar arquivos órfãos;
- mapear dependências.

---

# P-009 — Cobertura de observabilidade

## Status

🟡 Médio

---

## Descrição

Existem mecanismos de erro:

```
erroComCodigo()
throw Error()
```

porém não existe camada completa de:

- métricas;
- dashboards;
- alertas;
- histórico operacional.

---

# P-010 — Histórico completo de alterações

## Status

🟢 Baixo

---

## Descrição

O sistema possui histórico operacional, porém não existe auditoria completa de:

- quem alterou;
- quando alterou;
- valor anterior;
- valor novo.

---

# Resumo Inicial

| ID | Pendência | Status |
|-|-|-|
| P-001 | Acoplamento Google Sheets | 🟡 |
| P-002 | Portal.js concentrado | 🟡 |
| P-003 | Drive automatizado | 🟡 |
| P-004 | Ambientes isolados | 🟡 |
| P-005 | Provisionamento de configuração | 🟡 |
| P-006 | Dependências externas | 🟡 |
| P-007 | Deploy operacional | 🟡 |
| P-008 | Auditoria automática | 🟢 |
| P-009 | Observabilidade | 🟡 |
| P-010 | Auditoria de alterações | 🟢 |

---

# Estado Atual

Pendências iniciais levantadas.

Próxima etapa:

- relacionar cada pendência aos módulos afetados;
- definir impacto;
- classificar prioridade de execução.

---

# Matriz de Pendências

Esta seção relaciona cada pendência com os componentes afetados.

Fluxo:

```
Pendência

↓

Local técnico

↓

Impacto

↓

Prioridade
```

---

# P-001 — Dependência forte do Google Sheets

## Local afetado

```
src/entrypoint/Portal.js

src/modulos/*

Repositories

ACLs
```

---

## Impacto técnico

Afeta:

- escalabilidade;
- performance;
- concorrência;
- evolução futura.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Avaliar futuramente:

```
Sheets

↓

API

↓

Banco estruturado
```

Sem alteração imediata.

---

# P-002 — Portal.js concentrado

## Local afetado

```
src/entrypoint/Portal.js
```

---

## Impacto técnico

Afeta:

- manutenção;
- leitura;
- isolamento de testes.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Separar futuramente:

```
Portal.js

↓

Controllers

↓

Composition Root
```

---

# P-003 — Ausência de camada Drive

## Local afetado

```
src/modulos/Entrega.js

src/modulos/Documento.js

src/modulos/PortalConteudo.js
```

---

## Impacto operacional

Arquivos dependem de:

- links externos;
- operação manual;
- organização fora do sistema.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Criar futuramente:

```
Drive Service

↓

Upload

↓

Pastas

↓

Permissões
```

---

# P-004 — Ambientes não isolados

## Local afetado

```
appsscript.json

Script Properties

Deployments
```

---

## Impacto

Pode causar:

- alterações no ambiente errado;
- dificuldade de testes;
- risco em produção.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Criar:

```
dev

staging

production
```

com configurações próprias.

---

# P-005 — Provisionamento manual de configurações

## Local afetado

```
src/shared/Nucleo.js

Script Properties
```

---

## Impacto

Novos ambientes dependem de configuração manual.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Criar processo de:

```
setup inicial

↓

validação automática

↓

ambiente pronto
```

---

# P-006 — Dependências externas

## Local afetado

```
src/modulos/Autenticacao.js

src/modulos/Parceira.js
```

---

## Dependências:

```
Google OAuth

BrasilAPI
```

---

## Impacto

Falhas externas podem interromper funcionalidades.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Adicionar:

- timeout;
- mensagens claras;
- fallback quando possível.

---

# P-007 — Processo de Deploy

## Local afetado

```
clasp

appsscript.json

Deploy Web App
```

---

## Impacto

Dificulta:

- publicação segura;
- rollback;
- validação.

---

## Prioridade

```
ALTA
```

---

## Ação recomendada

Documentar:

```
alteração

↓

teste

↓

deploy

↓

validação
```

---

# P-008 — Auditoria automática

## Local afetado

```
Ferramentas de desenvolvimento
```

---

## Impacto

Manutenção depende de auditoria manual.

---

## Prioridade

```
BAIXA
```

---

## Ação recomendada

Adicionar futuramente:

- análise estática;
- relatórios automáticos;
- validação CI.

---

# P-009 — Observabilidade

## Local afetado

```
src/shared/Nucleo.js

Portal.js

Services
```

---

## Impacto

Dificulta investigação de problemas.

---

## Prioridade

```
MÉDIA
```

---

## Ação recomendada

Adicionar:

- logs estruturados;
- métricas;
- acompanhamento de erros.

---

# P-010 — Auditoria de alterações

## Local afetado

```
Repositories

Google Sheets
```

---

## Impacto

Não existe trilha completa de mudanças.

---

## Prioridade

```
BAIXA
```

---

## Ação recomendada

Criar:

```
AuditLog

↓

usuário

↓

data

↓

alteração
```

---

# Priorização Geral

## Alta prioridade

```
P-007

Processo de Deploy
```

---

## Média prioridade

```
P-001

P-002

P-003

P-004

P-005

P-006

P-009
```

---

## Baixa prioridade

```
P-008

P-010
```

---

# Diagnóstico

A maior parte das pendências não representa falha funcional.

São principalmente:

- evolução arquitetural;
- escalabilidade;
- operação;
- manutenção.

O sistema atual possui estrutura funcional, porém existem pontos de maturidade para evolução.

---

# Backlog de Evolução

Esta seção consolida melhorias futuras identificadas durante a auditoria.

Estas ações não representam bloqueios atuais.

---

# Evolução Arquitetural

## EP-001 — Separação do EntryPoint

Objetivo:

Reduzir responsabilidade do:

```
src/entrypoint/Portal.js
```

Possível evolução:

```
Portal.js

↓

Controllers

↓

Services

↓

Composition Root
```

---

## EP-002 — Camada de Persistência Evolutiva

Objetivo:

Reduzir dependência direta de Google Sheets.

Possível evolução:

```
Repositories

↓

Interface de Persistência

↓

Sheets / Banco / API
```

---

## EP-003 — Serviço de Arquivos

Objetivo:

Criar abstração para documentos e materiais.

Possível evolução:

```
ArquivoService

↓

Google Drive

↓

Storage externo
```

Responsabilidades:

- upload;
- organização;
- permissões;
- histórico.

---

# Evolução Operacional

## EP-004 — Ambientes Formais

Criar separação:

```
Development

↓

Staging

↓

Production
```

Cada ambiente deve possuir:

- configurações próprias;
- deployment próprio;
- validações próprias.

---

## EP-005 — Automação de Provisionamento

Criar processo para:

- configurar Script Properties;
- validar ambiente;
- preparar novo deploy.

---

## EP-006 — Pipeline de Deploy

Criar fluxo:

```
Código

↓

Testes

↓

Lint

↓

Deploy

↓

Validação
```

---

# Evolução de Segurança

## EP-007 — Auditoria de Alterações

Criar histórico:

```
Usuário

↓

Data/Hora

↓

Ação

↓

Valor anterior

↓

Valor novo
```

---

## EP-008 — Controle de Permissões Mais Granular

Evoluir:

```
Usuário

↓

Perfil

↓

Permissões

↓

Recursos
```

---

# Evolução de Observabilidade

## EP-009 — Logs Estruturados

Adicionar:

- contexto da operação;
- usuário;
- competência;
- entidade afetada.

---

## EP-010 — Monitoramento

Adicionar:

- indicadores;
- alertas;
- acompanhamento de falhas.

---

# Priorização Recomendada

## Fase 1 — Segurança operacional

Prioridade:

ALTA

Itens:

```
P-007

EP-005

EP-006
```

Objetivo:

Garantir deploy seguro e previsível.

---

## Fase 2 — Manutenção

Prioridade:

MÉDIA

Itens:

```
P-002

P-005

P-009
```

Objetivo:

Reduzir complexidade operacional.

---

## Fase 3 — Evolução arquitetural

Prioridade:

MÉDIA/BAIXA

Itens:

```
P-001

P-003

EP-001

EP-002

EP-003
```

Objetivo:

Preparar crescimento futuro.

---

# Pendências Não Confirmadas

Itens que precisam de validação contínua:

- [ ] existência de todos os ambientes esperados;
- [ ] estratégia definitiva de armazenamento;
- [ ] necessidade de migração de persistência;
- [ ] política final de auditoria;
- [ ] política de retenção de dados.

---

# Checklist Final

## Auditoria de Pendências

- [x] Bugs identificados
- [x] Inconsistências registradas
- [x] Débitos técnicos documentados
- [x] Riscos arquiteturais listados
- [x] Melhorias futuras separadas
- [x] Prioridades definidas

---

# Status

Documento concluído como referência oficial das pendências técnicas do Projeto TEAR V2.

Resultado da auditoria:

```
Sistema funcional.

Pendências atuais são principalmente evolutivas,
operacionais e arquiteturais.
```
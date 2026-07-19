# Deploy Plan

## Objetivo

O documento `DEPLOY_PLAN.md` define o processo oficial de publicação do Projeto TEAR V2.

O objetivo é garantir que alterações sejam disponibilizadas de forma controlada através de:

- preparação técnica;
- validação;
- sincronização;
- publicação;
- verificação pós-deploy.

---

# Princípios de Deploy

O processo deve seguir:

```
Código local

↓

Validação

↓

Sincronização

↓

Deployment

↓

Teste operacional
```

---

# Ambiente de Deploy

O TEAR V2 utiliza:

```
Google Apps Script Web App
```

Fluxo:

```
Código local

↓

clasp push

↓

Google Apps Script

↓

Deployment Web App

↓

/exec
```

---

# Pré-requisitos

Antes de publicar:

## Código

Validar:

- alterações revisadas;
- arquivos corretos;
- documentação atualizada.

---

## Dependências

Confirmar:

- Node.js disponível;
- dependências instaladas;
- testes executados.

---

## Google Apps Script

Confirmar:

- projeto correto;
- autenticação ativa;
- permissões válidas.

---

# Preparação Antes do Deploy

Executar:

```
git status
```

Objetivo:

Confirmar arquivos alterados.

---

Executar:

```
npm test
```

Objetivo:

Garantir funcionamento dos testes.

---

Executar:

```
npm run lint
```

Objetivo:

Validar qualidade do código.

---

# Revisão de Alterações

Antes do deploy:

Verificar:

```
Arquivo alterado

↓

Motivo da alteração

↓

Impacto esperado
```

---

# Sincronização

Processo:

```
Código local

↓

clasp push

↓

Apps Script
```

---

# Validação Inicial

Após sincronização:

Confirmar:

- arquivos enviados;
- ausência de erro;
- projeto atualizado.

---

# Status

Primeira etapa do processo de deploy definida.

Próxima etapa:

- publicação;
- validação pós-deploy;
- rollback.

---

# Processo de Publicação

Esta etapa descreve o fluxo de publicação do TEAR V2 após validação do código.

---

# Etapa 01 — Sincronização

## Objetivo

Enviar os arquivos locais para o Google Apps Script.

Fluxo:

```
Código local

↓

clasp push

↓

Projeto Apps Script
```

---

## Comando

```bash
clasp push
```

---

## Validar resultado

Confirmar:

- arquivos enviados;
- ausência de erros;
- projeto atualizado.

---

# Etapa 02 — Versionamento

## Objetivo

Criar uma referência da versão publicada.

---

## Processo

Registrar:

```
Versão

↓

Data

↓

Alterações

↓

Responsável
```

---

## Exemplo

```
v2.x.x

Alteração:

Descrição da mudança

Arquivos:

lista dos arquivos alterados
```

---

# Etapa 03 — Deployment Web App

## Objetivo

Publicar uma versão executável.

Fluxo:

```
Apps Script

↓

Deploy

↓

New Deployment

↓

Web App
```

---

## Configurações esperadas

Validar:

```
Execute as:

User deploying the web app

```

---

## Acesso

Validar:

```
Quem tem acesso

↓

Configuração esperada do ambiente
```

---

# Etapa 04 — Validação Pós-Deploy

Após publicação:

Abrir:

```
/exec
```

---

Executar fluxo mínimo:

```
Página inicial

↓

Login

↓

Dashboard

↓

Consulta principal
```

---

# Checklist Pós-Deploy

## Sistema

- [ ] Web App abre
- [ ] Frontend carrega
- [ ] Backend responde
- [ ] Sessão funciona
- [ ] Dados carregam

---

## Autenticação

- [ ] Login válido funciona
- [ ] Usuário inválido é bloqueado
- [ ] Sessão expirada é tratada

---

## Dados

- [ ] Leitura funcionando
- [ ] Escrita funcionando
- [ ] Dados persistidos corretamente

---

# Validação de Fluxos Críticos

## Parceira

Validar:

```
Cadastro

↓

Consulta

↓

Atualização
```

---

## Briefing

Validar:

```
Abrir briefing

↓

Preencher

↓

Salvar
```

---

## Entrega

Validar:

```
Enviar material

↓

Aprovar

↓

Atualizar estado
```

---

## Financeiro

Validar:

```
Criar pagamento

↓

Liberar

↓

Confirmar
```

---

# Critério de Sucesso

Deploy aprovado quando:

```
Aplicação acessível

+

Fluxos principais funcionando

+

Sem erros críticos
```

---

# Critério de Falha

Deploy deve ser interrompido quando houver:

- erro de autenticação;
- falha de carregamento;
- perda de dados;
- quebra de fluxo principal;
- erro de permissão.

---

# Registro de Deploy

Cada publicação deve registrar:

```
Versão

↓

Data

↓

Alterações

↓

Resultado

↓

Observações
```

---

# Rollback

## Objetivo

Definir o procedimento para retornar a uma versão estável em caso de falha.

---

# Critérios para Rollback

O rollback deve ser considerado quando ocorrer:

- falha de autenticação;
- indisponibilidade do portal;
- perda de dados;
- erro crítico em fluxo principal;
- quebra de integração.

---

# Processo de Rollback

Fluxo:

```
Identificar falha

↓

Interromper nova alteração

↓

Restaurar versão estável

↓

Validar funcionamento

↓

Registrar incidente
```

---

# Estratégia de Restauração

O retorno deve utilizar:

```
Versão anterior conhecida

+

Deployment anterior

+

Configuração validada
```

---

# Validação Pós-Rollback

Após restauração:

Validar:

- acesso ao portal;
- login;
- leitura de dados;
- operações principais;
- permissões.

---

# Registro de Incidente

Todo rollback deve registrar:

```
Versão afetada

↓

Problema encontrado

↓

Causa provável

↓

Ação tomada

↓

Resultado
```

---

# Segurança no Deploy

Durante publicação:

Evitar:

- alterar produção sem validação;
- publicar código não testado;
- modificar configurações críticas sem registro.

---

# Configurações Sensíveis

Antes do deploy validar:

```
Script Properties

↓

OAuth

↓

IDs Google

↓

Permissões
```

---

# Checklist Final de Deploy

## Antes

- [ ] Código revisado
- [ ] Testes executados
- [ ] Lint executado
- [ ] Documentação atualizada
- [ ] Alterações registradas

---

## Durante

- [ ] clasp push executado
- [ ] Deployment criado
- [ ] Configurações verificadas
- [ ] Versão registrada

---

## Depois

- [ ] Web App acessível
- [ ] Login validado
- [ ] Fluxos críticos testados
- [ ] Sem erros críticos
- [ ] Resultado registrado

---

# Fluxo Oficial

```
Desenvolvimento

↓

Revisão

↓

Testes

↓

clasp push

↓

Deployment

↓

Validação

↓

Produção
```

---

# Status Final

Documento concluído como plano oficial de deploy do Projeto TEAR V2.

Resultado esperado:

```
Deploy previsível

↓

Baixo risco operacional

↓

Rápida recuperação em caso de falha
```
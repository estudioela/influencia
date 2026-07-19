# Validation Plan

## Objetivo

O documento `VALIDATION_PLAN.md` define a estratégia de validação do Projeto TEAR V2.

O objetivo é garantir que alterações realizadas no sistema sejam verificadas através de:

- testes automatizados;
- validações funcionais;
- validações arquiteturais;
- validações operacionais.

---

# Princípios de Validação

Toda alteração deve seguir:

```
Alteração

↓

Teste

↓

Validação funcional

↓

Revisão

↓

Deploy
```

---

# Camadas de Validação

O projeto utiliza múltiplas camadas:

```
Teste Unitário

↓

Teste de Serviço

↓

Teste de Integração

↓

Teste Manual

↓

Validação em Produção
```

---

# Validação de Código

## Objetivo

Garantir qualidade técnica antes da publicação.

---

## Verificações

Executar:

```bash
npm run lint
```

---

## Validar:

- sintaxe;
- padrões de código;
- erros estáticos;
- consistência.

---

# Validação Automatizada

## Objetivo

Garantir que regras existentes continuam funcionando.

---

## Execução

```bash
npm test
```

---

## Abrangência

Os testes devem validar:

- entidades;
- serviços;
- controllers;
- repositories;
- ACLs;
- integrações.

---

# Domínio de Autenticação

## Validar

- login;
- sessão;
- OAuth;
- expiração;
- permissões.

---

## Componentes

```
Autenticacao.js

Usuario.js

Portal.js
```

---

## Critério de aprovação

```
Usuário autorizado

↓

Acesso permitido
```

e:

```
Usuário inválido

↓

Acesso bloqueado
```

---

# Domínio de Parceiras

## Validar

- cadastro;
- identidade INFLU_KEY;
- atualização;
- estados.

---

## Componentes

```
Parceira.js

Perfil.js
```

---

## Critério de aprovação

```
Cadastro válido

↓

Registro persistido
```

---

# Domínio de Briefing

## Validar

- criação;
- consulta;
- preenchimento;
- competência.

---

## Componentes

```
Briefing.js
```

---

## Critério de aprovação

```
Briefing válido

↓

Disponível no portal
```

---

# Domínio de Entregas

## Validar

- criação;
- envio;
- aprovação;
- publicação.

---

## Componentes

```
Entrega.js
```

---

## Critério de aprovação

Fluxo:

```
Criada

↓

Enviada

↓

Aprovada

↓

Publicada
```

---

# Domínio Financeiro

## Validar

- criação de pagamento;
- liberação;
- confirmação.

---

## Componentes

```
Financeiro.js
```

---

## Critério de aprovação

Fluxo:

```
Criado

↓

Liberado

↓

Pago
```

---

# Estado Atual

Plano de validação estruturado.

Próxima etapa:

- validações integradas;
- validações de infraestrutura;
- checklist de aprovação.

---

# Validação de Integração

Esta etapa valida o funcionamento conjunto entre camadas.

Fluxo:

```
Frontend

↓

google.script.run

↓

Portal.js

↓

Services

↓

Repositories

↓

Persistência
```

---

# Validação Frontend + Backend

## Objetivo

Garantir comunicação correta entre interface e servidor.

---

## Validar

- chamadas `google.script.run`;
- parâmetros enviados;
- respostas recebidas;
- tratamento de erros.

---

## Critério de aprovação

```
Ação no portal

↓

Backend processa

↓

Resposta válida retorna ao usuário
```

---

# Validação de Persistência

## Objetivo

Garantir gravação correta dos dados.

---

## Componentes

```
Repositories

↓

ACLs

↓

Google Sheets
```

---

## Validar

- criação de registros;
- atualização;
- leitura;
- consistência dos dados.

---

## Critério de aprovação

```
Operação executada

↓

Dados persistidos corretamente
```

---

# Validação de Regras de Negócio

## Objetivo

Garantir que regras do domínio continuam protegidas.

---

## Validar

- estados permitidos;
- transições;
- campos obrigatórios;
- bloqueios.

---

## Exemplos

Entrega:

```
Criada

↓

Enviada

↓

Aprovada

↓

Publicada
```

Pagamento:

```
Criado

↓

Liberado

↓

Pago
```

---

# Validação de Segurança

## Objetivo

Garantir controle de acesso.

---

## Validar

- usuário autenticado;
- sessão válida;
- permissões;
- bloqueios.

---

## Critério de aprovação

Usuário autorizado:

```
Acesso permitido
```

Usuário inválido:

```
Acesso negado
```

---

# Validação de Configuração

## Objetivo

Garantir ambiente corretamente configurado.

---

## Validar

- Script Properties;
- IDs Google;
- OAuth;
- Deployment;
- permissões.

---

## Checklist

- [ ] SPREADSHEET_ID configurado
- [ ] OAuth configurado
- [ ] Web App publicado
- [ ] permissões revisadas

---

# Validação de Deploy

## Objetivo

Confirmar funcionamento após publicação.

---

## Processo

```
Deploy

↓

Abrir /exec

↓

Executar login

↓

Validar fluxo principal
```

---

## Fluxos mínimos

Testar:

```
Login

↓

Dashboard

↓

Consulta de dados

↓

Operação principal
```

---

# Validação Manual

## Objetivo

Confirmar experiência real do usuário.

---

## Perfis de teste

### Parceira

Validar:

- login;
- perfil;
- briefing;
- entrega.

---

### Administrador

Validar:

- usuários;
- pagamentos;
- aprovação;
- compilação.

---

# Critério de Reprovação

Uma versão deve ser considerada inválida quando:

- testes falham;
- regras de negócio quebram;
- dados são gravados incorretamente;
- autenticação falha;
- fluxo principal fica indisponível.

---

# Resultado Esperado

Após validação:

```
Código aprovado

↓

Fluxos aprovados

↓

Deploy autorizado
```

---

# Checklist Geral de Validação

Antes de considerar uma entrega concluída:

## Código

- [ ] Código revisado
- [ ] Lint executado
- [ ] Testes automatizados executados
- [ ] Sem erros críticos

---

## Domínio

- [ ] Regras de negócio validadas
- [ ] Estados revisados
- [ ] Transições testadas
- [ ] Validações mantidas

---

## Integrações

- [ ] Google Services funcionando
- [ ] OAuth validado
- [ ] APIs externas disponíveis
- [ ] Configurações corretas

---

## Interface

- [ ] Páginas carregam
- [ ] Chamadas frontend/backend funcionam
- [ ] Mensagens de erro adequadas
- [ ] Fluxos principais testados

---

# Cenários Críticos

## Cenário 01 — Login

Entrada:

```
Usuário válido
```

Esperado:

```
Sessão criada

↓

Dashboard disponível
```

---

## Cenário 02 — Usuário inválido

Entrada:

```
Credencial inválida
```

Esperado:

```
Acesso bloqueado
```

---

## Cenário 03 — Nova competência

Entrada:

```
Competência válida
```

Esperado:

```
Dados mensais criados
```

---

## Cenário 04 — Entrega

Entrada:

```
Material enviado
```

Esperado:

```
Entrega atualizada

↓

Status alterado
```

---

## Cenário 05 — Pagamento

Entrada:

```
Pagamento liberado
```

Esperado:

```
Estado financeiro atualizado
```

---

# Critérios de Aprovação da Versão

Uma versão pode ser aprovada quando:

```
Todos os testes passam

+

Fluxos principais funcionam

+

Configuração validada

+

Documentação atualizada
```

---

# Critérios de Bloqueio

O deploy deve ser interrompido quando existir:

- erro de autenticação;
- perda de dados;
- falha de persistência;
- quebra de fluxo principal;
- teste crítico falhando.

---

# Estratégia de Regressão

Após qualquer alteração relevante:

Executar novamente:

```
Testes automatizados

↓

Fluxos críticos

↓

Validação manual
```

---

# Responsabilidade de Validação

Cada alteração deve possuir:

```
Responsável técnico

↓

Validação executada

↓

Resultado registrado
```

---

# Evidências de Validação

Registrar:

- data;
- versão;
- testes executados;
- resultado;
- problemas encontrados.

---

# Status Final

Documento concluído como plano oficial de validação do Projeto TEAR V2.

Resultado esperado:

```
Alterações controladas

↓

Qualidade garantida

↓

Deploy seguro
```
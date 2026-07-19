# Acceptance Criteria

## Objetivo

O documento `ACCEPTANCE_CRITERIA.md` define os critérios necessários para considerar uma versão do Projeto TEAR V2 aceita.

Uma entrega somente é considerada concluída quando atende aos critérios:

- funcionais;
- técnicos;
- operacionais;
- de segurança;
- de qualidade.

---

# Princípio de Aceitação

A aprovação segue:

```
Implementação

↓

Validação

↓

Critérios atendidos

↓

Aceitação
```

---

# Critérios Gerais

Uma versão não pode ser considerada aceita quando:

- possui erro crítico conhecido;
- quebra fluxo principal;
- perde dados;
- possui falha de autenticação;
- não possui validação executada.

---

# Critérios Funcionais

---

# Autenticação

## Deve permitir

- login de usuário autorizado;
- criação de sessão;
- validação de identidade;
- encerramento de sessão.

---

## Deve impedir

- acesso sem autenticação;
- sessão inválida;
- usuário sem permissão.

---

## Critério de aprovação

```
Usuário válido

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

# Gestão de Parceiras

## Deve permitir

- cadastro;
- consulta;
- atualização;
- identificação por INFLU_KEY.

---

## Critério de aprovação

```
Parceira cadastrada

↓

Dados persistidos corretamente
```

---

# Briefing

## Deve permitir

- criação;
- consulta;
- preenchimento;
- associação à competência.

---

## Critério de aprovação

```
Briefing criado

↓

Disponível no portal

↓

Dados preservados
```

---

# Entregas

## Deve permitir

- envio de material;
- atualização de estado;
- aprovação;
- publicação.

---

## Fluxo esperado

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

# Financeiro

## Deve permitir

- criação de pagamento;
- liberação;
- confirmação.

---

## Fluxo esperado

```
Criado

↓

Liberado

↓

Pago
```

---

# Documentos

## Deve permitir

- geração;
- associação à parceira;
- consulta.

---

# Critérios de Dados

O sistema deve garantir:

- registros com identidade válida;
- competências consistentes;
- ausência de duplicação;
- persistência correta.

---

# Critérios de Domínio

As regras de negócio devem permanecer:

- centralizadas;
- testadas;
- protegidas;
- documentadas.

---

# Critérios Técnicos

Esta seção define os requisitos técnicos mínimos para aprovação de uma versão.

---

# Código

## Deve possuir

- código organizado;
- responsabilidades separadas;
- ausência de erros críticos;
- padrões mantidos.

---

## Critério de aprovação

```
Código revisado

+

Sem falhas críticas

+

Testes executados
```

---

# Testes

## Deve possuir

Execução bem-sucedida de:

```bash
npm test
```

e:

```bash
npm run lint
```

---

## Critério de aprovação

Resultado esperado:

```
Todos os testes passando

+

Lint sem erros bloqueantes
```

---

# Arquitetura

## Deve manter

```
Frontend

↓

Entrypoint

↓

Services

↓

Domínio

↓

Repositories

↓

Persistência
```

---

## Não deve ocorrer

- regra de negócio no frontend;
- acesso direto à planilha fora da persistência;
- segredo no código;
- duplicação de lógica crítica.

---

# Dados

## Critérios

O sistema deve garantir:

- registros consistentes;
- chaves únicas;
- referências válidas;
- competências corretas.

---

## Identidade

Toda entidade principal deve possuir identificação adequada.

Exemplo:

```
INFLU_KEY
```

---

# Persistência

## Critério

Operações devem respeitar:

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

# Segurança

## Autenticação

Deve garantir:

- usuário identificado;
- sessão válida;
- acesso autorizado.

---

## Configurações

Informações sensíveis devem permanecer em:

```
Script Properties
```

Nunca em:

- código;
- documentação pública;
- commits.

---

# Critérios Operacionais

---

# Deploy

Uma versão somente é aceita quando:

- deployment criado;
- Web App acessível;
- configuração validada;
- fluxo principal testado.

---

# Configuração

Validar:

- Script Properties;
- OAuth;
- IDs Google;
- permissões.

---

# Recuperação

Deve existir:

- versão anterior conhecida;
- possibilidade de rollback;
- registro da publicação.

---

# Experiência do Usuário

## Portal

Deve garantir:

- carregamento correto;
- navegação funcional;
- mensagens claras;
- ausência de erros bloqueantes.

---

# Perfis de Aceitação

---

# Parceira

Validar:

- login;
- dashboard;
- perfil;
- briefing;
- entrega.

---

# Administrador

Validar:

- usuários;
- parceiras;
- pagamentos;
- processos mensais.

---

# Cenários Obrigatórios

## Cenário 01 — Login

Entrada:

```
Usuário autorizado
```

Esperado:

```
Sessão criada

↓

Portal liberado
```

---

## Cenário 02 — Consulta de Dados

Entrada:

```
Usuário autenticado
```

Esperado:

```
Dados carregados corretamente
```

---

## Cenário 03 — Alteração de Estado

Entrada:

```
Operação válida
```

Esperado:

```
Estado atualizado

↓

Histórico preservado
```

---

## Cenário 04 — Operação Inválida

Entrada:

```
Dados incorretos
```

Esperado:

```
Erro controlado

↓

Nenhuma alteração persistida
```

---

# Critérios de Qualidade

A entrega deve possuir:

- documentação atualizada;
- testes registrados;
- alterações rastreáveis;
- comportamento previsível.

---

# Critérios de Produção

Uma versão somente pode ser considerada pronta para produção quando:

- todos os critérios funcionais foram atendidos;
- validações técnicas foram executadas;
- deploy foi realizado corretamente;
- documentação está atualizada.

---

# Checklist Final de Aceitação

## Funcional

- [ ] Login funcionando
- [ ] Sessão funcionando
- [ ] Dashboard carregando
- [ ] Parceiras funcionando
- [ ] Briefings funcionando
- [ ] Entregas funcionando
- [ ] Financeiro funcionando
- [ ] Documentos funcionando

---

## Técnico

- [ ] Código revisado
- [ ] Testes executados
- [ ] Lint aprovado
- [ ] Arquitetura preservada
- [ ] Dependências documentadas

---

## Segurança

- [ ] OAuth validado
- [ ] Permissões revisadas
- [ ] Segredos protegidos
- [ ] Acessos indevidos bloqueados

---

## Dados

- [ ] Persistência validada
- [ ] Registros consistentes
- [ ] Competências corretas
- [ ] Sem duplicações críticas

---

## Deploy

- [ ] Deployment criado
- [ ] Web App acessível
- [ ] Fluxos principais testados
- [ ] Rollback possível

---

# Critérios de Rejeição

A versão deve ser rejeitada quando:

## Funcional

- fluxo principal quebrado;
- usuário não consegue completar operação;
- dados incorretos são apresentados.

---

## Técnico

- testes críticos falham;
- erro de runtime;
- alteração quebra arquitetura existente.

---

## Segurança

- credenciais expostas;
- autenticação comprometida;
- permissões incorretas.

---

# Aceite Final

Uma versão é considerada aceita quando:

```
Critérios funcionais atendidos

+

Critérios técnicos aprovados

+

Critérios de segurança validados

+

Deploy confirmado
```

---

# Registro de Aceitação

Cada versão aprovada deve registrar:

```
Versão

↓

Data

↓

Alterações realizadas

↓

Testes executados

↓

Responsável

↓

Resultado
```

---

# Governança Contínua

Após a aceitação:

- novos requisitos devem atualizar este documento;
- mudanças arquiteturais devem ser documentadas;
- critérios devem acompanhar a evolução do sistema.

---

# Status Final

Documento concluído como referência oficial dos critérios de aceitação do Projeto TEAR V2.

Resultado esperado:

```
Sistema validado

↓

Operação segura

↓

Entrega aprovada
```
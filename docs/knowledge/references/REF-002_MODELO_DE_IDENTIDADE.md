# REF-002 — Modelo de Identidade

> **Tipo:** Documento de Referência (REF)
>
> **Status:** Ativo
>
> **Versão:** 1.0
>
> **Última atualização:** Julho/2026

---

# Objetivo

Este documento reúne os princípios utilizados por arquiteturas modernas para modelagem de identidade digital (Identity Management).

Seu objetivo é servir como referência arquitetural para decisões relacionadas à representação, vinculação e gerenciamento de identidades em sistemas distribuídos.

Este documento **não define a arquitetura do TEAR**.

Ele documenta apenas os conceitos e padrões utilizados pela indústria como base para decisões arquiteturais.

---

# Escopo

Este documento cobre:

- Identidade Digital
- Identity Management (IAM)
- Identity Provider (IdP)
- Service Provider (SP)
- Identidade Externa
- Identidade Interna
- Identity Mapping
- Account Linking
- Chaves permanentes
- Modelagem de identidade
- Boas práticas
- Anti-patterns

---

# Não faz parte deste documento

Este documento não aborda:

- autenticação Google
- OAuth
- OpenID Connect
- implementação do TEAR
- regras de negócio
- onboarding
- autorização
- sessão
- Apps Script
- banco de dados específico

Esses assuntos são tratados em outros REF, ADRs e SPECs.

---

# Relação com outros documentos

| Documento | Finalidade |
|------------|------------|
| REF | Explica padrões e referências externas |
| ADR | Registra decisões arquiteturais do TEAR |
| SPEC | Define comportamento funcional do sistema |

Caso exista qualquer divergência entre este documento e um ADR aprovado, o **ADR prevalece**.

---

# Visão Geral

```
Pessoa

        │

        ▼

Identity Provider

        │

        ▼

Identidade Externa

        │

        ▼

Identity Mapping

        │

        ▼

Identidade Interna

        │

        ▼

Perfis

        │

        ▼

Permissões

        │

        ▼

Sessão

        │

        ▼

Aplicação
```

---

# Modelo Canônico de Identidade

Arquiteturas modernas costumam seguir uma separação clara entre identidade e regras de negócio.

```
Identity Provider

↓

External Identity

↓

Identity Mapping

↓

Internal Identity

↓

Roles

↓

Permissions

↓

Session

↓

Application
```

Essa separação reduz acoplamento, facilita substituição de provedores de login e melhora a segurança da aplicação.

---

# PARTE I — Fundamentos

## 1. O que é Identidade Digital

Identidade Digital é a representação eletrônica de uma entidade.

Essa entidade pode ser:

- uma pessoa;
- uma organização;
- um dispositivo;
- um serviço.

Uma identidade é composta por um identificador permanente e um conjunto de atributos associados.

A identidade deve ser tratada como um domínio próprio dentro da arquitetura.

Ela não deve ser confundida com registros de usuários ou regras de negócio.

---

## 2. Identidade × Autenticação × Autorização × Sessão

São quatro conceitos distintos.

### Identidade

Define quem é a entidade.

---

### Autenticação (Authentication)

É o processo de comprovar a identidade.

---

### Autorização (Authorization)

Define o que aquela identidade pode fazer.

---

### Sessão

Representa o estado temporário criado após uma autenticação bem-sucedida.

---

Essas quatro responsabilidades devem permanecer desacopladas.

---

## O que NÃO é Identidade

Os itens abaixo não representam identidade:

- nome
- e-mail
- telefone
- cargo
- função
- perfil
- permissões
- departamento

Todos esses elementos podem mudar ao longo da vida do usuário.

A identidade deve permanecer estável.

---

# PARTE II — Provedores

## 3. Identity Provider (IdP)

O Identity Provider é responsável por autenticar usuários.

Exemplos:

- Google
- Microsoft Entra
- Okta
- Auth0
- Apple

O IdP valida credenciais e emite tokens de identidade.

A aplicação não deve implementar autenticação própria quando um IdP confiável estiver disponível.

---

## 4. Service Provider (SP)

O Service Provider (ou Relying Party) é a aplicação que consome a identidade emitida pelo IdP.

Suas responsabilidades são:

- validar o token recebido;
- identificar o usuário;
- localizar sua identidade interna;
- criar uma sessão.

O SP nunca deve conhecer senhas do usuário.

---

# PARTE III — Modelagem

## 5. Identidade Externa × Identidade Interna

Arquiteturas modernas distinguem dois conceitos.

### Identidade Externa

Representa a identidade fornecida pelo provedor.

Exemplos:

- Google
- Microsoft
- Apple

---

### Identidade Interna

Representa o usuário dentro da aplicação.

Ela contém:

- preferências;
- histórico;
- estado;
- regras de negócio;
- relacionamentos.

A aplicação deve depender exclusivamente da Identidade Interna.

---

## 6. Identity Mapping

O Identity Mapping é a camada responsável por conectar:

```
Identidade Externa

↓

Identidade Interna
```

Essa camada elimina o acoplamento entre o provedor de login e o domínio da aplicação.

---

## 7. Chaves Permanentes

Toda arquitetura moderna deve utilizar identificadores permanentes.

Exemplos:

- UUID
- ULID
- Google SUB

Esses identificadores:

- nunca mudam;
- nunca são reciclados;
- são utilizados em relacionamentos.

---

## Atributos Mutáveis

São informações que podem mudar.

Exemplos:

- nome
- e-mail
- telefone
- cargo
- endereço

Eles nunca devem ser utilizados como chave de identidade.

---

## 8. Por que o e-mail não é identidade

O e-mail é apenas um atributo.

Ele pode:

- mudar;
- ser removido;
- ser reutilizado;
- ser renomeado.

Por isso:

**Email não é identidade.**

Email é apenas informação de contato.

---

## 9. Modelagem recomendada

Arquiteturas modernas costumam separar:

```
Users

↓

Identities

↓

Providers
```

A entidade principal representa o usuário.

As identidades representam os métodos de autenticação.

Essa separação permite adicionar novos provedores sem alterar o domínio da aplicação.

---

## 10. Múltiplas identidades

Uma mesma pessoa pode possuir diversas identidades externas.

Exemplo:

```
Google

↓

Mesmo usuário

↑

Microsoft

↑

Apple
```

Todas elas podem apontar para a mesma Identidade Interna.

Esse conceito é conhecido como **Account Linking**.

---

## 11. Vinculação de provedores

A aplicação deve tratar todos os provedores de maneira uniforme.

Independentemente do provedor utilizado, a camada de entrada deve converter as informações recebidas para um modelo interno padronizado.

A lógica de negócio nunca deve depender do provedor utilizado.

---

# PARTE IV — Boas Práticas

## 12. Sistemas Corporativos

Arquiteturas corporativas costumam adotar:

- Single Sign-On (SSO)
- Multi-Factor Authentication (MFA)
- Just-In-Time Provisioning (JIT)
- SCIM
- Identity Federation
- Zero Trust

O objetivo é centralizar a identidade e reduzir inconsistências.

---

# NÃO FAÇA

Nunca:

- utilizar e-mail como chave primária;
- misturar identidade com perfil;
- misturar autenticação com autorização;
- confiar apenas no frontend;
- armazenar senhas localmente quando houver IdP;
- criar relacionamentos utilizando atributos mutáveis;
- criar sessões permanentes.

---

# PARTE V — Anti-patterns

Os erros mais comuns são:

- usar e-mail como identificador;
- utilizar CPF como chave primária;
- misturar identidade com regras de negócio;
- acoplar toda a aplicação ao Google;
- depender de atributos mutáveis;
- validar identidade apenas no navegador;
- espalhar lógica específica de provedores pela aplicação.

---

# Tabela Resumo

| Conceito | Responsável |
|-----------|-------------|
| Identidade | Identity Provider |
| Autenticação | Identity Provider |
| Identidade Interna | Aplicação |
| Perfis | Aplicação |
| Permissões | Aplicação |
| Sessão | Aplicação |

---

# Conclusões arquiteturais

A literatura atual conduz às seguintes conclusões:

1. Identidade é diferente de autenticação.

2. Autenticação é diferente de autorização.

3. Sessão não é identidade.

4. Toda identidade externa deve ser convertida para uma identidade interna.

5. A aplicação deve depender exclusivamente da identidade interna.

6. Toda identidade deve utilizar identificadores permanentes.

7. O e-mail não deve ser utilizado como identificador.

8. A autorização deve permanecer desacoplada do provedor de login.

9. O domínio da aplicação nunca deve depender diretamente do IdP.

10. A arquitetura deve permitir múltiplos provedores de identidade sem alterações no modelo de domínio.

---

# Glossário

| Termo | Significado |
|--------|-------------|
| IAM | Identity and Access Management |
| IdP | Identity Provider |
| SP | Service Provider |
| RP | Relying Party |
| Identity Mapping | Camada que relaciona identidade externa e interna |
| Account Linking | Vinculação de múltiplas identidades ao mesmo usuário |
| Identity Federation | Compartilhamento de identidade entre domínios |
| SCIM | Provisionamento automático de identidades |
| SSO | Single Sign-On |
| MFA | Multi-Factor Authentication |

---

# Referências Oficiais

## NIST

- NIST SP 800-63 — Digital Identity Guidelines
- NIST SP 800-207 — Zero Trust Architecture

## OpenID Foundation

- OpenID Connect Core 1.0

## OWASP

- Authentication Cheat Sheet
- Authorization Cheat Sheet

## Microsoft

- Microsoft Entra Identity Documentation

## Okta

- Identity Architecture
- User Identity Model

## Auth0

- Normalized User Profile
- Account Linking
- User Identity Model

---

**Fim do documento.**
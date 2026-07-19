# REF-001 — Google Identity & OAuth

> **Tipo:** Documento de Referência (REF)
>
> **Status:** Ativo
>
> **Versão:** 1.0
>
> **Última atualização:** Julho/2026

---

# Objetivo

Este documento reúne as boas práticas oficiais do Google para autenticação utilizando **Google Identity Services (GIS)**, **OAuth 2.0** e **OpenID Connect (OIDC)**.

Seu propósito é servir como referência técnica para decisões arquiteturais relacionadas à autenticação, identidade e validação de usuários.

Este documento **não define a arquitetura do TEAR**.

Ele documenta apenas as recomendações oficiais utilizadas como fundamento para as decisões arquiteturais do projeto.

---

# Escopo

Este documento cobre:

- Google Identity Services
- OAuth 2.0
- OpenID Connect
- Authorization Code Flow
- ID Token
- Claims
- Validação de tokens
- Boas práticas de segurança
- Erros comuns

---

# Não faz parte deste documento

Este documento não aborda:

- arquitetura interna do TEAR
- regras de negócio
- fluxo de onboarding
- modelo de autorização
- gestão de sessões
- implementação em Apps Script
- implementação em JavaScript

Esses assuntos são tratados em ADRs e SPECs específicos.

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
Usuário

      │

      ▼

Google Identity Services

      │

      ▼

Google OAuth

      │

      ▼

ID Token

      │

      ▼

Backend

      │

      ▼

Validação

      │

      ▼

SUB

      │

      ▼

Sistema
```

---

# PARTE I — Fundamentos

## 1. Google Identity Services (GIS)

### Conceito

Google Identity Services é a plataforma oficial do Google para autenticação de usuários.

Ela substitui a antiga biblioteca Google Sign-In e centraliza todos os mecanismos modernos de login.

Exemplos:

- Sign in with Google
- One Tap
- Credential Manager

### Recomendação oficial

Aplicações novas devem utilizar exclusivamente Google Identity Services.

Bibliotecas legadas como `gapi.auth2` não devem ser utilizadas em novos projetos.

### Importância arquitetural

O GIS deve ser considerado apenas a camada responsável por obter a identidade do usuário.

Toda decisão de autenticação pertence ao backend.

---

## 2. OAuth 2.0 × OpenID Connect

### OAuth 2.0

Resolve o problema de autorização.

Seu objetivo é permitir acesso controlado a recursos protegidos.

Produz:

- Access Token

---

### OpenID Connect

Resolve o problema de autenticação.

Seu objetivo é informar quem é o usuário autenticado.

Produz:

- ID Token

---

### Boas práticas

Utilize:

- ID Token → autenticação
- Access Token → acesso a APIs

Nunca utilize Access Tokens como prova de identidade.

---

## 3. Authorization Code Flow

O Authorization Code Flow é o fluxo recomendado para aplicações que possuem backend.

Fluxo simplificado:

```
Usuário

↓

Google Login

↓

Authorization Code

↓

Backend

↓

Google

↓

ID Token

↓

Validação

↓

Sessão
```

O frontend nunca recebe nem manipula credenciais sensíveis.

Sempre que possível, utilize PKCE juntamente com o Authorization Code Flow.

---

# PARTE II — Identidade

## 4. ID Token

O ID Token é um JWT assinado pelo Google.

Sua função é comprovar a identidade do usuário autenticado.

Ele contém informações conhecidas como **claims**.

Um ID Token não representa uma sessão permanente.

Ele representa apenas um evento de autenticação.

Após validado, o sistema deve criar sua própria sessão.

---

## 5. Principais Claims

### sub

Identificador permanente do usuário.

É único.

É imutável.

Nunca é reciclado.

É a chave oficial de identidade.

---

### aud

Client ID para o qual o token foi emitido.

Deve corresponder exatamente ao Client ID da aplicação.

---

### iss

Emissor do token.

Deve corresponder ao Google.

---

### exp

Data de expiração.

Tokens expirados devem ser rejeitados.

---

### iat

Momento da emissão.

---

### email

Endereço de e-mail.

É um atributo de contato.

Não é um identificador permanente.

---

### email_verified

Indica se o endereço de e-mail foi verificado pelo Google.

---

## 6. Por que utilizar o SUB

O Google recomenda utilizar exclusivamente o claim **sub** como identificador permanente.

Motivos:

- nunca muda
- nunca é reciclado
- identifica unicamente uma conta Google
- permanece válido mesmo após alteração de e-mail

O relacionamento entre identidade externa e identidade interna deve ocorrer através do SUB.

---

## 7. Por que NÃO utilizar o e-mail

O e-mail pode:

- mudar
- deixar de existir
- ser reutilizado
- ser renomeado
- ser substituído em organizações

Por isso:

**Email não é identidade.**

Email é apenas informação de contato.

---

# PARTE III — Validação

## 8. Como validar um ID Token

Antes de confiar em qualquer informação presente no token, o backend deve validar:

- assinatura criptográfica
- issuer (`iss`)
- audience (`aud`)
- expiração (`exp`)

Somente após essas verificações os claims podem ser considerados confiáveis.

A validação deve utilizar as bibliotecas oficiais do Google.

Implementações criptográficas próprias não são recomendadas.

---

# PARTE IV — Segurança

## 9. Boas práticas

Sempre:

- utilizar Authorization Code Flow
- utilizar PKCE
- validar ID Token no backend
- validar `aud`
- validar `iss`
- validar `exp`
- utilizar `sub` como identificador
- proteger Client Secret
- utilizar Redirect URIs restritas
- utilizar `state`
- utilizar `nonce`

---

# NÃO FAÇA

Nunca:

- utilizar email como chave primária
- autenticar usando Access Token
- confiar apenas na validação do frontend
- armazenar Client Secret no navegador
- implementar validação criptográfica manual
- ignorar `aud`
- ignorar `iss`
- ignorar expiração do token

---

# PARTE V — Anti-patterns

Os erros mais comuns em implementações OAuth/OIDC são:

- utilizar email como identidade
- aceitar qualquer ID Token
- não validar assinatura
- criar sessão apenas no frontend
- confiar em informações enviadas pelo navegador
- expor credenciais
- utilizar bibliotecas legadas

---

# Conclusões arquiteturais

A documentação oficial do Google conduz às seguintes conclusões:

1. A autenticação deve utilizar OpenID Connect.

2. O Authorization Code Flow é o fluxo recomendado.

3. O backend é responsável por validar a identidade.

4. O `sub` deve ser a chave permanente da identidade.

5. O e-mail não deve ser utilizado como identificador.

6. O sistema deve criar sua própria sessão após validar o ID Token.

7. Autenticação e autorização são responsabilidades distintas e devem permanecer desacopladas.

---

# Glossário

| Termo | Significado |
|--------|-------------|
| GIS | Google Identity Services |
| OAuth | Framework de autorização |
| OIDC | Camada de autenticação sobre OAuth |
| JWT | JSON Web Token |
| ID Token | Token de identidade |
| Access Token | Token de autorização |
| Claim | Informação presente no ID Token |
| SUB | Identificador permanente do usuário |

---

# Referências Oficiais

## Google

- Google Identity Services
- Authenticate with a Backend Server
- Verify Google ID Tokens
- OAuth 2.0 for Web Server Applications
- Sign In With Google - Best Practices

## RFCs

- RFC 6749 — OAuth 2.0
- RFC 7636 — PKCE
- OpenID Connect Core 1.0
- RFC 7519 — JSON Web Token

---

**Fim do documento.**
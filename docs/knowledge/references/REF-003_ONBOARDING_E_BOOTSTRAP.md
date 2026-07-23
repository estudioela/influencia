# REF-003 — Onboarding e Bootstrap

> **Tipo:** Documento de Referência (REF)
>
> **Status:** Ativo
>
> **Versão:** 1.0
>
> **Última atualização:** Julho/2026

---

# Objetivo

Este documento reúne os princípios utilizados por arquiteturas modernas para modelagem do ciclo inicial de vida de uma identidade digital.

Seu objetivo é servir como referência arquitetural para decisões relacionadas ao primeiro acesso, provisionamento de usuários, onboarding, bootstrap e ativação de contas.

Este documento **não define a arquitetura do TEAR**.

Ele documenta apenas os conceitos e padrões utilizados pela indústria como base para decisões arquiteturais.

---

# Escopo

Este documento cobre:

- Onboarding
- Identity Lifecycle
- Provisionamento
- Just-In-Time Provisioning (JIT)
- Pre-Provisioning
- Bootstrap
- Bootstrap do primeiro administrador
- Invitation Flow
- Estados da identidade
- Recuperação de onboarding
- Ativação de contas
- Boas práticas
- Anti-patterns

---

# Não faz parte deste documento

Este documento não aborda:

- autenticação Google
- OAuth
- OpenID Connect
- autorização
- sessão
- implementação do TEAR
- regras de negócio
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

```text
Primeiro Login

↓

Autenticação

↓

Identidade Validada

↓

Existe Identidade Interna?

↓

SIM ---------------- NÃO

│                     │

▼                     ▼

Sessão          Provisionamento

                     │

                     ▼

Onboarding

                     │

                     ▼

Conta Ativa

                     │

                     ▼

Sessão Operacional
```

---

# Modelo Canônico

Arquiteturas modernas normalmente seguem o fluxo abaixo:

```text
Identity Provider

↓

Authentication

↓

Identity Mapping

↓

Provisioning

↓

Internal Identity

↓

Onboarding

↓

Activation

↓

Operational Session
```

Essa separação reduz acoplamento, melhora a segurança e permite diferentes estratégias de provisionamento sem alterar o domínio da aplicação.

---

# PARTE I — Fundamentos

## 1. O que é Onboarding

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 2. Identity Lifecycle

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## O que NÃO é Onboarding

Onboarding não é:

- autenticação;
- cadastro;
- provisionamento;
- bootstrap;
- autorização.

Onboarding representa apenas a jornada inicial após a identidade já ter sido validada.

---

# PARTE II — Provisionamento

## 3. Provisionamento de usuários

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 4. Just-In-Time Provisioning (JIT)

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 5. Pre-Provisioning

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 6. Quando criar uma identidade interna

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 7. Vinculação entre identidade autenticada e conta interna

*(Conteúdo baseado na pesquisa do Gemini.)*

---

# PARTE III — Bootstrap

## 8. Bootstrap de sistemas

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 9. Bootstrap do primeiro administrador

*(Conteúdo baseado na pesquisa do Gemini.)*

---

# PARTE IV — Fluxo Inicial

## 10. Primeiro login versus criação de conta

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 11. Fluxo recomendado para primeiro acesso

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 12. Convites (Invitation Flow)

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 13. Recuperação de onboarding interrompido

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 14. Aprovação manual versus criação automática

*(Conteúdo baseado na pesquisa do Gemini.)*

---

## 15. Estados possíveis da identidade

*(Conteúdo baseado na pesquisa do Gemini.)*

---

# PARTE V — Boas Práticas

## 16. Sistemas Corporativos

*(Conteúdo baseado na pesquisa do Gemini.)*

---

# NÃO FAÇA

Nunca:

- criar usuários automaticamente sem regras claras;
- utilizar credenciais bootstrap fixas;
- confiar no frontend para concluir onboarding;
- misturar onboarding com autenticação;
- utilizar estados implícitos;
- ignorar recuperação de onboarding interrompido;
- permitir acesso operacional antes da ativação da conta.

---

# PARTE VI — Anti-patterns

*(Conteúdo baseado na pesquisa do Gemini.)*

---

# Tabela Resumo

| Etapa | Responsável |
|---------|-------------|
| Authentication | Identity Provider |
| Identity Validation | Backend |
| Provisioning | Aplicação |
| Onboarding | Aplicação |
| Activation | Aplicação |
| Session | Aplicação |

---

# Conclusões arquiteturais

A literatura atual conduz às seguintes conclusões:

1. Autenticação não cria usuários.

2. Identidade validada não implica conta criada.

3. Provisionamento é responsabilidade da aplicação.

4. Onboarding deve ser tratado como uma máquina de estados.

5. Bootstrap deve ser automatizado e idempotente.

6. O primeiro administrador nunca deve utilizar credenciais fixas.

7. O ciclo de vida da identidade continua após o onboarding.

8. Toda conta deve possuir um estado explícito.

9. Sessões devem refletir o estado atual da identidade.

10. O backend deve controlar todo o fluxo de onboarding.

---

# Glossário

*(Conteúdo baseado na pesquisa do Gemini.)*

---

# Referências Oficiais

- NIST SP 800-63
- NIST SP 800-207
- RFC 7643 (SCIM)
- RFC 7644 (SCIM)
- OpenID Foundation
- OWASP Authentication Cheat Sheet
- Microsoft Entra Documentation
- Okta Identity Lifecycle Management
- Auth0 User Onboarding
- Auth0 JIT Provisioning

---

**Fim do documento.**
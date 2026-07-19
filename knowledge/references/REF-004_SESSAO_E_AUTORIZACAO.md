Esta é uma pesquisa técnica profunda e exaustiva sobre **Session Management** e **Authorization** em arquiteturas modernas. O material foi fundamentado em especificações oficiais (IETF RFCs, OpenID Foundation, OAuth Working Group) e recomendações de segurança e arquitetura consolidadas (NIST, OWASP, AWS, Azure, Google e Auth0/Okta).

---

# PARTE I: Gerenciamento de Estado e Identidade Contínua

### 1. Session Management

* **Conceitos e Definições:** O gerenciamento de sessão é o processo arquitetural de rastrear de forma segura as interações de um usuário (ou serviço) autenticado através de múltiplas requisições HTTP (que é um protocolo inerentemente *stateless*). Consiste no ciclo de vida de estabelecimento, manutenção e destruição do estado autenticado.
* **Recomendações:** Deve ser delegado a bibliotecas e frameworks maduros. A OWASP recomenda que os mecanismos de gerenciamento de sessão protejam a confidencialidade e a integridade da troca de mensagens, prevenindo interceptação e manipulação.
* **Boas Práticas:** Impor autenticação multifator (MFA) no estabelecimento da sessão; usar canais criptografados (TLS 1.2+); destruir a sessão de forma segura tanto no cliente quanto no servidor durante o *logout*.
* **Riscos:** Implementação criptográfica caseira ("Roll your own crypto"), falha na proteção de dados em trânsito e ausência de limites temporais adequados.
* **Referências:** OWASP Session Management Cheat Sheet; NIST SP 800-63B (Authentication and Lifecycle Management).

### 2. Stateful Sessions

* **Conceitos e Definições:** Arquitetura onde o estado e os metadados da sessão (privilégios, tempo de expiração, identificador do usuário) são armazenados e mantidos inteiramente no lado do servidor (Server-Side). O cliente recebe apenas um identificador opaco (Session ID).
* **Vantagens:** Revogação instantânea (basta apagar o registro no banco/cache); controle absoluto sobre os dados da sessão; o cliente não tem visibilidade do *payload*.
* **Desvantagens:** Consumo de memória no servidor; complexidade de escalabilidade horizontal (exige *Sticky Sessions* ou armazenamento distribuído compartilhado).
* **Exemplo Arquitetural:** O servidor autentica o usuário, cria um registro no Redis (Key: `session_id`, Value: `user_data`), e envia o `session_id` via *Cookie*. Toda requisição consulta o Redis.
* **Referências:** OWASP Web Application Security Testing Guide.

### 3. Stateless Sessions

* **Conceitos e Definições:** Arquitetura onde o estado e as permissões do usuário são empacotados, assinados criptograficamente pelo servidor, e armazenados no lado do cliente (Client-Side). O servidor não guarda estado em memória; ele apenas verifica a assinatura a cada requisição. O padrão *de facto* é o JSON Web Token (JWT).
* **Vantagens:** Escalabilidade horizontal extrema (qualquer nó pode validar o token); ausência de latência de banco de dados para validação de sessão; ideal para arquiteturas de Microserviços.
* **Desvantagens:** Revogação complexa e custosa (uma vez emitido, o token é válido até expirar); aumento no tamanho do *payload* trafegado em todas as requisições HTTP.
* **Anti-patterns:** Armazenar dados sensíveis (PII) no corpo do token *stateless*, pois ele é codificado em Base64 e não criptografado (salvo uso de JWE).

**Tabela Comparativa: Stateful vs Stateless**

| Característica | Stateful (Server-Side) | Stateless (Client-Side / Token) |
| --- | --- | --- |
| **Fonte da Verdade** | Banco de dados ou Cache (Redis) | Criptografia (Assinatura do Token) |
| **Escalabilidade** | Requer infraestrutura distribuída | Nativa (qualquer servidor valida) |
| **Revogação** | Imediata (Exclusão no DB) | Diferida (Até a expiração) ou *Blocklist* |
| **Tamanho da Mensagem** | Pequeno (Apenas ID Opaco) | Grande (Header + Payload + Assinatura) |

### 4. Session IDs

* **Conceitos e Definições:** Uma string ou token emitido pelo provedor que atua como chave para os dados de estado.
* **Recomendações:** A OWASP exige que o Session ID deve ter no mínimo 128 bits de entropia e ser gerado por um CSPRNG (Cryptographically Secure Pseudo-Random Number Generator).
* **Boas Práticas:** Os identificadores devem ser puramente aleatórios (opacos). O ID da sessão nunca deve conter informações que permitam deduzir a identidade do usuário (ex: evitar MD5 de "email + timestamp").
* **Riscos:** Entropia baixa permitindo ataques de força bruta (*Brute-force*) ou previsão sequencial.

### 5. Cookies

* **Conceitos e Definições:** Mecanismo do protocolo HTTP que permite que servidores enviem dados ao navegador, que os armazenará e os enviará de volta em requisições subsequentes ao mesmo domínio.
* **Boas Práticas e Recomendações de Segurança:** Para armazenar Session IDs ou Tokens, os Cookies devem impreterivelmente utilizar as *flags*:
* `HttpOnly`: Impede acesso via JavaScript (mitiga XSS).
* `Secure`: Impede transmissão por canais não-HTTPS (mitiga MITM).
* `SameSite (Lax ou Strict)`: Impede o envio do cookie em requisições de origem cruzada (mitiga CSRF).
* `__Host-` Prefix: Trava o cookie ao subdomínio exato e exige a flag `Secure`.


* **Referências:** IETF RFC 6265bis (Cookies and Cookie Security).

---

# PARTE II: Ecossistema de Tokens (OAuth & OIDC)

### 6. JWT (JSON Web Token)

* **Conceitos e Definições:** Padrão aberto da IETF (RFC 7519) que define um método compacto e autocontido para representar e transmitir declarações (*claims*) de forma segura entre duas partes.
* **Estrutura:** Composto por três partes em Base64Url: `Header.Payload.Signature`.
* **Recomendações:** Utilizar algoritmos de assinatura assimétricos (ex: RS256, ES256) onde o IdP assina com a chave privada e o SP verifica com a chave pública distribuída via endpoint JWKS (*JSON Web Key Set*).
* **Anti-patterns:** Aceitar tokens com o cabeçalho `alg: "none"`; confiar em *claims* não validadas criptograficamente; usar algoritmos simétricos (HS256) em sistemas distribuídos de fronteira de confiança mista.

### 7. Access Token

* **Conceitos e Definições:** Credencial utilizada no framework OAuth 2.0 (RFC 6749) para acessar recursos protegidos em nome do dono do recurso (Resource Owner). Geralmente é um *Bearer Token* (RFC 6750) — "quem o porta, possui o direito".
* **Boas Práticas:** Devem ter um tempo de vida muito curto (Short-Lived), variando de 5 a 60 minutos. A validação deve verificar obrigatoriamente as *claims* `iss` (Emissor), `aud` (Audiência) e `exp` (Expiração).
* **Riscos:** Vazamento do Access Token. Sendo um *Bearer Token*, se for interceptado, o atacante pode acessar os recursos.
* **Exemplo Arquitetural:** O *Frontend* injeta o Access Token no *Header* `Authorization: Bearer <token>` para o *API Gateway*. O Gateway valida o token no modelo estateless antes de rotear para o microsserviço.

### 8. Refresh Token

* **Conceitos e Definições:** Credencial de longa duração (Long-Lived) emitida pelo Servidor de Autorização (Authorization Server) ao cliente, usada para obter novos Access Tokens quando o atual expirar, sem exigir reautenticação interativa do usuário.
* **Recomendações:** Nunca devem ser enviados ou validados pelas APIs de recurso (Resource Servers). Devem trafegar apenas entre o Cliente e o Servidor de Autorização. O armazenamento no lado do cliente deve ser ultrasseguro (ex: *Secure HttpOnly Cookies* em web, *Keychain/Keystore* em mobile).
* **Vantagens:** Melhora a experiência de usuário (UX) enquanto mantém os Access Tokens com vida útil curta.

### 9. Session Rotation

* **Conceitos e Definições:** Processo de emitir novos identificadores de sessão ou tokens e invalidar os anteriores sistematicamente. No contexto de tokens, refere-se ao *Refresh Token Rotation* (RTR).
* **Boas Práticas:** Sempre que um Refresh Token é usado para solicitar um novo Access Token, o Authorization Server deve invalidar o Refresh Token original e emitir um novo.
* **Riscos Mitigados:** RTR é o mecanismo primário de defesa contra o roubo de Refresh Tokens. Se um atacante usar um Refresh Token roubado, a rotação acontecerá. Quando o usuário legítimo tentar usar o mesmo token original (já invalidado), o servidor detectará a reutilização (*Token Reuse Detection*), considerará a cadeia comprometida e revogará **toda** a família de tokens associada àquela sessão, expulsando o atacante.

### 10. Session Revocation

* **Conceitos e Definições:** Mecanismo arquitetural para encerrar ativamente uma sessão antes do fim da sua validade programada (ex: solicitação do usuário, ação administrativa, detecção de fraude).
* **Estratégias de Implementação:**
* *Stateful:* Simples exclusão do registro em banco.
* *Stateless (JWT):* Manutenção de uma lista de negação (*Blocklist/Denylist*) de tokens revogados em memória distribuída ou cache veloz, lida pelo API Gateway.
* *Continuous Access Evaluation (CAE):* Protocolo moderno proposto pela OpenID Foundation onde o IdP notifica ativamente as *Relying Parties* sobre eventos críticos (como revogação).


* **Referências:** IETF RFC 7009 (OAuth 2.0 Token Revocation), Shared Signals and Events (SSE).

---

# PARTE III: Ciclo de Vida e Vulnerabilidades de Sessão

### 11. Idle Timeout

* **Conceitos e Definições:** Período máximo contínuo que uma sessão pode permanecer válida sem atividade ou interação do usuário.
* **Recomendações:** O NIST recomenda que para aplicações com impacto moderado a alto (Fintechs, Healthcare), o *Idle Timeout* seja estabelecido entre 15 e 30 minutos.
* **Vantagens:** Reduz a janela de oportunidade para atacantes em cenários de abandono de dispositivo destravado por parte do usuário.

### 12. Absolute Timeout

* **Conceitos e Definições:** Período máximo absoluto de sobrevivência de uma sessão a partir de sua criação (login inicial), independentemente do nível de atividade contínua do usuário.
* **Recomendações:** A OWASP dita que todas as sessões devem ter um tempo de vida absoluto. Ao expirar, a sessão é destruída, forçando o usuário a reautenticar-se (podendo ser silenciado por fluxos biométricos).
* **Boas Práticas:** Equilibrar UX e risco. Aplicações de alta criticidade (Bancos): *Absolute Timeout* diário (12-24h). Aplicações de consumo (Redes Sociais): Mensal ou semestral, protegido por RTR.

### 13. Session Fixation

* **Conceitos e Definições:** Ataque onde o agente malicioso "fixa" o Session ID. O atacante força o navegador da vítima a usar um Session ID predeterminado (por exemplo, via injeção em URL) antes do login. Após a vítima fazer o login usando este ID, o atacante também ganha acesso.
* **Boas Práticas de Defesa:** O servidor deve obrigatoriamente forçar uma renovação do identificador da sessão (gerar um novo ID) sempre que ocorrer uma transição no nível de privilégio (especialmente da fase não-autenticada para autenticada).

### 14. Session Hijacking

* **Conceitos e Definições:** Sequestro de Sessão. O atacante rouba a credencial de sessão ativa de um usuário legítimo (via XSS, intercepção de rede ou malware de navegador) e a utiliza em seu próprio maquinário para forjar a identidade da vítima.
* **Riscos:** É uma das formas mais letais de Account Takeover (ATO), pois ignora defesas de MFA (uma vez que MFA ocorre *antes* da emissão da sessão).
* **Defesa em Profundidade:** Combinar *HttpOnly Cookies* (bloqueia XSS local), TLS (bloqueia interceptação na rede) e *Device Binding/Token Binding* (vincular o token criptograficamente à camada de transporte do cliente, RFC 8471).

### 15. CSRF (Cross-Site Request Forgery)

* **Conceitos e Definições:** Ataque que força um navegador autenticado a executar uma ação não intencional em uma aplicação web na qual o usuário está logado no momento. Baseia-se no fato de que navegadores enviavam cookies de forma irrestrita.
* **Estratégias de Mitigação:**
* *Modernas:* Utilização universal de cookies com a flag `SameSite=Lax` ou `Strict`, que impedem que o cookie da sessão seja anexado a requisições originadas de domínios atacantes.
* *Clássicas:* *Anti-CSRF Tokens* (Synchronizer Token Pattern) e validação de *Origin/Referer headers*.



---

# PARTE IV: Fundamentos de Authorization (AuthZ)

### 16. Authorization

* **Conceitos e Definições:** Autorização é o processo que determina se uma entidade autenticada (usuário, serviço ou dispositivo) possui as permissões necessárias para acessar um recurso específico ou executar uma ação específica.
* **Recomendações:** A Autorização deve ser tratada como uma política baseada em regras separada da lógica de Autenticação (AuthN). "AuthN diz *quem* você é; AuthZ diz *o que* você pode fazer".

### 17. RBAC (Role-Based Access Control)

* **Conceitos e Definições:** Controle de Acesso Baseado em Papéis. O acesso é concedido baseado no papel (role) atribuído ao usuário na organização. Permissões são conectadas a Papéis, e Papéis são atribuídos a Usuários.
* **Diagrama ASCII:**
```text
[Usuário] ---> (possui) ---> [Papel: "Gerente"] ---> (possui) ---> [Permissão: "Aprovar_Despesas"]

```


* **Vantagens:** Simplicidade de implementação; fácil compreensão lógica para os negócios; amplamente suportado.
* **Desvantagens:** "Role Explosion" (Explosão de Papéis). Se o contexto importa (ex: "Gerente pode aprovar despesa, mas apenas do seu próprio departamento"), o RBAC exige a criação de papéis infinitos (Gerente_TI, Gerente_RH), tornando-se insustentável.

### 18. ABAC (Attribute-Based Access Control)

* **Conceitos e Definições:** Controle de Acesso Baseado em Atributos. Avalia regras booleanas usando atributos do Sujeito (cargo, localização), do Objeto (nível de sigilo), da Ação (ler, deletar) e do Ambiente (hora do dia, risco da rede).
* **Vantagens:** Altamente dinâmico e contextual. Resolve o problema do RBAC. Pode expressar regras complexas (ex: "Permitir leitura de documento SE cargo_sujeito = gerente_projeto E departamento_sujeito = departamento_documento E hora > 08:00").
* **Desvantagens:** Complexidade arquitetural alta; impacto de performance durante a avaliação das políticas; governança de atributos complexa.
* **Referências:** NIST SP 800-162 (Guide to ABAC).

### 19. ReBAC (Relationship-Based Access Control)

* **Conceitos e Definições:** Controle de Acesso Baseado em Relacionamentos. Evolução baseada no artigo "Zanzibar" do Google. O acesso é determinado através da travessia de grafos de relacionamento de nós conectados.
* **Exemplo:** Usuário tem acesso ao Documento porque o Usuário "pertence" ao Grupo X, que "é dono" da Pasta Y, que "contém" o Documento.
* **Vantagens:** Performance extrema na avaliação global de hierarquias profundas; escalabilidade natural para sistemas colaborativos globais (como Google Drive ou GitHub).
* **Referências:** O documento de pesquisa do Google Zanzibar. Softwares inspirados: Auth0 FGA, SpiceDB.

---

# PARTE V: Granularidade e Expressão de Permissões

### 20. Scopes

* **Conceitos e Definições:** No contexto do OAuth 2.0, *Scopes* especificam o nível de acesso que o aplicativo cliente está solicitando em nome do dono do recurso.
* **Recomendações:** Um equívoco clássico é usar Scopes para determinar o que o usuário pode fazer (como se fosse um papel). Scopes representam **Delegação**. Eles limitam a capacidade do *Cliente*.
* **Anti-pattern:** Fazer a API autorizar `DELETE /user` baseando-se apenas se o token possui o scope `admin`. O scope não reflete os papéis internos do usuário, apenas reflete o que o token (cliente) foi autorizado a pedir.

### 21. Claims

* **Conceitos e Definições:** Pedaços de informações empacotados num JWT (OIDC). Um claim é uma afirmação que um emissor faz sobre um sujeito. Pode conter a identidade (`sub`), perfil (`email`) e papéis (`roles`).
* **Boas Práticas:** Manter os *claims* enxutos. Incluir apenas *claims* essenciais que o sistema de consumo precisará para suas verificações iniciais (como ID de Tenant ou papéis de nível de borda).

### 22. Permissions

* **Conceitos e Definições:** A unidade de autorização mais atômica e granular do sistema. Formada estruturalmente pelo formato `<Recurso>:<Ação>`.
* **Exemplos Arquiteturais:** `invoice:read`, `payment:execute`.
* **Boas Práticas:** Os microsserviços devem validar as *Permissions*, não os *Roles*. O código deve checar `if(user.hasPermission('invoice:read'))` e **nunca** `if(user.is('manager'))`. As permissões são permanentes na estrutura do código, os papéis são fluidos no banco de dados.

### 23. Roles

* **Conceitos e Definições:** Um agrupador estático e administrativo de *Permissions*. É utilizado exclusivamente para simplificar a concessão (provisionamento) de múltiplos direitos a um usuário de forma coesa por administradores.

**Tabela Comparativa: Scopes, Roles e Permissions**

| Elemento | Pertence ao | Objetivo | Avaliado por |
| --- | --- | --- | --- |
| **Scope** | Aplicativo (Cliente) | Delimita a extensão do acesso do Cliente via OAuth. | API Gateway / Resource Server |
| **Role** | Usuário | Agrupa logicamente permissões corporativas. | Motor de Identidade / IAM |
| **Permission** | Recurso (API) | Determina de forma atômica se uma ação é válida. | Microsserviços / Políticas locais |

---

# PARTE VI: Princípios Arquiteturais de Segurança

### 24. Least Privilege

* **Conceitos e Definições:** Princípio do Menor Privilégio. A arquitetura de segurança (NIST SP 800-53) exige que qualquer entidade (usuário, serviço ou sistema) receba apenas o nível exato e mínimo de privilégios de que necessita para realizar sua tarefa, pelo menor tempo possível.
* **Implementação:** Identidades *machine-to-machine* (M2M) na AWS usando IAM Roles restritas a ARNs específicos (não permitindo curingas globais `*`), ou JIT Provisioning (Elevação Temporária de Acesso) do Entra ID.

### 25. Defense in Depth

* **Conceitos e Definições:** Defesa em Profundidade. Estratégia militar e cibernética onde múltiplos mecanismos independentes de defesa são interpostos em camadas.
* **Exemplo Arquitetural IAM:**
1. Rede: Firewall restringe o acesso.
2. Borda (API Gateway): Valida a assinatura do JWT, o *Scope* (Delegado) e o Expiry.
3. Microsserviço: Confere a permissão exata no ABAC baseando-se no estado de negócio da entidade (`invoice.status == 'open'`).



### 26. Zero Trust

* **Conceitos e Definições:** Arquitetura de Confiança Zero. Define que a localização na rede não confere nenhuma confiança inerente (estar dentro da VPN corporativa não isenta o usuário ou o serviço de ser autenticado e autorizado de forma rigorosa em cada requisição). "Nunca confie, sempre verifique".
* **Boas Práticas:** Todas as comunicações internas devem ocorrer via mTLS (Mutual TLS); todas as APIs e microsserviços internos devem exigir e validar JWTs da mesma maneira que fariam com chamadas vindas da internet.
* **Referências:** NIST SP 800-207 (Zero Trust Architecture).

---

# PARTE VII: Soluções e Padrões Enterprise

### 27. Policy Engines

* **Conceitos e Definições:** Motores de Política. Ferramentas projetadas para desacoplar e abstrair as regras de autorização do código-fonte da aplicação, centralizando as decisões lógicas em um artefato auditável e de alta performance. O padrão ouro do mercado é o OPA (Open Policy Agent) com a linguagem Rego, ou o AWS Cedar.
* **Exemplo Arquitetural (Desacoplamento):**
```text
[Microsserviço de Faturamento] -> (Pergunta: Usuário 'Alice' pode 'Ler' Recurso 'Fatura_10'?) -> [Motor OPA (Sidecar)]
[Motor OPA] avalia o arquivo .rego -> responde (Booleano: TRUE) -> [Microsserviço] permite o fluxo.

```


* **Vantagens:** Mudanças de regras de negócio (ex: "apenas diretores podem aprovar acima de 10k") não exigem *deploy* de aplicação, apenas *update* das políticas.

### 28. Fine-Grained Authorization (FGA)

* **Conceitos e Definições:** Autorização de Granularidade Fina. É a capacidade de conceder acessos pontuais a instâncias individuais de recursos em vez de coleções inteiras (ex: Alice tem acesso de leitura à Fatura ID=745, mas não a todas as Faturas).
* **Recomendações:** Modelar FGA com as primitivas ReBAC em combinação com Policy Engines, suportando checagens rápidas de relacionamento no nível da entidade de dados (Row-Level Security / RLS em bancos de dados relacionais atrelado a tokens de acesso).

### 29. Enterprise Authorization

* **Conceitos e Definições:** Estruturação arquitetural para empresas de grande porte que precisam suportar múltiplos locatários (Multitenancy), Identidade Federada (SAML 2.0 / OIDC Federation) e governança em conformidade de ciclo de vida de acesso.
* **Boas Práticas:** Utilizar SCIM (System for Cross-domain Identity Management - RFC 7643/7644) para orquestrar o provisionamento, atualização de grupos e desprovisionamento (revogação instantânea) de identidades, mantendo o diretório local de dados em sincronia com provedores externos (ex: Entra, Okta).

---

# PARTE VIII: Padrões Corrompidos

### 30. Anti-patterns em Identity & Access Management

* **Frontend Enforcer:** Realizar controles de autorização baseando-se unicamente em checagens no lado do cliente (JavaScript, React, Angular). Ocultar um botão de "Deletar" na UI é essencial para UX, mas **não é** segurança. O Backend sempre deve aplicar a política independentemente do estado do cliente.
* **Confused Deputy Problem:** Problema de privilégio cruzado onde o serviço A (legítimo e com alto privilégio) é instruído pelo usuário B (com baixo privilégio) a cometer uma ação maliciosa em um sistema C, pois o sistema C verifica apenas as credenciais do serviço A (falha em preservar a identidade original ou *On-Behalf-Of* flag).
* **Infinite / Long-Lived Sessions:** Configurar JWTs sem prazo de expiração para não precisar lidar com complexidade de Refresh Tokens, resultando em sessões irremovíveis que violam o controle arquitetural e os padrões normativos de segurança da IETF.
* **In-house Crypto & Roll-your-own JWTs:** Implementar parsing manual de cabeçalhos JWTs via algoritmos não provados de Express/Spring no lugar de usar middlewares oficiais mantidos pelas OpenID Foundations, frequentemente conduzindo a falhas lógicas (*Signature Stripping*).
* **AuthN and AuthZ Coupling:** Fundir a lógica que averigua a senha/MFA na mesma camada de domínio de negócio (Controllers) que decide o nível de autorização para o banco de dados. A AuthN deve ser externalizada ao Gateway ou IdP, provendo um objeto submetido de confiança total para as camadas inferiores manipularem estritamente a AuthZ.

# 2. Stateful Sessions

## Objetivo

As **Stateful Sessions** representam o modelo clássico de gerenciamento de sessões, no qual **todo o estado da sessão é mantido no servidor**.

O cliente conhece apenas um identificador opaco (Session ID), enquanto todas as informações relacionadas à autenticação, permissões e contexto permanecem armazenadas na infraestrutura da aplicação.

Esse modelo foi dominante durante décadas e continua sendo amplamente utilizado em aplicações corporativas, sistemas legados, ERPs, plataformas financeiras e aplicações monolíticas.

---

## Conceito

Em uma sessão stateful, o servidor cria um registro interno contendo todas as informações necessárias para identificar um usuário autenticado.

O navegador recebe apenas um identificador único da sessão.

Nas requisições seguintes, esse identificador é enviado novamente ao servidor, que recupera os dados armazenados e reconstrói o contexto do usuário.

```text
             Login

                │

                ▼

      Servidor autentica

                │

                ▼

    Cria registro da sessão

                │

                ▼

       Redis / Banco / Cache

                ▲

                │

      Session ID enviado

                │

                ▼

             Cliente
```

O cliente nunca possui conhecimento do conteúdo da sessão.

---

## Funcionamento

O fluxo normalmente ocorre da seguinte maneira:

1. O usuário realiza login.

2. O servidor autentica suas credenciais.

3. É criado um registro interno da sessão.

4. Um Session ID aleatório é gerado.

5. Esse Session ID é enviado ao navegador.

6. Em cada nova requisição o navegador devolve esse identificador.

7. O servidor procura a sessão correspondente.

8. Se encontrada e válida, o acesso é concedido.

---

## Estrutura Conceitual

Internamente, uma sessão stateful costuma armazenar informações como:

```text
Session

├── Session ID

├── User ID

├── Roles

├── Permissions

├── Data de criação

├── Último acesso

├── Tempo restante

├── Informações do dispositivo

└── Estado da autenticação
```

Esses dados permanecem exclusivamente no servidor.

---

## Onde a sessão costuma ser armazenada

A implementação varia conforme a arquitetura.

Os locais mais comuns são:

- Memória da aplicação
- Redis
- Memcached
- Banco de dados
- Cache distribuído

Hoje, Redis tornou-se praticamente o padrão para aplicações distribuídas devido à sua baixa latência.

---

## Vantagens

### Revogação imediata

Como o servidor controla toda a sessão, basta remover seu registro para invalidá-la instantaneamente.

```text
DELETE Session

↓

Sessão deixa de existir

↓

Próxima requisição é negada
```

---

### Controle total

Todo o contexto permanece sob controle da aplicação.

O cliente não consegue:

- visualizar permissões;
- alterar atributos;
- descobrir dados internos.

---

### Alteração dinâmica

Permissões podem ser modificadas durante a vida da sessão.

Por exemplo:

```text
Administrador remove permissão

↓

Servidor atualiza sessão

↓

Nova permissão passa a valer imediatamente
```

Não há necessidade de emitir novos tokens.

---

### Simplicidade conceitual

É um modelo extremamente intuitivo.

O servidor conhece o usuário.

O cliente apenas informa qual sessão deseja utilizar.

---

## Desvantagens

### Consumo de memória

Cada usuário autenticado ocupa espaço no servidor.

Em aplicações com milhões de usuários isso representa um custo significativo.

---

### Escalabilidade horizontal

Se existirem múltiplos servidores:

```text
Cliente

↓

Servidor A

↓

Sessão criada
```

Na próxima requisição pode ocorrer:

```text
Cliente

↓

Servidor B

↓

Sessão inexistente
```

Isso exige mecanismos adicionais.

---

### Sticky Sessions

Uma solução histórica consiste em manter o usuário sempre conectado ao mesmo servidor.

```text
Load Balancer

↓

Usuário A

↓

Servidor 3
```

Esse mecanismo reduz flexibilidade e dificulta balanceamento de carga.

---

### Cache distribuído

A solução moderna consiste em compartilhar as sessões.

```text
Servidor A

      │

      ▼

 Redis Cluster

      ▲

      │

Servidor B
```

Assim qualquer servidor pode recuperar a mesma sessão.

---

## Segurança

Como o cliente conhece apenas o Session ID, a segurança depende principalmente da proteção desse identificador.

Caso ele seja roubado, o invasor poderá assumir a sessão.

Por esse motivo são obrigatórios:

- HTTPS
- Cookies HttpOnly
- Cookies Secure
- SameSite
- Session Rotation
- Expiração adequada

---

## Casos de Uso

Stateful Sessions são particularmente indicadas para:

- sistemas internos;
- ERPs;
- aplicações monolíticas;
- plataformas administrativas;
- aplicações com forte necessidade de revogação imediata;
- sistemas financeiros.

---

## Quando evitar

Arquiteturas stateful tendem a ser menos adequadas quando:

- existem centenas de microsserviços;
- há necessidade de escalabilidade extrema;
- múltiplas regiões precisam validar sessões;
- aplicações serverless realizam processamento efêmero.

Nesses cenários, modelos stateless normalmente apresentam melhor desempenho operacional.

---

# 3. Stateless Sessions

## Objetivo

As **Stateless Sessions** eliminam a necessidade de armazenamento de estado no servidor.

Toda a informação necessária para validar uma sessão acompanha o próprio cliente por meio de um token assinado criptograficamente.

O servidor apenas verifica a assinatura do token antes de conceder acesso.

---

## Conceito

Enquanto no modelo stateful o servidor armazena a sessão, no modelo stateless a própria credencial contém o estado necessário para reconstruir o contexto autenticado.

Na prática, isso significa que o servidor não precisa consultar banco de dados ou cache para identificar o usuário.

Ele apenas valida o token.

```text
Cliente

↓

JWT

↓

Servidor

↓

Validação criptográfica

↓

Acesso
```

O formato mais utilizado atualmente é o **JSON Web Token (JWT)**.

---

## Funcionamento

O fluxo normalmente ocorre da seguinte maneira:

1. O usuário realiza login.

2. O Identity Provider autentica o usuário.

3. Um JWT é emitido.

4. O cliente armazena esse token.

5. Cada requisição envia o JWT.

6. O servidor verifica a assinatura.

7. Se válida, a requisição é processada.

---

## Estrutura Conceitual

Em vez de armazenar dados em banco, o estado acompanha o token.

```text
JWT

├── Header

├── Payload

│   ├── Subject

│   ├── Roles

│   ├── Claims

│   ├── Expiração

│   └── Emissor

└── Signature
```

A assinatura garante integridade.

Ela **não criptografa** o conteúdo.

---

## Fonte da Verdade

Em arquiteturas stateless, a fonte da verdade deixa de ser um banco de dados de sessões.

Ela passa a ser:

- assinatura criptográfica;
- chave pública do emissor;
- validade temporal.

---

## Vantagens

### Escalabilidade

Qualquer servidor consegue validar o token.

```text
Cliente

↓

JWT

↓

Servidor A

Servidor B

Servidor C

Servidor D
```

Nenhum deles precisa compartilhar sessões.

---

### Baixa latência

Não existe consulta a banco para recuperar a sessão.

A validação ocorre localmente.

---

### Ideal para microsserviços

Como todos conseguem validar o token de forma independente, esse modelo tornou-se praticamente padrão em arquiteturas distribuídas.

---

### Independência entre servidores

Servidores podem ser criados ou destruídos dinamicamente sem perda de sessões.

Essa característica favorece ambientes Kubernetes, Serverless e Cloud Native.

---

## Desvantagens

### Revogação

Uma vez emitido, um token permanece válido até sua expiração.

Isso torna a revogação significativamente mais complexa.

---

### Payload maior

Ao contrário de um Session ID simples, um JWT pode possuir centenas ou milhares de bytes.

Esse conteúdo acompanha todas as requisições.

---

### Dados públicos

Embora assinados, JWTs normalmente não são criptografados.

Seu conteúdo pode ser lido facilmente.

Por esse motivo:

**Nunca devem conter informações sensíveis.**

---

## Segurança

Boas práticas incluem:

- utilizar algoritmos assimétricos (RS256 ou ES256);
- validar emissor (`iss`);
- validar audiência (`aud`);
- validar expiração (`exp`);
- validar assinatura;
- rejeitar tokens expirados.

---

## Anti-patterns

Nunca:

- utilizar `alg: none`;
- armazenar senhas no JWT;
- armazenar informações pessoais sensíveis;
- confiar apenas no payload sem validar assinatura;
- emitir tokens sem prazo de expiração.

---

## Comparativo

| Característica | Stateful | Stateless |
|----------------|----------|-----------|
| Estado | Servidor | Cliente |
| Fonte da verdade | Banco/Redis | Assinatura criptográfica |
| Revogação | Imediata | Complexa |
| Escalabilidade | Média | Muito alta |
| Latência | Consulta servidor | Validação local |
| Complexidade | Menor | Maior |
| Ideal para | Monólitos e ERPs | APIs e Microsserviços |

---

## Conclusão

Os dois modelos coexistem no mercado e resolvem problemas distintos.

Stateful Sessions oferecem maior controle operacional e revogação imediata, sendo adequadas para aplicações centralizadas.

Stateless Sessions priorizam escalabilidade, elasticidade e distribuição, tornando-se a escolha predominante em arquiteturas modernas baseadas em APIs, microsserviços e computação em nuvem.

A escolha entre ambos deve considerar requisitos de segurança, infraestrutura, experiência do usuário e custos operacionais, e não apenas desempenho.

# 4. Session IDs

## Objetivo

O **Session ID** é o identificador utilizado para associar uma requisição HTTP ao contexto autenticado de uma sessão existente.

Sua função é servir como uma chave de referência entre o cliente e o estado mantido pelo servidor (em arquiteturas stateful) ou como identificador de uma sessão específica em mecanismos híbridos.

Embora aparentemente simples, o Session ID representa um dos ativos mais sensíveis de toda a arquitetura de autenticação, pois sua posse normalmente implica acesso à sessão correspondente.

---

## Conceito

Um Session ID é uma sequência de caracteres gerada de forma criptograficamente segura e utilizada para identificar unicamente uma sessão.

Ele **não deve conter nenhuma informação sobre o usuário**.

Em vez disso, funciona como uma chave opaca.

```text
Cliente

↓

Session ID

↓

Servidor

↓

Busca sessão correspondente

↓

Usuário autenticado
```

---

## Características

Um bom Session ID deve possuir:

- alta entropia;
- tamanho suficiente;
- imprevisibilidade;
- unicidade global;
- impossibilidade prática de adivinhação.

Segundo a OWASP, recomenda-se uma entropia mínima de **128 bits** produzida por um **Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)**.

---

## Session IDs Opacos

O identificador jamais deve conter dados do usuário.

Exemplos incorretos:

```text
daniel_20260718

cliente1456

MD5(email)

SHA1(nome+data)
```

Esses formatos tornam a sessão previsível ou permitem inferir informações sobre o usuário.

O formato recomendado é completamente aleatório.

```text
c29d5d7a8d1fe75af2d9d27d44b35c97
```

ou

```text
9fc9cb43-92df-4b45-a8c7-54e32a85cf7e
```

---

## Geração

A geração deve utilizar exclusivamente geradores criptográficos.

Exemplos:

- `/dev/urandom`
- `crypto.randomUUID()`
- `SecureRandom`
- `System.Security.Cryptography`
- bibliotecas oficiais da plataforma

Nunca utilizar:

- `Math.random()`
- contadores
- timestamps
- números sequenciais

---

## Armazenamento

Normalmente o Session ID é armazenado em:

- Cookies HttpOnly
- Cookies Secure

Evita-se armazenamento em:

- LocalStorage
- SessionStorage
- parâmetros da URL

---

## Ciclo de Vida

```text
Login

↓

Novo Session ID

↓

Uso contínuo

↓

Rotação (quando necessário)

↓

Expiração

↓

Destruição
```

Sempre que houver mudança significativa de privilégio, recomenda-se gerar um novo identificador.

---

## Ataques Relacionados

A proteção do Session ID é essencial para evitar:

- Session Hijacking
- Session Fixation
- Replay Attacks
- Brute Force
- Session Prediction

---

## Boas Práticas

- utilizar IDs totalmente aleatórios;
- nunca reutilizar identificadores antigos;
- utilizar HTTPS obrigatório;
- renovar após autenticação;
- destruir durante logout;
- limitar tempo de vida.

---

# 5. Cookies

## Objetivo

Cookies são o mecanismo padrão do protocolo HTTP para armazenar pequenas quantidades de informação no navegador e reenviá-las automaticamente em requisições futuras.

Em sistemas modernos, constituem o principal mecanismo de transporte de Session IDs e, em muitos casos, também de Tokens de autenticação.

---

## Conceito

O servidor envia um cabeçalho HTTP:

```http
Set-Cookie:
```

O navegador armazena esse valor.

Em todas as próximas requisições ao mesmo domínio:

```http
Cookie:
```

é enviado automaticamente.

Essa característica permite manter uma sessão contínua entre cliente e servidor.

---

## Fluxo Simplificado

```text
Servidor

↓

Set-Cookie

↓

Browser

↓

Armazena Cookie

↓

Nova requisição

↓

Cookie enviado automaticamente
```

---

## Estrutura

Um cookie normalmente possui:

```text
Cookie

├── Nome

├── Valor

├── Expiração

├── Domínio

├── Caminho

├── Secure

├── HttpOnly

└── SameSite
```

---

## Flags de Segurança

### HttpOnly

Impede que JavaScript tenha acesso ao cookie.

Mitiga ataques de XSS que tentam roubar credenciais.

```text
JavaScript

↓

Cookie

↓

Acesso negado
```

---

### Secure

Determina que o cookie só pode trafegar através de HTTPS.

```text
HTTP

↓

Cookie não enviado

HTTPS

↓

Cookie enviado
```

---

### SameSite

Controla quando o navegador envia cookies para requisições originadas de outros sites.

Valores possíveis:

- Strict
- Lax
- None

---

#### Strict

Máxima proteção.

O cookie nunca acompanha requisições iniciadas por outros domínios.

---

#### Lax

Permite navegação comum entre sites, mas bloqueia grande parte dos ataques CSRF.

É atualmente o valor recomendado para a maioria das aplicações.

---

#### None

Permite envio em qualquer contexto.

Exige obrigatoriamente:

```text
Secure = true
```

---

## Prefixos Especiais

### __Host-

Restrições:

- HTTPS obrigatório;
- Secure obrigatório;
- sem atributo Domain;
- Path=/ obrigatório.

É considerado o formato mais seguro para cookies de sessão.

---

### __Secure-

Também exige HTTPS e Secure, porém permite domínio configurável.

---

## Expiração

Existem dois modelos principais.

### Session Cookie

É removido quando o navegador é encerrado.

---

### Persistent Cookie

Possui data de expiração definida.

Pode permanecer armazenado por dias ou meses.

---

## Riscos

Cookies mal configurados podem resultar em:

- Session Hijacking
- CSRF
- Vazamento de sessão
- Roubo por XSS
- Ataques MITM

---

## Recomendações OWASP

Sempre utilizar:

```text
HttpOnly

+

Secure

+

SameSite=Lax
```

ou

```text
HttpOnly

+

Secure

+

SameSite=Strict
```

dependendo da aplicação.

---

## Anti-patterns

Evitar:

- armazenar informações sensíveis em cookies;
- permitir cookies via HTTP;
- utilizar SameSite=None sem necessidade;
- armazenar JWTs em cookies sem proteção adequada;
- reutilizar cookies após logout.

---

## Comparativo

| Característica | Session ID | Cookie |
|----------------|------------|--------|
| O que é | Identificador da sessão | Mecanismo de transporte |
| Criado por | Aplicação | Navegador/Servidor |
| Contém estado | Não | Pode conter Session ID ou Token |
| Segurança | Depende da geração | Depende da configuração |
| Papel | Identificar sessão | Transportar informações |

---

## Encerramento da Parte 3

Nesta etapa foram apresentados os mecanismos fundamentais utilizados para identificar e transportar sessões entre cliente e servidor.

Enquanto o **Session ID** representa a identidade técnica de uma sessão, os **Cookies** constituem o principal meio de transporte dessa credencial dentro do protocolo HTTP.

Na próxima parte serão abordados os mecanismos modernos baseados em tokens, incluindo **JSON Web Tokens (JWT)**, **Access Tokens** e **Refresh Tokens**, que sustentam a maior parte das arquiteturas distribuídas atuais.

# PARTE II — Ecossistema de Tokens

Os mecanismos de gerenciamento de sessão evoluíram significativamente com o surgimento de arquiteturas distribuídas, APIs REST e microsserviços.

Em vez de manter todo o estado da sessão no servidor, tornou-se comum transportar credenciais autocontidas entre cliente e servidor utilizando **tokens assinados criptograficamente**.

Essa abordagem permite que diferentes serviços validem uma identidade sem depender de um repositório central de sessões.

Os principais componentes desse ecossistema são:

- JSON Web Tokens (JWT)
- Access Tokens
- Refresh Tokens
- Session Rotation
- Session Revocation

Embora frequentemente utilizados em conjunto, cada um possui responsabilidades distintas dentro da arquitetura.

---

# 6. JSON Web Token (JWT)

## Objetivo

O **JSON Web Token (JWT)** é um padrão aberto definido pela **RFC 7519** que especifica um formato compacto e autocontido para transmitir informações entre duas partes de forma verificável criptograficamente.

Seu objetivo não é substituir autenticação ou autorização, mas servir como um mecanismo padronizado para transportar informações confiáveis (*claims*) entre sistemas distribuídos.

---

## Conceito

Um JWT é composto por três partes:

```text
Header

.

Payload

.

Signature
```

Cada parte é codificada utilizando Base64URL.

O resultado é um token semelhante a:

```text
eyJhbGciOiJSUzI1NiIs...

.

eyJzdWIiOiIxMjM0NTYi...

.

SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV...
```

---

## Estrutura

### Header

Contém informações sobre o algoritmo utilizado.

Exemplo:

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

---

### Payload

Contém os **Claims**.

Exemplo:

```json
{
  "sub": "123",
  "name": "Daniel",
  "roles": ["admin"],
  "exp": 1752859200
}
```

---

### Signature

É produzida pela assinatura criptográfica do Header + Payload.

Seu objetivo é garantir:

- integridade;
- autenticidade;
- não adulteração.

---

## O que um JWT NÃO é

Um erro comum consiste em acreditar que JWT é criptografado.

Na realidade:

- Base64 **não é criptografia**;
- qualquer pessoa consegue visualizar o Payload.

A segurança do JWT depende da assinatura.

---

## Algoritmos

Os mais comuns são:

| Algoritmo | Tipo |
|------------|------|
| HS256 | Simétrico |
| RS256 | Assimétrico |
| ES256 | Curvas Elípticas |

Em arquiteturas distribuídas, recomenda-se o uso de algoritmos assimétricos.

---

## Validação

Antes de aceitar um JWT, recomenda-se validar:

- assinatura;
- algoritmo;
- emissor (`iss`);
- audiência (`aud`);
- expiração (`exp`);
- data de emissão (`iat`);
- não utilização antes de (`nbf`).

A ausência dessas validações compromete completamente o modelo de segurança.

---

## Anti-patterns

Evitar:

- aceitar `alg: none`;
- confiar apenas no Payload;
- armazenar senhas;
- armazenar documentos pessoais;
- utilizar JWTs sem expiração.

---

# 7. Access Token

## Objetivo

O **Access Token** representa a credencial utilizada por um cliente para acessar recursos protegidos em nome de um usuário autenticado.

No ecossistema OAuth 2.0, ele funciona como uma autorização temporária concedida pelo Authorization Server.

---

## Conceito

Após o login:

```text
Usuário

↓

Identity Provider

↓

Access Token

↓

Cliente

↓

API
```

O cliente envia esse token em todas as requisições protegidas.

---

## Transporte

O padrão mais comum utiliza o cabeçalho HTTP:

```http
Authorization: Bearer <token>
```

Por esse motivo, Access Tokens são frequentemente chamados de **Bearer Tokens**.

Quem possuir o token consegue utilizá-lo.

---

## Vida Útil

Boas práticas recomendam curta duração.

Normalmente:

- 5 minutos
- 15 minutos
- 30 minutos
- até 60 minutos

Quanto menor sua duração, menor a janela de ataque em caso de vazamento.

---

## Conteúdo

Normalmente contém apenas informações necessárias para autorização.

Exemplo:

```text
Subject

Roles

Scopes

Tenant

Expiração

Issuer
```

---

## Responsabilidades

O Access Token deve permitir:

- identificação do usuário;
- validação da autenticidade;
- autorização inicial;
- acesso temporário.

Ele **não substitui** regras de autorização do domínio.

---

## Validação

Toda API deve verificar:

- assinatura;
- expiração;
- audiência;
- emissor.

Opcionalmente:

- scopes;
- tenant;
- claims customizados.

---

## Boas Práticas

- curta duração;
- HTTPS obrigatório;
- assinatura assimétrica;
- nunca registrar tokens em logs.

---

# 8. Refresh Token

## Objetivo

O **Refresh Token** existe para permitir que novos Access Tokens sejam emitidos sem exigir que o usuário realize autenticação novamente.

Ele melhora significativamente a experiência do usuário mantendo o Access Token com vida curta.

---

## Fluxo

```text
Login

↓

Access Token

+

Refresh Token

↓

Cliente

↓

Access Token expira

↓

Cliente envia Refresh Token

↓

Novo Access Token
```

---

## Características

Enquanto o Access Token é utilizado pelas APIs, o Refresh Token comunica-se exclusivamente com o Authorization Server.

As APIs nunca devem aceitar Refresh Tokens.

---

## Vida Útil

Sua duração normalmente é muito superior.

Pode variar entre:

- dias;
- semanas;
- meses.

Dependendo da política de segurança.

---

## Armazenamento

Em aplicações Web recomenda-se:

- Secure Cookies
- HttpOnly
- SameSite

Em aplicações Mobile:

- Keychain (iOS)
- Keystore (Android)

Nunca:

- LocalStorage
- SessionStorage
- variáveis JavaScript globais.

---

## Vantagens

Permite:

- Access Tokens curtos;
- melhor UX;
- menor exposição;
- renovação transparente.

---

## Riscos

Caso comprometido, um Refresh Token permite geração contínua de novos Access Tokens.

Por esse motivo, ele exige proteção ainda maior que o Access Token.

---

# 9. Session Rotation

## Objetivo

A **Session Rotation** consiste na substituição periódica das credenciais utilizadas durante uma sessão.

Seu principal objetivo é reduzir o impacto do comprometimento de credenciais.

---

## Refresh Token Rotation

A forma moderna de rotação consiste em:

```text
Refresh Token A

↓

Utilizado

↓

Invalidado

↓

Refresh Token B

↓

Utilizado

↓

Invalidado

↓

Refresh Token C
```

Cada Refresh Token pode ser utilizado apenas uma única vez.

---

## Reuse Detection

Caso um token antigo seja reutilizado:

```text
Token A

↓

Já utilizado

↓

Tentativa de reutilização

↓

Sessão comprometida

↓

Revogar toda cadeia
```

Esse mecanismo reduz drasticamente o impacto do roubo de Refresh Tokens.

---

# 10. Session Revocation

## Objetivo

A revogação consiste no encerramento ativo de uma sessão antes de sua expiração natural.

Pode ocorrer por:

- logout;
- ação administrativa;
- troca de senha;
- perda do dispositivo;
- detecção de fraude;
- comprometimento da conta.

---

## Stateful

A revogação é simples.

```text
DELETE Session

↓

Sessão deixa de existir
```

---

## Stateless

Como o token permanece válido até sua expiração, torna-se necessário utilizar mecanismos adicionais.

Os mais comuns são:

- Blocklists;
- Denylists;
- Revocation Lists;
- Continuous Access Evaluation.

---

## Continuous Access Evaluation

Modelos modernos permitem que o Identity Provider notifique aplicações imediatamente quando uma sessão precisa ser encerrada.

```text
Identity Provider

↓

Evento

↓

API Gateway

↓

Revogar acesso
```

Essa abordagem reduz significativamente a janela de exposição.

---

## Comparativo

| Característica | Access Token | Refresh Token |
|----------------|-------------|---------------|
| Utilizado pelas APIs | Sim | Não |
| Vida útil | Curta | Longa |
| Renovável | Não | Sim |
| Pode emitir novo Access Token | Não | Sim |
| Deve chegar ao Resource Server | Sim | Nunca |

---

## Encerramento da Parte 4

Nesta parte foram apresentados os componentes que sustentam o modelo moderno de autenticação baseada em tokens.

O JWT fornece um formato padronizado para transporte de informações confiáveis, o Access Token representa a credencial utilizada pelas APIs e o Refresh Token permite a renovação contínua dessa credencial sem exigir novo processo de autenticação.

Também foram apresentados os mecanismos de **Session Rotation** e **Session Revocation**, fundamentais para reduzir o impacto do comprometimento de credenciais e manter o ciclo de vida das sessões sob controle em arquiteturas distribuídas.

Na próxima parte serão abordados os modelos modernos de autorização, incluindo RBAC, ABAC, ReBAC, Scopes, Claims, Roles e Permissions.

# PARTE III — Modelos de Autorização

Enquanto a autenticação responde **quem é o usuário**, a autorização determina **o que ele pode fazer**.

Embora esses conceitos frequentemente apareçam juntos, eles representam responsabilidades arquiteturais distintas.

Uma aplicação pode autenticar corretamente um usuário e, ainda assim, negar acesso a determinados recursos por questões de autorização.

Esta seção apresenta os principais modelos utilizados atualmente pela indústria.

---

# 11. Authorization

## Objetivo

A autorização (**Authorization**) é o processo responsável por determinar se uma identidade autenticada possui permissão para executar determinada ação sobre um recurso.

Ela ocorre **após** a autenticação.

---

## Fluxo Conceitual

```text
Usuário

↓

Authentication

↓

Identity Confirmada

↓

Authorization

↓

Permitido ou Negado
```

---

## Elementos Envolvidos

Todo mecanismo de autorização trabalha, direta ou indiretamente, com quatro elementos:

```text
Quem

↓

Pode fazer

↓

O quê

↓

Em qual recurso
```

Ou, de maneira formal:

```text
Subject

↓

Action

↓

Resource

↓

Decision
```

---

## Exemplos

```text
Usuário

↓

Editar

↓

Campanha
```

ou

```text
Administrador

↓

Excluir

↓

Usuário
```

A autorização consiste justamente em responder:

> "Essa ação é permitida?"

---

## Princípios

Uma arquitetura moderna deve separar claramente:

- autenticação;
- autorização;
- regras de negócio.

Misturar essas responsabilidades aumenta o acoplamento e dificulta manutenção.

---

# 12. RBAC — Role-Based Access Control

## Conceito

RBAC (**Role-Based Access Control**) é o modelo mais difundido de autorização.

Nesse modelo, permissões não são atribuídas diretamente aos usuários.

Em vez disso:

```text
Usuário

↓

Role

↓

Permissions
```

---

## Estrutura

```text
Usuário

↓

Administrador

↓

Criar Usuário

Editar Usuário

Excluir Usuário

Visualizar Relatórios
```

---

## Funcionamento

Durante o login:

```text
Usuário

↓

Role

↓

Permissões carregadas

↓

Autorização
```

---

## Vantagens

- simples;
- intuitivo;
- fácil auditoria;
- amplamente suportado.

---

## Limitações

RBAC possui baixa flexibilidade.

Exemplo:

```text
Usuário pode editar

↓

Somente campanhas próprias
```

Esse tipo de regra não depende apenas do cargo.

Depende também do recurso.

RBAC puro não resolve bem esse cenário.

---

## Casos de Uso

Ideal para:

- ERPs;
- sistemas administrativos;
- backoffices;
- CRMs;
- aplicações corporativas.

---

# 13. ABAC — Attribute-Based Access Control

## Conceito

ABAC (**Attribute-Based Access Control**) toma decisões utilizando atributos.

Esses atributos podem pertencer a:

- usuário;
- recurso;
- ambiente;
- contexto.

---

## Exemplo

```text
Usuário

Departamento = Marketing

↓

Campanha

Departamento = Marketing

↓

Permitir acesso
```

Nesse caso não existe Role envolvida.

A decisão depende dos atributos.

---

## Fontes de Atributos

Podem ser utilizados atributos como:

Usuário

- departamento;
- idade;
- país;
- empresa;
- cargo.

Recurso

- proprietário;
- classificação;
- cliente.

Ambiente

- horário;
- localização;
- dispositivo;
- rede.

---

## Vantagens

ABAC oferece enorme flexibilidade.

É capaz de representar regras extremamente complexas sem multiplicar cargos.

---

## Desvantagens

Maior complexidade.

Regras podem tornar-se difíceis de compreender e auditar quando mal organizadas.

---

# 14. ReBAC — Relationship-Based Access Control

## Conceito

ReBAC toma decisões com base no relacionamento existente entre identidades e recursos.

Em vez de perguntar:

> "Qual o cargo?"

pergunta:

> "Qual a relação entre essas entidades?"

---

## Exemplo

```text
Usuário

↓

É proprietário

↓

Documento
```

ou

```text
Usuário

↓

É membro

↓

Projeto
```

---

## Aplicações

Muito utilizado em:

- Google Drive;
- GitHub;
- Notion;
- Figma;
- Dropbox.

---

## Modelo

```text
Usuário

↓

Relacionamento

↓

Recurso

↓

Permissão
```

---

## Benefícios

Excelente para colaboração.

Evita explosão de cargos.

Representa relações naturais entre pessoas e objetos.

---

# Comparação

| Modelo | Base da decisão |
|---------|-----------------|
| RBAC | Roles |
| ABAC | Atributos |
| ReBAC | Relacionamentos |

Na prática, grandes plataformas combinam múltiplos modelos.

---

# 15. Roles

## Conceito

Uma **Role** representa uma função exercida por uma identidade dentro de determinado contexto.

Ela agrupa permissões relacionadas.

Exemplos:

```text
Administrador

Editor

Financeiro

Parceira

Cliente
```

---

## Objetivo

Reduzir a necessidade de atribuir permissões individualmente.

---

## Exemplo

```text
Role

Editor

↓

Editar conteúdo

↓

Publicar conteúdo

↓

Excluir rascunhos
```

---

## Boas Práticas

- poucas roles;
- responsabilidades bem definidas;
- evitar sobreposição.

---

# 16. Permissions

## Conceito

Permissions representam operações individuais permitidas.

São o menor nível de autorização.

Exemplos:

```text
users.read

users.write

campaign.edit

campaign.delete
```

---

## Relação com Roles

```text
Role

↓

Permissions

↓

Operações
```

Uma mesma permissão pode pertencer a diversas Roles.

---

## Granularidade

Quanto menor a permissão, maior a flexibilidade do sistema.

---

# Encerramento da Parte 5

Nesta parte foram apresentados os principais modelos de autorização utilizados atualmente.

O **RBAC** organiza permissões por funções, o **ABAC** utiliza atributos para tomar decisões e o **ReBAC** fundamenta o acesso nos relacionamentos existentes entre identidades e recursos.

Também foram apresentados os conceitos de **Roles** e **Permissions**, que constituem a base da maioria dos sistemas corporativos modernos.

Na parte final serão abordados **Scopes**, **Claims**, **Least Privilege**, **Defense in Depth**, **Zero Trust**, motores de políticas, autorização granular, anti-patterns, glossário e referências bibliográficas.

# PARTE IV — Princípios Modernos de Autorização

Os modelos de autorização apresentados anteriormente (RBAC, ABAC e ReBAC) definem **como** uma decisão pode ser tomada.

Entretanto, arquiteturas modernas também utilizam conceitos complementares que tornam essas decisões mais precisas, auditáveis e escaláveis.

Entre eles destacam-se:

- Claims
- Scopes
- Least Privilege
- Defense in Depth
- Zero Trust
- Policy Engines
- Fine-Grained Authorization

Esses conceitos representam o estado da arte em sistemas distribuídos de controle de acesso.

---

# 17. Claims

## Objetivo

**Claims** são declarações sobre uma identidade.

Representam informações emitidas por uma autoridade confiável e utilizadas durante processos de autenticação e autorização.

Em um JWT, os Claims constituem praticamente todo o conteúdo do Payload.

---

## Exemplos

```json
{
  "sub": "123",
  "name": "Daniel",
  "email": "daniel@email.com",
  "role": "admin",
  "tenant": "empresa-a"
}
```

Cada campo representa um Claim.

---

## Categorias

### Registered Claims

Definidos pela RFC 7519.

Exemplos:

- iss
- sub
- aud
- exp
- iat
- nbf
- jti

---

### Public Claims

Claims padronizados entre diferentes aplicações.

---

### Private Claims

Criados especificamente para determinada organização.

Exemplo:

```json
{
  "tenant": "empresa-a",
  "department": "marketing"
}
```

---

## Boas Práticas

Claims devem ser:

- pequenos;
- objetivos;
- relevantes;
- não sensíveis.

Nunca utilizar Claims para armazenar:

- senhas;
- CPF;
- cartões;
- dados financeiros.

---

# 18. Scopes

## Objetivo

Scopes representam **o nível de autorização concedido** a uma aplicação ou cliente.

Enquanto Roles descrevem quem é o usuário, Scopes descrevem quais operações foram autorizadas para aquele token específico.

---

## Exemplo

```text
read:users

write:users

delete:users
```

---

## Funcionamento

```text
Usuário

↓

OAuth

↓

Consentimento

↓

Scopes

↓

Access Token
```

A API verifica se o token contém o Scope necessário.

---

## Diferença entre Roles e Scopes

| Roles | Scopes |
|--------|---------|
| Ligadas ao usuário | Ligados ao token |
| Representam funções | Representam permissões concedidas |
| Geralmente permanentes | Podem variar entre requisições |

---

# 19. Least Privilege

## Conceito

O princípio do **Menor Privilégio** determina que toda identidade deve possuir apenas as permissões estritamente necessárias para executar suas funções.

Nada mais.

---

## Exemplo

Errado:

```text
Administrador Geral
```

para todos os funcionários.

Correto:

```text
Financeiro

↓

Apenas permissões financeiras
```

---

## Benefícios

- reduz impacto de invasões;
- diminui erros humanos;
- facilita auditorias;
- reduz superfície de ataque.

---

# 20. Defense in Depth

## Conceito

Nenhum mecanismo de segurança é perfeito.

Por esse motivo, arquiteturas modernas utilizam múltiplas camadas independentes de proteção.

---

## Modelo

```text
Firewall

↓

Identity Provider

↓

API Gateway

↓

Autorização

↓

Regras de Negócio

↓

Banco
```

Mesmo que uma camada falhe, as demais continuam protegendo o sistema.

---

## Exemplos

- MFA;
- HTTPS;
- JWT;
- RBAC;
- Auditoria;
- Rate Limiting;
- IDS;
- Monitoramento.

---

# 21. Zero Trust

## Conceito

Zero Trust parte do princípio:

> **Never Trust. Always Verify.**

Nenhuma identidade, dispositivo ou serviço é considerado confiável por padrão.

Toda requisição deve ser validada.

Independentemente de sua origem.

---

## Modelo Tradicional

```text
Entrou na rede

↓

Confiável
```

---

## Modelo Zero Trust

```text
Cada requisição

↓

Nova validação

↓

Nova autorização
```

---

## Princípios

- verificar continuamente;
- assumir comprometimento;
- autenticação forte;
- autorização contextual;
- menor privilégio.

---

# 22. Policy Engines

## Objetivo

Motores de políticas centralizam regras de autorização.

Em vez de espalhar verificações pelo código da aplicação, as decisões são delegadas a um componente especializado.

---

## Fluxo

```text
API

↓

Policy Engine

↓

Allow

ou

Deny
```

---

## Exemplos

- Open Policy Agent (OPA)
- Cedar
- AWS Verified Permissions
- Google Zanzibar (modelo)
- AuthZed / SpiceDB

---

## Benefícios

- regras centralizadas;
- auditoria simplificada;
- reutilização;
- menor acoplamento.

---

# 23. Fine-Grained Authorization

## Conceito

Autorização granular permite controlar permissões em nível extremamente detalhado.

Em vez de responder apenas:

```text
Pode editar campanhas?
```

o sistema responde:

```text
Pode editar

↓

Somente campanhas

↓

Da empresa X

↓

Criadas por ele

↓

Enquanto estiverem em revisão
```

---

## Exemplo

```text
Usuário

↓

Documento

↓

É proprietário?

↓

Está compartilhado?

↓

Está bloqueado?

↓

Permitir edição
```

---

## Casos de Uso

Muito utilizado em:

- Google Drive;
- GitHub;
- Notion;
- Jira;
- Slack;
- sistemas multiempresa.

---

# Anti-patterns

Erros comuns em sistemas de autorização:

- confiar apenas no frontend;
- validar permissões apenas na interface;
- utilizar Roles excessivamente genéricas;
- duplicar regras em diversos serviços;
- armazenar regras diretamente no código;
- permitir privilégios permanentes desnecessários;
- utilizar JWTs eternos;
- não registrar decisões de autorização.

---

# Glossário

| Termo | Definição |
|--------|-----------|
| Authentication | Processo de verificar a identidade de uma entidade. |
| Authorization | Processo de determinar quais ações são permitidas. |
| Session | Contexto autenticado mantido entre requisições. |
| Session ID | Identificador único de uma sessão. |
| Cookie | Mecanismo de armazenamento e transporte de dados HTTP. |
| JWT | Formato padronizado para transporte de Claims assinados. |
| Access Token | Credencial temporária utilizada para acessar recursos protegidos. |
| Refresh Token | Credencial utilizada para emitir novos Access Tokens. |
| Claim | Informação declarada sobre uma identidade. |
| Scope | Permissão concedida a um token. |
| Role | Função atribuída a uma identidade. |
| Permission | Operação específica autorizada sobre um recurso. |
| RBAC | Controle de acesso baseado em papéis (Roles). |
| ABAC | Controle de acesso baseado em atributos. |
| ReBAC | Controle de acesso baseado em relacionamentos. |
| Least Privilege | Princípio de conceder apenas as permissões estritamente necessárias. |
| Defense in Depth | Estratégia de utilizar múltiplas camadas independentes de proteção. |
| Zero Trust | Modelo de segurança baseado em verificação contínua. |
| Policy Engine | Componente responsável por avaliar políticas de autorização. |

---

# Considerações Finais

O gerenciamento de identidade moderno não se resume à autenticação de usuários.

Ele envolve um conjunto de mecanismos responsáveis por estabelecer, manter, proteger e revogar sessões, bem como decidir continuamente quais recursos podem ser acessados por cada identidade.

Arquiteturas contemporâneas combinam autenticação robusta, sessões seguras, tokens de curta duração, autorização contextual e políticas centralizadas para atender aos requisitos de escalabilidade, segurança e governança exigidos por aplicações distribuídas.

A escolha entre sessões stateful ou stateless, o modelo de autorização adotado e a forma de distribuição das decisões de acesso devem sempre considerar os requisitos específicos do domínio da aplicação, evitando soluções universais para problemas distintos.

---

# Referências

## Especificações

- RFC 7519 — JSON Web Token (JWT)
- RFC 6749 — OAuth 2.0 Authorization Framework
- RFC 6750 — Bearer Token Usage
- RFC 6265 — HTTP State Management Mechanism
- RFC 9110 — HTTP Semantics

## Guias Técnicos

- NIST SP 800-63 — Digital Identity Guidelines
- OWASP ASVS
- OWASP Session Management Cheat Sheet
- OWASP Authorization Cheat Sheet
- OWASP JWT Cheat Sheet

## Referências da Indústria

- OpenID Foundation
- OAuth Working Group
- Microsoft Identity Platform Documentation
- Google Cloud IAM Documentation
- AWS IAM Documentation
- Auth0 Documentation
- Okta Developer Documentation
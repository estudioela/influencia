# ADR-011 · Acoplamento entre a trava global do Portal e a chamada síncrona de CEP

**Status:** Proposto (rascunho para decisão do responsável do projeto — NÃO aceito)
**Resolve:** dívida técnica registrada na implementação da SPEC-032 (Perfil no
Portal), documentada em `docs/_workspace/TASK_ROUTER.md` (seção SPEC-032,
"Dívida registrada") e no cabeçalho de `src/service/PerfilPortalService.js`.
**Contexto:** `src/entrypoint/Portal.js`, função `comTravaDeAcesso` (trava
global via `LockService.getScriptLock()`, `waitLock(10000)`), criada pela
SPEC-025 (RN-02) para serializar a escrita concorrente nas abas
`SESSOES`/`BLOQUEIOS` (contagem de tentativas de login). Toda operação do
Portal que renova a Sessão da Parceira passa por essa trava:
`entrarNoPortal`, `renovarSessaoDoPortal`, `sairDoPortal`, `verPendencias`,
`lerBriefingDoItem`, `enviarMaterialDoPortal` e, desde a SPEC-032,
`verPerfilDoPortal`/`editarPerfilDoPortal`.

## Problema

A SPEC-032 introduziu, dentro de `PerfilPortalService.editarPerfil` →
`recomporEndereco`, a **primeira chamada HTTP síncrona** feita sob essa
trava: `AdaptadorDeCepBrasilApi.resolver(cep)`, via `UrlFetchApp.fetch` contra
a BrasilAPI, disparada sempre que o CEP muda. Google Apps Script não permite
configurar timeout em `UrlFetchApp.fetch` — não há como limitar quanto tempo
essa chamada pode segurar a trava.

Consequência: se a BrasilAPI degradar ou responder lentamente, a trava global
fica presa pelo tempo inteiro da chamada. Qualquer outra Parceira tentando
logar, deslogar, ver pendências ou enviar material nesse intervalo pode
falhar por timeout do lock (10s) — mesmo sem nenhuma relação com quem está
editando o CEP. O acoplamento é: **trava pensada para proteger consistência
de escrita em duas abas de controle (SESSOES/BLOQUEIOS) agora também
serializa uma dependência de rede externa de latência não controlável.**

**Mitigação já aplicada** (não elimina o problema, só reduz a frequência):
o adaptador só é chamado quando o CEP de fato muda (`cepMudou`), não a cada
edição de perfil — ver `recomporEndereco` em `PerfilPortalService.js`.

Este ADR não decide a resolução — apresenta alternativas para o responsável
do projeto escolher.

## Alternativas em avaliação

### Alternativa A — mover a resolução de CEP para fora da trava global

Resolver o CEP no Entrypoint (`Portal.js`, dentro de `editarPerfilDoPortal`)
**antes** de chamar `comTravaDeAcesso`, e passar o resultado já resolvido
(ou `null` em caso de falha) para `PerfilPortalService.editarPerfil`, que
deixaria de conhecer o adaptador de CEP.

- **Ganho:** a chamada HTTP síncrona sai de dentro da trava; login/logout/
  pendências/envio de outras Parceiras deixam de correr risco de timeout por
  causa de uma edição de CEP alheia.
- **Trade-off principal (o que o pedido de análise já antecipava):**
  `recomporEndereco` decide se o CEP mudou comparando o CEP novo com o CEP
  **atual** do perfil (`this.parceiraACL.obterPerfil(parceiraId)`), e o
  `parceiraId` só é conhecido depois de resolver a Sessão a partir do token
  (`resolverSessao` → `acessoPortalService.renovar`). Resolver a Sessão é,
  hoje, exatamente a operação que a trava protege (renovação desliza a
  expiração e toca a aba `SESSOES` — mesma razão de ser da SPEC-025 RN-02).
  Ou seja: para tirar só a chamada de rede da trava, a **leitura do perfil
  atual** (e, por extensão, parte da resolução da Sessão para obter o
  `parceiraId`) também precisaria sair de dentro da trava — não é possível
  mover apenas o `UrlFetchApp.fetch` mantendo tudo o resto onde está.
- **Risco novo introduzido:** ao tirar a leitura do perfil atual da trava,
  duas requisições concorrentes da **mesma** Parceira (ex.: duas abas
  abertas) poderiam ler o mesmo "CEP atual" antes de qualquer uma escrever,
  e ambas decidirem `cepMudou = true`/`false` de forma inconsistente — uma
  race condition nova, porém restrita a uma única Parceira editando o
  próprio perfil em paralelo (não mais o problema atual, que afeta Parceiras
  sem nenhuma relação entre si). A escrita final (`atualizarPerfil`)
  continuaria protegida pela trava.
- **Custo de implementação:** split do fluxo em duas fases no Entrypoint
  (leitura/resolução fora da trava, escrita dentro), possivelmente exigindo
  uma nova porta de leitura "peek" que não force renovação de Sessão, para
  não duplicar a semântica de `renovar`.

### Alternativa B — trocar a trava global por uma trava por-Parceira

Substituir `LockService.getScriptLock()` por um mecanismo que serialize
apenas as operações da **mesma** Parceira, liberando Parceiras diferentes
para operar em paralelo.

- **Ganho:** elimina o acoplamento entre Parceiras diferentes — uma chamada
  de CEP lenta só afetaria a própria Parceira que está editando o perfil,
  nunca outra.
- **Limitação técnica real do GAS:** `LockService` não oferece uma trava
  nativa "por chave arbitrária" (não existe algo como `getLock(parceiraId)`).
  As opções nativas são `getScriptLock()` (global, a atual),
  `getUserLock()` (por usuário efetivo do script) e `getDocumentLock()` (por
  documento). Se o Web App estiver publicado como "Executar como: Eu" —
  padrão comum para Portal com acesso anônimo/sem conta Google da Parceira —
  `getUserLock()` colapsa para o mesmo usuário efetivo em toda requisição,
  ou seja, **equivale à trava global atual** e não resolve o problema. Isso
  precisa ser confirmado antes de considerar `getUserLock()` como solução.
- **Alternativa dentro da Alternativa B:** implementar a trava por-Parceira
  manualmente, ex. uma linha/marcador de "em processamento" por `parceiraId`
  numa aba de controle (nova, ou reaproveitando `BLOQUEIOS`). Isso exige:
  (1) uma seção crítica curtíssima protegida pela trava global só para
  verificar-e-marcar o registro daquela Parceira (check-and-set atômico);
  (2) liberar a trava global imediatamente após marcar; (3) executar a
  chamada de CEP fora de qualquer trava, protegida apenas pelo marcador;
  (4) um mecanismo de expiração/limpeza do marcador para o caso de a
  execução travar/lançar antes de liberar (falha órfã) — sem isso, uma
  Parceira poderia ficar bloqueada de si mesma indefinidamente.
- **Trade-off principal:** bem mais complexidade (nova aba ou colunas, lógica
  de expiração, tratamento de marcador órfão, testes de concorrência) em
  troca de eliminar o acoplamento entre Parceiras diferentes. Também amplia
  a superfície de: quem mais está autorizado a tocar o mecanismo de trava
  (hoje só o Entrypoint toca `LockService`, por design — SPEC-025).

### Alternativa C — aceitar o risco como está, documentado

Manter a trava global e a mitigação já aplicada (chamada de CEP só quando o
CEP muda), sem mudança de código adicional. Registrar formalmente como
limite conhecido do sistema.

- **Racional:** edição de CEP é um evento raro comparado a login/ver
  pendências/enviar material (que dominam o tráfego do Portal); a mitigação
  já reduz a exposição a "só quando o CEP realmente muda", não a cada edição
  de perfil. A BrasilAPI é um serviço de terceiro geralmente estável; o
  cenário de degradação prolongada o suficiente para estourar 10s de
  `waitLock` e ainda por cima coincidir com tráfego concorrente de outras
  Parceiras é uma composição de eventos pouco provável, ainda que não nula.
- **Trade-off:** não elimina o problema — apenas aceita a probabilidade
  residual como custo/benefício razoável frente à complexidade das
  alternativas A/B. Exige reavaliação se a frequência de reclamação de
  timeout de login/logout aumentar, ou se a BrasilAPI se mostrar
  historicamente instável.

## Invariantes que valem independentemente da alternativa escolhida

- RN-02/CB-01 (SPEC-032) continuam valendo: falha do Adaptador de CEP nunca
  pode impedir salvar PIX/e-mail/CEP/número/complemento.
- O `parceiraId` nunca pode vir de um parâmetro do chamador — sempre da
  Sessão resolvida pelo token (RN-03/INV-01, Q-09), mesmo que a resolução de
  Sessão seja parcialmente reorganizada pela Alternativa A.
- Nenhuma alternativa pode reintroduzir a vulnerabilidade original que a
  trava da SPEC-025 resolve: contorno do limite de 5 tentativas de login em
  paralelo (RN-02 da SPEC-025).
- Continua proibido qualquer ponto de acesso a `LockService` fora do
  Entrypoint (padrão já estabelecido pela SPEC-025).

## Consequências

- Nenhuma mudança de código é feita por este ADR — é um rascunho de decisão.
- Enquanto o Status permanecer "Proposto", a mitigação atual (chamada de CEP
  condicionada a `cepMudou`) é o único tratamento em produção; o risco
  descrito em "Problema" permanece real, ainda que reduzido em frequência.
- Escolhida uma alternativa, este ADR deve ser atualizado para "Aceito" com a
  decisão registrada, e a implementação correspondente vira um item de
  trabalho novo (fora do escopo deste rascunho).
- Se nenhuma alternativa for escolhida, a Alternativa C (aceitar o risco
  documentado) é o comportamento padrão de fato, por já estar em produção.

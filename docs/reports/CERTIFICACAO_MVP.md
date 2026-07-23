# CERTIFICACAO_MVP.md — TEAR V2.5 (tear-v2-app)

**Data:** 2026-07-23
**Papel:** Agente B — QA / Homologação / Certificação (mandato de operação
autônoma, `CLAUDE.md`)
**Commit de referência:** `955bb83` (branch `feat/ui-design-system-ela`,
sincronizado com `origin/feat/ui-design-system-ela`)
**Escopo:** somente `tear-v2-app/` (Laravel 13 + React 19). O Portal legado
GAS (`src/`) e o domínio soberano (`CONTRATO_SOBERANO.md`) não fazem parte
desta certificação.

> Este documento certifica **prontidão funcional para demonstração a
> cliente**, não autorização de produção. A autorização de Go-Live
> (infraestrutura, credenciais externas, SSH/Locaweb, PostgreSQL, DNS) é
> um gate separado e independente, tratado em
> `docs/release/GATE_FINAL_GO_LIVE.md` — hoje **NÃO AUTORIZADO**, por
> motivos exclusivamente de infraestrutura, não de regra de negócio. Os
> dois gates não devem ser confundidos.

---

## 1. Escopo homologado

Ciclo de negócio completo definido pelo responsável do projeto
(`TASK_ROUTER.md` §32) como critério de certificação:

```
Cadastro → Aprovação → Convite → Senha → Login → Participação →
Briefing → Upload → Aprovação de material → Pagamento → Histórico
```

Módulos cobertos pelas duas sessões de homologação/auditoria de
2026-07-23 (`TASK_ROUTER.md` §37 e §38) e pelas correções aplicadas
depois delas na mesma branch: Cadastro público, Convite de
influenciadora, Recuperação de senha, Login, Aprovação de Parceira,
Campanhas, Briefing, Upload de material, Aprovação/reprovação de
material, Pagamento (caso 1:1), Logística/Envio (`TASK_ROUTER.md` §32),
Administração/RBAC, e Histórico do Portal (RF-028, adicionado após as
duas sessões de auditoria).

## 2. Critérios utilizados

Critério fixado explicitamente pelo responsável do projeto durante a
sessão de homologação (`TASK_ROUTER.md` §37.3, reafirmado em §38):
**validar que os fluxos de negócio funcionam ponta a ponta para permitir
demonstrar o TEAR a um cliente antes da reescrita futura para a
arquitetura definitiva — não hardening de produção.**

Achados classificados em três categorias (`ESTADO_SESSAO.md` §4,
`TASK_ROUTER.md` §38):

- **Categoria A** — bloqueia a validação do produto (o sistema chega a um
  estado de negócio impossível/incorreto). Corrigido obrigatoriamente.
- **Categoria B** — funciona, mas compromete robustez, segurança,
  concorrência ou manutenção. Registrado, não corrigido nesta fase.
- **Categoria C** — decisão de produto em aberto ou polimento cosmético.
  Registrado, não corrigido nesta fase.

## 3. Fluxos validados

| Fluxo | Método | Resultado |
|---|---|---|
| Cadastro público de Parceira | Auditoria de código + correção aplicada | Funcional (transação atômica com consentimento LGPD, `TASK_ROUTER.md` §37 item 2) |
| Convite de influenciadora (criação e edição) | Auditoria de código + reprodução manual no navegador | Funcional — bug de consentimento LGPD ausente no modo criação encontrado e corrigido (`bb44d20`, achado por reprodução manual pós-sessão de auditoria) |
| Aprovação de Parceira | Auditoria de código + correção aplicada | Funcional (race condition de e-mail duplicado corrigida, `TASK_ROUTER.md` §37 item 1) |
| Recuperação de senha | Auditoria de código (2 rodadas independentes) | Funcional — throttle assimétrico corrigido, saída para link expirado adicionada |
| Login | Auditoria de código (2 rodadas independentes, sem bug encontrado) | Sem bug funcional identificado; **reprodução manual dedicada do próprio fluxo de Login ainda não confirmada** (ver §5) |
| Briefing | Auditoria de código | Funcional |
| Upload de material | Auditoria de código | Funcional (dependia de Google Drive configurado — resolvido em `TASK_ROUTER.md` §33-§35, fora do escopo desta certificação funcional) |
| Aprovação/reprovação de material | Auditoria de código | Funcional |
| Pagamento (caso 1:1) | Auditoria de regras de negócio | **Bug Categoria A encontrado e corrigido** — gate de material aprovado (`P0-1`) era contornável pulando direto para `PAGO` (`4138c04`); estendido para cobrir `APROVADO` e `PAGO`. Mergeado em `feat/ui-design-system-ela` via PR #66 (`99b5f6a`) |
| Campanhas | Auditoria de regras de negócio | Funcional (limitações registradas como Categoria B, ver §4) |
| Logística/Envio | Navegação real ao vivo (`TASK_ROUTER.md` §32) | Funcional, sem divergência |
| Administração/RBAC | Auditoria de código | Funcional — todas as rotas de escrita cobertas por `role:ADMIN`/Policy |
| Histórico do Portal (RF-028) | Implementado e validado no navegador com campanha real `ENCERRADA` (`955bb83`) | Funcional — fecha a última etapa do ciclo de negócio definido em `TASK_ROUTER.md` §32 |

**Estado da suíte na branch, verificado nesta sessão em `955bb83`:**
backend 208/208 testes verdes, `pint --test` limpo, `tsc -b` (frontend)
limpo.

## 4. Limitações aceitas (Categoria C — decisão de produto, não bug)

- Recorrência/parcelamento de pagamento não implementado (`Pagamento` é
  1:1 com `ParticipacaoNaCampanha`).
- `GESTOR_MARCA` não é um papel funcional (sem vínculo Usuário↔Marca no
  schema); nenhum fluxo de produção atribui esse papel hoje.
- Validação de formato do Instagram não implementada.
- Congelamento (`congelado_em`) é decorativo fora dos campos comerciais
  da própria Participação (não bloqueia Briefing, Material nem Envio) —
  escopo de "congelar" nunca foi formalmente definido.
- `reenviarConvite` não distingue parceira já ativa de uma que nunca
  definiu senha.
- Item de menu "Logística" no `AppShell.tsx` é um `PlaceholderPage`
  desabilitado — o módulo é 100% funcional, só alcançável por
  drill-down a partir de Campanha (rótulo enganoso, não bug de lógica).

## 5. Pendências reais

- **Reprodução manual dedicada do fluxo de Login no navegador** — as
  duas auditorias de código independentes (§37, §38) não encontraram bug
  funcional, e reproduções manuais adjacentes (Convite, Histórico) já
  ocorreram sem problema; falta apenas o passo específico de logar e
  recarregar a tela de Login isoladamente para fechar essa validação.
- **Categoria B (compromete robustez/segurança/concorrência, não bloqueia
  a demonstração)** — lista completa em `ESTADO_SESSAO.md` §4:
  `Pagamento.valor` editável sem trava após `PAGO`; Pagamento e
  cancelamento de Participação não se checam mutuamente; Campanha
  `ENCERRADA`/`CANCELADA` continua editável; Participação pode ser criada
  numa Campanha já encerrada; `PagamentoController` sem
  `DB::transaction`/lock; falta de unicidade de e-mail em Parceira;
  mensagens de erro genéricas no Login; `/login` sem rate-limit por
  e-mail (só por IP); `CadastroPublicoController::store()` não trata
  `QueryException` de nome duplicado sob concorrência.
- Validação ponta a ponta dos e-mails reais (convite, reset) com o SMTP
  de produção — ainda não executada (item de infraestrutura, fora do
  escopo funcional).
- Fluxos secundários não auditados neste ciclo: Marcas, Medidas — decisão
  de continuar ou não fica com o responsável do projeto (mesma
  recomendação de `ESTADO_SESSAO.md` §3.3).

## 6. Bloqueadores

**Nenhum bloqueador funcional ativo.** O único item Categoria A
identificado nas duas sessões de auditoria (gate de material aprovado
contornável no Pagamento) foi corrigido, testado e **já está mergeado**
em `feat/ui-design-system-ela` (PR #66, commit de merge `99b5f6a`).

Bloqueadores de **infraestrutura/produção** (fora do escopo desta
certificação funcional) permanecem registrados e não autorizados em
`docs/release/GATE_FINAL_GO_LIVE.md` — SSH real da Locaweb, PostgreSQL de
produção, DNS/TLS de `influencia.estudioela.com`, `.env` de produção,
SMTP em ambiente real, backup/restore ensaiados. Nenhum deles impede a
demonstração do produto em ambiente controlado (local/homologação).

## 7. Parecer técnico

### O MVP encontra-se funcionalmente certificado?

**Sim**, para o critério definido pelo responsável do projeto: validar
que o ciclo de negócio completo (Cadastro → Aprovação → Convite → Senha
→ Login → Participação → Briefing → Upload → Aprovação → Pagamento →
Histórico) funciona ponta a ponta o suficiente para demonstração a
cliente, sem hardening de produção.

**Justificativa:**

1. Duas auditorias independentes (por tela e por regra de negócio)
   cobriram todos os módulos do ciclo definido em `TASK_ROUTER.md` §32,
   mais Logística/Envio e Administração/RBAC.
2. O único achado Categoria A (bloqueador real: pagamento liberável sem
   material aprovado) foi corrigido, coberto por 3 testes novos, e está
   mergeado na branch de trabalho — não é mais uma pendência condicional.
3. A suíte completa do backend está verde (208/208), lint limpo em
   backend e frontend, no commit de HEAD atual da branch.
4. As duas correções aplicadas depois das sessões de auditoria (consentimento
   LGPD no cadastro, `bb44d20`; Histórico do Portal, `955bb83`) fecham,
   respectivamente, um bug encontrado em reprodução manual e a última
   etapa do próprio ciclo certificado — sem introduzir regressão (suíte
   verificada nesta sessão).
5. Os itens remanescentes (Categoria B/C) são, por definição do próprio
   critério adotado, robustez/segurança/produto — não impedem que um
   cliente veja o sistema funcionando de ponta a ponta.

**Ressalva explícita:** esta certificação é **funcional**, não de
produção. `docs/release/GATE_FINAL_GO_LIVE.md` continua **NÃO
AUTORIZADO** e deve ser tratado como gate independente antes de qualquer
acesso público real.

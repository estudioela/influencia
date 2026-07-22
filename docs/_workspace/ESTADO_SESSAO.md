# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `24f7dfc148ae823926d3820d6805cd6ed335e85e` (`24f7dfc`)
- **Branch:** `feat/ui-design-system-ela` — 19 commits à frente de `origin/feat/ui-design-system-ela`, working tree limpa
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — plano de lançamento comercial visando 15/01/2027
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — ainda **não iniciada tecnicamente**. Esta sessão foi de due diligence de plano, correção de governança e reconciliação de código pendente, não de execução de fase.
- **Testes:** backend 183/183 verdes (461 assertions), Pint limpo. Frontend: `tsc -b` limpo, `oxlint` só o warning pré-existente não relacionado (`auth.tsx:80`), `vite build` ok.

## 2. Principal marco concluído nesta sessão

**Merge de `worktree-spec-mvp-completa` concluído** (commit `24f7dfc`) — 16 conflitos resolvidos combinando as duas frentes (correções de LGPD/segurança desta sessão + funcionalidades da branch órfã: logística/Envio, reprovação de cadastro, dados contratuais, congelamento de participação, Materiais vinculados a Briefing, Portal reorganizado). Nenhum lado descartado indiscriminadamente. Suíte subiu de 151 para 183 testes, todos verdes. Uma regressão adicional (fora dos 16 conflitos) foi encontrada e corrigida: `PortalCampanhaDetailPage.tsx` chamava a API de upload com assinatura obsoleta — substituída pela página já construída na branch órfã (`PortalParticipacaoPage.tsx`).

Também concluído nesta sessão: due diligence completa do Plano Mestre (painel de 9 especialistas), consolidação de 3 auditorias externas (`RELATORIO_CONSOLIDACAO_AUDITORIAS.md`), fix de consentimento LGPD no cadastro público, resolução da contradição Docker×Locaweb na documentação de deploy, e institucionalização deste protocolo (`/comecar`, `/fim`).

## 3. Próxima tarefa recomendada

**Iniciar a Macrofase A do Plano Mestre (Go Live interno)** — infraestrutura Locaweb: variáveis reais de produção, banco gerenciado, SMTP, Google Drive (ver `docs/deployment/PLANO_IMPLEMENTACAO.md` para o runbook de 12 etapas já detalhado).

Antes disso, recomenda-se resolver o achado da seção 5 abaixo (sobreposição de documentos de planejamento) para não carregar duplicidade para a próxima fase.

## 4. Pendências / bloqueios (decisão do responsável do projeto)

- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no INPI.
- Credenciais reais de produção (Locaweb, Google Drive, SMTP) — nenhuma preenchida ainda.
- **Novo:** decidir o que fazer com os 4 documentos trazidos pelo merge para `docs/` raiz (ver §5) — arquivar, mesclar ao canon de `docs/planning/`, ou manter como está.

## 5. Riscos ativos

1. **Novo, encontrado nesta sessão:** o merge trouxe 4 documentos novos direto para `docs/` raiz — `BACKLOG_EXECUTIVO_MVP.md`, `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`, `PLANO_EXECUCAO_MVP.md`, `DECISAO_TAXONOMIA_MATERIAL_BRIEFING.md` — que se sobrepõem em escopo a documentos já canônicos em `docs/planning/` (`BACKLOG_FUNCIONAL_V2_6.md`, `ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md`, `PLANO_MESTRE_ELA_INFLUENCIA.md`). Ainda não lidos/reconciliados nesta sessão — é exatamente o tipo de duplicação documental que o projeto já identificou como dívida recorrente (`docs/governance/REPOSITORY_GOVERNANCE_AUDIT.md`). **Leitura obrigatória na próxima sessão**, ver §6.
2. Validação comercial concentrada em um único piloto ainda não confirmado.
3. Bus factor 1 — fundador único operando agência, produto e suporte.
4. Migração de infraestrutura prevista para novembro coincide com o pico sazonal da Jescri em dezembro.

## 6. Documentos de leitura obrigatória na próxima sessão

Além de `CLAUDE.md` §Documentos oficiais (lista padrão): os 4 documentos novos trazidos pelo merge, citados no risco #1 acima, **antes** de tocar em `docs/planning/` ou de iniciar a Macrofase A — para decidir se há conflito de conteúdo com o canon existente e evitar decidir duas vezes a mesma coisa.

## 7. IA recomendada para a próxima tarefa

- **Execução de engenharia/terminal** (deploy, scripts, provisionamento de infra): **ChatGPT**, por padrão, pela integração com terminal — salvo instrução em contrário do responsável do projeto.
- **Reconciliação de documentos/planejamento/auditoria:** **Claude**.
- **Design visual/UX:** sem recomendação padrão registrada ainda.

## 8. Prompt de handoff (modelo — `/comecar` preenche com o estado real no momento)

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §16 para o histórico do merge
da worktree-spec-mvp-completa). Leitura obrigatória antes de alterar
código: ver CLAUDE.md §Documentos oficiais.

Tarefa desta sessão: [preencher — vem da seção 3 acima]

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit.
```

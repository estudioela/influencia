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

O bloqueio documental que antes precedia esta tarefa foi resolvido nesta sessão (ver §2b) — nada mais pendente antes de iniciar a Macrofase A, exceto as pendências de decisão do responsável do projeto em §4.

## 2b. Consolidação documental concluída nesta sessão (2026-07-22)

Os 4 documentos trazidos pelo merge (§5 da versão anterior deste arquivo) foram reconciliados contra o canon de `docs/planning/`. Decisão de produto que destravava a consolidação: **CPF passa a ser suportado, conforme `BACKLOG_FUNCIONAL_V2_6.md` CD-01; HU-3.5 tratada como superada.** Detalhe completo em `docs/_workspace/TASK_ROUTER.md` §17.

- `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` — nova **fonte oficial** de especificação funcional (superset verificado de `ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md`, que foi arquivado).
- `docs/planning/BACKLOG_FUNCIONAL_V2_6.md` — **permanece** a única fonte vigente de backlog (CD-02/B-01 corrigidos para ✅ implementado).
- `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` — não tocado (altitude diferente, sem duplicidade).
- Arquivados em `docs/archive/consolidacao-mvp-completa/`: `ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md`, `BACKLOG_EXECUTIVO_MVP.md`, `PLANO_EXECUCAO_MVP.md`, `DECISAO_TAXONOMIA_MATERIAL_BRIEFING.md`.
- Referências cruzadas corrigidas em `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` e `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`.

## 4. Pendências / bloqueios (decisão do responsável do projeto)

- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no INPI.
- Credenciais reais de produção (Locaweb, Google Drive, SMTP) — nenhuma preenchida ainda.
- Decisão do que fazer com a branch remota `worktree-spec-mvp-completa` (arquivar/apagar) — já integrada via merge, sem urgência técnica.

## 5. Riscos ativos

1. Validação comercial concentrada em um único piloto ainda não confirmado.
2. Bus factor 1 — fundador único operando agência, produto e suporte.
3. Migração de infraestrutura prevista para novembro coincide com o pico sazonal da Jescri em dezembro.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais. Nenhuma leitura extra pendente — a dívida documental do risco #1 anterior foi encerrada nesta sessão.

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

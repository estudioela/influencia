# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **Branch:** `feat/ui-design-system-ela`
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — plano de lançamento comercial visando 15/01/2027
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — ainda não iniciada tecnicamente; sessão atual foi de due diligence de plano e correção de governança, não de execução de fase

## 2. Última sessão concluída (resumo)

- Auditoria técnica do MVP `tear-v2-app` (prontidão de Go-Live).
- Due diligence completa do Plano Mestre por painel de 9 especialistas de IA (Founder SaaS, CTO, Staff Engineer, PM, UX, Customer Success, Security/LGPD, FinOps/DevOps, Devil's Advocate).
- Audit Kit preparado e enviado a auditores externos (Manus, outra IA/CPO).
- 3 auditorias externas recebidas e consolidadas — ver `RELATORIO_CONSOLIDACAO_AUDITORIAS.md` (raiz do repo).
- **Implementado e validado (151/151 testes verdes):** consentimento LGPD explícito no nascimento do dado, no cadastro público de Parceira (antes só existia na edição).
- **Implementado:** contradição arquitetural Docker × Locaweb resolvida na documentação (`tear-v2-app/docs/DEPLOY.md` reescrito; `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` ajustado nos pontos normativos).
- **Investigada, não mesclada:** branch órfã `origin/worktree-spec-mvp-completa` — 16 commits, zero conflitos confirmados (`git merge-tree`), contém logística (`Envio`), cálculo automático de data de aprovação do briefing (RN-04) e campos contratuais em `Parceira`. Merge bloqueado pelo classificador de permissão (ação grande demais para a tarefa em curso) — ver `TASK_ROUTER.md` §16.

## 3. Próxima tarefa recomendada

1. **Decidir e, se autorizado, executar a integração de `worktree-spec-mvp-completa`** — maior ganho por esforço da fila hoje (código pronto e testado, só falta validar pós-merge contra o frontend atual).
2. Depois disso: iniciar de fato a Macrofase A do Plano Mestre (infraestrutura Locaweb — variáveis reais, banco gerenciado, SMTP, Google Drive).

## 4. Pendências / bloqueios (decisão do responsável do projeto)

- Merge de `worktree-spec-mvp-completa` — aguardando autorização explícita.
- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no INPI.
- Credenciais reais de produção (Locaweb, Google Drive, SMTP) — nenhuma preenchida ainda.

## 5. Riscos ativos (top 3)

1. Validação comercial concentrada em um único piloto ainda não confirmado.
2. Bus factor 1 — fundador único operando agência, produto e suporte.
3. Migração de infraestrutura prevista para novembro coincide com o pico sazonal da Jescri em dezembro.

## 6. IA recomendada para a próxima tarefa

- **Execução de engenharia/terminal** (merge de branch, deploy, scripts, correção de código): **ChatGPT**, por padrão, pela integração com terminal — salvo instrução em contrário do responsável do projeto.
- **Planejamento, auditoria, redação estratégica, síntese multi-fonte:** **Claude**.
- **Design visual/UX:** sem recomendação padrão registrada ainda — anotar aqui quando a primeira tarefa desse tipo surgir.

## 7. Prompt de handoff (modelo — `/comecar` preenche com o estado real no momento)

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md. Leitura obrigatória antes de
alterar código: ver CLAUDE.md §Documentos oficiais.

Tarefa desta sessão: [preencher — vem da seção 3 acima]

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit.
```

---
description: Inicia a sessão — lê o protocolo do projeto e reporta estado, próxima tarefa, pendências, riscos e IA recomendada.
---

Leia `docs/_workspace/ESTADO_SESSAO.md` (fonte única deste briefing) e, se precisar de mais profundidade em algum ponto, `CLAUDE.md` §Documentos oficiais e `docs/_workspace/TASK_ROUTER.md`.

Rode rapidamente `git status --short` e `git log --oneline -5` para confirmar que o estado descrito em `ESTADO_SESSAO.md` ainda bate com a realidade do repositório; se houver divergência óbvia (commits novos não refletidos, working tree sujo de forma inesperada), avise antes de prosseguir.

Reporte ao usuário, em formato compacto:

1. **Estado atual** (fase, branch, sistema em foco).
2. **Próxima tarefa recomendada.**
3. **Pendências/bloqueios** (o que depende de decisão do responsável do projeto).
4. **Riscos ativos.**
5. **Documentos obrigatórios** para a tarefa recomendada (citar a lista de `CLAUDE.md` §Documentos oficiais, sem duplicá-la).
6. **IA recomendada** para a próxima tarefa, seguindo a regra já registrada em `ESTADO_SESSAO.md` §6 (ChatGPT para engenharia/terminal por padrão, Claude para planejamento/auditoria, salvo instrução em contrário do usuário nesta sessão).
7. **Prompt de handoff pronto** — preencha o modelo de `ESTADO_SESSAO.md` §7 com a tarefa real recomendada, para o usuário copiar e colar em outra IA se for o caso.

Não releia o projeto inteiro nem reabra auditorias já concluídas — este comando é um briefing rápido, não uma nova investigação.

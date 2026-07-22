---
description: Encerra a sessão — atualiza docs/_workspace/ESTADO_SESSAO.md com o que foi feito, decidido, e o que fica pendente para a próxima sessão.
---

Encerramento de sessão. Faça, nesta ordem:

1. Levante o que mudou nesta sessão: `git status --short`, `git diff --stat`, e `git log --oneline` desde o início da sessão (ou desde o commit que `ESTADO_SESSAO.md` §1 registrava como mais recente, se ainda estiver visível no histórico da conversa).
2. Reúna, a partir da conversa desta sessão: decisões tomadas, arquivos alterados, commits feitos (se houver), tarefas concluídas, pendências novas ou resolvidas, riscos novos ou mitigados.
3. **Reescreva por completo** `docs/_workspace/ESTADO_SESSAO.md` (não acrescente ao final — é um snapshot, não um log histórico) mantendo a mesma estrutura de seções (Estado atual, Última sessão concluída, Próxima tarefa recomendada, Pendências/bloqueios, Riscos ativos, IA recomendada, Prompt de handoff), com os dados atualizados desta sessão.
4. Se algo desta sessão for uma decisão de arquitetura, de domínio, ou uma mudança de estado de SPEC relevante para o histórico de longo prazo (não só para o próximo `/comecar`), registre também uma entrada correspondente em `docs/_workspace/TASK_ROUTER.md`, seguindo a convenção já usada lá (seção datada, apenas acrescentada ao final) — `ESTADO_SESSAO.md` é o snapshot rápido, `TASK_ROUTER.md` continua sendo o histórico completo.
5. Não crie nenhum outro arquivo de encerramento (relatório de sessão, changelog avulso, etc.) — a atualização de `ESTADO_SESSAO.md` (e, quando aplicável, `TASK_ROUTER.md`) é suficiente.
6. Reporte ao usuário, em poucas linhas: o que foi atualizado e um resumo do que a próxima sessão deve fazer primeiro.

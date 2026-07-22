# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** preparação documental do Go-Live em andamento nesta sessão
  (branch dedicada `agente-b/go-live-runbook`, worktree isolado) —
  commit e push ao final desta sessão, ver §2.
- **Branch:** `feat/ui-design-system-ela` continua a branch de trabalho
  principal, working tree limpa até esta sessão.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — Go-Live interno,
  seguindo `docs/deployment/PLANO_DE_IMPLANTACAO.md`.
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — Etapa 1
  concluída (domínio `influencia.estudioela.com` travado); **Etapa 2
  parcialmente validada** (auditoria de painel feita na sessão anterior;
  validação via SSH ainda pendente de ação do responsável do projeto).
- **Testes:** sem alteração de código nesta sessão (só documentação) —
  última medição conhecida: backend 192/192 verdes, Pint limpo,
  `tsc -b`/`oxlint`/`vite build` do frontend limpos.

## 2. Última sessão concluída — preparação documental do Go-Live (2026-07-22)

Sessão dedicada (Agente B) a deixar a documentação do Go-Live pronta
"para o deploy começar imediatamente quando a auditoria terminar", sem
alterar código/arquitetura/deploy. Ver `docs/_workspace/TASK_ROUTER.md`
§25 para o detalhe completo. Resumo:

- `docs/deployment/PLANO_DE_IMPLANTACAO.md` ganhou uma seção nova de
  GO/NO-GO (ANTES/DURANTE/DEPOIS + critérios de GO/ABORT para o dia do
  corte) e um bloqueio ⚠ explícito nas Etapas 9/11 reconciliando-as com o
  achado da auditoria Locaweb (SSH por senha/temporário, "Git" = FTP) —
  decisão de arquitetura de deploy continua em aberto, não resolvida.
- 4 referências quebradas a `CONTRATO_SOBERANO.md` corrigidas (arquivo
  real está em `docs/history/`, não na raiz) e um caminho incompleto de
  `BackupDatabaseToDrive.php` corrigido.
- Novo `docs/governance/INVENTARIO_DOCUMENTAL.md` — status
  ativo/legado/redundante de toda a documentação de deployment/release.
- **Decisão explícita de escopo:** não foram criados os dois arquivos
  novos originalmente pedidos (`GO_LIVE_RUNBOOK.md`/
  `GO_NO_GO_CHECKLIST.md`) — `PLANO_DE_IMPLANTACAO.md` já cobria quase
  todo esse terreno; criar arquivos novos teria duplicado documentação
  (regra explícita de `CLAUDE.md`). Complementar o existente, não
  duplicar.

## 3. Sessão anterior — auditoria do painel Locaweb (2026-07-22)

Auditoria read-only completa do painel Locaweb (Central do Cliente +
Painel de Hospedagens), gerando `docs/deployment/AUDITORIA_LOCAWEB.md`.
Nenhuma configuração foi alterada (SSH não habilitado, nenhum banco/
domínio/SSL criado), por instrução explícita do responsável do projeto.

**Achados principais:**
- A conta Locaweb tem **duas hospedagens Linux ativas** —
  `elafashionmkt.com.br` (agência) e `estudioela.com` (alvo do TEAR) —
  mesmo plano (Hospedagem I Linux), sem custo adicional. A hospedagem
  correta para o TEAR já existe e é compatível, **sem necessidade de
  upgrade, migração ou novo serviço contratado**.
- Confirmado: PHP 8.3 ativo, PostgreSQL disponível (0/10 usados), Crontab
  nativo disponível, SSL Let's Encrypt gratuito. DNS de `estudioela.com`
  ainda não está apontado para a Locaweb.
- **Dois achados críticos** que corrigem premissas de
  `ARQUITETURA_PRODUCAO.md` §3 e `PLANO_DE_IMPLANTACAO.md` Etapa 2: (1)
  SSH vem desabilitado por padrão, sessão de 3h, renovação manual,
  autenticação por **senha** (não por chave); (2) "Publicar via Git" do
  painel não é deploy real — é só upload FTP, não executa comandos
  remotos. Isso afeta diretamente o workflow já commitado em
  `.github/workflows/tear-v2-deploy.yml`/`scripts/deploy-locaweb.sh`
  (Etapas 5/6 de sessão anterior), que presumia SSH automatizado por
  chave — precisa de revisão de estratégia de deploy antes da Etapa 6.
- `PLANO_DE_IMPLANTACAO.md` Etapa 2 atualizada com nota de status e
  ponteiro para o relatório. `TASK_ROUTER.md` §24 registra o histórico
  completo.
- Commit `22dc446` (docs only) já pushado. Nenhuma nova etapa da
  implantação foi iniciada, por instrução explícita do responsável do
  projeto nesta sessão.

## 4. Próxima tarefa recomendada

**Fechar a validação técnica da Etapa 2 de `PLANO_DE_IMPLANTACAO.md`:**
o responsável do projeto habilita o SSH no painel da hospedagem
`estudioela.com` (ação manual, válida por 3h) para permitir confirmar via
SSH: `php -v`, `which composer`, `crontab -l`, conexão de teste ao
PostgreSQL. Em paralelo — mas sem bloquear o item acima — decidir a
estratégia de deploy dado que SSH é temporário/por senha e o "Git" do
painel é só FTP (opções detalhadas em `AUDITORIA_LOCAWEB.md` §5, checklist
de decisão).

## 5. Pendências / bloqueios (decisão do responsável do projeto)

- Habilitar SSH no painel Locaweb para fechar a validação técnica da
  Etapa 2 (não pode ser feito pelo agente).
- Decidir a estratégia de deploy diante da limitação de SSH
  temporário/por senha e do "Git" ser só FTP (`AUDITORIA_LOCAWEB.md` §5).
- Apontar o DNS de `estudioela.com` para a Locaweb (Etapa 4 do plano,
  depende da Etapa 2 estar fechada).
- Preço do piloto externo (simbólico vs. real reduzido).
- Separação da marca do produto da marca da agência, antes do registro no
  INPI.
- Credenciais reais de produção (Google Drive, SMTP) — ainda não
  preenchidas.
- Decisão do que fazer com a branch remota `worktree-spec-mvp-completa`
  (arquivar/apagar) — já integrada via merge, sem urgência técnica.

## 6. Riscos ativos

1. Estratégia de deploy planejada (`ARQUITETURA_PRODUCAO.md` §3, symlink
   swap via SSH automatizado) esbarra na limitação real do painel Locaweb
   (SSH temporário/por senha) — risco novo desta sessão, precisa de
   decisão antes da Etapa 6.
2. Validação comercial concentrada em um único piloto ainda não
   confirmado.
3. Bus factor 1 — fundador único operando agência, produto e suporte.
4. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.

## 7. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais, mais
`docs/deployment/AUDITORIA_LOCAWEB.md` e a nova seção `## 3. GO/NO-GO`
de `docs/deployment/PLANO_DE_IMPLANTACAO.md` antes de retomar a Etapa 2
ou avançar para a Etapa 9/11 (bloqueio ⚠ ainda em aberto). Para o mapa de
qual documento é a fonte oficial de cada assunto, ver
`docs/governance/INVENTARIO_DOCUMENTAL.md` (novo).

## 8. IA recomendada para a próxima tarefa

- **Execução de engenharia/terminal** (deploy, scripts, provisionamento de
  infra): **ChatGPT**, por padrão, pela integração com terminal — salvo
  instrução em contrário do responsável do projeto.
- **Reconciliação de documentos/planejamento/auditoria:** **Claude**.
- **Design visual/UX:** sem recomendação padrão registrada ainda.

## 9. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §25 para a preparação
documental do Go-Live e §24 para a auditoria Locaweb). Leitura obrigatória
antes de alterar código: ver CLAUDE.md §Documentos oficiais.

Tarefa desta sessão: Etapa 2 de docs/deployment/PLANO_DE_IMPLANTACAO.md —
o responsável do projeto habilita SSH no painel Locaweb (hospedagem
estudioela.com); validar php -v, composer, crontab -l e conexão ao
PostgreSQL. Em paralelo, decidir a estratégia de deploy dado que SSH é
temporário/por senha e "Publicar via Git" do painel é só FTP (ver
docs/deployment/AUDITORIA_LOCAWEB.md §5 para as opções).

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit.
```

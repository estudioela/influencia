# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `22dc446` — commitado e **já pushado** para
  `origin/feat/ui-design-system-ela` (branch em dia com o remoto).
- **Branch:** `feat/ui-design-system-ela`, working tree limpa.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — Go-Live interno,
  seguindo `docs/deployment/PLANO_DE_IMPLANTACAO.md`.
- **Fase do Plano Mestre:** Macrofase A (Go Live interno) — Etapa 1
  concluída (domínio `influencia.estudioela.com` travado); **Etapa 2
  parcialmente validada** nesta sessão (auditoria de painel feita;
  validação via SSH ainda pendente de ação do responsável do projeto).
- **Testes:** sem alteração de código nesta sessão — última medição
  conhecida (sessão anterior): backend 192/192 verdes, Pint limpo,
  `tsc -b`/`oxlint`/`vite build` do frontend limpos.

## 2. Última sessão concluída — auditoria do painel Locaweb (2026-07-22)

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

## 3. Próxima tarefa recomendada

**Fechar a validação técnica da Etapa 2 de `PLANO_DE_IMPLANTACAO.md`:**
o responsável do projeto habilita o SSH no painel da hospedagem
`estudioela.com` (ação manual, válida por 3h) para permitir confirmar via
SSH: `php -v`, `which composer`, `crontab -l`, conexão de teste ao
PostgreSQL. Em paralelo — mas sem bloquear o item acima — decidir a
estratégia de deploy dado que SSH é temporário/por senha e o "Git" do
painel é só FTP (opções detalhadas em `AUDITORIA_LOCAWEB.md` §5, checklist
de decisão).

## 4. Pendências / bloqueios (decisão do responsável do projeto)

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

## 5. Riscos ativos

1. Estratégia de deploy planejada (`ARQUITETURA_PRODUCAO.md` §3, symlink
   swap via SSH automatizado) esbarra na limitação real do painel Locaweb
   (SSH temporário/por senha) — risco novo desta sessão, precisa de
   decisão antes da Etapa 6.
2. Validação comercial concentrada em um único piloto ainda não
   confirmado.
3. Bus factor 1 — fundador único operando agência, produto e suporte.
4. Migração de infraestrutura prevista para novembro coincide com o pico
   sazonal da Jescri em dezembro.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais, mais
`docs/deployment/AUDITORIA_LOCAWEB.md` (novo, gerado nesta sessão) antes
de retomar a Etapa 2 ou avançar para a Etapa 6 do
`PLANO_DE_IMPLANTACAO.md`.

## 7. IA recomendada para a próxima tarefa

- **Execução de engenharia/terminal** (deploy, scripts, provisionamento de
  infra): **ChatGPT**, por padrão, pela integração com terminal — salvo
  instrução em contrário do responsável do projeto.
- **Reconciliação de documentos/planejamento/auditoria:** **Claude**.
- **Design visual/UX:** sem recomendação padrão registrada ainda.

## 8. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e, para histórico/decisões
de SPEC, docs/_workspace/TASK_ROUTER.md (ver §24 para a auditoria Locaweb
desta sessão). Leitura obrigatória antes de alterar código: ver CLAUDE.md
§Documentos oficiais.

Tarefa desta sessão: Etapa 2 de docs/deployment/PLANO_DE_IMPLANTACAO.md —
o responsável do projeto habilita SSH no painel Locaweb (hospedagem
estudioela.com); validar php -v, composer, crontab -l e conexão ao
PostgreSQL. Em paralelo, decidir a estratégia de deploy dado que SSH é
temporário/por senha e "Publicar via Git" do painel é só FTP (ver
docs/deployment/AUDITORIA_LOCAWEB.md §5 para as opções).

Regras: não alterar arquitetura sem ADR; não criar documentação duplicada;
uma frente por vez; validar (testes/lint) antes de commit.
```

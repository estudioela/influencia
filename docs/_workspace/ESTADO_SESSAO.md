# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-22
- **HEAD:** `4f08601` — commitado e pushado nesta sessão
  (`origin/feat/ui-design-system-ela` em dia). Working tree com os mesmos
  3 arquivos não rastreados (`??`) de sessões anteriores, mantidos assim
  por instrução explícita do responsável do projeto:
  `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`.
- **Branch:** `feat/ui-design-system-ela`.
- **Sistema em foco:** `tear-v2-app/` (Laravel + React) — **o projeto mudou
  oficialmente de fase nesta sessão**. Mandato do responsável do projeto:
  encerra a fase "construir funcionalidades"; entra a fase "certificar o
  MVP e colocar em produção" (Go-Live). Nenhuma funcionalidade nova deve
  ser iniciada até o MVP estar online, salvo o que estiver diretamente
  vinculado ao checklist de Go-Live (ver §3).
- **Decisão arquitetural reconfirmada como encerrada:** banco relacional,
  PostgreSQL em produção — não reabrir estudo de alternativas (ex.:
  MongoDB) nesta fase.
- **Testes:** não alterados nesta sessão (nenhum código de aplicação
  tocado, só documentação). Última medição de qualidade segue a da sessão
  anterior — backend 198/198 verdes, Pint limpo; frontend `tsc -b`/
  `oxlint`/`vite build` limpos.

## 2. Última sessão concluída — Auditoria funcional completa + mudança oficial de prioridade para Go-Live (2026-07-22)

Sessão iniciada logo após o encerramento do backlog de certificação
funcional (sessão anterior, `TASK_ROUTER.md` §29-§31). Nesta sessão:

1. **Auditoria funcional completa por navegação real**, não só leitura de
   código — login e uso de verdade como ADMIN, GESTOR_MARCA e
   INFLUENCIADORA (via browser MCP), percorrendo Cadastro→Aprovação→
   Convite→Senha→Login→Participação→Briefing→Upload→Pagamento→
   Comprovante→Histórico→Congelamento→RBAC cruzado. Primeira tentativa de
   delegar a um agente em background retornou vazia (0 ações reais) e foi
   descartada; a segunda execução produziu achados concretos com
   evidência de código e tela.
2. **Logística/Envio testado ao vivo** — único módulo que nenhuma sessão
   anterior havia percorrido de verdade. Fluxo completo (criar envio,
   endereço lido da Parceira, PENDENTE→EXPEDIDO→ENTREGUE, RBAC
   `role:ADMIN`) funcionou sem nenhuma divergência. Fecha a última lacuna
   da certificação funcional do MVP.
3. **7 achados classificados** (Bug / Regra de Negócio Incompleta /
   Decisão de Produto Pendente / Problema de UX / Questão de
   Infraestrutura) — nenhum bloqueia o ciclo certificado:
   - F1/F2 (Infraestrutura, **bloqueiam produção**): upload de Material e
     de Comprovante de Pagamento retornam 503 — `GoogleDriveService`
     sem credenciais, sem fallback local. Já documentado em
     `PLANO_DE_IMPLANTACAO.md` Etapa 5 e `TEAR_V2.5_GO_LIVE_CHECKLIST.md`
     P0-9; esta sessão só reconfirmou ao vivo.
   - F3 (Infraestrutura, **bloqueia produção**): `MAIL_MAILER=log`, e-mail
     de convite não chega a ninguém real. Já documentado (Etapa 6);
     reconfirmado ao vivo.
   - F4 (Regra de Negócio Incompleta/Bug, não bloqueia): papel
     `GESTOR_MARCA` não funcional — filtros de posse só cobrem ADMIN/
     INFLUENCIADORA, gestor nunca vê nada. Fora do escopo do ciclo
     certificado (que não depende de GESTOR_MARCA); fica como Evolução.
   - F5 (Regra de Negócio Incompleta, não bloqueia): congelamento de
     Participação bloqueia só campos comerciais — Briefing pode ser
     criado/editado numa participação já congelada. Estreita o escopo da
     ratificação pendente já registrada em §29-§31.
   - F6 (Decisão de Produto Pendente, não bloqueia): Instagram sem
     validação de formato — pendência já conhecida, reconfirmada ao vivo.
   - F7 (Problema de UX, não bloqueia): sidebar rotula Briefings/
     Materiais/Aprovações/Pagamentos como "(em breve)" mesmo já sendo
     100% funcionais via drill-down Campanha→Participação.
4. **Conclusão da auditoria:** o núcleo de negócio (Cadastro→...→
   Histórico) está funcionalmente certificado — **nenhum bloqueador de
   lógica de aplicação resta**. Os únicos bloqueadores reais para colocar
   uma influenciadora real em produção são credenciais externas (Google
   Drive, SMTP) e infraestrutura de hospedagem já mapeada (Postgres na
   Locaweb, autenticação SSH do deploy, DNS, `restore-db.sh`, PR #62).
5. **Registro formal em `TASK_ROUTER.md` §32** (mandato de mudança de
   prioridade + todos os achados F1-F7 + fechamento de Logística),
   commit `4f08601`, pushado. Nenhum outro arquivo de encerramento criado
   (instrução explícita do responsável do projeto).
6. **Nova convenção de relatório de fim de etapa**, exigida pelo
   responsável do projeto para toda sessão a partir de agora, nesta fase
   de Go-Live: ao final de cada etapa de trabalho, reportar
   explicitamente (1) Concluído, (2) Bloqueadores (classificados Crítico/
   Alto/Médio/Baixo), (3) Próxima prioridade, (4) Checklist de Go-Live
   (`- [ ] Google Drive` / `SMTP` / `PostgreSQL` / `Deploy` / `HTTPS` /
   `DNS` / `Backup` / `Monitoramento` / `Piloto` / `MVP Online`). Todos os
   10 itens do checklist seguem **não concluídos** ao final desta sessão.

## 3. Próxima tarefa recomendada

**Destravar Prioridade 1 do checklist de Go-Live: Google Drive Service
Account.** É o bloqueador que afeta mais etapas do ciclo certificado
(Material + Comprovante de Pagamento). Requer decisão/acesso do
responsável do projeto, não é tarefa de engenharia pura:

1. Acesso ao Google Workspace `estudioela.com` + Google Cloud Console
   para seguir `docs/deployment/PLANO_DE_IMPLANTACAO.md` Etapa 5 (criar
   Shared Drive, habilitar API, criar Service Account, adicionar como
   Content Manager).
2. Extrair e entregar 4 valores: `GOOGLE_DRIVE_CLIENT_EMAIL`,
   `GOOGLE_DRIVE_PRIVATE_KEY`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`,
   `GOOGLE_DRIVE_BACKUP_FOLDER_ID`.

**Em paralelo, mesma prioridade (Prioridade 2 do checklist): SMTP** —
confirmar com a Locaweb o relay incluso no plano (Etapa 6 do mesmo
documento) ou decidir outro provedor.

**Só depois** (Prioridade 3): retomar infraestrutura de hospedagem
(PostgreSQL, deploy, DNS, backup, monitoramento — `TASK_ROUTER.md`
§27/§29, inalterados) e então o piloto com uma única influenciadora real.

Nenhuma nova funcionalidade deve ser iniciada antes disso, por mandato
explícito desta sessão (ver §1).

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Google Drive Service Account** — credencial que a IA não possui e
  não pode gerar. Bloqueia Material e Comprovante de Pagamento (503 real,
  confirmado ao vivo nesta sessão).
- **SMTP de produção** — credencial/decisão de provedor pendente.
  Bloqueia todo onboarding real de influenciadora (convite não chega).
- Definir estratégia de infraestrutura do PostgreSQL — bloqueante para a
  Etapa 3 do Go-Live (inalterado, várias sessões).
- Decisão real de autenticação de deploy (chave vs. senha vs. híbrido) —
  `ADR-016` não resolveu essa incompatibilidade (inalterado).
- DNS de `influencia.estudioela.com` não apontado (inalterado).
- Reconciliar PR #62 (conflitante) e a branch
  `worktree-agente-b-deploy-infra` não mesclada (inalterado).
- Decisão de recorrência/parcelamento de pagamento por Participação —
  não bloqueia o ciclo certificado, mas segue sem resposta (inalterado).
- Validação de formato do Instagram — decisão de produto pendente, não
  bloqueia (inalterado).
- Ratificação formal de 2 decisões já implementadas de fato pelo código
  (bloqueio de edição pós-congelamento — escopo mais estreito do que se
  pensava, ver F5; `FEED = carrossel_qtd`) — não bloqueiam, sem dono
  formal (inalterado).
- GESTOR_MARCA não funcional (F4) — não bloqueia o ciclo certificado;
  decisão de produto sobre se/quando esse papel deve funcionar de fato.
- Promover `docs/design/stitch-export/DESIGN.md` a fonte oficial de
  tokens (ADR-002) — simplificação documental pausada, baixa prioridade
  nesta fase de Go-Live.
- Preço do piloto externo; separação marca produto/agência antes do
  INPI; branch remota `worktree-spec-mvp-completa` — inalterados.

## 5. Riscos ativos

1. **Google Drive e SMTP não configurados** — enquanto pendentes, nenhum
   piloto real é possível: influenciadora não recebe convite, não
   consegue enviar material, equipe não registra comprovante (novo foco
   desta sessão, antes disperso em vários documentos).
2. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma do Go-Live (inalterado).
3. Pipeline de deploy com incompatibilidade de autenticação não resolvida
   — Go-Live falharia na primeira execução real se retomado sem correção
   (inalterado).
4. DNS de `influencia.estudioela.com` não apontado — bloqueia SSL/domínio
   de produção (inalterado).
5. Validação comercial concentrada em piloto único ainda não confirmado;
   bus factor 1; migração de infra prevista para novembro coincide com
   pico sazonal Jescri em dezembro (inalterados).

**Risco encerrado nesta sessão:** incerteza sobre lacunas na certificação
funcional — Logística/Envio era o único módulo nunca percorrido ao vivo;
testado nesta sessão, sem divergência. A certificação funcional do MVP
está, portanto, completa; o risco remanescente é só de infraestrutura/
credenciais, não de lógica de aplicação.

## 6. Documentos de leitura obrigatória na próxima sessão

Lista padrão de `CLAUDE.md` §Documentos oficiais. Para o estado da
certificação funcional e a mudança de prioridade desta sessão, ver
`docs/_workspace/TASK_ROUTER.md` §32. Para destravar Google Drive/SMTP,
ver `docs/deployment/PLANO_DE_IMPLANTACAO.md` (Etapas 5 e 6) e
`docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` (item P0-9). Para o
restante do Go-Live, `docs/deployment/AUDITORIA_LOCAWEB.md` e
`docs/adrs/ADR-016-composer-no-ci-deploy-manual.md`.

## 7. IA recomendada para a próxima tarefa

- **Obtenção de credenciais (Google Drive, SMTP) e decisões de
  infraestrutura:** responsável do projeto — não é tarefa de IA.
- **Configuração/validação técnica assim que as credenciais chegarem
  (preencher `.env` de produção, testar upload real, testar SMTP real,
  retomar deploy):** **ChatGPT**, por padrão, pela integração com
  terminal — salvo instrução em contrário.
- **Nova auditoria, QA final, ou relatório de status de Go-Live:**
  **Claude**, mesmo motivo das sessões anteriores.
- **A partir desta sessão, toda IA que assumir o projeto deve seguir a
  convenção de relatório de fim de etapa registrada em §2.6** (Concluído/
  Bloqueadores classificados/Próxima prioridade/Checklist de Go-Live).

## 8. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel+React), plano de
lançamento comercial em 15/01/2027. O projeto mudou oficialmente de fase
nesta sessão: sai de "construir funcionalidades" e entra em "certificar o
MVP e colocar em produção" (Go-Live). Estado e pendências completos em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e docs/_workspace/
TASK_ROUTER.md §32 (mandato de prioridade + auditoria funcional completa
desta sessão).

Estado: auditoria funcional completa executada por navegação real como
ADMIN/GESTOR_MARCA/INFLUENCIADORA, incluindo Logística/Envio (única
lacuna que faltava de sessões anteriores, agora fechada sem divergência).
Conclusão: o núcleo de negócio (Cadastro→Aprovação→Convite→Senha→Login→
Participação→Briefing→Upload→Aprovação→Logística→Pagamento→Histórico)
está funcionalmente certificado — nenhum bloqueador de lógica de
aplicação resta. Os únicos bloqueadores reais para produção são
credenciais externas (Google Drive Service Account, SMTP) e
infraestrutura de hospedagem já mapeada (PostgreSQL na Locaweb,
autenticação SSH do deploy, DNS, restore-db.sh, PR #62).

Tarefa desta sessão: destravar Google Drive (Prioridade 1 do checklist de
Go-Live) — precisa que o responsável do projeto acesse o Google Workspace/
Cloud Console (docs/deployment/PLANO_DE_IMPLANTACAO.md Etapa 5) e entregue
GOOGLE_DRIVE_CLIENT_EMAIL/_PRIVATE_KEY/_ROOT_FOLDER_ID/_BACKUP_FOLDER_ID.
Em paralelo, confirmar SMTP de produção (Etapa 6). Só depois retomar
infraestrutura de hospedagem e o piloto com uma única influenciadora
real. Nenhuma funcionalidade nova deve ser iniciada antes do MVP estar
online, por mandato explícito do responsável do projeto.

Regras: não alterar arquitetura sem ADR; banco permanece relacional
(PostgreSQL), não reabrir estudo de alternativas; não criar documentação
duplicada; uma frente por vez; validar (testes/lint) antes de commit;
toda sessão nesta fase deve reportar ao final: Concluído / Bloqueadores
(Crítico/Alto/Médio/Baixo) / Próxima prioridade / Checklist de Go-Live
(ver ESTADO_SESSAO.md §2.6).
```

# ESTADO_SESSAO.md — Protocolo Operacional do Projeto

> Reescrito por `/fim` ao final de cada sessão; lido por `/comecar` no início
> da próxima. É o **cockpit** — snapshot curto e sempre atual. Não duplica
> histórico: para decisões de SPEC e histórico completo, ver
> `docs/_workspace/TASK_ROUTER.md`; para fases/calendário do negócio, ver
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`; para a lista de leitura
> obrigatória antes de alterar código, ver `CLAUDE.md` §Documentos oficiais.

## 1. Estado atual

- **Data desta atualização:** 2026-07-23
- **HEAD de `feat/ui-design-system-ela`:** `955bb83`, sincronizado com
  `origin/feat/ui-design-system-ela`.
- **Branch:** `feat/ui-design-system-ela`.
- **Working tree:** limpo, exceto os mesmos 3 arquivos `??` de sessões
  anteriores, intocados por instrução explícita (destino ainda não
  decidido): `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`,
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`.
- **Sistema em foco:** `tear-v2-app/` (Laravel 13 + React), fase de
  Certificação do MVP concluída nesta sessão.
- **PR #66 (`fix/pagamento-gate-pago` → `feat/ui-design-system-ela`):
  MERGEADO** (merge commit `99b5f6a`, CI verde). A correção do único bug
  Categoria A (gate de material aprovado contornável em Pagamentos,
  commit `4138c04`) está de fato em vigor na branch principal de
  trabalho.
- **Verificado nesta sessão em `955bb83`:** backend 208/208 testes
  verdes, `vendor/bin/pint --test` limpo, `tsc -b` (frontend) limpo.

## 2. Última sessão concluída — Retomada pós-interrupção: PR #66 confirmado mergeado, MVP certificado funcionalmente (2026-07-23)

Continuação da sessão de QA/Auditor Técnico do §38 do `TASK_ROUTER.md`
(interrompida por limite mensal de uso do Claude, retomada como Agente B).
Não foi uma nova auditoria — verificação de estado do trabalho já
entregue e produção da documentação final de certificação pendente.

1. **Verificação do PR #66:** ao contrário do que o snapshot anterior
   registrava ("aguardando merge"), o PR já estava **mergeado**
   (`99b5f6a`) quando esta sessão retomou o trabalho — merge feito fora
   desta sessão, entre a interrupção e a retomada.
2. **Descoberta de trabalho adicional não documentado:** a branch tinha
   avançado mais dois commits depois do merge, de uma sessão paralela:
   `bb44d20` (corrige consentimento LGPD ausente no cadastro/convite de
   Parceira, achado por reprodução manual no navegador) e `955bb83`
   (implementa Histórico do Portal, RF-028 — fecha a última etapa do
   ciclo de negócio certificável definido em `TASK_ROUTER.md` §32).
   Registrado em `TASK_ROUTER.md` §40.
3. **Verificação de regressão:** suíte completa do backend, `pint` e
   `tsc` rodados nesta sessão contra o HEAD atual (`955bb83`) — todos
   verdes, sem regressão introduzida pelo merge nem pelos dois commits
   acima.
4. **Entrega:** `docs/reports/CERTIFICACAO_MVP.md` — parecer técnico
   formal respondendo "o MVP está funcionalmente certificado?" com
   **sim**, para o critério de demonstração a cliente (não confundir com
   autorização de Go-Live de produção, gate separado e ainda **não
   autorizado** em `docs/release/GATE_FINAL_GO_LIVE.md`, que depende só
   de itens de infraestrutura externos ao código).
5. **Missão do Agente B nesta frente (QA/Homologação/Certificação)
   encerrada** — não há mais tarefa pendente de auditoria funcional do
   ciclo core; próximos passos são decisão do responsável do projeto (ver
   §3).

## 3. Próxima tarefa recomendada

Não há tarefa de QA/certificação pendente nesta frente. Decisão do
responsável do projeto entre:

1. **Seguir para a frente de infraestrutura/Go-Live**
   (`docs/release/GATE_FINAL_GO_LIVE.md`, `docs/deployment/
   CHECKLIST_GO_LIVE.md`, `docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md`)
   — hoje **NÃO AUTORIZADO**, bloqueado só por itens de infraestrutura
   externa (SSH real da Locaweb, PostgreSQL de produção, DNS/TLS,
   `.env` de produção, SMTP em ambiente real). Nenhum bloqueador de
   código.
2. **Ampliar a auditoria funcional a fluxos secundários** não cobertos
   ainda (Marcas, Medidas) antes de avançar ao Go-Live — mesma
   recomendação já registrada em sessões anteriores, ainda não decidida.
3. Reproduzir manualmente o fluxo de **Login** isolado no navegador —
   único item do ciclo core sem reprodução manual dedicada registrada
   (auditorias de código não encontraram bug; ver `CERTIFICACAO_MVP.md`
   §5). Baixa prioridade — não bloqueia a certificação.

Ver `docs/reports/CERTIFICACAO_MVP.md` (parecer completo desta sessão),
`docs/_workspace/TASK_ROUTER.md` §40 (esta sessão), §38/§37 (auditorias
de origem) e §32 (mandato de Certificação do MVP).

## 4. Pendências/bloqueios (decisão do responsável do projeto)

- **Nenhum bloqueador funcional (Categoria A) em aberto** — o único
  identificado (gate de Pagamento) foi corrigido e mergeado.
- **Categoria B (compromete robustez/segurança/concorrência/manutenção,
  não bloqueia a certificação funcional):**
  - `Pagamento.valor` editável mesmo com `status=PAGO`, sem trava nem
    auditoria de quem alterou.
  - Pagamento e cancelamento de Participação não se checam mutuamente
    (dá pra pagar uma participação cancelada, ou cancelar uma já paga).
  - Campanha `ENCERRADA`/`CANCELADA` continua 100% editável (inclusive
    reabrindo status ou trocando marca).
  - Participação pode ser criada numa Campanha já `ENCERRADA`/`CANCELADA`.
  - `PagamentoController` sem `DB::transaction`/lock — mesma classe de
    race condition já corrigida em `ParceiraController::aprovar`, ainda
    não replicada aqui.
  - `StoreParceiraRequest`/`UpdateParceiraRequest` sem unicidade de
    e-mail entre Parceiras — colisão só é detectada tarde, ao aprovar
    (já tratado com 422 claro, mas depois de o admin investir tempo
    revisando a candidata).
  - Mensagens de erro genéricas no frontend de Login não distinguem
    429/5xx de credenciais inválidas.
  - `/login` sem rate-limit por e-mail (só por IP).
  - `CadastroPublicoController::store()` não trata `QueryException` de
    nome duplicado em requisições concorrentes (TOCTOU) — exige duas
    requisições simultâneas para se manifestar.
  - Usuário sem nenhuma role atribuída recebe o `AppShell` administrativo
    completo no frontend — hoje não existe fluxo de produto que crie
    `User` sem role.
  - `email` não é normalizado (trim) em `StoreParceiraRequest`, ao
    contrário de nome/telefone/CNPJ/CEP.
- **Categoria C (pode esperar, decisão de produto em aberto):**
  - Congelamento (`congelado_em`) é decorativo fora dos campos
    comerciais da própria Participação — não bloqueia Briefing, Material
    nem Envio. Escopo real de "congelar" nunca foi formalmente definido.
  - `reenviarConvite` não distingue parceira já ativa de uma que nunca
    definiu senha (reenvia "boas-vindas" mesmo para conta já em uso).
  - Item de menu "Logística" no `AppShell.tsx` é um `<PlaceholderPage>`
    desabilitado — Envio só é alcançável por drill-down de Campanha
    (funcional, rótulo enganoso).
  - `GESTOR_MARCA` não funcional, validação de formato Instagram, rótulo
    "(em breve)" na sidebar — não bloqueiam o ciclo certificado.
- Destino dos 3 relatórios `docs/reports/*.md` (`??` há múltiplas
  sessões) não decidido.
- Validação ponta a ponta dos 2 fluxos reais de e-mail (convite, reset)
  com o SMTP real — ainda não executada (item de infraestrutura).
- SPF/DKIM/DMARC do domínio `elafashionmkt.com.br` não verificados.
- Limite diário de envio do plano Locaweb não levantado.
- `MAIL_FROM_NAME=TEAR` diverge da marca usada no corpo dos e-mails
  ("ELÃ | influência") — configurado deliberadamente, não alterar sem
  decisão do responsável do projeto.
- Recorrência/parcelamento de pagamento não implementado (`Pagamento` é
  estritamente 1:1 com `ParticipacaoNaCampanha`) — limitação de escopo
  conhecida, não bug.
- `tear-v2-app/docs/CONFIGURACAO_PRODUCAO.md` linha ~164 — item de
  checklist ainda cita "TVs and Limited Input devices" (Google Drive,
  abandonado) — não confirmado se foi corrigido.
- Estrutura fixa de pastas do Google Drive vs. estrutura dinâmica real
  em produção — decisão de produto pendente.
- `docs/deployment/GOOGLE_DRIVE_RECOVERY.md` — não iniciado.
- Dois OAuth Clients "Web application" órfãos no Cloud Console
  (cosmético).
- Estratégia de infraestrutura do PostgreSQL, autenticação de deploy
  (ADR-016), DNS de `influencia.estudioela.com`, PR #62 vs.
  `worktree-agente-b-deploy-infra` — inalterados desde sessões
  anteriores (ver `docs/release/GATE_FINAL_GO_LIVE.md`,
  `docs/deployment/CHECKLIST_GO_LIVE.md` para o gate completo de infra).

## 5. Riscos ativos

1. PostgreSQL indisponível no plano atual da Locaweb — impacto em
   custo/cronograma (inalterado).
2. Pipeline de deploy com incompatibilidade de autenticação não resolvida
   (inalterado).
3. DNS de `influencia.estudioela.com` não apontado (inalterado).
4. Validação comercial concentrada em piloto único ainda não confirmado;
   bus factor 1 (inalterado).
5. SPF/DKIM/DMARC não verificados no domínio de envio — risco de spam em
   volume real, ainda não avaliado (inalterado, baixo risco imediato).
6. **Mitigado (sessão anterior, confirmado nesta):** o gate de material
   aprovado do fluxo de Pagamentos (regra `P0-1`) tinha um desvio trivial
   (pular direto para `PAGO`) que permitia liberar pagamento sem entrega
   aprovada — corrigido no commit `4138c04`, **agora em vigor na branch
   principal** (merge `99b5f6a` confirmado nesta sessão).

## 6. IA recomendada para a próxima tarefa

- **Decisão de seguir para infraestrutura/Go-Live ou ampliar
  auditoria:** decisão do responsável do projeto, não requer IA.
- **Reprodução manual do fluxo de Login no navegador:** qualquer IA com
  acesso a ferramenta de browser (Claude com Chrome/Playwright MCP,
  ChatGPT com navegador) — tarefa mecânica e curta.
- **Continuação da frente de infraestrutura/Go-Live (se decidido):**
  Claude, mesmo agente que já mantém `docs/deployment/` e
  `docs/release/GATE_FINAL_GO_LIVE.md`.
- **Auditoria de fluxos secundários (Marcas, Medidas), se decidido:**
  Claude, mesmo motivo das sessões anteriores (volume de fluxos,
  necessidade de cruzar com `docs/specs/`/`docs/PRD.md`).
- Toda sessão nesta fase de Go-Live segue reportando ao final: Concluído
  / Bloqueadores (Crítico/Alto/Médio/Baixo) / Próxima prioridade /
  Checklist de Go-Live (convenção registrada em sessões anteriores).

## 7. Prompt de handoff

```
Contexto: projeto ELÃ | influência (tear-v2-app, Laravel 13+React), branch
feat/ui-design-system-ela, HEAD 955bb83. Estado completo em
docs/_workspace/ESTADO_SESSAO.md (leia primeiro) e docs/_workspace/
TASK_ROUTER.md §40 (esta sessão), §38/§37 (auditorias de origem), §32
(mandato de Certificação do MVP).

Estado: a fase de Certificação Funcional do MVP foi CONCLUÍDA nesta
sessão. PR #66 (gate de Pagamento, bug Categoria A) confirmado mergeado
(99b5f6a). Suíte verificada em 955bb83: backend 208/208, pint limpo, tsc
limpo. Parecer técnico completo em docs/reports/CERTIFICACAO_MVP.md —
resposta: MVP funcionalmente certificado (critério de demonstração a
cliente), sem confundir com autorização de Go-Live de produção (gate
separado, docs/release/GATE_FINAL_GO_LIVE.md, hoje NÃO AUTORIZADO por
itens de infraestrutura externa).

Tarefa desta sessão: nenhuma pendente de QA/certificação. Próxima sessão
deve receber decisão do responsável do projeto entre (1) avançar para a
frente de infraestrutura/Go-Live, (2) ampliar a auditoria a fluxos
secundários (Marcas, Medidas), ou (3) reproduzir manualmente o fluxo de
Login isolado (baixa prioridade, não bloqueia).

Regras: não alterar arquitetura sem ADR; não criar documentação
duplicada; uma frente por vez; validar (testes/lint) antes de commit;
reportar ao final: Concluído / Bloqueadores (Crítico/Alto/Médio/Baixo) /
Próxima prioridade / Checklist de Go-Live.
```

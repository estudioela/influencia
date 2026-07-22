# Reconciliação — Especificação Funcional × Implementação Real (`tear-v2-app`)

- **Data:** 2026-07-22
- **Escopo:** exclusivamente `tear-v2-app/` (Laravel + React), branch `feat/ui-design-system-ela`.
- **Objetivo:** não é uma nova análise nem substitui `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` (2026-07-20) — lista **só as divergências** entre esse documento e o estado real do código hoje, verificadas por leitura direta (migrations/models/controllers/rotas/testes), não por inferência de outro documento.
- **Não implementa nada novo** — só reconcilia documentação com código já existente (parte do backlog de `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`, item P1 "Reconciliar o próprio texto do spec funcional").
- **Fora desta tabela:** itens onde a especificação e o código já concordam (ex.: recorrência de pagamento, validação de formato do Instagram, Contratos/Produtos/Assessorias/Métricas/Permutas/Portal da Marca não implementados) — não são divergência, são pendências reais já documentadas em `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` §9 e não repetidas aqui.

---

## Tabela de divergências

| Módulo | Especificação atual | Implementação atual | Status | Evidência | Ação recomendada |
|---|---|---|---|---|---|
| Portal da Influenciadora — Campanhas/Briefing/Materiais/Pagamento | §2, §4.2: "❌ inexistente" para as 4 telas; só Perfil/Dashboard funcionais | As 4 telas implementadas e funcionais, com isolamento entre influenciadoras coberto por teste automatizado | Especificação desatualizada | `frontend/src/pages/portal/PortalCampanhasListPage.tsx`, `PortalParticipacaoPage.tsx`; `backend/tests/Feature/PortalIsolamentoTest.php` | Atualizar especificação |
| RFC-07 — Envio de material pelo próprio Portal | §2, §4.2, §8 (P0): rota "ainda `role:ADMIN`-only" | `POST /participacoes/{participacao}/materiais` sem `role:ADMIN`; autorização por Policy (dono da participação ativa OU ADMIN) | Especificação desatualizada | `backend/routes/api.php`; `backend/app/Http/Controllers/Api/MaterialController.php::store`; teste `MaterialTest::test_dona_da_participacao_ativa_pode_enviar_material` | Atualizar especificação |
| Congelamento de Participação (`congelado_em`) | §2, §3.3, §8 (P0): "❌ inexistente"; mecanismo só "proposto, não implementado" | Coluna `congelado_em` existe; `ParticipacaoNaCampanha::congelar()`; `ParticipacaoController::congelar`/`update` bloqueia edição de campos comerciais após congelamento (HTTP 409) | Especificação desatualizada | Migration `2026_07_20_180000_add_congelado_em...`; `backend/app/Models/ParticipacaoNaCampanha.php`; `backend/app/Http/Controllers/Api/ParticipacaoController.php` | Atualizar especificação |
| Edição após congelamento (bloquear vs. permitir-com-auditoria) | §3.3, §9 (#2): "as duas opções foram levantadas e nenhuma foi escolhida" | Código já implementa uma das duas opções (bloqueio total, HTTP 409, sem trilha de auditoria) — decisão foi tomada de fato pela implementação, não formalizada como decisão consciente de produto | Parcial | `ParticipacaoController::update` (bloco `CAMPOS_COMERCIAIS` + 409) | Decisão de produto — ratificar (ou reverter) a escolha já implementada; depois atualizar especificação |
| Vínculo estrutural Material↔Briefing + vocabulário unificado | §2, §3.4, §3.9: "ausente"; "não há mapeamento 1:1 entre os dois enums"; bloqueia Portal de Materiais | FK `briefing_id` em `materiais`; `Material.tipo` sempre derivado do `Briefing` vinculado (fora do fillable); enums unificados (`FEED/REELS/STORIES/TIKTOK/UGC`) | Especificação desatualizada | Migration `2026_07_20_190000_add_briefing_id_to_materiais_table.php`; `backend/app/Models/Material.php` | Atualizar especificação |
| RBAC de leitura granular (admin) | §2, §8 (P0): "toda rota GET administrativa exige só `auth:sanctum`, sem checar papel/posse" | Toda rota GET usa `$this->authorize('view'\|'viewAny', ...)` contra Policy real, com `Gate::before` liberando ADMIN e Policies restringindo os demais papéis por posse; coberto por teste | Especificação desatualizada | `AppServiceProvider.php` (`Gate::before`); `app/Policies/*`; `tests/Feature/RbacIsolamentoTest.php`, `PortalIsolamentoTest.php` — verificado nesta sessão (196/196 verde antes de qualquer mudança) | Atualizar especificação |
| Comprovante de pagamento | §2, §3.10, §9 (#12): "gap total, sem nenhuma decisão prévia"; formato ainda a definir | Implementado nesta sessão: `POST /pagamentos/{pagamento}/comprovante` (upload PDF/imagem via `GoogleDriveService`, mesma abstração de Materiais), campo `comprovante_url` exposto, UI no admin (upload/link) e no Portal (link somente leitura) | Especificação desatualizada (era gap real até este momento; resolvido nesta sessão) | Commit `fabd5c1`; `PagamentoController::comprovante`; `PagamentoResource` | Atualizar especificação |
| Locale das mensagens de validação | §2, §6: "`APP_LOCALE=en` é bug de produto ativo hoje" | `config('app.locale')` default é `pt_BR` (`env('APP_LOCALE', 'pt_BR')`), mesmo em `.env.example`/`.env.production.example` | Especificação desatualizada | `backend/config/app.php:83` | Atualizar especificação |
| `FEED` reaproveita `carrossel_qtd` | §3.4, §9 (#3, parcial): "levantado em 3 documentos, sem resposta" — tratado como decisão em aberto | Código já assume a resposta implicitamente, com decisão registrada em comentário de domínio: não existe coluna `feed_qtd`; `FEED` sempre lê de `carrossel_qtd` | Parcial | `ParticipacaoNaCampanha::quantidadeContratadaPara()` (comentário: "FEED generaliza o Carrossel da V1 — não há coluna própria de feed") | Decisão de produto — ratificar formalmente a escolha já implementada; depois atualizar especificação |
| Deduplicação/normalização de nome de Parceira | §3.1: "MVP usa só `unique()` de banco sobre `nome`, sem normalização" | `NomeParceiraUnico` (comparação case-insensitive via `LOWER()`, nome normalizado em `prepareForValidation()`) já implementado, reaproveitado em Store/Update | Especificação desatualizada | Commit `9824b7b`; `backend/app/Rules/NomeParceiraUnico.php` | Atualizar especificação |
| `POST /parceiras/cadastro` administrativo sem `authorize()` | §3.1, §9: "qualquer autenticado cria Parceira" (`AUDITORIA_MODELO_DADOS_TEAR_V2.md` §2.1) | Rota `POST /parceiras` tem `middleware('role:ADMIN')` **e** `ParceiraController::store` chama `$this->authorize('create', Parceira::class)`; coberto por teste dedicado | Especificação desatualizada (achado nunca foi reproduzido nesta sessão — parece ter confundido a rota pública `/parceiras/cadastro`, intencionalmente sem `authorize()`, com a administrativa `/parceiras`) | `backend/routes/api.php`; `ParceiraController::store`; `ParceiraTest::test_usuario_sem_role_admin_nao_pode_criar_parceira` (verde) | Atualizar especificação |

---

## O que segue igual (não é divergência, só lembrete de pendência real)

Sem mudança de status — confirmado que especificação e código ainda concordam, cada um já registrado em `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` §9:

- Recorrência/parcelamento de pagamento (schema ainda 1:1 estrito) — decisão de produto, maior alavancagem pendente.
- Validação de formato do Instagram — campo ainda texto livre, sem regra definida.
- Contratos, Produto/Variante/Estoque, Assessorias, Métricas de perfil, Permutas, Portal da Marca (`GESTOR_MARCA`), importação do histórico legado — nenhum implementado, todos por decisão de escopo já aceita.
- Trilha de auditoria polimórfica (hoje `historico_alteracoes` só cobre Parceira, não Participação/Pagamento).

## Certificação funcional do MVP — leitura objetiva

Com as divergências acima corrigidas na especificação, **o núcleo operacional do MVP (Cadastro → Aprovação → Campanha → Participação → Briefing → Material → Aprovação → Pagamento, incluindo o Portal completo da Influenciadora) está funcionalmente conforme e testado** — nenhum dos itens desta tabela representa um bloqueador de código, só documentação desatualizada a favor do sistema.

O que efetivamente falta para "certificar" o MVP não é código, é **decisão de produto** — restam 2 decisões de maior alavancagem sem resposta:

1. Recorrência/parcelamento de pagamento por Participação.
2. Validação de formato do Instagram (item de menor impacto, mas também aberto).

Mais duas decisões já foram tomadas **de fato** pela implementação, sem ratificação formal (linhas "Parcial" acima) — recomenda-se ratificá-las explicitamente para fechar o gap entre "o sistema já decide" e "o responsável do projeto decidiu conscientemente".

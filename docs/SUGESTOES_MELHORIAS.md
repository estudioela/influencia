# Sugestões de melhoria — registradas, não aplicadas

> Levantadas na revisão geral de 2026-07-08 (rotas quebradas, código morto, inconsistências frontend/backend, links antigos, fluxos duplicados).
>
> **Nada aqui foi executado.** A tarefa desta sessão era corrigir dois problemas de produção e realinhar a documentação — não refatorar. Este arquivo existe para que o achado não se perca; **não é um plano aprovado**, e nenhum item deve ser aplicado sem decisão do usuário.
>
> Governança: na `main`, o `CLAUDE.md` §11 (MODO MANUTENÇÃO) proíbe refatorar por iniciativa própria. Está em curso, em branch separada (`docs/v2-realinhamento`), uma emenda que adiciona uma §12 autorizando refatoração dentro de `mae/`, `test/` e `docs/` para o escopo da V2. **Se essa emenda entrar na `main`, os itens de "Higiene" abaixo passam a ser elegíveis**; os de "Produto" continuam exigindo decisão explícita, e os de "Risco" tocam arquivos do usuário fora do repo.
>
> Não duplica fonte de verdade: cada item aponta para `CLAUDE.md` / `FLOW.md` / `SYSTEM_TRUTH.md` / código real. Roadmap da V2: `docs/V2_ROADMAP.md`.

## Legenda

- **Risco** — pode causar incidente se não tratado.
- **Higiene** — não quebra nada hoje; reduz confusão futura.
- **Produto** — mudança de comportamento; exige decisão do usuário.

---

## 1. Risco — `mae_backup_antes_clasp/` tem um `.clasp.json` de produção

Diretório não versionado na raiz, com `.clasp.json` apontando para o **mesmo `scriptId` de produção** e uma cópia antiga do código (`Código.js` com 40 KB contra 49 KB atuais). Um `clasp push` executado de dentro dele sobrescreveria o Apps Script ao vivo com código defasado.

É reincidência exata do incidente de 2026-07-05 documentado no `CLAUDE.md` §6 (“projeto clasp duplicado na raiz”).

**Sugestão:** mover para fora do repositório (ex.: `~/Backups/`), como já foi feito com as pastas `_backup_*`. Exige confirmação do usuário — é backup dele, não meu.

## 2. Risco — `mae/PortalUi.js` é duplicata não versionada de `mae/PortalUi.gs`

Arquivos byte-a-byte idênticos (mesma função `abrirPortalModal()`). Resíduo de um `clasp pull` — o arquivo no Apps Script se chama `PortalUi`, e o `clasp` o materializa como `.js`.

Hoje é inofensivo porque `mae/.claspignore` é uma allowlist e só inclui `PortalUi.gs`. Mas os dois colidiriam no mesmo arquivo remoto se a allowlist mudasse.

**Sugestão:** apagar o arquivo local (zero perda: idêntico a um arquivo versionado). Não apaguei por não ter sido eu quem o criou.

## 3. Higiene — código morto comprovado

| Função | Local | Situação |
|---|---|---|
| `include()` | `mae/WebApp.js:147` | `doGet` usa `createTemplateFromFile('Index')`, mas `Index.html` não tem nenhum scriptlet `include(...)`. Helper padrão inerte. |
| `createOnOpenTrigger()` | `mae/Código.js:167` | Zero referências. Não é item de menu nem ponto de entrada. |
| `configurarTokenQAHeadless()` | `mae/QaShadow.js:99` | Escrita para `clasp run`, que **não funciona** neste projeto (`CLAUDE.md` §6). |
| `rodarQaShadowAgoraHeadless()` | `mae/QaShadow.js:107` | idem |
| `executarPendenciasQAHeadless()` | `mae/QaShadow.js:118` | idem |
| `instalarTriggersSchemaExporterHeadless()` | `mae/SchemaExporter.js:126` | idem |

As quatro `*Headless` são inacessíveis **por decisão consciente** (esperam `clasp run`), não por acidente. `include()` e `createOnOpenTrigger()` são morte real.

**Sugestão:** remover `include()` e `createOnOpenTrigger()`; manter as `*Headless` com um comentário no topo dizendo que dependem de `clasp run` estar funcional.

## 4. Higiene — URL da BrasilAPI duplicada

`https://brasilapi.com.br/api/cep/v1/` aparece em `mae/Código.js:858` (`onFormSubmit`) e `mae/Código.js:908` (`preencherEnderecoPorCEP`).

**Sugestão:** extrair para uma constante no topo de `Código.js`, junto de `SETUP`.

## 5. Higiene — comentário mente sobre a sessão

`mae/Index.html`, bloco `STATE`, diz literalmente *“ESTADO GLOBAL (em memória, nunca localStorage/sessionStorage)”*. Mas `persistirSessao()` (`mae/Index.html:941`) grava token e nome no `localStorage`, e `tentarRestaurarSessao()` os lê de volta.

O comportamento (persistir) é intencional e correto — o comentário é que ficou obsoleto e induz a erro quem for auditar segurança.

**Sugestão:** corrigir o comentário.

## 6. Produto — `ajustes` é um status sobrecarregado

`finalizarEnvioResumable()` grava `STATUS_CONTEUDO = "ajustes"` ao receber um upload; a UI exibe isso como **“Em aprovação”**. Mas `ajustes` é também o termo natural para “a equipe pediu correções”.

Consequência: **não há como distinguir**, pelo status, “material recebido, ainda não revisado” de “material reprovado, refazer”. A reprovação acontece fora do sistema (WhatsApp).

Restrição real: a célula tem validação de dados que aceita só 5 valores (`em aberto`, `falta drive`, `aprovado`, `ajustes`, `postado`). Um valor novo exige mexer na validação da planilha viva — não é mudança só de código.

**Sugestão (V2):** discutir com o usuário a introdução de um valor `em revisão` distinto de `ajustes`. Ver `FLOW.md`, seção `STATUS_CONTEUDO`.

## 7. Produto — `falta drive` existe na validação e nunca é usado

Nenhuma função grava esse valor. `normalizarStatusAtivacao()` o mapeia para `AGUARDANDO_MATERIAL` (via a substring `"falta"`).

**Sugestão:** decidir se ganha uso ou sai da validação da célula.

## 8. Produto — editar CEP no Portal não recalcula o endereço

`updatePerfil()` (`mae/WebApp.js:569`) grava `CEP`, `NUMERO`, `COMPLEMENTO`, mas **não** recalcula `RUA`/`BAIRRO`/`CIDADE`/`UF` nem `INFLUENCIADORA_ENDERECO`.

O preenchimento automático por CEP vive em `onEdit()` (`mae/Código.js:293`), um trigger que **não dispara para escritas feitas por script**. Resultado: a influenciadora troca o CEP no Portal e o endereço de entrega dos looks continua o antigo, sem aviso a ninguém.

**Sugestão:** chamar `preencherEnderecoPorCEP()` de dentro de `updatePerfil()` quando o CEP mudar. É a única sugestão desta lista que corrige um comportamento **errado** hoje, e por isso é a de maior prioridade — mas altera escrita em `BASE DE DADOS`, zona que o `CLAUDE.md` §11 exige aprovação explícita para tocar.

## 9. Higiene — `getPerfil()` devolve `telefone` sempre vazio

`mae/WebApp.js:546` retorna `telefone: ""` fixo. Nenhuma coluna de telefone é lida. O front-end não exibe o campo.

**Sugestão:** remover o campo do contrato, ou ligá-lo a uma coluna real.

## 10. Higiene — branches `dev` e `staging` 27 commits atrás

Ambas apontam para `e041ea0`, muito atrás de `main`. Não são usadas por nenhum fluxo de deploy (produção sai de `main` → `clasp` e de `pages-portal` → GitHub Pages).

**Sugestão:** ressincronizar ou deletar. Não existe ambiente de staging de verdade hoje (ver `docs/V2_ROADMAP.md` P4).

## 11. Higiene — GitHub Pages usa `build_type: legacy`

O build legado do commit `68c50de` ficou preso em `building` por ~3 dias (2026-07-06 → 2026-07-08), sem erro reportado, enquanto o deployment ao vivo seguia servindo o commit anterior. Foi assim que a rota `/jescri-cadastro/` respondeu 404 mesmo estando commitada.

Um `git push` novo destravou. Mas o modo legado não avisa quando trava — falha silenciosa em produção.

**Sugestão:** migrar para o build via GitHub Actions (`build_type: workflow`), que expõe status e logs por execução.

---

## Não fazer (registrado para evitar retrabalho)

- **Não implementar `mode=cadastro`** em `doGet()`. O cadastro tem um fluxo só (Google Form). Ver `FLOW.md`, “FLOW: Cadastro de nova influenciadora”, nota de 2026-07-08.
- **Não migrar** para Supabase / Postgres / Next.js nesta fase — decisão do usuário em 2026-07-08, registrada em `NEXT_AGENT.md` e `docs/V2_ROADMAP.md`.
- **Não “consertar”** `clasp run`. Investigado a fundo em 2026-07-05; a conta é editora, não dona do script. Ver `CLAUDE.md` §6.

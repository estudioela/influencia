# UI Final Review — Design System Estúdio Elã (Fase 3)

> Revisão de validação da branch `feat/ui-design-system-ela` (PR #40) antes do
> merge. Não altera código — apenas relata achados, conforme solicitado.

## 0. Método e limitação declarada

Esta revisão foi feita por **leitura de código e análise estática do CSS**
(`src/ui/portal-head.html` + as 12 páginas), incluindo o rastreamento manual
do algoritmo de quebra de linha do flexbox para os pontos onde o layout
depende dele. **Não houve captura de tela / renderização real**: a extensão
Claude em Chrome não está conectada neste ambiente, e o repositório não tem
Puppeteer/Playwright para screenshot headless. O `npm run preview` foi
iniciado e a estrutura HTML servida foi conferida, mas nenhum pixel foi
inspecionado visualmente.

Isso significa: os achados abaixo marcados como **"confirmado por CSS"** são
consequências determinísticas da especificação do flexbox (alta confiança,
não dependem de screenshot). Os achados marcados como **"requer conferência
visual"** são hipóteses que só um teste em navegador real confirma ou
descarta. Recomendo tratar a Seção 4 como checklist mínimo de
`npm run preview` antes do merge.

## 1. Status geral

**Necessita ajustes antes do merge.**

Nenhum bloqueador de arquitetura, segurança ou regra de negócio — os fixes de
segurança feitos durante a Fase 3 (escape de HTML) seguem válidos e não foram
tocados aqui. Os achados desta revisão são de **consistência visual e
navegação**, concentrados em `financeiro.html` e no padrão de nav aninhada
usado em 10 das 12 páginas. Nenhum é um retrabalho estrutural; todos cabem
dentro do escopo já aprovado da Fase 3 (CSS/markup, sem tocar
`google.script.run`).

## 2. Página por página

| Página | Status | Observações |
|---|---|---|
| `login.html` | ✅ OK | Único caso sem nav aninhada nem botão Sair — não sofre o problema da Seção 4.1. 4 painéis com `paper-panel`, hierarquia clara. |
| `dashboard.html` | ⚠ Ajuste | Nav aninhada + Sair → ver 4.1. KPI único (`kpiPendencias`) num `kpi-grid` de 1 card fica com bastante espaço vazio ao lado em telas largas (`amplo` + `auto-fit minmax(220px,1fr)` gera 1 card esticado ou pequeno dependendo da largura — conferir). |
| `admin.html` | ✅ OK | Nav simples (wordmark + Sair, sem sub-nav) — o único par que respeita a mecânica do flexbox sem quebra estranha. Hierarquia contexto→pendências→ação→ferramentas bem aplicada, consistente com o handoff. |
| `perfil.html` | ⚠ Ajuste | Nav aninhada + Sair → ver 4.1. Fora isso, página de menor risco, bem alinhada ao DS (inputs underline, `alert info` para aviso de endereço). |
| `briefing.html` | ⚠ Ajuste | Nav aninhada (link único) + Sair → ver 4.1. Fix de escape confirmado (uso de `createElement`). |
| `entrega.html` | ⚠ Ajuste | Idem briefing. Badges de estado sem diferenciação de cor (ver 4.3). |
| `envio.html` | ⚠ Ajuste | Idem. Painel de confirmação de endereço corretamente migrado para `paper-panel` (não é mais `pre` solto). |
| `financeiro.html` | ⚠ Ajuste (mais achados) | Nav aninhada **incompleta** — falta link "Meu perfil" (ver 4.2). Seletor de competência **fora de qualquer `paper-panel`/form**, único caso na base (ver 4.2). `<main>` sem `class="amplo"` apesar de ter `kpi-grid` + tabela de 5 colunas (ver 4.2). |
| `pagamentos.html` | ⚠ Ajuste | Nav aninhada + Sair → ver 4.1. Painel de mensagem de cobrança substitui bem o `window.prompt` antigo. Badges sem cor por estado (ver 4.3). |
| `pendencias.html` | ⚠ Ajuste | Idem 4.1. Bom uso de `empty-state` e `fieldset` por item. |
| `compilar-mes.html` | ⚠ Ajuste (menor) | Idem 4.1. Lista de colaborações sem `empty-state` para zero itens (único caso divergente — ver 4.4). |
| `documentos.html` | ⚠ Ajuste | Idem 4.1. Rename de `id="resultado"` → `resultadoDocumento` confirmado, sem colisão com o padrão legado. |

## 3. Design System

**Tokens** — únicos, centralizados em `portal-head.html` `:root`; nenhuma cor,
fonte ou espaçamento hardcoded encontrado nas 12 páginas migradas. ✅

**Tipografia** — Fraunces (display, fallback de IvyPresto) + Inter (corpo)
carregadas uma única vez e aplicadas de forma consistente; `h1` minúsculo via
`text-transform` (assinatura Elã) presente em todas as páginas. ✅

**Componentes** — uso consistente de `paper-panel`/`fieldset`, `kpi-grid`,
`badge`, `empty-state`, `eyebrow`+`wordmark`+`.sub` no cabeçalho de toda
página (12/12). Dois idiomas de "card" coexistem sem estarem documentados
como variantes intencionais:
- `.item-lista` — linha compacta (admin/cadastros, compilar-mes/colaborações).
- `fieldset` (estilizado como `paper-panel`) — card multi-campo com ações
  inline (briefing, entrega, envio, pendencias, pagamentos).

Ambos fazem sentido dado o conteúdo (linha simples vs. formulário inline),
mas nada no DS registra essa distinção — vale uma nota futura para quem for
criar a próxima página não reinventar um terceiro padrão.

**Consistência** — cabeçalho (`eyebrow`/`h1`/`sub`) e posição do `#mensagem`
logo após o header são 100% uniformes nas 12 páginas. O ponto fora da curva é
`financeiro.html` (Seção 4.2).

## 4. Riscos antes do merge

### 4.1 Nav aninhada + botão Sair — provável quebra em 3 linhas (confirmado por CSS, requer conferência visual)

Afeta 10 de 12 páginas (todas exceto `login.html` e `admin.html`).

O padrão introduzido nesta fase é:

```html
<nav>
  <span class="wordmark">tear v2</span>
  <nav> <!-- links --> </nav>
  <button id="sair" class="secundario">Sair</button>
</nav>
```

com a regra já existente em `portal-head.html` (linha 123):
`nav nav { width: 100%; margin: 0; padding: 0; border: 0; }`.

Rastreando o algoritmo de quebra de linha do flexbox (`nav` é
`display:flex; flex-wrap:wrap`): o `wordmark` cabe na linha 1; a `nav`
interna pede 100% da largura do container — não cabe no espaço restante da
linha 1 e quebra sozinha para a linha 2, ocupando-a inteira; o botão Sair,
declarado depois no DOM, não encontra espaço na linha 2 (já 100% ocupada) e
quebra para uma linha 3, onde fica sozinho, empurrado para a direita por
`margin-left:auto`.

Resultado esperado em desktop: 3 linhas — wordmark isolado, linha de links,
e "Sair" isolado à direita numa linha própria com bastante espaço vazio à
esquerda. Isso é uma consequência determinística da spec (não é uma
suposição), mas **não foi confirmada com pixels reais** porque não havia
navegador disponível nesta sessão para screenshot.

Duas hipóteses: (a) é o resultado pretendido (3 blocos empilhados) e está
tudo bem; (b) é um efeito colateral não intencional do reuso da regra
`nav nav { width: 100% }` — criada na Fase 1 pensando em outro layout — ao
ser combinada com um botão *depois* da nav aninhada no DOM. Peço conferência
visual (`npm run preview`, ex. `?pagina=portal-perfil` em desktop ≥1024px)
antes do merge. Se for indesejado, a correção é de markup/CSS (ex.: mover o
botão Sair para antes da `<nav>` aninhada, ou usar `order` no flex) — não
requer ADR nem toca `google.script.run`.

### 4.2 `financeiro.html` destoa do padrão das outras 3 páginas do Portal da Parceira

Comparando as 4 páginas do Portal (`dashboard`, `perfil`, `pendencias`,
`financeiro`): cada uma linka para as outras 3 — exceto `financeiro.html`,
cuja nav aninhada só tem `linkInicio` e `linkPendencias`, **sem link para
"Meu perfil"**. É a única quebra desse padrão nas 12 páginas.

Além disso, o seletor de competência (`<label for="periodo">` + `<select
id="periodo">`) é o único filtro de toda a aplicação que não está dentro de
um `<form>`/`paper-panel` — fica solto entre o header e o `kpi-grid`, sem o
card com hairline que toda outra tela de filtro usa (compare com o `#filtro`
de `pagamentos.html` ou o `#busca` de `entrega.html`/`envio.html`).

Por fim, `financeiro.html` é a única página com `kpi-grid` que não usa
`class="amplo"` no `<main>` (compare com `admin.html` e `dashboard.html`),
apesar de também ter uma tabela de 5 colunas (`#historico`) que se beneficiaria
do container mais largo antes de precisar do scroll horizontal.

### 4.3 Badges de estado sem diferenciação de cor

Em `entrega.html`, `envio.html`, `pagamentos.html` e `pendencias.html`, o
`.badge.micro` usado para mostrar o estado (`aguardando material`, `em
revisão`, `aprovado`, `publicado`, `em aberto`, `pago` etc.) é sempre o mesmo
badge neutro cinza — não há cor por estado. Pode ser a intenção "quiet
luxury" do DS Elã (evitar sinalização tipo semáforo), mas reduz a
escaneabilidade em telas operacionais com listas longas, onde a equipe
precisa identificar rapidamente o que precisa de ação. Não é um bug, é uma
decisão de UX que vale confirmar como intencional.

### 4.4 `compilar-mes.html` sem estado vazio

`listar()` não trata o caso de `colaboracoes.length === 0`: o `<div
id="colaboracoes">` simplesmente fica vazio, sem a mensagem `.empty-state`
que todas as outras páginas de listagem mostram. Baixa severidade (a
compilação de mês normalmente sempre gera colaborações para parceiras
ativas), mas é uma inconsistência com o padrão estabelecido nas outras 11
páginas.

## 5. Recomendação final

**Necessita ajustes antes do merge.**

Nenhum dos achados é arquitetural, de segurança ou de regra de negócio — os
quatro pontos da Seção 4 são ajustes de CSS/markup dentro do escopo já
aprovado da Fase 3. Sugiro, antes do merge de PR #40:

1. Conferir visualmente (`npm run preview`) o comportamento da nav aninhada
   em pelo menos uma página do Portal e uma da Equipe, em desktop — decidir
   se o resultado de 3 linhas (4.1) é aceitável ou pede ajuste de markup.
2. Corrigir `financeiro.html`: adicionar o link "Meu perfil" à nav, envolver
   o seletor de competência num `paper-panel`, e avaliar `class="amplo"` no
   `<main>` (4.2).
3. Confirmar se a ausência de cor nos badges de estado (4.3) é intencional.
4. Opcional/baixa prioridade: `empty-state` em `compilar-mes.html` (4.4).

Nada aqui foi corrigido nesta revisão, conforme solicitado — aguardando sua
aprovação para qualquer commit.

# Prompt para Claude Chat / Claude Design — Manual de Uso da Plataforma Jescri

> **Como usar:** abra uma conversa nova no Claude, anexe o arquivo `docs/BRIEFING_MANUAL_USUARIO.md` e cole o prompt abaixo (tudo dentro do bloco). O briefing contém todos os fatos verificados; o prompt diz o que fazer com eles.

---

## Prompt (copiar a partir daqui)

Você vai produzir um **manual de uso profissional, visual e completo** de uma plataforma de gestão de campanhas de marketing de influência (Estúdio Elã / Jescri).

Anexei o arquivo `BRIEFING_MANUAL_USUARIO.md`. Ele foi extraído diretamente do código-fonte do sistema e **é sua única fonte de verdade**.

### Regras invioláveis

1. **Não invente nada.** Se uma funcionalidade não está no briefing, ela não existe. Leia a **seção 12 ("O que NÃO existe")** antes de escrever qualquer capítulo — ela lista funcionalidades que um manual típico teria e que este sistema **não tem** (métricas, relatórios, botão de aprovar/reprovar, notificações, recuperação de senha, área de gestor no Portal).
2. **Não desenhe telas que não existem.** O Portal tem exatamente 7 telas, descritas na seção 5. O ERP não tem telas — tem um menu dentro de uma Planilha Google e duas sidebars (seção 6).
3. **Copie literalmente** as mensagens de erro, os nomes de menu, os nomes de aba e os 5 valores de status que o briefing traz entre aspas ou crases. São strings reais do produto.
4. Se algo estiver marcado **[NÃO VERIFICADO]** no briefing, ou omita, ou trate como nota de rodapé — nunca como fato.
5. Nas capturas/mockups, use **apenas dados fictícios** (ex.: "MARIA EXEMPLO", cupom `MARIA10`, CNPJ e PIX mascarados).

### Público e estrutura

O manual atende **dois públicos distintos** e deve ser organizado em **trilhas visualmente separadas**:

- 👤 **Trilha da Influenciadora** — usuária leiga, no celular, usa o Portal web. Linguagem simples, zero jargão, zero menção a "planilha", "aba" ou "coluna".
- 🏢 **Trilha da Equipe** — operação da Jescri, no desktop, trabalha dentro da Planilha Google. Pode citar abas e colunas, sempre em `monoespaçado`.
- ⚙️ **Parte de Administração** — ferramentas técnicas e operações irreversíveis.

Siga **exatamente a ordem de capítulos da seção 14 do briefing** (28 capítulos, em 5 partes). Não reordene.

### Conteúdo obrigatório

Cada capítulo de procedimento deve ter:
- um parágrafo curto de contexto ("para que serve / quando fazer");
- **passo a passo numerado**, um verbo de ação por passo;
- o **resultado esperado** ao final ("você deve ver…");
- os callouts pertinentes;
- a figura sugerida, marcada como placeholder (ver abaixo).

**Os cinco pontos que mais causam erro e precisam de destaque máximo** (não os dilua no texto corrido):
1. 🚨 *"Iniciar Novo Mês"* **apaga toda a aba BRIEFING** antes de recriá-la. Sempre gerar o mês **antes** de escrever os briefings. Rodar duas vezes destrói o trabalho.
2. ⚠️ Marcar `postado` ou `pago` **arquiva a linha**: ela desaparece da aba viva e vai para o histórico. Não é bug.
3. ⚠️ Uma influenciadora recém-cadastrada nasce **`OFF` e sem cupom** — não recebe tarefas e não consegue fazer login até a equipe ativá-la e preencher o cupom + as quantidades de conteúdo.
4. 🧠 **Não existe botão de aprovar/reprovar.** Aprovação é digitar um dos 5 valores permitidos na célula `STATUS_CONTEUDO`. E `aprovado` não dispara nada — conteúdo e pagamento são camadas independentes.
5. ⚠️ Alterar o **CEP pelo Portal não recalcula** rua/cidade/UF; o endereço de entrega dos looks continua o antigo até a equipe redigitar o CEP na planilha.

### Sistema de callouts (use estes cinco, com consistência)

| Ícone | Rótulo | Quando |
|---|---|---|
| 🚨 | Perigo — irreversível | Iniciar Novo Mês; Limpar Histórico Oficial |
| ⚠️ | Atenção | Arquivamento automático; armadilha do CEP |
| 💡 | Dica | Ordem correta das operações |
| 🧠 | Entenda o porquê | Independência conteúdo × pagamento; por que `ajustes` aparece como "Em aprovação" |
| 🔐 | Segurança | Regra da senha; sair em dispositivo compartilhado |

### Figuras

Para **cada** figura, insira um placeholder no formato:

```
[FIGURA N — <tipo: diagrama | captura de tela | tabela ilustrada>]
Título: <título da figura>
Descrição para o ilustrador: <o que deve aparecer, com que rótulos>
Legenda: <texto que vai sob a figura no manual>
```

Produza, no mínimo, as **8 figuras e diagramas** listados na seção 13.2 do briefing. Os três indispensáveis:
- **Máquina de estados do conteúdo** — 4 caixas (`em aberto` → `ajustes` → `aprovado` → `postado`), cada uma com dois rótulos: *valor na planilha* e *o que a influenciadora vê no app*; a seta final marcada como "arquiva".
- **Linha do tempo do ciclo mensal** — da geração do mês ao arquivamento.
- **Cálculo do prazo de entrega** — mini-calendário mostrando "−7 dias" e a seta empurrando sexta/sábado/domingo para a segunda-feira.

Onde um diagrama for simples (árvore de pastas do Drive, tracker de pagamento em 3 etapas, mapa de navegação), **desenhe-o em ASCII/Markdown direto no texto**, além de sugerir a versão ilustrada.

### Identidade visual

Use a paleta e a tipografia reais do produto (seção 15 do briefing):
- Vinho `#8f0002` (primária), `#bc0004` (ênfase), fundo rosé `#fdf8f8`, superfície `#f1edec`, texto `#1c1b1b`, erro `#ba1a1a`.
- **EB Garamond** (serifada) nos títulos, **Archivo Narrow** (condensada) em rótulos/legendas, **Inter** no corpo.
- A marca escreve em **caixa baixa** — títulos de capítulo podem seguir essa estética; o corpo usa capitalização normal.
- Muito espaço em branco. Rodapé com capítulo + ícone da trilha.
- **Acessibilidade:** nunca comunicar status apenas por cor; contraste mínimo AA.

### Tom

Cordial, direto, segunda pessoa ("você"). Frases curtas. Nada de linguagem corporativa vazia. Na trilha da influenciadora, explique como se ela nunca tivesse usado o sistema; na trilha da equipe, assuma familiaridade com planilhas, mas não com programação.

### Tratamento especial: o capítulo de "relatórios"

O sistema **não tem** módulo de métricas ou relatórios. Não invente um. Escreva o capítulo como **"Como acompanhar resultados hoje"**, cobrindo (a) os totais *previsto no mês* / *pago no mês* que o Portal exibe, (b) o uso da própria Planilha Google (filtros, ordenação, tabela dinâmica) sobre as abas de histórico, e (c) uma declaração explícita de que não existe dashboard.

### Entregáveis

1. O **manual completo**, em Markdown, com todos os capítulos da seção 14 do briefing e os placeholders de figura.
2. Dois **anexos de uma página** cada:
   - *Cartão de bolso da influenciadora* — como entrar, o que cada uma das 4 pills de status significa, como enviar material.
   - *Checklist do ciclo mensal* — a ordem correta das operações da equipe, com caixas de marcar.
3. Um **glossário** (ativação, briefing, formato, cupom, `INFLU_KEY`, arquivamento, `ON`/`OFF`).

Comece confirmando, em até 5 linhas, o que entendeu do escopo e quais funcionalidades **não** vai documentar por não existirem. Depois produza o manual.

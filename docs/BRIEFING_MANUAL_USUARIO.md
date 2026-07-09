# Briefing — Manual de Uso da Plataforma Jescri / Influência 360º

> **Para quem é este documento:** é insumo para outra IA (Claude Chat / Claude Design) produzir o manual final do usuário. Não é o manual.
>
> **Origem dos dados:** leitura direta do código-fonte em `mae/` (commit `d323ae2`, deploy Apps Script `@37`) + testes ao vivo das URLs públicas, em 2026-07-08. Tudo o que está aqui foi verificado no código ou por requisição real. O que não pôde ser verificado está marcado como **[NÃO VERIFICADO]**.
>
> **Regra de ouro para quem for escrever o manual:** não invente funcionalidade. A seção 12 (“O que NÃO existe”) é obrigatória de ler antes de escrever qualquer capítulo. Vários itens que um manual típico teria (relatórios, métricas, botão de aprovar) **não existem neste sistema**.

---

## 1. Objetivo da plataforma

O sistema gerencia o ciclo mensal de campanhas de marketing de influência do Estúdio Elã / Jescri: da entrada de uma influenciadora no cadastro até o pagamento pelo conteúdo publicado.

Ele resolve quatro problemas operacionais:

1. **Planejamento mensal** — gerar, de uma vez, todas as tarefas do mês (quantas peças de conteúdo cada influenciadora deve entregar, quanto vai receber, o que precisa ser enviado pelo correio).
2. **Briefing** — comunicar a cada influenciadora o que ela precisa produzir, com prazos calculados automaticamente.
3. **Coleta de entregas** — receber os arquivos de conteúdo (fotos/vídeos) direto no Google Drive, organizados por influenciadora / mês / formato.
4. **Financeiro e logística** — controlar o status de pagamento (PIX) e o rastreio dos looks enviados.

**Arquitetura em uma frase:** uma Planilha Google é o banco de dados; um Google Apps Script coloca dois rostos sobre essa planilha — um menu de ERP para a equipe e um Portal web para as influenciadoras.

---

## 2. Público-alvo

O manual precisa falar com dois públicos muito diferentes, e isso deve estruturar o documento inteiro:

| Público | Quem é | Contexto de uso | Nível técnico |
|---|---|---|---|
| **Equipe Jescri / Elã** (gestão) | Operação, financeiro, logística | Desktop, dentro da Planilha Google | Confortável com planilhas; não é programador |
| **Influenciadoras** (parceiras) | Criadoras de conteúdo contratadas | Celular, navegador, fora da planilha | Leiga; usa o Portal como se fosse um app |

A influenciadora **nunca vê a planilha**. A equipe **quase nunca usa o Portal** (só pode abri-lo num modal para conferência).

---

## 3. Perfis de usuário e níveis de acesso

Existem exatamente **dois perfis**, e eles são separados por *ferramenta*, não por permissão dentro de um mesmo app.

### 3.1 Equipe (ERP)
- **Como acessa:** abrindo a Planilha Google `[JESCRI] INFLUÊNCIA 360º` com uma conta que tenha permissão de edição na planilha.
- **Autenticação:** é a própria conta Google. Não há login separado, não há senha do sistema, não há papéis/roles.
- **Poder:** total. Vê e edita todas as abas, de todas as influenciadoras. Roda todas as funções do menu, inclusive as irreversíveis.
- **Não há distinção** entre “administrador” e “operador”. Quem edita a planilha pode fazer tudo.

### 3.2 Influenciadora (Portal)
- **Como acessa:** `https://portal.estudioela.com` (ou a URL `/exec` do Apps Script diretamente).
- **Autenticação:** cupom + senha (ver seção 8.2).
- **Poder:** só enxerga os próprios dados. Toda função do Portal recebe o token de sessão, resolve o cupom → `INFLU_KEY`, e filtra as linhas por essa chave. Tentar acessar a ativação de outra pessoa retorna `ACESSO_NEGADO`.
- **Pode escrever apenas:** 5 campos do próprio perfil (chave PIX, e-mail, CEP, número, complemento) e o envio de arquivos de material.

> **Callout importante para o manual:** o Portal **não tem área de gestor**. Existe no código um objeto `appState.permissions` com todas as permissões fixas em `true` — é um esqueleto sem uso, não um sistema de papéis.

---

## 4. Estrutura completa da aplicação

### 4.1 Componentes

```
Planilha Google "[JESCRI] INFLUÊNCIA 360º"   ← banco de dados único
        │
        ├── Projeto Google Apps Script (scriptId 1fE8w10O…)
        │     ├── Código.js          → ERP: menu, automações (onEdit/onFormSubmit), ciclo mensal
        │     ├── WebApp.js          → Portal: doGet + funções chamadas pelo front-end
        │     ├── Index.html         → Portal: SPA completa (HTML+CSS+JS num arquivo)
        │     ├── PortalUi.gs        → abre o Portal num modal dentro da planilha
        │     ├── SidebarBackend.js  → backend das 2 sidebars do ERP
        │     ├── Sidebar.html / SidebarPagamento.html
        │     ├── SchemaExporter.js  → gera documentação viva do schema
        │     └── QaShadow.js        → testes E2E sem tocar produção
        │
        ├── Google Drive             → arquivos de material enviados pelas influenciadoras
        ├── Google Form              → formulário público de cadastro → aba CADASTROS
        └── API BRComerce            → rastreio de encomendas
```

### 4.2 As 9 abas da planilha (nomes exatos, com acento)

| Aba | Papel | Quem escreve |
|---|---|---|
| `BASE DE DADOS` | Cadastro-mestre das influenciadoras. Coluna A = `ON`/`OFF` (ativa no ciclo). | Equipe + `onFormSubmit` + Portal (perfil) |
| `CADASTROS` | Respostas cruas do formulário público. | Google Form |
| `BRIEFING` | O que cada influenciadora produz no mês (looks, textos por formato, datas de aprovação). | Equipe + `gerarNovoMesCompleto` + `sincronizarLooks` |
| `FLUXO LOGÍSTICO` | Envio físico dos looks (endereço, rastreio, status). | Equipe + `atualizarRastreiosBRComerce` |
| `ATIVAÇÕES` | Uma linha por peça de conteúdo a entregar. **Coração do sistema.** | `gerarNovoMesCompleto` + equipe + Portal (upload) |
| `PAGAMENTOS` | Uma linha por pagamento previsto. | `gerarNovoMesCompleto` + sidebar + equipe |
| `HISTÓRICO DE CONTEÚDOS` | Ativações concluídas (arquivadas). | `arquivarGenerico` |
| `HISTÓRICO DE PAGAMENTOS` | Pagamentos efetivados (arquivados). | `arquivarGenerico` |
| `HISTÓRICO LOGÍSTICO` | Envios entregues (arquivados). | `arquivarGenerico` |

Além dessas, o Portal detecta dinamicamente **abas de histórico legado** (qualquer aba com `INFLU_KEY` no cabeçalho e cujo nome contenha “HISTÓRICO”, ou cujo cabeçalho tenha `MES_REFERENCIA` + `STATUS_CONTEUDO`/`STATUS_PAGAMENTO`).

### 4.3 Colunas que o manual precisa citar

**`BASE DE DADOS`** (as que aparecem em fluxo de usuário): coluna A (`ON`/`OFF`), `INFLU_KEY` (nome-chave, maiúsculas), `CUPOM` (login), `INFLUENCIADORA_CNPJ` (origem da senha), `INFLUENCIADORA_RAZAO_SOCIAL`, `EMAIL`, `CHAVE_PIX`, `VALOR_TOTAL`, `REELS_TEXTO`, `CARROSSEL_TEXTO`, `STORIES_TEXTO` (quantidades), `CEP`, `RUA`, `NUMERO`, `COMPLEMENTO`, `CIDADE`, `UF`, `INFLUENCIADORA_ENDERECO`, `PASTA_DRIVE_LINK`, `INFLU_SHEET_URL` (planilha de looks da influenciadora).

**`ATIVAÇÕES`**: `ID` (UUID), `INFLU_KEY`, `MES_REFERENCIA`, `ANO_REFERENCIA`, `FORMATO`, `STATUS_CONTEUDO`, `DATA_ATIVACAO` (data de postagem), `DATA_APROVACAO` (prazo de entrega), `LINK_ARQUIVO`.

**`PAGAMENTOS`**: `INFLU_KEY`, `MES_REFERENCIA`, `ANO_REFERENCIA`, `VALOR_TOTAL`, `CHAVE_PIX`, `STATUS_PAGAMENTO`, `DATA_PAGAMENTO`, `MENSAGEM_PIX`.

> ⚠️ **Regra estrutural:** todas as colunas são resolvidas **pelo nome do cabeçalho**, nunca pela posição. Renomear um cabeçalho quebra o sistema silenciosamente. Reordenar colunas é seguro.

---

## 5. Descrição de cada tela — Portal (influenciadora)

O Portal é uma SPA (single-page app) de 7 telas dentro de um único arquivo. Visual mobile-first, tudo em **caixa baixa** (o CSS força `text-transform: lowercase` em inputs, botões e vários títulos).

Quatro telas têm barra de navegação inferior; três não (`sem-nav`).

---

### Tela 1 — Login (`#tela-login`) · sem nav

**Função:** autenticar a influenciadora.

**Componentes:**
- Marca: título `jescri` (fonte serifada EB Garamond) + subtítulo `portal de influenciadoras`.
- Campo `cupom` — texto, auto-maiúsculas, sem autocomplete.
- Campo `senha` — password, teclado numérico (`inputmode="numeric"`).
- Mensagem de erro inline (some ao redigitar).
- Botão primário `entrar` com ícone de seta.

**Mensagens de erro reais (copiar literalmente no manual):**
| Situação | Texto exibido |
|---|---|
| Campo vazio | “Preencha cupom e senha.” |
| Cupom ou senha errados | “Cupom ou senha inválidos.” |
| 5 tentativas erradas | “Muitas tentativas. Aguarde 15 minutos e tente novamente.” |
| Falha inesperada | “Não foi possível entrar. Tente novamente.” |

---

### Tela 2 — Pendências (`#tela-pendencias`) · **tela inicial após login** · com nav

**Função:** listar as ativações do mês selecionado.

**Componentes:**
- Saudação `olá, <primeiro nome>` + subtítulo `suas ativações do mês`.
- **Seletor de mês**: botão ◀, rótulo do período, botão ▶. Navega apenas entre períodos que **realmente têm dados** para aquela influenciadora (mais recente primeiro). Meses sem dados não aparecem.
- **Lista de cards**, um por ativação: formato (REEL / CARROSSEL / STORIES), campanha (mês + ano), data de entrega, data de postagem, e uma **pill de status** colorida.
- Estado vazio e estado “carregando…”.

**As 4 pills de status** (é o vocabulário que a influenciadora vê):

| Pill | Significado para a influenciadora |
|---|---|
| `Aguardando material` | Nada foi enviado ainda. Ação necessária. |
| `Em aprovação` | Material enviado, equipe está revisando. |
| `Aprovado` | Equipe aprovou. Aguardando a data de postagem. |
| `Publicado` | Ciclo encerrado (aparece no Histórico). |

Tocar num card abre o Briefing daquela ativação.

---

### Tela 3 — Briefing (`#tela-briefing`) · sem nav

**Função:** mostrar o que produzir naquela peça específica.

**Componentes:**
- Botão voltar (← para Pendências) + título.
- Bloco **“resumo do mês”** — texto geral da campanha. **Só aparece se estiver preenchido** na planilha.
- Faixa de 4 tags: mês, formato, `entrega: dd/mm/aaaa`, `postagem: dd/mm/aaaa`.
- Corpo do briefing: o texto específico do formato. Se não houver briefing cadastrado para aquele formato/mês, exibe literalmente: *“Briefing não encontrado para este formato/mês.”*
- Botão fixo no rodapé: **`enviar material`**.

> **Nuance para o manual:** o texto do briefing vem de uma coluna diferente por formato (`SOBRE_REEL`, `SOBRE_CARROSSEL`, `SOBRE_STORIES_1`, `SOBRE_STORIES_2`). Se a equipe preencher só a coluna do Reel, quem tem Stories vê a mensagem de “não encontrado”.

---

### Tela 4 — Enviar material (`#tela-upload`) · sem nav

**Função:** subir os arquivos de conteúdo para o Google Drive.

Tem **4 estados visuais** (o manual deve ilustrar os quatro):

1. **Seleção** — caixa tracejada “toque para escolher foto ou vídeo”, botão `escolher arquivo`, nome do arquivo escolhido, botão `enviar` (desabilitado até escolher). Aceita **múltiplos arquivos**, só imagem e vídeo.
2. **Progresso** — nome do arquivo, barra de progresso e `enviando… NN%`. O upload é feito em pedaços de **8 MB** direto para o Drive (upload “resumable”), então arquivos grandes funcionam, mas dependem de conexão estável.
3. **Sucesso** — ícone de check, “material enviado”, “seu arquivo foi recebido e está em análise.”, botão `voltar para pendências`.
4. **Erro** — mensagem de falha + botão `tentar novamente`.

**Onde o arquivo vai parar (Drive):**
```
<Pasta raiz de entregas>
  └── <Razão social da influenciadora>
        └── <MÊS_REFERENCIA>
              └── REEL | CARROSSEL | STORIES 1 | STORIES 2 | OUTROS
                    └── arquivo enviado
```

Ao concluir, o sistema grava o link do arquivo na coluna `LINK_ARQUIVO` da ativação (**acumulando**: envios múltiplos viram várias linhas dentro da mesma célula) e muda o status da ativação para “em aprovação”.

---

### Tela 5 — Pagamentos (`#tela-pagamentos`) · com nav

**Componentes:**
- Seletor de mês (mesmo componente da Tela 2).
- **Card de totais**: `previsto no mês` e `pago no mês`, em reais.
- Lista de pagamentos; cada item tem um **tracker de 3 etapas**:

```
  Pendente  ─────  Aprovado  ─────  Pago
```

Regra de leitura: “pago” é etapa final; “aprovado” é a etapa do meio; **qualquer outro valor** (inclusive “em aberto”, “em análise”) aparece como **Pendente**.

> **Observação de UX:** um pagamento que chega a “Pago” é arquivado e **desaparece da tela de Pagamentos**, reaparecendo na tela de Histórico. Isso precisa ser dito explicitamente no manual, senão a influenciadora acha que o pagamento sumiu.

---

### Tela 6 — Histórico (`#tela-historico`) · com nav

- Seletor de mês.
- Seção **ativações** — todas as peças já publicadas (status sempre exibido como `Publicado`).
- Seção **pagamentos** — todos os pagamentos já efetivados (etapa sempre `Pago`), com a data do pagamento.

Agrega as abas oficiais de histórico **e** abas legado detectadas automaticamente, então pode conter dados de antes do sistema atual.

---

### Tela 7 — Perfil (`#tela-perfil`) · com nav

Três blocos:

1. **dados cadastrais** (somente leitura): nome, CNPJ, cidade, estado, rua.
2. **editáveis** (com botão `salvar alterações`): **chave pix**, **e-mail**, **cep**, **número**, **complemento**.
3. **somente leitura**: cupom, valor total.

> ⚠️ **Armadilha real, verificada no código:** alterar o **CEP** pelo Portal grava o novo CEP, mas **não recalcula** rua/bairro/cidade/UF. O preenchimento automático de endereço por CEP só roda quando alguém digita o CEP **direto na planilha** — automações do Google Sheets não disparam para alterações feitas por script. Consequência prática: se uma influenciadora se muda e troca o CEP pelo Portal, o endereço de entrega dos looks continua o antigo até a equipe corrigir. **Isto deve virar um callout de alerta no manual, na seção de Perfil e na de Logística.**

---

## 6. Descrição de cada tela — ERP (equipe)

O ERP não tem “telas”: tem **um menu** dentro da Planilha Google e **duas sidebars**.

### 6.1 O menu ` ERP ELÃ 6.2`

Aparece na barra superior da planilha ao lado de “Ajuda”. Estrutura exata:

| Submenu | Item | O que faz |
|---|---|---|
| **Planejamento & Campanhas** | 1. Iniciar Novo Mês (Gerar Rascunhos e Tarefas) | Gera a campanha do mês inteiro. **Ação mais importante do sistema.** |
| | 2. Puxar Looks da Planilha Externa para Briefing | Importa os looks da planilha individual de cada influenciadora. |
| **Financeiro & PIX** | 1. Lançar Pagamentos Avulsos do Mês | Cria linhas de pagamento sem criar ativações. |
| | 2. Copiar Mensagem de PIX (Aba Pagamentos) | Monta o texto de cobrança da linha selecionada. |
| **Logística & Envios** | 1. Atualizar Rastreios Automáticos (BRComerce) | Consulta a transportadora e atualiza o status de entrega. |
| | 2. Copiar Dados de Confirmação (WhatsApp) | Monta mensagem de confirmação de endereço/PIX. |
| **Cadastros & Configurações** | 1. Abrir Formulário de Cadastro | Abre o formulário público de cadastro. |
| | 2. Preencher Endereço por CEP (Aba Base) | Preenche o endereço da linha selecionada. |
| | 3. Executar Limpeza e Arquivamento Geral | Arquiva tudo que está concluído (3 abas de uma vez). |
| | 4. Estruturar Planilha (Setup Inicial) | Recria a estrutura das abas. **Só na implantação.** |
| | 5. Editar Dados da Influenciadora (Sidebar) | Abre a sidebar de edição. |
| | 6. Lançar Pagamento Extra/UGC (Sidebar) | Abre a sidebar de pagamento avulso. |
| | 7. ⚠️ Limpar Histórico Oficial (IRREVERSÍVEL) | Apaga permanentemente as linhas dos dois históricos. |
| | 8. Remover Triggers Órfãos | Manutenção técnica. |
| | 9. Adicionar Coluna ANO_REFERENCIA em Briefing | Migração já executada; re-executar é inofensivo. |
| | 10. Adicionar Colunas ID/ANO em Ativações | Migração já executada; re-executar é inofensivo. |
| **🖥️ Portal de Apoio** | 1. Abrir Portal (Modal) | Abre o Portal da influenciadora numa janela dentro da planilha. |
| **📄 Schema Vivo** | 1. Exportar Schema Agora / 2. Instalar Triggers | Documentação técnica automática. |
| **🧪 QA Shadow** | 1. Rodar QA Shadow Agora / 2. Gerar/Ver Token | Testes automatizados. |

> Os itens **4, 7, 8, 9, 10** e todo o **Schema Vivo / QA Shadow** são **técnicos ou de implantação**. O manual do usuário deve tratá-los num capítulo separado (“Administração e manutenção”), com destaque de perigo no item 7, e não misturá-los com o uso diário.

### 6.2 Sidebar “Dados da Influenciadora”

Painel lateral direito. Seleciona uma influenciadora numa lista (as inativas aparecem com o sufixo ` (OFF)`) e edita: cupom, valor total, quantidade de reels, quantidade de carrosséis, quantidade de stories, quantidade de looks, canais, prazo e o link da planilha de looks.

É **aqui** que se define quantas peças de conteúdo o ciclo mensal vai gerar para aquela pessoa.

### 6.3 Sidebar “Pagamento Extra (UGC)”

Painel lateral que insere uma linha nova na aba `PAGAMENTOS` (influenciadora, mês, valor, PIX) já com status `em aberto`. Serve para pagamentos fora do contrato mensal.

---

## 7. Fluxo de navegação

### 7.1 Portal (influenciadora)

```
                         ┌──────────────┐
                         │    LOGIN     │
                         └──────┬───────┘
                                │ (sessão válida restaura direto)
                                ▼
   ┌──────────────────── PENDÊNCIAS ◀── (tela inicial)
   │                          │
   │                          │ toca num card
   │                          ▼
   │                      BRIEFING ──── "enviar material" ──▶ UPLOAD
   │                          │                                  │
   │                          └──◀── voltar ──────────────────◀──┘
   │
   │  ┌──────────────┬──────────────┬──────────────┐
   └──│  PENDÊNCIAS  │  PAGAMENTOS  │  HISTÓRICO   │  PERFIL   │   ← nav inferior (4 abas)
      └──────────────┴──────────────┴──────────────┘
```

- A **nav inferior** tem 4 destinos: pendências, pagamentos, histórico, perfil.
- **Briefing e Upload não têm nav** — são telas de profundidade, saída só pelo botão voltar.
- O botão **sair** fica no cabeçalho.

### 7.2 ERP (equipe)

Não há navegação: a equipe trabalha diretamente nas abas da planilha e aciona o menu quando precisa de uma ação em lote. O “fluxo” é temporal (ciclo do mês), não espacial.

---

## 8. Fluxos completos

### 8.1 Fluxo: cadastrar uma influenciadora

**Passo a passo real (5 etapas, sendo 3 manuais):**

1. **Formulário público.** A candidata preenche `https://estudioela.com/cliente/jescri-cadastro/`. É uma página com um formulário que envia as respostas para um Google Form. Há dois atalhos para chegar lá, e ambos levam ao **mesmo** formulário: o menu do ERP → *Cadastros & Configurações → 1. Abrir Formulário de Cadastro*, e o endereço `portal.estudioela.com/jescri-cadastro/` (que apenas redireciona).
2. **Resposta cai na aba `CADASTROS`.**
3. **Automação (`onFormSubmit`)** cria a linha em `BASE DE DADOS`:
   - Copia nome, e-mail, razão social, CNPJ, PIX, CEP, número, complemento.
   - **Consulta o CEP** numa API pública e preenche rua, bairro, cidade, UF e monta o campo `INFLUENCIADORA_ENDERECO` completo.
   - **Marca a influenciadora como `OFF`** (coluna A).
4. **A equipe completa o cadastro** pela sidebar (*Editar Dados da Influenciadora*): define **`CUPOM`**, `VALOR_TOTAL` e as **quantidades** de reels/carrossel/stories.
5. **A equipe muda a coluna A para `ON`.** Só a partir daí ela entra no ciclo mensal.

> 🚩 **Três destaques obrigatórios no manual:**
> - **A influenciadora entra como `OFF`.** Se ninguém ativar, ela nunca recebe tarefas — e o cadastro parece ter “sumido”.
> - **Sem `CUPOM` preenchido, ela não consegue fazer login.** O cupom é o nome de usuário.
> - **Sem as quantidades preenchidas, o ciclo mensal cria zero ativações para ela** (mas cria a linha de pagamento). É a causa nº 1 de “a campanha não apareceu no portal dela”.

---

### 8.2 Fluxo: login da influenciadora

- **Usuário** = o `CUPOM` dela (não diferencia maiúsculas/minúsculas).
- **Senha** = os **5 primeiros dígitos do CNPJ**, sem pontuação.
- **5 tentativas erradas** bloqueiam aquele cupom por **15 minutos**.
- A sessão dura **6 horas**, renovadas a cada uso (uso contínuo não expira).
- A sessão fica salva no navegador: reabrir o Portal **volta direto para Pendências** sem pedir senha de novo, até expirar ou até clicar em **sair**.

> 🔐 **Callout de segurança para o manual:** a senha é derivada do CNPJ, um dado semipúblico. Ela **não pode ser trocada** e **não existe “esqueci minha senha”**. O manual deve orientar: não compartilhar o link do Portal já logado, e sempre usar **sair** em dispositivo compartilhado.
>
> Observação factual: estar `OFF` **não impede o login** — só faz com que não haja ativações para mostrar.

---

### 8.3 Fluxo: criar uma campanha (o ciclo mensal) — **capítulo mais importante do manual**

Menu → *Planejamento & Campanhas → 1. Iniciar Novo Mês*.

1. O sistema pergunta o mês e o ano: formato **`AGOSTO 2026`**.
2. Ele seleciona **todas as influenciadoras `ON`**.
3. **⚠️ APAGA TODO O CONTEÚDO DA ABA `BRIEFING`** (mantém só o cabeçalho) e a reescreve do zero, uma linha por influenciadora ativa, já preenchendo nome, cupom, mês, ano e link da pasta do Drive.
4. Para cada influenciadora `ON`, insere:
   - **`ATIVAÇÕES`** — uma linha por peça, conforme as quantidades cadastradas. Cada linha ganha um `ID` único e nasce com status **`em aberto`**.
     - Formatos gerados: `REEL`, `CARROSSEL`, e `STORIES` (se a quantidade for 1) ou `STORIES_1`, `STORIES_2`… (se for mais de um).
   - **`PAGAMENTOS`** — uma linha com o valor do contrato e status **`em aberto`**.
   - **`FLUXO LOGÍSTICO`** — uma linha com o endereço e status **“Aguardando Confirmação”**.
5. Reordena `ATIVAÇÕES` por data e atualiza o schema técnico.
6. Mostra a confirmação de sucesso.

> 🚨 **O aviso mais importante do manual inteiro:** *“Iniciar Novo Mês” apaga o briefing atual.* Rodar de novo, por engano, no meio de um mês já preenchido, **destrói todos os textos de briefing daquele mês**. A ordem correta é sempre: **primeiro gerar o mês, depois preencher o briefing.** O próprio diálogo do sistema avisa (“O Briefing atual será limpo para o rascunho”), mas em letra pequena.

**Depois de gerar o mês, a equipe:**
- Preenche os textos de briefing por formato (`SOBRE_REEL`, `SOBRE_CARROSSEL`, `SOBRE_STORIES_1`, `SOBRE_STORIES_2`) e o `RESUMO_MES`.
- Opcionalmente puxa os looks (*Puxar Looks da Planilha Externa*).
- Preenche a **`DATA_ATIVACAO`** (data de postagem) de cada ativação — o que dispara o cálculo automático do prazo.

---

### 8.4 Regra de datas (automática) — merece um diagrama próprio

Quando a equipe preenche a **`DATA_ATIVACAO`** (data em que o post vai ao ar) numa linha de `ATIVAÇÕES`, o sistema calcula sozinho a **`DATA_APROVACAO`** (prazo de entrega do material pela influenciadora):

```
DATA_APROVACAO = DATA_ATIVACAO − 7 dias
                 └─ se cair em sexta, sábado ou domingo → empurra para a segunda-feira seguinte
```

O resultado é copiado também para a coluna de aprovação correspondente na aba `BRIEFING` (casando por influenciadora + mês + ano). Apagar a `DATA_ATIVACAO` limpa a `DATA_APROVACAO`.

Efeito prático: **o prazo de entrega nunca cai num fim de semana nem numa sexta.**

---

### 8.5 Fluxo: acompanhar entregas e aprovar/reprovar conteúdo

Este é o fluxo em que a expectativa do usuário mais diverge da realidade do sistema. **Não existe botão de aprovar ou reprovar.** A aprovação é feita **digitando um valor numa célula**.

**Onde:** aba `ATIVAÇÕES`, coluna `STATUS_CONTEUDO`. A célula tem validação de dados e aceita **exatamente 5 valores**:

| Valor na célula | Quem escreve | O que a influenciadora vê | Efeito colateral |
|---|---|---|---|
| `em aberto` | Sistema, ao criar o mês | `Aguardando material` | — |
| `ajustes` | **Sistema, ao receber um upload** | `Em aprovação` | — |
| `aprovado` | **Equipe (manual)** | `Aprovado` | Nenhum |
| `postado` | **Equipe (manual)** | `Publicado` | ⚠️ **Arquiva a linha:** ela sai de `ATIVAÇÕES` e vai para `HISTÓRICO DE CONTEÚDOS` |
| `falta drive` | ninguém | `Aguardando material` | Valor previsto na validação, sem uso |

**Ciclo real de acompanhamento:**

```
 equipe cria o mês        influenciadora envia          equipe revisa            equipe posta
        │                        │                           │                        │
   [em aberto]  ──────▶     [ajustes]      ──────▶     [aprovado]   ──────▶     [postado]
  "Aguardando material"   "Em aprovação"              "Aprovado"              "Publicado"
                                                                                    │
                                                                                    ▼
                                                                    linha arquivada em HISTÓRICO
```

> 🧠 **Duas ciladas conceituais que o manual precisa desfazer:**
>
> 1. **“Reprovar” não tem valor próprio.** O status que significa “material recebido, em revisão” é literalmente `ajustes` — o mesmo termo que a equipe usaria para “precisa de ajustes”. Não há como distinguir, pelo status, “ainda não revisei” de “pedi correções”. A comunicação de reprovação acontece **fora do sistema** (WhatsApp). Para pedir um novo envio, basta deixar a linha em `ajustes`; a influenciadora pode enviar outro arquivo, e os links **se acumulam** na mesma célula.
> 2. **`aprovado` não faz nada automaticamente.** Não notifica ninguém, não libera pagamento, não muda `PAGAMENTOS`. É apenas um marcador visual.

---

### 8.6 Fluxo: pagamentos

`PAGAMENTOS` e `ATIVAÇÕES` são **camadas totalmente independentes**. Aprovar conteúdo **não** libera pagamento; não existe nenhuma ligação de código entre as duas.

1. A linha nasce com `STATUS_PAGAMENTO = em aberto` (a influenciadora vê **Pendente**).
2. A equipe pode escrever `aprovado` → a influenciadora vê a etapa do meio do tracker.
3. A equipe escreve **`pago`** → o sistema, automaticamente:
   - preenche `DATA_PAGAMENTO` com data e hora (se estiver vazia);
   - **move a linha inteira** para `HISTÓRICO DE PAGAMENTOS`.

Apoio: *Copiar Mensagem de PIX* monta, a partir da linha selecionada, um texto pronto de cobrança (referência, influenciadora, valor, chave PIX) e o grava também na coluna `MENSAGEM_PIX`.

> ⚠️ Marcar `pago` faz a linha **sumir** da aba `PAGAMENTOS`. Não é bug. É o arquivamento.

---

### 8.7 Fluxo: logística (envio dos looks)

1. `gerarNovoMesCompleto` cria a linha em `FLUXO LOGÍSTICO` com status “Aguardando Confirmação”.
2. *Copiar Dados de Confirmação (WhatsApp)* gera a mensagem para confirmar endereço e PIX com a influenciadora.
3. A equipe cola o **link de rastreio** na coluna `RASTREIO`. Ao colar um link, o sistema preenche a `DATA_DE_ENVIO` sozinho (se vazia).
4. *Atualizar Rastreios Automáticos (BRComerce)* consulta a transportadora e atualiza `STATUS_LOGISTICA`; em seguida **arquiva automaticamente** tudo que estiver como “entregue” / “entrega realizada” / “objeto entregue” para `HISTÓRICO LOGÍSTICO`.

---

### 8.8 Fluxo: administração e manutenção

- **Arquivamento manual em lote:** *Executar Limpeza e Arquivamento Geral* varre as 3 abas vivas e move para o histórico tudo que estiver `postado`, `pago` ou `entregue`.
- **Pagamento avulso:** sidebar *Lançar Pagamento Extra/UGC*.
- **Pagamentos avulsos do mês:** cria uma linha de pagamento para **todas** as influenciadoras `ON`, sem criar ativações.
- **☠️ Limpar Histórico Oficial:** apaga permanentemente **todas** as linhas de `HISTÓRICO DE CONTEÚDOS` e `HISTÓRICO DE PAGAMENTOS`. Pede confirmação. **Irreversível — não existe desfazer.**
- **Setup Inicial, Remover Triggers Órfãos, Adicionar Colunas, Schema Vivo, QA Shadow:** ferramentas técnicas. Devem ser descritas como “não use no dia a dia; acione o responsável técnico”.

---

## 9. Principais regras de negócio (lista consolidada)

1. Só influenciadoras com coluna A = **`ON`** entram no ciclo mensal.
2. A quantidade de ativações geradas vem das colunas de quantidade da `BASE DE DADOS`; zero ou vazio ⇒ nenhuma ativação.
3. **`Iniciar Novo Mês` limpa a aba `BRIEFING`** antes de repopulá-la.
4. Prazo de entrega = data de postagem − 7 dias, empurrado para segunda se cair de sexta a domingo.
5. `STATUS_CONTEUDO` aceita só: `em aberto`, `falta drive`, `aprovado`, `ajustes`, `postado`.
6. Upload de material sempre grava `ajustes` (exibido como “Em aprovação”) e **acumula** links, nunca substitui.
7. `postado` **arquiva** a ativação. `pago` **arquiva** o pagamento (e carimba a data). “entregue” **arquiva** a logística.
8. `STATUS_CONTEUDO` e `STATUS_PAGAMENTO` são **independentes**; nenhuma automação liga uma coisa à outra.
9. Cada influenciadora só enxerga as próprias linhas, filtradas por `INFLU_KEY`.
10. Login: cupom + 5 primeiros dígitos do CNPJ. 5 erros ⇒ 15 min de bloqueio. Sessão de 6 h renovável.
11. Cadastro novo nasce `OFF`.
12. Colunas são localizadas **pelo nome do cabeçalho** — renomear cabeçalho ou aba quebra o sistema.
13. A campanha é identificada por **mês + ano** (duas campanhas de “JULHO” em anos diferentes não se misturam).

---

## 10. Pontos que merecem destaque para novos usuários

**Para a equipe (ordem de importância):**
1. `Iniciar Novo Mês` apaga o briefing. Gere o mês **antes** de escrever o briefing.
2. Marcar `postado` / `pago` faz a linha desaparecer da aba viva — ela foi arquivada, não perdida.
3. Cadastro novo entra `OFF` e sem cupom. Ative e preencha o cupom, ou a influenciadora não loga nem recebe tarefas.
4. Nunca renomeie cabeçalhos de coluna nem abas.
5. Nada é automático entre conteúdo e pagamento. Aprovar conteúdo não paga ninguém.
6. Não existe notificação: toda comunicação com a influenciadora é feita por fora (WhatsApp).
7. O item 7 do menu de configurações é irreversível.

**Para a influenciadora:**
1. Seu usuário é o **cupom**; sua senha são os **5 primeiros números do CNPJ**.
2. Não existe “esqueci a senha” — chame a equipe.
3. O seletor de mês só mostra meses em que você tem algo.
4. Pode enviar **vários arquivos**; eles se somam, não se substituem.
5. “Em aprovação” significa que a equipe recebeu — não precisa reenviar.
6. Pagamentos e ativações concluídos **saem** das telas principais e vão para o **Histórico**.
7. Trocar o CEP no perfil **não** atualiza o endereço de entrega automaticamente — avise a equipe.

---

## 11. Erros comuns e como evitá-los

| # | Sintoma relatado | Causa real | Como evitar / resolver |
|---|---|---|---|
| 1 | “Perdi todos os briefings do mês” | Rodaram `Iniciar Novo Mês` duas vezes | Gerar o mês **uma vez**, antes de escrever briefings. Não há desfazer (só o histórico de versões do Sheets). |
| 2 | “A campanha não apareceu no portal dela” | Quantidades (reels/carrossel/stories) vazias, ou influenciadora `OFF` | Preencher as quantidades na sidebar e ativar (`ON`) **antes** de gerar o mês |
| 3 | “Ela não consegue fazer login” | `CUPOM` vazio na `BASE DE DADOS`, ou CNPJ com menos de 5 dígitos / mal formatado | Preencher o cupom; conferir o CNPJ |
| 4 | “Cupom ou senha inválidos” mesmo com dados certos | Senha ≠ 5 primeiros dígitos do CNPJ, ou 5 tentativas já queimadas | Esperar 15 min; conferir o CNPJ na planilha |
| 5 | “O pagamento sumiu da aba PAGAMENTOS” | Alguém marcou `pago` → linha arquivada | Procurar em `HISTÓRICO DE PAGAMENTOS` |
| 6 | “A ativação sumiu de ATIVAÇÕES” | Alguém marcou `postado` → linha arquivada | Procurar em `HISTÓRICO DE CONTEÚDOS` |
| 7 | “O upload dá erro / não salva o status” | Alguém digitou um valor fora dos 5 permitidos em `STATUS_CONTEUDO` | Usar apenas os 5 valores da validação |
| 8 | “Enviei o material mas continua ‘em aprovação’” | É o comportamento correto: só a equipe muda para `aprovado` | Explicar no manual |
| 9 | “Briefing não encontrado para este formato/mês” | A coluna `SOBRE_<FORMATO>` daquele formato está vazia | Preencher a coluna do formato correspondente |
| 10 | “Mudei o CEP no portal e o look foi pro endereço antigo” | O Portal não recalcula o endereço | Equipe redigita o CEP **na planilha** para disparar o preenchimento automático |
| 11 | “O sistema parou de achar as colunas” | Cabeçalho ou nome de aba renomeado | Restaurar o nome exato |
| 12 | “Fui deslogada do nada” | Sessão de 6 h expirada | Fazer login de novo |
| 13 | “O upload travou” | Arquivo grande + conexão instável (envio em blocos de 8 MB) | Reenviar em rede estável; usar `tentar novamente` |

---

## 12. ⛔ O que NÃO existe (seção de contenção — leia antes de escrever o manual)

O pedido original do manual mencionava “métricas”, “relatórios” e “aprovar ou reprovar conteúdos”. Verificação no código (2026-07-08):

| Funcionalidade esperada | Existe? | Realidade |
|---|---|---|
| Tela/painel de **métricas** (alcance, engajamento, KPIs) | **Não** | Não há nenhuma tela, gráfico ou cálculo de métrica em lugar nenhum do sistema. |
| **Relatórios** exportáveis / dashboards | **Não** | O mais próximo são: os totais “previsto/pago no mês” no Portal, e a própria planilha (que a equipe pode filtrar e ordenar à mão). |
| **Botão** de aprovar / reprovar conteúdo | **Não** | Aprovação = digitar `aprovado` na célula `STATUS_CONTEUDO`. Ver 8.5. |
| Notificações / e-mails automáticos | **Não** | Nenhum envio de e-mail ou push em nenhum fluxo. |
| Área de gestor dentro do Portal | **Não** | O Portal é exclusivo da influenciadora. |
| Recuperação/troca de senha | **Não** | Senha derivada do CNPJ, imutável. |
| Cadastro de influenciadora **dentro** do Portal | **Não** | O cadastro acontece num formulário público, fora do Portal: `estudioela.com/cliente/jescri-cadastro/`. O endereço `portal.estudioela.com/jescri-cadastro/` **não hospeda formulário**: é apenas um atalho que redireciona para esse mesmo formulário oficial. Trate os dois como **um único fluxo**. |

> **Instrução direta para a IA que escrever o manual:** se um capítulo sobre métricas/relatórios for exigido, ele deve ser escrito como **“Como acompanhar resultados hoje”**, explicando os totais do Portal e o uso da própria planilha (filtros, tabela dinâmica) — e declarando explicitamente que não há módulo de relatórios. **Não desenhe telas que não existem.**

---

## 13. Sugestões de ilustrações, diagramas, capturas e callouts

### 13.1 Sistema de callouts (usar consistentemente)

| Ícone | Rótulo | Quando usar |
|---|---|---|
| 🚨 | **Perigo — irreversível** | `Iniciar Novo Mês` (apaga briefing); `Limpar Histórico Oficial` |
| ⚠️ | **Atenção** | Marcar `pago`/`postado` arquiva a linha; CEP do Portal não recalcula endereço |
| 💡 | **Dica** | Ordem correta de operações; atalhos |
| 🧠 | **Entenda o porquê** | Independência entre conteúdo e pagamento; por que `ajustes` = “Em aprovação” |
| 🔐 | **Segurança** | Regra da senha, sair em dispositivo compartilhado |

### 13.2 Diagramas (vetoriais, feitos à mão — não são screenshots)

1. **Mapa do sistema** (cap. 1) — Planilha ao centro; ERP à esquerda (equipe), Portal à direita (influenciadora); Drive, Form e BRComerce como satélites. *(Base: seção 4.1.)*
2. **Linha do tempo do ciclo mensal** (cap. sobre campanhas) — faixa horizontal: Gerar mês → Preencher briefing → Definir datas de postagem → Influenciadora envia → Equipe aprova → Postado → Arquivado.
3. **Máquina de estados do conteúdo** (cap. de entregas) — 4 caixas (`em aberto` → `ajustes` → `aprovado` → `postado`) com duas legendas por caixa: *valor na planilha* / *o que ela vê no app*. Marcar a seta final com “arquiva”. *(Base: seção 8.5.)*
4. **Tracker de pagamento** — três etapas Pendente/Aprovado/Pago, com nota de que “Pago” move para o histórico.
5. **Cálculo da data de entrega** — mini-calendário mostrando “−7 dias” e a seta empurrando sexta/sábado/domingo para a segunda. *(Base: seção 8.4.)*
6. **Árvore de pastas do Drive** — Influenciadora → Mês → Formato. *(Base: Tela 4.)*
7. **Mapa de navegação do Portal** — as 7 telas, marcando quais têm nav inferior. *(Base: seção 7.1.)*
8. **Fluxo de cadastro em 5 etapas** — com selo “manual” nas etapas 4 e 5 e um alerta no “nasce OFF”. *(Base: seção 8.1.)*

### 13.3 Capturas de tela sugeridas

**Portal (celular, retrato, ~390×844):** login; pendências com os 4 tipos de pill visíveis; briefing com o bloco “resumo do mês”; upload nos 4 estados (seleção / progresso / sucesso / erro); pagamentos com o tracker; histórico; perfil com o bloco “editáveis”.

**ERP (desktop):** menu ` ERP ELÃ 6.2` aberto com os submenus; diálogo do “Iniciar Novo Mês” (com o aviso de limpeza do briefing); aba `ATIVAÇÕES` com a lista suspensa de `STATUS_CONTEUDO` aberta mostrando os 5 valores; sidebar “Dados da Influenciadora”; diálogo de confirmação do “Limpar Histórico Oficial”.

> Toda captura deve usar **dados fictícios** (ex.: influenciadora “MARIA EXEMPLO”, cupom `MARIA10`, CNPJ mascarado, PIX fictício). Nunca dados reais.

### 13.4 Recursos de apoio

- **Cartão de bolso da influenciadora** (1 página, imprimível): como entrar, o que cada pill significa, como enviar material.
- **Checklist do ciclo mensal** (1 página, para a equipe): a ordem correta das 6 operações do mês, com caixas de marcar.
- **Glossário**: ativação, briefing, formato, cupom, `INFLU_KEY`, arquivamento, `ON`/`OFF`, resumable upload.

---

## 14. Ordem ideal dos capítulos

O manual deve ser **um documento com duas trilhas**, sinalizadas visualmente (cor/ícone por trilha), porque os dois públicos não leem os mesmos capítulos.

```
PARTE 0 — ABERTURA
  1. O que é a plataforma (mapa do sistema, os dois rostos)
  2. Quem faz o quê (perfis e acessos)
  3. Glossário rápido

PARTE I — TRILHA DA INFLUENCIADORA  👤
  4. Como acessar o Portal
  5. Como entrar (login, senha, bloqueio, sair)
  6. Pendências: sua tela inicial
  7. Briefing: entendendo o que produzir
  8. Enviando seu material
  9. Acompanhando seus pagamentos
 10. Histórico
 11. Seu perfil (e o alerta do CEP)
 12. Dúvidas frequentes da influenciadora

PARTE II — TRILHA DA EQUIPE  🏢
 13. Visão geral da planilha (as 9 abas)
 14. Cadastrando uma influenciadora  ← inclui os 3 destaques (OFF, cupom, quantidades)
 15. Criando a campanha do mês  🚨 (capítulo mais crítico)
 16. Escrevendo o briefing e puxando os looks
 17. Definindo datas: a regra dos 7 dias
 18. Acompanhando entregas e aprovando conteúdo (a máquina de estados)
 19. Pagamentos e PIX
 20. Logística e rastreio
 21. Arquivamento: para onde as linhas vão

PARTE III — ADMINISTRAÇÃO  ⚙️
 22. Ferramentas de manutenção (setup, triggers, schema, QA)
 23. Operações irreversíveis  ☠️
 24. Regras que nunca devem ser quebradas (nomes de colunas e abas)

PARTE IV — APOIO
 25. Solução de problemas (a tabela da seção 11)
 26. FAQ geral
 27. O que a plataforma não faz (expectativas × realidade)  ← seção 12 deste briefing
 28. Anexos: cartão de bolso + checklist mensal
```

**Racional da ordem:** a influenciadora vem primeiro porque é o público maior e mais leigo, e porque entender o Portal ajuda a equipe a entender o efeito das próprias ações. Dentro da trilha da equipe, a ordem é **cronológica pelo ciclo do mês**, não pelo menu.

---

## 15. Identidade visual e estilo de apresentação

### 15.1 Paleta — extraída do CSS real do Portal

| Papel | Hex | Uso |
|---|---|---|
| Primária (vinho) | `#8f0002` | Títulos de capítulo, callouts, links |
| Primária forte | `#bc0004` | Hover, ênfase |
| Fundo (rosé claro) | `#fdf8f8` | Fundo das páginas |
| Superfície | `#f1edec` / `#f7f2f2` | Caixas, cards, blocos de código |
| Branco | `#ffffff` | Cartões elevados |
| Texto | `#1c1b1b` | Corpo |
| Texto secundário | `#5d3f3b` | Legendas |
| Texto tênue | `#916f6a` | Notas de rodapé |
| Fio/borda | `rgba(145,111,106,.25)` | Divisórias |
| Erro | `#ba1a1a` | Callouts de perigo |

Cores auxiliares do ERP (usadas na planilha, úteis nos diagramas): verde `#D9EAD3` = influenciadora **ON**; vermelho claro `#F4CCCC` = **OFF**; cabeçalho `#cd0005`.

### 15.2 Tipografia — as mesmas 3 famílias do produto

- **EB Garamond** (serifada) → títulos e números de capítulo. É a fonte da marca “jescri”.
- **Archivo Narrow** (condensada) → rótulos, tags, legendas de figura, cabeçalhos de tabela.
- **Inter** (sans) → corpo de texto.

### 15.3 Estilo

- **Tom:** cordial, direto, segunda pessoa (“você”). Sem jargão técnico na trilha da influenciadora. Na trilha da equipe, pode-se nomear colunas e abas — sempre em `monoespaçado`.
- **A marca escreve em caixa baixa.** Títulos de capítulo podem seguir essa estética (“criando a campanha do mês”); o corpo do texto usa capitalização normal.
- **Passo a passo numerado**, um verbo de ação por passo, com o resultado esperado ao final (“você deve ver…”).
- **Toda captura de tela** com legenda numerada e, quando útil, balões de destaque (círculo vinho sobre o elemento citado).
- **Densidade:** muito espaço em branco; no máximo um diagrama por página dupla.
- **Rodapé de cada página:** nome do capítulo + trilha (👤 influenciadora / 🏢 equipe / ⚙️ admin).
- **Acessibilidade:** nunca comunicar status só por cor — as pills sempre com texto; contraste mínimo AA.

---

## 16. Fatos técnicos de referência (para consulta, não para o manual)

- Deploy do Portal: Google Apps Script Web App, executa como o usuário que implantou, acesso anônimo.
- `portal.estudioela.com` é uma página no GitHub Pages que embute o Apps Script num iframe.
- Sessão: token UUID em cache do servidor por 6 h (renovação deslizante) + cópia no `localStorage` do navegador.
- Upload: `resumable upload` da API do Drive, blocos de 8 MB, enviados do navegador direto para o Google.
- Bloqueio de login: 5 tentativas, 900 s.
- Integrações externas: BrasilAPI (CEP) e BRComerce (rastreio).
- **[NÃO VERIFICADO]** Se os *triggers instaláveis* (`onEdit`, `onFormSubmit`) estão de fato ativos no painel do Apps Script — isso não é verificável pelo código-fonte. Se as automações de data/arquivamento/cadastro não estiverem funcionando em produção, esta é a primeira hipótese a checar.

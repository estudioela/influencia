# STITCH_PROTOTYPE.md

# ENTREGA 1 — FUNDAMENTO DO PROTÓTIPO

---

# 1. OBJETIVO DO PROTÓTIPO

O protótipo do Stitch tem como objetivo materializar visualmente a experiência definida nos documentos:

- UX_FLOW.md
- SCREEN_MAP.md
- UI_RULES.md

O protótipo deve representar a interface futura do TEAR, validando:

- arquitetura visual;
- hierarquia das informações;
- navegação;
- componentes;
- responsividade;
- experiência dos principais fluxos operacionais.

O objetivo não é criar todas as telas finais da plataforma neste momento.

O objetivo é construir a fundação visual reutilizável do sistema.

---

# 2. CONTEXTO DO PRODUTO

O TEAR é uma plataforma de gestão de marketing de influência responsável por organizar todo o ciclo operacional entre:

- marcas;
- parceiras;
- colaborações;
- briefings;
- materiais;
- aprovações;
- logística;
- pagamentos;
- contratos;
- histórico.

A interface deve refletir um sistema profissional, organizado e escalável.

O usuário deve perceber:

- controle;
- clareza;
- confiança;
- eficiência operacional.

---

# 3. DIREÇÃO VISUAL

## Conceito

A interface deve transmitir:

- sofisticação;
- organização;
- tecnologia;
- proximidade;
- profissionalismo.

O TEAR não deve parecer uma ferramenta administrativa genérica.

Deve possuir identidade própria, equilibrando:

- plataforma SaaS moderna;
- ferramenta operacional;
- ambiente premium de gestão de influência.

---

# Características Visuais

A interface deve priorizar:

- espaços amplos;
- hierarquia clara;
- tipografia elegante;
- componentes minimalistas;
- informações organizadas;
- poucos elementos decorativos.

Evitar:

- excesso de cores;
- interfaces poluídas;
- dashboards com informação excessiva;
- aparência de sistema legado.

---

# 4. PRINCÍPIOS DE DESIGN

## Clareza

Toda tela deve deixar evidente:

- onde o usuário está;
- qual informação está sendo exibida;
- qual ação pode ser executada.

---

## Consistência

O mesmo elemento deve possuir sempre o mesmo comportamento.

Exemplos:

- botões;
- cards;
- tabelas;
- filtros;
- status;
- menus.

---

## Hierarquia

A interface deve destacar primeiro:

1. informação crítica;
2. ação principal;
3. contexto;
4. informações complementares.

---

## Simplicidade

Cada tela deve apresentar somente informações necessárias para aquele momento.

A complexidade deve aparecer progressivamente conforme a necessidade.

---

## Orientação por Fluxo

A interface deve acompanhar os processos do negócio.

O usuário deve sempre compreender:

- etapa atual;
- próxima ação;
- resultado esperado.

---

# 5. DESIGN SYSTEM BASE

## Tipografia

A interface deve utilizar uma combinação de:

- fonte principal para textos;
- fonte de destaque para títulos;
- pesos variados para hierarquia.

Requisitos:

- alta legibilidade;
- aparência profissional;
- consistência entre telas.

---

# Cores

A paleta deve seguir uma identidade premium.

Categorias:

## Cor Primária

Uso:

- ações principais;
- destaques;
- elementos de marca.

---

## Cor Secundária

Uso:

- complementos visuais;
- estados auxiliares;
- elementos de suporte.

---

## Neutros

Uso:

- fundos;
- textos;
- divisórias;
- tabelas.

---

## Estados

Cores específicas para:

- sucesso;
- alerta;
- erro;
- informação;
- pendência.

As cores nunca devem ser o único meio de comunicação do estado.

---

# Espaçamento

Utilizar sistema consistente de espaçamento.

Priorizar:

- respiro visual;
- agrupamento lógico;
- alinhamento entre componentes.

---

# Componentes Base

O protótipo deve considerar componentes reutilizáveis:

- Header;
- Sidebar;
- Cards;
- Botões;
- Inputs;
- Selects;
- Tabelas;
- Badges;
- Status;
- Modais;
- Alertas;
- Timeline;
- Empty States;
- Loading States.

---

# 6. ESTRUTURA GLOBAL DA INTERFACE

A estrutura principal da aplicação segue:
Aplicação

├── Header Global
│
├── Navegação Lateral
│
├── Área Principal
│
└── Contexto do Usuário
---

# Header Global

Responsável por:

- identidade da plataforma;
- pesquisa;
- notificações;
- usuário autenticado.

---

# Navegação Lateral

Responsável por:

- acesso aos módulos;
- localização atual;
- navegação principal.

Módulos:
Dashboard

Marcas

Parceiras

Colaborações

Competências

Briefings

Materiais

Aprovação

Logística

Pagamentos

Contratos

Histórico

Perfil

Configurações

Administração
---

# Área Principal

Responsável por apresentar:

- páginas;
- tabelas;
- formulários;
- dashboards;
- fluxos operacionais.

---

# Contexto do Usuário

Sempre apresentar:

- usuário atual;
- organização;
- permissões relevantes;
- ações disponíveis.

---

# 7. ARQUITETURA DE NAVEGAÇÃO

A navegação do protótipo deve seguir:
Login

↓

Dashboard

↓

Módulo

↓

Tela

↓

Ação

↓

Resultado

↓

Histórico

---

# Navegação Principal

O usuário sempre poderá acessar:

- Dashboard;
- módulos autorizados;
- Perfil;
- Configurações.

---

# Navegação Contextual

Elementos como:

- cards;
- indicadores;
- notificações;
- alertas;

devem funcionar como atalhos para os fluxos relacionados.

---

# Regra Principal do Protótipo

O Stitch deve criar uma experiência de aplicação real.

Não deve criar telas isoladas.

Toda tela deve existir dentro de uma jornada navegável.

# ENTREGA 2 — TELAS E COMPONENTES

---

# 8. TELAS PRIORITÁRIAS

O protótipo inicial do Stitch deve representar as principais jornadas operacionais do TEAR.

A prioridade é validar:

- navegação;
- hierarquia visual;
- componentes;
- experiência dos fluxos críticos.

Não é necessário prototipar todos os módulos administrativos neste primeiro ciclo.

---

# 8.1 Tela: Login

## Objetivo

Permitir autenticação do usuário e entrada segura na plataforma.

## Componentes

- Logo TEAR;
- Campo de identificação;
- Campo de autenticação;
- Botão principal;
- Mensagens de erro;
- Recuperação de acesso.

## Estados

- Inicial;
- Preenchimento;
- Carregamento;
- Erro;
- Sucesso.

## Saída

Após autenticação:
Login

↓

Dashboard

---

# 8.2 Tela: Dashboard

## Objetivo

Apresentar a visão operacional personalizada do usuário.

## Componentes

- Header;
- Navegação lateral;
- Cards de indicadores;
- Ações rápidas;
- Alertas;
- Atividades recentes;
- Notificações.

## Prioridades Visuais

1. Pendências;
2. Indicadores;
3. Próximas ações;
4. Histórico recente.

---

# 8.3 Tela: Lista de Parceiras

## Objetivo

Permitir consulta e gerenciamento das influenciadoras cadastradas.

## Componentes

- Busca;
- Filtros;
- Tabela ou cards;
- Status;
- Botão nova parceira;
- Paginação.

## Informações principais

- Nome;
- Status;
- Cidade;
- Competências;
- Colaborações ativas.

---

# 8.4 Tela: Perfil da Parceira

## Objetivo

Apresentar todas as informações relevantes de uma parceira.

## Componentes

- Cabeçalho do perfil;
- Dados principais;
- Competências;
- Histórico;
- Colaborações;
- Materiais;
- Status.

## Navegação
Parceiras

↓

Perfil

↓

Colaboração

---

# 8.5 Tela: Colaboração

## Objetivo

Controlar o ciclo operacional entre marca e parceira.

## Componentes

- Identificação da colaboração;
- Status;
- Timeline;
- Briefings;
- Materiais;
- Aprovações;
- Pagamentos.

## Visual Principal

Utilizar conceito de linha do tempo:
Criação

↓

Briefing

↓

Produção

↓

Aprovação

↓

Pagamento

↓

Conclusão

---

# 8.6 Tela: Briefing

## Objetivo

Apresentar orientações da campanha.

## Componentes

- Título;
- Marca;
- Objetivos;
- Requisitos;
- Datas;
- Arquivos;
- Status.

## Ações

- Visualizar;
- Editar;
- Publicar;
- Arquivar.

---

# 8.7 Tela: Materiais

## Objetivo

Gerenciar conteúdos enviados pelas parceiras.

## Componentes

- Lista de materiais;
- Preview;
- Status;
- Data de envio;
- Comentários.

## Estados

- Enviado;
- Em análise;
- Aprovado;
- Ajuste solicitado.

---

# 8.8 Tela: Aprovação

## Objetivo

Permitir análise e decisão sobre materiais.

## Componentes

- Preview do material;
- Informações da colaboração;
- Comentários;
- Aprovar;
- Solicitar ajustes.

## Ações principais
Aprovar

ou

Solicitar Ajustes

---

# 8.9 Tela: Pagamentos

## Objetivo

Acompanhar o processo financeiro das colaborações.

## Componentes

- Lista;
- Status;
- Valor;
- Data;
- Beneficiário;
- Histórico.

## Estados

- Pendente;
- Em processamento;
- Pago;
- Cancelado.

---

# 8.10 Tela: Perfil do Usuário

## Objetivo

Gerenciar informações individuais.

## Componentes

- Dados pessoais;
- Preferências;
- Segurança;
- Histórico.

---

# 9. COMPONENTES PRINCIPAIS

---

# Header

Responsável pela identificação e navegação global.

Contém:

- Logo;
- Busca;
- Notificações;
- Usuário.

---

# Sidebar

Menu principal da aplicação.

Regras:

- sempre consistente;
- destacar módulo atual;
- respeitar permissões.

---

# Cards

Utilizados para:

- indicadores;
- resumos;
- ações rápidas.

Características:

- informação objetiva;
- hierarquia clara;
- ação contextual.

---

# Tabelas

Utilizadas para dados operacionais.

Devem possuir:

- busca;
- filtros;
- ordenação;
- ações por registro.

---

# Formulários

Regras:

- poucos campos por etapa;
- validação clara;
- mensagens objetivas;
- preservação dos dados.

---

# Timeline

Utilizada em processos com etapas.

Aplicações:

- colaboração;
- aprovação;
- histórico.

Exemplo:
Evento

↓

Evento

↓

Evento

---

# Status

Representação visual dos estados dos objetos.

Exemplos:

- Ativo;
- Pendente;
- Aprovado;
- Bloqueado;
- Finalizado.

---

# Modais

Uso restrito.

Permitidos para:

- confirmação;
- ações críticas;
- informações rápidas.

Evitar:

- fluxos longos;
- formulários complexos.

---

# Alertas

Utilizados para:

- atenção;
- erros;
- confirmações;
- avisos.

Devem possuir:

- título;
- mensagem;
- ação quando necessário.

---

# Empty States

Toda tela sem dados deve apresentar:

- motivo da ausência;
- explicação;
- próxima ação.

---

# Loading States

Utilizar:

- skeletons;
- indicadores de progresso;
- bloqueio apenas quando necessário.

---

# Regra Geral dos Componentes

Todos os componentes devem:

- ser reutilizáveis;
- possuir estados definidos;
- respeitar permissões;
- funcionar em dispositivos diferentes;
- manter comportamento consistente em toda a plataforma.

---

# Critério de Aceitação da Entrega 2

O protótipo deve possuir:

✔ telas principais definidas  
✔ componentes base definidos  
✔ navegação entre telas principais  
✔ estrutura visual consistente  
✔ base suficiente para geração no Stitch

# ENTREGA 3 — REGRAS PARA O STITCH

---

# 10. FLUXOS PARA PROTÓTIPO

O protótipo deve representar fluxos completos, não apenas telas isoladas.

O Stitch deve priorizar os seguintes caminhos:

---

## Fluxo 1 — Entrada no Sistema

```text
Login

↓

Dashboard

↓

Visualização da Home

Objetivo:

Validar autenticação, carregamento inicial e navegação principal.

⸻

Fluxo 2 — Gestão de Parceira
Dashboard

↓

Parceiras

↓

Lista

↓

Perfil da Parceira

↓

Colaboração

Objetivo:

Validar o fluxo principal de relacionamento com influenciadoras.

⸻

Fluxo 3 — Execução de Colaboração

Colaboração

↓

Briefing

↓

Material

↓

Aprovação

↓

Pagamento

Objetivo:

Representar o ciclo completo de uma campanha.

⸻

Fluxo 4 — Aprovação
Material

↓

Análise

↓

Aprovar

ou

Solicitar Ajustes

Objetivo:

Demonstrar decisões e estados alternativos.

⸻

Fluxo 5 — Consulta

Dashboard

↓

Histórico

↓

Registro

↓

Detalhes

Objetivo:

Demonstrar rastreabilidade.

⸻

11. RESPONSIVIDADE

O protótipo deve seguir abordagem Mobile First.

A interface deve funcionar em:

* smartphone;
* tablet;
* desktop.

---

Regras Responsivas

Mobile

Priorizar:

* conteúdo principal;
* ações essenciais;
* navegação simplificada.

Adaptações:

* sidebar transforma-se em menu;
* tabelas tornam-se cards;
* informações secundárias podem ser recolhidas.

⸻

Tablet

Utilizar:

* duas colunas quando necessário;
* navegação expandida;
* melhor aproveitamento do espaço.

⸻

Desktop

Permitir:

* múltiplos painéis;
* tabelas completas;
* visão operacional ampliada.

⸻

Regra Principal

A funcionalidade nunca deve depender do tamanho da tela.

Apenas a apresentação deve mudar.

⸻

12. ESTADOS DAS TELAS

Todas as telas prototipadas devem possuir estados definidos.

⸻

Estado Normal

Representa a utilização padrão.

Elementos:

* conteúdo carregado;
* ações disponíveis;
* navegação ativa.

⸻

Estado Loading

Representa carregamento.

Utilizar:

* skeleton;
* placeholders;
* indicadores discretos.

Evitar:

* telas totalmente vazias;
* bloqueios desnecessários.

⸻

Estado Vazio

Representa ausência de dados.

Sempre apresentar:

* motivo;
* explicação;
* próxima ação.

Exemplo:
Nenhuma colaboração encontrada.

Criar nova colaboração

Estado Erro

Representa falha operacional.

Deve possuir:

* mensagem clara;
* ação de recuperação;
* opção de tentar novamente.

⸻

Estado Sem Permissão

Representa acesso restrito.

Não exibir:

* dados protegidos;
* ações indisponíveis.

⸻

Estado Sucesso

Após uma ação concluída:

* atualizar interface;
* confirmar resultado;
* indicar próximo passo.

⸻

13. REGRAS DE INTERAÇÃO

Botões

Todo botão deve possuir:

* ação clara;
* texto objetivo;
* estado visual.

Preferir:
Criar Parceira

Salvar Alteração

Aprovar Material

Evitar:
Clique aqui

Continuar

Formulários

Regras:

* poucos campos por etapa;
* validação clara;
* mensagens próximas ao erro;
* preservar dados preenchidos.

⸻

Confirmações

Utilizar confirmação para:

* exclusões;
* encerramentos;
* ações irreversíveis.

⸻

Feedback

Toda ação deve gerar resposta.

Exemplos:

* salvo com sucesso;
* enviado para aprovação;
* erro ao processar;
* aguardando processamento.

⸻

Navegação

O usuário deve sempre saber:

* onde está;
* como chegou;
* qual próximo passo.

⸻

14. REGRAS VISUAIS

Hierarquia

Prioridade:

1. ação principal;
2. informação crítica;
3. contexto;
4. detalhes.

⸻

Espaçamento

Manter:

* respiro visual;
* agrupamento lógico;
* alinhamento consistente.

⸻

Cores

Utilizar cores para:

* identidade;
* estados;
* destaque.

Nunca utilizar cor como único indicador de significado.

⸻

Tipografia

Priorizar:

* legibilidade;
* contraste;
* hierarquia.

⸻

Ícones

Ícones devem:

* complementar textos;
* possuir significado claro;
* evitar ambiguidade.

⸻

15. O QUE NÃO FAZER

O Stitch NÃO deve criar:

* telas sem contexto de navegação;
* dashboards poluídos;
* excesso de gráficos;
* múltiplos padrões para o mesmo componente;
* formulários gigantes;
* modais para fluxos completos;
* informações sem origem definida;
* ações sem permissão;
* layouts incompatíveis com mobile.

⸻

16. CRITÉRIOS DE ACEITAÇÃO

O protótipo será considerado aprovado quando:

Navegação

✔ usuário consegue iniciar pelo Login
✔ usuário consegue chegar ao Dashboard
✔ módulos possuem caminhos claros
✔ retorno entre telas funciona

⸻

Interface

✔ componentes possuem padrão único
✔ hierarquia visual é clara
✔ estados estão representados
✔ responsividade está prevista

⸻

Fluxos

✔ ciclo da colaboração está representado
✔ aprovação possui decisão
✔ materiais possuem estados
✔ pagamentos possuem acompanhamento

⸻

Design

✔ aparência profissional
✔ identidade consistente
✔ baixa carga visual
✔ experiência semelhante a produto SaaS premium

⸻

Resultado Esperado

Ao final desta etapa, o Stitch deve produzir uma primeira versão navegável do TEAR contendo:

* identidade visual inicial;
* estrutura de aplicação;
* componentes reutilizáveis;
* principais telas;
* fluxos críticos;
* base para evolução futura do design.
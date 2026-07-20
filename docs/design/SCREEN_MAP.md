# Tela: Dashboard

## Objetivo

O Dashboard é o ponto central da experiência do usuário no TEAR.

Sua finalidade é apresentar uma visão consolidada da situação atual da plataforma, permitindo que cada usuário compreenda rapidamente o estado de suas atividades e inicie novas jornadas operacionais com o menor número possível de interações.

Esta tela constitui a página inicial após a autenticação bem-sucedida.

Dashboards eficazes devem responder rapidamente às principais perguntas do usuário, destacar informações prioritárias e permitir ações imediatas sem sobrecarga visual.  [oai_citation:0‡ArcGIS](https://doc.arcgis.com/en/dashboards/latest/reference/author-effective-dashboards.htm?utm_source=chatgpt.com)

---

# Perfis

A tela está disponível para:

- Administrador
- Gestor de Marca
- Gestor de Influenciadoras
- Operação
- Financeiro
- Influenciadora
- Auditoria

O conteúdo exibido adapta-se dinamicamente às permissões do perfil autenticado.

---

# Origem

O Dashboard pode ser acessado a partir de:

- Login
- Logo da plataforma
- Menu principal
- Breadcrumb
- Retorno de qualquer módulo
- Encerramento de operações

É considerado a Home oficial do sistema.

---

# Destinos

A partir do Dashboard o usuário pode navegar diretamente para:

- Marcas
- Parceiras
- Colaborações
- Competências
- Briefings
- Materiais
- Aprovação
- Logística
- Pagamentos
- Contratos
- Histórico
- Perfil
- Configurações
- Administração

Os destinos disponíveis respeitam a Matriz de Permissões.

---

# Componentes

A tela é composta pelos seguintes componentes.

## Navegação Global

Contém:

- logotipo;
- menu principal;
- notificações;
- pesquisa global;
- acesso ao perfil;
- acesso às configurações;
- encerramento da sessão.

---

## Cabeçalho

Exibe:

- saudação personalizada;
- nome do usuário;
- organização ativa;
- data;
- contexto operacional.

---

## Área de Resumo

Apresenta indicadores consolidados do perfil autenticado.

Exemplos:

- campanhas em andamento;
- briefings pendentes;
- materiais aguardando aprovação;
- entregas pendentes;
- pagamentos pendentes;
- contratos aguardando assinatura.

O Dashboard deve priorizar apenas informações relevantes para aquele perfil, evitando excesso de conteúdo e reduzindo a carga cognitiva.  [oai_citation:1‡ArcGIS](https://doc.arcgis.com/en/dashboards/latest/reference/author-effective-dashboards.htm?utm_source=chatgpt.com)

---

## Ações Rápidas

Permite iniciar imediatamente operações frequentes.

Exemplos:

- Nova Marca
- Nova Parceira
- Nova Colaboração
- Novo Briefing
- Consultar Histórico

As ações variam conforme o perfil.

---

## Atividades Recentes

Lista os eventos mais recentes relacionados ao usuário.

Exemplos:

- material enviado;
- briefing publicado;
- aprovação realizada;
- pagamento concluído;
- contrato assinado.

---

## Alertas

Apresenta situações que exigem atenção.

Exemplos:

- aprovações pendentes;
- campanhas próximas do vencimento;
- entregas atrasadas;
- pagamentos bloqueados;
- contratos pendentes.

---

## Agenda

Exibe compromissos futuros relevantes.

Exemplos:

- publicações;
- entregas;
- aprovações;
- pagamentos;
- encerramentos de campanhas.

---

# Ações

O Dashboard permite:

- navegar entre módulos;
- iniciar novas operações;
- consultar indicadores;
- acessar notificações;
- pesquisar registros;
- visualizar pendências;
- acompanhar atividades recentes.

---

# Navegação

Fluxo principal:

```text
Login

↓

Dashboard

↓

Selecionar Módulo

↓

Executar Operação
```

Fluxo secundário:

```text
Qualquer Módulo

↓

Dashboard

↓

Nova Jornada
```

---

# Estados

A tela poderá apresentar os seguintes estados.

## Carregamento

Exibe placeholders enquanto os dados são carregados.

---

## Conteúdo

Estado padrão da tela.

---

## Dashboard Vazio

Caso não existam registros para exibição.

Exemplos:

- nenhuma campanha;
- nenhuma pendência;
- nenhuma atividade recente.

O sistema deverá incentivar a primeira ação do usuário.

---

## Erro

Caso ocorra falha na obtenção das informações.

O usuário poderá atualizar a tela ou tentar novamente.

---

## Sem Permissão

Caso algum componente não esteja autorizado para o perfil autenticado.

O componente simplesmente não será exibido.

---

# Permissões

| Perfil | Acesso |
|----------|:------:|
| Administrador | ✔ |
| Gestor de Marca | ✔ |
| Gestor de Influenciadoras | ✔ |
| Operação | ✔ |
| Financeiro | ✔ |
| Influenciadora | ✔ |
| Auditoria | ✔ |

Cada perfil visualiza apenas os componentes compatíveis com sua função.

---

# Regras de Negócio

- O Dashboard é sempre a primeira tela após a autenticação.
- Todo usuário autenticado possui acesso ao Dashboard.
- Os indicadores são calculados conforme o escopo autorizado.
- Informações confidenciais nunca são compartilhadas entre perfis.
- Os atalhos respeitam a Matriz de Permissões.
- Pendências críticas possuem prioridade visual.
- O Dashboard nunca substitui os módulos especializados.
- Toda informação apresentada deve possuir origem rastreável.

---

# Observações

O Dashboard não representa um módulo operacional.

Ele representa o centro de navegação do ecossistema TEAR.

Sua principal responsabilidade é responder rapidamente três perguntas ao usuário:

- O que está acontecendo?
- O que precisa da minha atenção agora?
- Qual deve ser minha próxima ação?

Toda decisão de layout, hierarquia e conteúdo desta tela deve priorizar clareza, contexto e rapidez de tomada de decisão, evitando informações irrelevantes ou redundantes.  [oai_citation:2‡Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips?utm_source=chatgpt.com)

## Objetivo

O Dashboard é a tela inicial do ecossistema TEAR e representa o principal ponto de entrada para a operação da plataforma.

Sua responsabilidade é oferecer ao usuário uma visão consolidada, contextualizada e personalizada do estado atual de suas atividades, permitindo identificar rapidamente prioridades, pendências e oportunidades de ação.

Diferentemente dos módulos operacionais, o Dashboard não possui como objetivo executar processos específicos. Sua função é orientar a tomada de decisão e reduzir o tempo necessário para que o usuário inicie a próxima atividade relevante.

Todas as informações apresentadas devem ser compatíveis com o perfil autenticado, respeitando integralmente a Matriz de Permissões da plataforma.

O Dashboard deve responder, de forma imediata, às seguintes perguntas:

- O que está acontecendo neste momento?
- O que exige minha atenção agora?
- Quais atividades estão pendentes?
- Qual deve ser minha próxima ação?
- Como posso acessar rapidamente os módulos necessários?

O conteúdo exibido deve priorizar informações acionáveis, indicadores relevantes e atalhos para as jornadas mais frequentes, evitando sobrecarga visual ou elementos que não contribuam para a tomada de decisão. O objetivo principal é reduzir a carga cognitiva do usuário e permitir que ele compreenda sua situação operacional em poucos segundos.  [oai_citation:0‡ArcGIS](https://doc.arcgis.com/en/dashboards/latest/reference/author-effective-dashboards.htm?utm_source=chatgpt.com)

O Dashboard constitui o centro de navegação da plataforma e deve permanecer como a principal referência de contexto durante toda a utilização do ecossistema TEAR.

## Perfis

O Dashboard é a única tela obrigatoriamente acessível para todos os usuários autenticados da plataforma.

Independentemente do perfil operacional, o Dashboard representa o ponto inicial da jornada e o centro permanente de navegação do ecossistema TEAR.

Embora a estrutura da tela permaneça única, seu conteúdo é personalizado dinamicamente de acordo com o papel desempenhado pelo usuário. Essa abordagem baseada em papéis (Role-Based Access Control — RBAC) permite apresentar apenas informações e ações relevantes para cada função, reduzindo a complexidade da interface e preservando a segurança dos dados.  [oai_citation:0‡Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-users-profiles-roles?utm_source=chatgpt.com)

### Administrador

Visualiza a versão mais completa do Dashboard.

Principais informações:

- indicadores globais;
- visão consolidada da plataforma;
- atividades recentes;
- alertas administrativos;
- métricas operacionais;
- atalhos para todos os módulos.

---

### Gestor de Marca

Visualiza informações relacionadas às marcas sob sua responsabilidade.

Principais informações:

- campanhas em andamento;
- briefings publicados;
- aprovações pendentes;
- contratos;
- desempenho das colaborações.

---

### Gestor de Influenciadoras

Visualiza informações referentes às parceiras.

Principais informações:

- novas parceiras;
- competências;
- campanhas ativas;
- entregas;
- materiais pendentes;
- acompanhamento operacional.

---

### Operação

Visualiza indicadores operacionais da execução das campanhas.

Principais informações:

- atividades em andamento;
- logística;
- pendências;
- entregas;
- acompanhamento diário.

---

### Financeiro

Visualiza exclusivamente informações financeiras autorizadas.

Principais informações:

- pagamentos pendentes;
- pagamentos concluídos;
- contratos vinculados;
- indicadores financeiros;
- alertas financeiros.

---

### Influenciadora

Visualiza apenas informações relacionadas à sua própria atuação.

Principais informações:

- briefings ativos;
- materiais enviados;
- solicitações de ajuste;
- pagamentos;
- histórico pessoal;
- próximos compromissos.

---

### Auditoria

Visualiza informações destinadas à rastreabilidade e conformidade.

Principais informações:

- registros históricos;
- indicadores de conformidade;
- eventos auditáveis;
- atividades recentes;
- consultas autorizadas.

---

## Personalização por Perfil

O Dashboard adapta dinamicamente:

- componentes exibidos;
- indicadores;
- atalhos;
- alertas;
- notificações;
- ações rápidas;
- métricas;
- áreas de destaque.

A estrutura da tela permanece idêntica para todos os usuários.

O que varia é exclusivamente o conteúdo apresentado.

Essa abordagem garante consistência na experiência de uso, reduz a carga cognitiva e assegura que cada usuário visualize apenas informações compatíveis com suas responsabilidades operacionais e permissões de acesso.  [oai_citation:1‡Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-users-profiles-roles?utm_source=chatgpt.com)

## Entrada

O Dashboard representa a principal porta de entrada operacional do ecossistema TEAR.

Sempre que uma sessão autenticada é iniciada ou uma jornada operacional é concluída, o usuário pode ser direcionado para esta tela.

Seu papel é restabelecer o contexto da operação, apresentar a situação atual do ambiente de trabalho e oferecer acesso imediato às próximas ações relevantes.

A tela pode ser acessada pelos seguintes caminhos.

### Após a Autenticação

Fluxo principal de entrada.

```text
Login

↓

Validação da Sessão

↓

Dashboard
```

Este é o caminho padrão para todos os usuários autenticados.

---

### Pelo Menu Principal

Durante qualquer jornada operacional.

```text
Menu Principal

↓

Dashboard
```

Permite retornar rapidamente ao centro de navegação da plataforma.

---

### Pelo Logotipo da Plataforma

O logotipo institucional atua como atalho permanente para o Dashboard.

```text
Clique no Logotipo

↓

Dashboard
```

Este comportamento deve permanecer consistente em toda a aplicação.

---

### Após a Conclusão de uma Operação

Ao finalizar determinados processos, o usuário poderá optar por retornar ao Dashboard.

Exemplos:

- cadastro concluído;
- colaboração criada;
- briefing publicado;
- material aprovado;
- pagamento registrado;
- contrato finalizado.

Fluxo:

```text
Operação Concluída

↓

Mensagem de Sucesso

↓

Retornar ao Dashboard
```

---

### A Partir de Qualquer Módulo

O Dashboard permanece acessível durante toda a navegação.

```text
Qualquer Tela

↓

Dashboard
```

O retorno ao Dashboard não deve provocar perda inesperada de contexto ou da sessão autenticada.

---

### Após Atualização da Página

Quando a sessão permanecer válida, uma atualização da página deverá reconstruir automaticamente o Dashboard utilizando o contexto do usuário autenticado.

```text
Atualizar Página

↓

Validar Sessão

↓

Recarregar Dashboard
```

---

## Pré-condições

Para acessar o Dashboard, devem ser atendidas as seguintes condições:

- o usuário deve estar autenticado;
- a sessão deve estar válida;
- o perfil deve possuir permissão de acesso ao sistema;
- a organização ativa deve estar definida, quando aplicável.

Caso alguma dessas condições não seja satisfeita, o usuário deverá ser redirecionado para o fluxo apropriado, como autenticação, seleção de contexto ou tela de erro.

---

## Resultado Esperado

Após o acesso, o Dashboard deverá:

- identificar o perfil autenticado;
- carregar apenas os componentes autorizados;
- apresentar indicadores atualizados;
- destacar pendências prioritárias;
- disponibilizar ações rápidas compatíveis com o perfil;
- permitir o início imediato de qualquer jornada operacional autorizada.

O Dashboard deve funcionar como a principal área de orientação da plataforma, oferecendo ao usuário contexto suficiente para compreender sua situação atual e decidir rapidamente sua próxima ação.  [oai_citation:0‡lollypop.design](https://lollypop.design/blog/2026/june/portal-ux-design/?utm_source=chatgpt.com)

## Saídas

O Dashboard funciona como o principal ponto de distribuição das jornadas do ecossistema TEAR.

A partir desta tela, o usuário pode iniciar qualquer fluxo operacional compatível com seu perfil de acesso, utilizando a navegação principal, ações rápidas, indicadores interativos, notificações ou atalhos contextuais.

As saídas do Dashboard devem ser diretas, previsíveis e orientadas às tarefas mais frequentes do usuário, reduzindo o número de interações necessárias para alcançar seu objetivo. Interfaces de dashboard eficientes priorizam acesso rápido aos destinos mais utilizados, navegação consistente e transições claras entre o contexto geral e as áreas de trabalho específicas.  [oai_citation:0‡FanRuan Software](https://fanruan.com/en/blog/dashboard-navigation-best-practices?utm_source=chatgpt.com)

---

### Marcas

```text
Dashboard

↓

Marcas

↓

Lista de Marcas
```

Também poderá iniciar diretamente:

- Nova Marca;
- Detalhes da Marca;
- Histórico da Marca.

---

### Parceiras

```text
Dashboard

↓

Parceiras

↓

Lista de Parceiras
```

Também poderá iniciar diretamente:

- Nova Parceira;
- Perfil da Parceira;
- Competências;
- Histórico.

---

### Colaborações

```text
Dashboard

↓

Colaborações

↓

Lista de Colaborações
```

Também poderá iniciar:

- Nova Colaboração;
- Timeline;
- Detalhes;
- Encerramento.

---

### Competências

```text
Dashboard

↓

Competências
```

---

### Briefings

```text
Dashboard

↓

Briefings
```

Também poderá acessar diretamente briefings:

- pendentes;
- publicados;
- em elaboração.

---

### Materiais

```text
Dashboard

↓

Materiais
```

Também poderá acessar:

- materiais pendentes;
- materiais em revisão;
- materiais aprovados.

---

### Aprovação

```text
Dashboard

↓

Aprovação
```

Também poderá abrir diretamente materiais aguardando validação.

---

### Logística

```text
Dashboard

↓

Logística
```

Também poderá acessar:

- entregas pendentes;
- envios em andamento;
- confirmações de recebimento.

---

### Pagamentos

```text
Dashboard

↓

Pagamentos
```

Também poderá consultar:

- pagamentos pendentes;
- pagamentos concluídos;
- histórico financeiro.

---

### Contratos

```text
Dashboard

↓

Contratos
```

Também poderá acessar contratos:

- aguardando assinatura;
- vigentes;
- concluídos.

---

### Histórico

```text
Dashboard

↓

Histórico
```

Permite consultar registros relacionados às atividades autorizadas do usuário.

---

### Perfil

```text
Dashboard

↓

Perfil
```

Permite visualizar e atualizar informações pessoais autorizadas.

---

### Configurações

```text
Dashboard

↓

Configurações
```

Disponível apenas para perfis autorizados.

---

### Administração

```text
Dashboard

↓

Administração
```

Disponível exclusivamente para usuários com privilégios administrativos.

---

## Navegação Contextual

Além do menu principal, o Dashboard poderá iniciar jornadas diretamente por meio de:

- indicadores clicáveis;
- cartões de resumo;
- notificações;
- alertas;
- ações rápidas;
- atividades recentes;
- agenda.

Esses elementos devem conduzir o usuário exatamente ao ponto onde a ação precisa ser executada, preservando o contexto da operação e reduzindo etapas intermediárias.  [oai_citation:1‡UI/UX Design Studio – Spaceberry](https://spaceberry.studio/blog/dashboard-ui-four-best-practices-for-mobile-clarity?utm_source=chatgpt.com)

---

## Resultado Esperado

Ao sair do Dashboard, o usuário deverá:

- acessar imediatamente o módulo desejado;
- manter a sessão autenticada;
- preservar seu contexto operacional;
- iniciar uma nova jornada sem necessidade de navegação adicional desnecessária;
- conseguir retornar ao Dashboard a qualquer momento por meio da navegação global.

## Componentes

O Dashboard é composto por um conjunto padronizado de componentes responsáveis por apresentar contexto, indicadores, navegação e ações rápidas.

A organização desses componentes deve seguir uma hierarquia visual clara, permitindo que o usuário identifique rapidamente informações prioritárias e execute suas próximas ações com o menor esforço possível. Dashboards eficazes utilizam agrupamento lógico, destaque para informações críticas e organização consistente para facilitar a leitura e a tomada de decisão. ([m3.material.io](https://m3.material.io/components/cards/overview?utm_source=chatgpt.com))

---

### Navegação Global

Componente permanente responsável pela navegação principal da plataforma.

Elementos:

- logotipo;
- menu principal;
- pesquisa global;
- notificações;
- acesso ao perfil;
- configurações (quando autorizado);
- encerramento da sessão.

---

### Cabeçalho

Área responsável por contextualizar o usuário.

Informações exibidas:

- saudação personalizada;
- nome do usuário;
- organização ativa;
- data;
- período;
- contexto operacional.

---

### Indicadores (KPIs)

Área composta por cartões resumidos contendo os principais indicadores do perfil autenticado.

Exemplos:

- campanhas ativas;
- briefings pendentes;
- materiais aguardando aprovação;
- entregas pendentes;
- pagamentos pendentes;
- contratos aguardando assinatura.

Cada indicador poderá funcionar como atalho para sua respectiva área operacional.

---

### Ações Rápidas

Conjunto de atalhos destinados às operações mais frequentes.

Exemplos:

- Nova Marca;
- Nova Parceira;
- Nova Colaboração;
- Novo Briefing;
- Consultar Histórico.

As ações disponíveis variam conforme o perfil autenticado.

---

### Atividades Recentes

Lista cronológica contendo os eventos mais recentes relacionados ao usuário.

Exemplos:

- material enviado;
- briefing publicado;
- aprovação concluída;
- pagamento realizado;
- contrato assinado;
- colaboração encerrada.

Cada item poderá abrir diretamente o registro correspondente.

---

### Alertas

Área destinada à exibição de situações que exigem atenção imediata.

Exemplos:

- aprovações pendentes;
- campanhas próximas do prazo;
- entregas atrasadas;
- pagamentos bloqueados;
- contratos pendentes;
- inconsistências operacionais.

Alertas críticos devem possuir maior destaque visual que alertas informativos.

---

### Agenda

Apresenta compromissos futuros relacionados às atividades do usuário.

Exemplos:

- datas de publicação;
- entregas previstas;
- pagamentos programados;
- encerramentos de campanhas;
- prazos de aprovação.

---

### Notificações

Área responsável pela comunicação de eventos relevantes.

Exemplos:

- novas tarefas;
- alterações em campanhas;
- novos briefings;
- solicitações de ajuste;
- confirmações de pagamento;
- avisos administrativos.

As notificações devem permitir acesso direto ao recurso relacionado.

---

### Pesquisa Global

Campo de pesquisa disponível durante toda a utilização da plataforma.

Permite localizar rapidamente:

- marcas;
- parceiras;
- colaborações;
- briefings;
- materiais;
- contratos;
- pagamentos;
- registros históricos.

---

### Área Principal de Conteúdo

Região central da tela onde são organizados os componentes dinâmicos do Dashboard.

Sua composição varia conforme:

- perfil do usuário;
- permissões;
- contexto operacional;
- indicadores disponíveis;
- prioridades do momento.

---

### Rodapé

Área institucional utilizada para informações complementares.

Pode apresentar:

- versão da plataforma;
- ambiente (produção, homologação ou desenvolvimento);
- links institucionais;
- informações legais;
- suporte.

---

## Organização dos Componentes

Os componentes devem respeitar a seguinte hierarquia funcional:

```text
Dashboard

├── Navegação Global
├── Cabeçalho
├── Indicadores
├── Ações Rápidas
├── Alertas
├── Agenda
├── Atividades Recentes
├── Pesquisa Global
├── Conteúdo Principal
└── Rodapé
```

A disposição visual poderá adaptar-se ao dispositivo utilizado, porém a função e a responsabilidade de cada componente devem permanecer consistentes em todas as versões da interface.

---

## Regras Gerais

- todos os componentes devem respeitar a Matriz de Permissões;
- componentes sem conteúdo disponível podem ser ocultados ou apresentar estado vazio apropriado;
- informações críticas devem possuir prioridade visual sobre conteúdos informativos;
- componentes interativos devem indicar claramente sua possibilidade de navegação;
- a composição do Dashboard deve ser personalizada conforme o perfil autenticado, preservando uma estrutura consistente para todos os usuários.

## Ações

O Dashboard concentra as ações de maior frequência da plataforma, permitindo que o usuário inicie novas jornadas, acompanhe atividades em andamento e responda rapidamente às demandas prioritárias.

As ações disponíveis variam conforme o perfil autenticado e devem respeitar integralmente a Matriz de Permissões do TEAR.

Cada ação apresentada deve possuir um objetivo claro, ser facilmente identificável e conduzir diretamente ao fluxo correspondente. Dashboards orientados à ação devem reduzir a distância entre a informação e a execução, oferecendo caminhos diretos para as tarefas mais relevantes do usuário.  [oai_citation:0‡Software Patterns Lexicon](https://softwarepatternslexicon.com/observability-patterns/dashboards/designing-actionable-dashboards/?utm_source=chatgpt.com)

---

### Navegar entre Módulos

Permite acessar qualquer módulo autorizado da plataforma.

Exemplos:

- Marcas;
- Parceiras;
- Colaborações;
- Briefings;
- Pagamentos;
- Histórico.

---

### Iniciar Nova Operação

Permite iniciar rapidamente processos frequentes.

Exemplos:

- Nova Marca;
- Nova Parceira;
- Nova Colaboração;
- Novo Briefing;
- Novo Contrato.

As operações disponíveis variam conforme o perfil do usuário.

---

### Consultar Indicadores

Permite aprofundar informações apresentadas nos cartões de indicadores.

Exemplos:

- visualizar campanhas ativas;
- listar pagamentos pendentes;
- consultar materiais aguardando aprovação;
- abrir entregas em andamento.

Os indicadores funcionam como pontos de entrada para seus respectivos módulos.

---

### Abrir Notificações

Permite visualizar eventos recentes que exigem conhecimento ou ação do usuário.

Exemplos:

- novo briefing publicado;
- material enviado;
- solicitação de ajuste;
- contrato disponível;
- pagamento registrado.

---

### Responder Alertas

Permite acessar diretamente itens classificados como prioritários.

Exemplos:

- aprovações pendentes;
- entregas atrasadas;
- campanhas próximas do encerramento;
- contratos aguardando assinatura.

Sempre que possível, a ação deve direcionar o usuário exatamente ao registro que originou o alerta.

---

### Consultar Agenda

Permite visualizar compromissos futuros relacionados às campanhas.

Exemplos:

- publicações programadas;
- prazos de entrega;
- datas de pagamento;
- encerramentos de campanhas.

---

### Consultar Atividades Recentes

Permite revisar as últimas operações executadas.

Exemplos:

- campanhas criadas;
- briefings publicados;
- materiais enviados;
- pagamentos concluídos;
- contratos assinados.

Cada registro pode funcionar como atalho para sua respectiva tela de detalhes.

---

### Utilizar Pesquisa Global

Permite localizar rapidamente recursos da plataforma.

A pesquisa pode retornar:

- marcas;
- parceiras;
- colaborações;
- briefings;
- materiais;
- contratos;
- pagamentos;
- registros históricos.

---

### Acessar Perfil

Permite consultar ou atualizar informações pessoais autorizadas.

Exemplos:

- dados cadastrais;
- preferências;
- configurações pessoais.

---

### Encerrar Sessão

Permite finalizar com segurança a sessão autenticada.

Ao concluir a operação, o usuário é direcionado para a tela de autenticação.

---

## Ações Condicionais

Algumas ações somente serão exibidas quando determinadas condições forem satisfeitas.

Exemplos:

- existência de pendências;
- notificações disponíveis;
- permissões específicas;
- campanhas ativas;
- pagamentos em aberto;
- contratos pendentes.

Componentes sem ações disponíveis podem permanecer ocultos ou desabilitados, evitando distrações desnecessárias.

---

## Regras Gerais

- todas as ações devem respeitar a Matriz de Permissões;
- ações indisponíveis não devem ser exibidas ao usuário;
- ações críticas devem solicitar confirmação quando necessário;
- toda ação deve produzir feedback imediato;
- ações iniciadas a partir do Dashboard devem preservar o contexto da navegação;
- as ações mais frequentes devem possuir maior destaque visual;
- a quantidade de ações simultaneamente visíveis deve permanecer reduzida para evitar sobrecarga cognitiva, priorizando clareza e rapidez na tomada de decisão.  [oai_citation:1‡Microsoft Learn](https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/design-effective-cards?utm_source=chatgpt.com)

## Navegação

O Dashboard constitui o principal ponto de navegação do ecossistema TEAR.

Toda jornada operacional deve iniciar, retornar ou poder ser retomada a partir desta tela, garantindo ao usuário uma referência permanente durante a utilização da plataforma.

A navegação deve permanecer consistente em todas as áreas do sistema, separando claramente a navegação global (entre módulos) da navegação local (dentro de um módulo), preservando o contexto do usuário durante toda a experiência.  [oai_citation:0‡FanRuan Software](https://www.fanruan.com/en/blog/dashboard-navigation-best-practices?utm_source=chatgpt.com)

---

### Fluxo Principal

O fluxo mais frequente da plataforma ocorre da seguinte forma.

```text
Login

↓

Dashboard

↓

Selecionar Módulo

↓

Executar Operação
```

Após a autenticação, o Dashboard torna-se o ponto de partida para qualquer atividade.

---

### Retorno ao Dashboard

O usuário poderá retornar ao Dashboard a partir de qualquer tela da plataforma.

Fluxo:

```text
Qualquer Tela

↓

Dashboard
```

Esse retorno deve preservar a sessão autenticada e, sempre que possível, o contexto operacional.

---

### Navegação Global

O Dashboard disponibiliza acesso direto aos módulos autorizados.

```text
Dashboard

├── Marcas
├── Parceiras
├── Colaborações
├── Competências
├── Briefings
├── Materiais
├── Aprovação
├── Logística
├── Pagamentos
├── Contratos
├── Histórico
├── Perfil
├── Configurações
└── Administração
```

A estrutura da navegação permanece constante para todos os perfis.

O que varia é exclusivamente a disponibilidade dos módulos.

---

### Navegação por Indicadores

Os cartões de indicadores (KPIs) funcionam como atalhos contextuais.

Exemplo:

```text
Campanhas Ativas

↓

Lista de Colaborações
```

```text
Pagamentos Pendentes

↓

Módulo de Pagamentos
```

```text
Materiais em Aprovação

↓

Fila de Aprovação
```

Cada indicador deve direcionar o usuário exatamente para o conjunto de registros correspondente.

---

### Navegação por Ações Rápidas

As ações rápidas iniciam diretamente os fluxos mais frequentes.

Exemplo:

```text
Nova Parceira

↓

Cadastro de Parceira
```

```text
Nova Colaboração

↓

Assistente de Criação
```

Esses atalhos reduzem o número de interações necessárias para iniciar uma nova jornada.

---

### Navegação por Notificações

Cada notificação deve possuir navegação contextual.

Fluxo:

```text
Notificação

↓

Registro Relacionado

↓

Ação Correspondente
```

O usuário nunca deve precisar localizar manualmente o item notificado.

---

### Navegação por Alertas

Alertas operacionais direcionam imediatamente para a atividade que exige atenção.

Exemplos:

- aprovação pendente;
- entrega atrasada;
- contrato aguardando assinatura;
- pagamento bloqueado.

Cada alerta deve abrir diretamente o recurso relacionado.

---

### Navegação por Pesquisa

A pesquisa global permite localizar rapidamente qualquer recurso autorizado.

Fluxo:

```text
Pesquisa

↓

Resultado

↓

Tela Correspondente
```

Os resultados devem respeitar integralmente a Matriz de Permissões.

---

### Navegação entre Jornadas

Após concluir uma operação, o usuário poderá:

```text
Concluir Operação

├── Retornar ao Dashboard
├── Permanecer no Módulo
└── Iniciar Nova Operação
```

O sistema deve privilegiar a continuidade da jornada, reduzindo deslocamentos desnecessários.

---

### Navegação Responsiva

A arquitetura de navegação permanece única em todos os dispositivos.

A apresentação poderá adaptar-se ao espaço disponível, mantendo:

- hierarquia;
- previsibilidade;
- localização dos elementos;
- consistência dos fluxos.

Interfaces de dashboard com navegação consistente e persistente reduzem a carga cognitiva e aumentam a velocidade de execução das tarefas, especialmente em aplicações com múltiplos módulos.  [oai_citation:1‡FanRuan Software](https://www.fanruan.com/en/blog/dashboard-navigation-best-practices?utm_source=chatgpt.com)

---

### Regras Gerais

- o Dashboard é sempre o ponto central da navegação;
- qualquer módulo autorizado deve ser acessível diretamente a partir desta tela;
- o retorno ao Dashboard deve estar disponível durante toda a utilização da plataforma;
- a navegação deve preservar a sessão autenticada e, sempre que possível, o contexto operacional;
- indicadores, notificações e alertas devem funcionar como atalhos contextuais;
- o usuário nunca deve precisar percorrer múltiplas telas para iniciar uma nova jornada;
- a estrutura de navegação deve permanecer consistente independentemente do perfil autenticado.

## Estados

O Dashboard deve possuir estados de interface claramente definidos para garantir previsibilidade, continuidade da navegação e feedback adequado ao usuário em qualquer situação operacional.

Cada estado representa uma condição específica da tela e deve comunicar, de forma inequívoca, o que está acontecendo, por que está acontecendo e qual ação o usuário pode executar em seguida. Estados de interface bem definidos reduzem a incerteza, aumentam a confiança do usuário e evitam interpretações equivocadas sobre o funcionamento do sistema.  [oai_citation:0‡UI/UX Atlas](https://uiuxatlas.com/lessons/interaction-design/system-states-loading-skeleton-empty-error-and-success/?utm_source=chatgpt.com)

---

### Estado Inicial

Representa o momento imediatamente anterior ao carregamento dos dados.

Neste estado:

- a estrutura da tela é inicializada;
- componentes permanentes são renderizados;
- inicia-se a recuperação das informações necessárias.

O usuário ainda não interage com os dados operacionais.

---

### Carregamento

Representa o período durante o qual o Dashboard está obtendo informações.

Características:

- utilização de skeletons para preservar o layout;
- indicadores de carregamento quando necessário;
- componentes interativos temporariamente indisponíveis;
- ausência de mudanças bruscas na interface.

Sempre que possível, skeletons devem ser utilizados em vez de indicadores genéricos de carregamento, pois preservam a estrutura visual da tela e reduzem a percepção de espera.  [oai_citation:1‡UI/UX Atlas](https://uiuxatlas.com/lessons/interaction-design/system-states-loading-skeleton-empty-error-and-success/?utm_source=chatgpt.com)

---

### Conteúdo Disponível

Estado padrão da tela.

Neste estado:

- todos os componentes autorizados encontram-se disponíveis;
- indicadores apresentam dados atualizados;
- atalhos permanecem ativos;
- notificações podem ser consultadas;
- ações rápidas estão habilitadas.

Este representa o estado esperado durante a maior parte da utilização da plataforma.

---

### Sem Dados (Primeiro Acesso)

Representa situações em que ainda não existem informações suficientes para compor o Dashboard.

Exemplos:

- primeira utilização da plataforma;
- organização recém-criada;
- nenhuma campanha cadastrada;
- nenhuma atividade registrada.

Neste cenário, o sistema deverá:

- explicar por que não existem dados;
- orientar o usuário sobre a primeira ação recomendada;
- oferecer atalhos para iniciar o processo.

O estado vazio deve orientar o usuário, e não apenas informar a ausência de conteúdo. Ele deve explicar a situação e indicar claramente o próximo passo.  [oai_citation:2‡sap.com](https://www.sap.com/design-system/fiori-design-web/v1-136/foundations/best-practices/global-patterns/designing-for-empty-states?utm_source=chatgpt.com)

---

### Sem Resultados

Representa situações em que filtros, pesquisas ou critérios aplicados retornam zero registros.

Exemplos:

- pesquisa sem correspondência;
- filtros muito restritivos;
- período sem atividades.

Neste estado, o Dashboard deverá:

- informar que nenhum resultado foi encontrado;
- preservar filtros ativos;
- permitir limpar ou ajustar filtros rapidamente.

---

### Dados Parciais

Representa situações em que parte das informações foi carregada com sucesso, enquanto outros componentes permanecem indisponíveis.

Exemplos:

- indicadores carregados;
- agenda indisponível;
- notificações temporariamente inacessíveis.

O Dashboard deve continuar utilizável sempre que possível.

Componentes indisponíveis não devem impedir a utilização dos demais.

---

### Atualização

Representa a atualização automática ou manual das informações.

Durante este estado:

- a navegação permanece disponível;
- apenas componentes em atualização apresentam feedback visual;
- a interface evita recarregamentos completos desnecessários.

---

### Erro

Representa falhas que impediram a obtenção parcial ou total das informações.

Exemplos:

- indisponibilidade temporária;
- falha de comunicação;
- erro interno.

Neste estado, o Dashboard deverá:

- explicar que ocorreu uma falha;
- preservar o restante da interface quando possível;
- oferecer ação para tentar novamente;
- evitar mensagens técnicas ao usuário final.

Mensagens de erro devem ser específicas, orientadas à recuperação e indicar claramente a próxima ação possível, evitando mensagens genéricas que aumentem a incerteza.  [oai_citation:3‡UI/UX Atlas](https://uiuxatlas.com/lessons/interaction-design/system-states-loading-skeleton-empty-error-and-success/?utm_source=chatgpt.com)

---

### Sessão Expirada

Caso a sessão autenticada expire durante a utilização.

Fluxo:

```text
Sessão Expirada

↓

Notificação

↓

Nova Autenticação

↓

Dashboard
```

Nenhuma operação protegida deverá permanecer disponível após a expiração da sessão.

---

### Sem Permissão

Representa tentativas de acesso a componentes não autorizados para o perfil autenticado.

Neste estado:

- o componente poderá ser ocultado;
- ou substituído por uma mensagem institucional;
- nenhuma informação protegida será exibida.

---

### Offline ou Indisponibilidade Temporária

Representa perda temporária de comunicação com os serviços da plataforma.

Quando aplicável, o Dashboard deverá:

- informar a indisponibilidade;
- preservar informações previamente carregadas;
- permitir nova tentativa automaticamente ou sob solicitação do usuário.

---

## Transições Entre Estados

O Dashboard deverá permitir transições previsíveis entre seus estados.

```text
Inicial

↓

Carregamento

↓

Conteúdo

├── Atualização
├── Sem Dados
├── Sem Resultados
├── Dados Parciais
├── Erro
├── Offline
└── Sessão Expirada
```

Nenhuma transição deve provocar perda inesperada de contexto ou reinicialização desnecessária da interface.

---

## Regras Gerais

- todos os estados devem possuir representação visual consistente;
- o usuário deve compreender claramente o estado atual da tela;
- estados vazios devem orientar a próxima ação;
- erros devem oferecer mecanismos de recuperação;
- componentes parcialmente indisponíveis não devem bloquear toda a interface;
- alterações de estado devem preservar a navegação e, sempre que possível, o contexto operacional;
- o Dashboard deve permanecer funcional mesmo diante de falhas parciais dos serviços.

## Permissões

O Dashboard é acessível a todos os usuários autenticados da plataforma.

Entretanto, o acesso ao Dashboard não implica acesso irrestrito às informações nele apresentadas.

Toda informação, componente, indicador, ação e atalho deve respeitar integralmente a Matriz de Permissões do ecossistema TEAR, implementada por meio de Controle de Acesso Baseado em Papéis (Role-Based Access Control — RBAC). Nesse modelo, a autorização é determinada pelas permissões associadas ao papel do usuário, e não pela tela em si.  [oai_citation:0‡Microsoft Learn](https://learn.microsoft.com/en-gb/azure/azure-portal/azure-portal-dashboard-share-access?utm_source=chatgpt.com)

---

## Princípios Gerais

O Dashboard deve obedecer aos seguintes princípios:

- autenticação obrigatória;
- autorização baseada em papéis (RBAC);
- princípio do menor privilégio;
- isolamento entre organizações, quando aplicável;
- ocultação de funcionalidades não autorizadas;
- proteção de informações sensíveis;
- rastreabilidade das ações executadas.

Nenhum componente deverá expor informações para as quais o usuário não possua autorização.

---

## Matriz de Acesso

| Perfil | Visualizar Dashboard | Indicadores | Ações Rápidas | Alertas | Notificações | Administração |
|----------|:-------------------:|:-----------:|:-------------:|:--------:|:------------:|:-------------:|
| Administrador | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Gestor de Marca | ✔ | ✔ | ✔ | ✔ | ✔ | Conforme Permissão |
| Gestor de Influenciadoras | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| Operação | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| Financeiro | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| Influenciadora | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| Auditoria | ✔ | ✔ | Limitado | Limitado | Limitado | ✖ |

A disponibilidade efetiva de cada funcionalidade depende das permissões concedidas ao usuário e do contexto operacional vigente.

---

## Controle dos Componentes

Cada componente do Dashboard deverá validar individualmente sua autorização.

Exemplos:

- indicadores financeiros somente para perfis autorizados;
- pagamentos apenas para usuários com acesso financeiro;
- administração apenas para administradores;
- informações pessoais restritas ao próprio usuário;
- métricas globais apenas para perfis com visão institucional.

A autorização deve ocorrer antes da recuperação e apresentação dos dados.

---

## Controle das Ações

Toda ação iniciada pelo Dashboard deve possuir validação própria de autorização.

Exemplos:

- criar nova marca;
- cadastrar parceira;
- publicar briefing;
- aprovar materiais;
- registrar pagamentos;
- acessar configurações administrativas.

Caso a permissão seja removida durante a sessão, novas tentativas de execução deverão ser bloqueadas imediatamente.

---

## Visibilidade dos Componentes

O Dashboard poderá adaptar sua interface conforme as permissões disponíveis.

Componentes não autorizados poderão:

- não ser renderizados;
- permanecer ocultos;
- ser exibidos como indisponíveis, quando houver justificativa de experiência do usuário.

A decisão deverá seguir o padrão definido pela arquitetura da plataforma para garantir consistência entre todos os módulos.

---

## Proteção de Dados

Mesmo quando um componente estiver visível, seu conteúdo deverá respeitar o escopo autorizado.

Exemplos:

- influenciadoras visualizam apenas seus próprios dados;
- gestores visualizam apenas registros sob sua responsabilidade;
- financeiro visualiza apenas informações financeiras autorizadas;
- auditoria possui acesso somente para consulta.

A autorização deve controlar simultaneamente:

- acesso ao componente;
- acesso aos dados;
- ações permitidas;
- abrangência das informações exibidas.

---

## Auditoria

Todas as operações relevantes iniciadas a partir do Dashboard deverão gerar registros de auditoria quando aplicável.

Podem ser registrados:

- acesso ao Dashboard;
- abertura de módulos;
- execução de ações críticas;
- falhas de autorização;
- tentativas de acesso negadas.

Esses registros devem seguir a política de auditoria definida pelo ecossistema TEAR.

---

## Regras Gerais

- nenhum usuário não autenticado pode acessar o Dashboard;
- todo componente deve validar permissões antes da exibição;
- toda ação deve validar permissões antes da execução;
- permissões são determinadas pelo papel do usuário e pelo contexto operacional;
- componentes nunca devem expor dados não autorizados;
- alterações de permissão devem produzir efeito imediato, sem necessidade de nova autenticação;
- o Dashboard deve permanecer consistente independentemente do conjunto de permissões disponível para cada perfil.

## Observações

O Dashboard é um componente transversal do ecossistema TEAR e não deve ser tratado como um módulo operacional independente.

Sua principal responsabilidade é consolidar informações relevantes, orientar o usuário e servir como ponto permanente de navegação entre os módulos da plataforma.

---

### Papel Arquitetural

O Dashboard não é responsável por executar regras de negócio específicas dos módulos.

Sua função limita-se a:

- apresentar informações consolidadas;
- disponibilizar indicadores;
- exibir alertas;
- oferecer atalhos;
- facilitar a tomada de decisão;
- direcionar o usuário para os fluxos operacionais apropriados.

Toda regra de negócio permanece sob responsabilidade do módulo proprietário da funcionalidade.

---

### Fonte das Informações

O Dashboard não constitui a origem oficial dos dados apresentados.

Todos os indicadores, métricas, notificações e resumos devem ser obtidos a partir dos módulos responsáveis por cada domínio do sistema.

Como consequência:

- não deve existir duplicação de regras de negócio;
- não deve existir persistência própria do Dashboard;
- informações exibidas representam apenas uma visão consolidada do estado atual da plataforma.

---

### Atualização dos Dados

Sempre que tecnicamente viável, as informações exibidas devem refletir o estado mais recente disponível.

Atualizações podem ocorrer:

- durante o carregamento inicial;
- sob solicitação do usuário;
- automaticamente durante a sessão;
- após a conclusão de operações relevantes.

A estratégia de atualização deverá equilibrar desempenho, consistência e disponibilidade das informações.

---

### Escalabilidade

O Dashboard deve permitir a inclusão de novos indicadores, componentes e áreas de resumo sem exigir alterações estruturais na arquitetura da tela.

Novos elementos devem ser incorporados como componentes independentes, respeitando:

- a hierarquia visual;
- a Matriz de Permissões;
- os princípios de modularidade;
- a consistência da experiência do usuário.

---

### Personalização

A estrutura do Dashboard permanece única para toda a plataforma.

A personalização ocorre exclusivamente por meio de:

- permissões;
- perfil do usuário;
- organização ativa;
- contexto operacional;
- disponibilidade das informações.

Essa abordagem evita múltiplas versões da mesma tela e reduz a complexidade de manutenção.

---

### Desempenho

O Dashboard deve priorizar rapidez de carregamento e baixa carga cognitiva.

Para isso, recomenda-se:

- carregamento progressivo dos componentes;
- atualização independente entre widgets;
- reutilização de informações quando apropriado;
- redução de consultas desnecessárias;
- renderização apenas dos componentes autorizados.

A tela deve permanecer responsiva mesmo quando determinados componentes estiverem temporariamente indisponíveis.

---

### Consistência

Toda a experiência do Dashboard deve seguir os princípios definidos pelo Design System e pela Arquitetura de Interface do TEAR.

Devem permanecer consistentes:

- nomenclatura;
- comportamento dos componentes;
- padrões de navegação;
- feedback visual;
- estados da interface;
- hierarquia das informações.

A consistência reduz a carga cognitiva, facilita o aprendizado e aumenta a previsibilidade da navegação em aplicações com múltiplos módulos e perfis de usuário.  [oai_citation:0‡ArcGIS](https://doc.arcgis.com/en/dashboards/latest/reference/author-effective-dashboards.htm?utm_source=chatgpt.com)

---

### Considerações Finais

O Dashboard representa a visão operacional da plataforma em um determinado momento.

Ele deve responder rapidamente às principais necessidades do usuário, sem substituir as funcionalidades especializadas dos módulos do sistema.

Seu sucesso é medido pela capacidade de:

- reduzir o tempo necessário para identificar prioridades;
- facilitar o acesso às jornadas mais frequentes;
- fornecer contexto suficiente para a tomada de decisão;
- manter uma experiência consistente para todos os perfis;
- permanecer escalável à medida que o ecossistema TEAR evolui.
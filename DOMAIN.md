# Domínio do Projeto TEAR V2

## Objetivo

Este documento descreve o domínio de negócio do Projeto TEAR V2.

Seu propósito é definir os conceitos fundamentais do sistema, a linguagem utilizada pelo negócio e as responsabilidades dos principais elementos do domínio.

Este documento representa a visão conceitual do negócio e deve permanecer independente de tecnologias, frameworks, banco de dados ou detalhes de implementação.

---

# O Domínio

O Projeto TEAR V2 é um sistema de gestão do Programa de Parcerias do Estúdio Elã.

Seu domínio concentra todas as operações necessárias para administrar o relacionamento entre a empresa e suas parceiras comerciais, desde o cadastro inicial até o encerramento de uma colaboração.

O sistema modela exclusivamente as regras de negócio envolvidas nesse processo, abstraindo aspectos técnicos como persistência, autenticação ou infraestrutura.

---

# Escopo do Domínio

O domínio compreende as seguintes capacidades de negócio:

- cadastro e manutenção de parceiras;
- definição das condições comerciais;
- planejamento das colaborações mensais;
- distribuição de briefings;
- acompanhamento das entregas;
- controle logístico;
- gestão de pagamentos;
- emissão de documentos;
- autenticação dos usuários do Portal;
- arquivamento do histórico operacional.

Essas capacidades representam o núcleo funcional do sistema e orientam toda a modelagem do domínio.

---

# Linguagem Ubíqua

O Projeto TEAR adota uma linguagem única compartilhada entre negócio, documentação e código-fonte.

Todos os artefatos do projeto devem utilizar os mesmos termos para evitar ambiguidades e garantir consistência entre especialistas do negócio e equipe técnica, conforme os princípios do Domain-Driven Design.  [oai_citation:0‡Microsoft Learn](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/best-practice-an-introduction-to-domain-driven-design?utm_source=chatgpt.com)

Os principais conceitos do domínio são:

| Termo | Definição |
|-------|-----------|
| Parceira | Pessoa responsável pela produção de conteúdo para uma marca. |
| Colaboração | Relação comercial entre a marca e uma Parceira durante um período específico. |
| Briefing | Conjunto de orientações para execução de uma colaboração. |
| Entrega | Material produzido pela Parceira para cumprimento do briefing. |
| Envio | Processo logístico relacionado aos produtos utilizados na colaboração. |
| Pagamento | Obrigação financeira decorrente de uma colaboração concluída. |
| Documento | Artefato formal gerado pelo sistema para registrar obrigações ou acordos. |
| Sessão | Estado temporário de autenticação de um usuário do Portal. |
| Identidade | Registro que representa um usuário autenticado no sistema. |

Toda evolução do projeto deve preservar essa terminologia.

---

# Contexto de Negócio

O TEAR atua como sistema central de operação do Programa de Parcerias.

Sua responsabilidade é organizar, controlar e registrar todas as atividades relacionadas às colaborações realizadas entre o Estúdio Elã, suas marcas e as Parceiras participantes.

O sistema não substitui ferramentas externas de comunicação ou produção de conteúdo.

Seu foco é manter a integridade das informações de negócio e garantir que cada colaboração siga o fluxo operacional definido pelo programa.

---

# Princípios do Domínio

O domínio do Projeto TEAR V2 é guiado pelos seguintes princípios:

## Centralização das Regras de Negócio

Toda regra operacional deve ser representada pelo modelo de domínio, evitando que decisões de negócio sejam distribuídas entre interface, infraestrutura ou mecanismos de persistência.

---

## Independência Tecnológica

Os conceitos do domínio não dependem de Google Apps Script, Google Sheets ou qualquer outra tecnologia utilizada pela implementação.

O modelo de negócio permanece válido mesmo que a infraestrutura seja substituída no futuro.

---

## Consistência Terminológica

Cada conceito possui um único significado dentro do sistema.

Não devem existir sinônimos para representar a mesma entidade de negócio nem um mesmo termo para representar conceitos diferentes.

---

## Evolução Controlada

Novos conceitos de domínio somente devem ser introduzidos quando representarem uma necessidade real do negócio.

Toda alteração significativa na linguagem ubíqua ou no modelo conceitual deve ser refletida na documentação oficial antes de sua implementação no código.

---

# Entidades do Domínio

As entidades representam os principais conceitos do negócio que possuem identidade própria e permanecem reconhecíveis ao longo de seu ciclo de vida.

Cada entidade encapsula dados, comportamento e regras de negócio relacionadas à sua responsabilidade.

## Parceira

A Parceira representa a pessoa participante do Programa de Parcerias.

É a entidade central do domínio e concentra todas as informações necessárias para participação nas colaborações.

Uma Parceira pode participar de diversas Colaborações ao longo do tempo.

---

## Colaboração

A Colaboração representa um acordo operacional realizado entre o Estúdio Elã e uma Parceira durante um determinado período.

Ela constitui a unidade central de trabalho do sistema.

Cada Colaboração possui seu próprio ciclo operacional, independentemente das demais.

---

## Briefing

O Briefing representa o conjunto de orientações fornecidas para execução de uma Colaboração.

Seu objetivo é definir claramente o conteúdo esperado, prazos e requisitos da campanha.

---

## Entrega

A Entrega representa o material produzido pela Parceira em resposta ao Briefing.

Cada Entrega percorre um fluxo próprio de produção, aprovação e arquivamento.

---

## Envio

O Envio representa o processo logístico associado a uma Colaboração.

Seu objetivo é controlar a movimentação dos produtos utilizados durante a campanha.

---

## Pagamento

O Pagamento representa uma obrigação financeira originada por uma Colaboração.

Seu ciclo de vida acompanha a evolução do processo financeiro até sua conclusão.

---

## Documento

O Documento representa um artefato formal emitido pelo sistema para registrar informações relevantes da operação.

Dependendo do contexto, diferentes tipos de documentos podem ser produzidos.

---

## Sessão

A Sessão representa um acesso autenticado ao Portal.

Sua responsabilidade é controlar a permanência temporária do usuário autenticado.

---

## Identidade

A Identidade representa um usuário reconhecido pelo sistema.

Ela estabelece a relação entre autenticação, permissões e acesso às funcionalidades disponíveis.

---

# Relacionamentos do Domínio

As entidades do domínio relacionam-se conforme o fluxo operacional do Programa de Parcerias.

```text
Parceira
      │
      ▼
Colaboração
      │
      ├────────► Briefing
      │
      ├────────► Entrega
      │
      ├────────► Envio
      │
      ├────────► Pagamento
      │
      └────────► Documento

Parceira
      │
      ▼
Identidade
      │
      ▼
Sessão
```

Esses relacionamentos representam dependências conceituais do domínio e não devem ser interpretados como relações físicas de banco de dados.

---

# Objetos de Valor

Além das entidades, o domínio utiliza Objetos de Valor para representar informações definidas exclusivamente por seus atributos, sem identidade própria, conforme os princípios do Domain-Driven Design.  [oai_citation:0‡Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis?utm_source=chatgpt.com)

Exemplos presentes no domínio incluem:

- Endereço
- Chave PIX
- Valor Monetário
- Mês de Referência
- Ano de Referência
- Prazo de Uso de Imagem
- Quantidade de Looks
- Canais de Uso de Imagem

Esses objetos são utilizados para descrever características das entidades, mas não possuem ciclo de vida independente.

---

# Serviços de Domínio

Algumas operações do negócio não pertencem naturalmente a uma única entidade.

Nesses casos, o domínio utiliza Serviços de Domínio para coordenar regras que envolvem múltiplas entidades.

Esses serviços devem:

- representar operações genuinamente do negócio;
- manter o domínio consistente;
- evitar duplicação de regras;
- preservar a responsabilidade das entidades.

Serviços de domínio não executam tarefas de infraestrutura, persistência ou comunicação externa.

---

# Estados do Domínio

As entidades evoluem através de estados definidos pelas regras de negócio.

Cada transição representa uma mudança válida dentro do ciclo operacional do sistema.

Os estados específicos de cada entidade são definidos em seus respectivos documentos funcionais e devem permanecer consistentes com a Linguagem Ubíqua adotada pelo projeto.

Novos estados somente devem ser introduzidos quando representarem uma necessidade real do negócio e não apenas uma conveniência técnica.

---

# Regras Fundamentais do Domínio

O comportamento do Projeto TEAR V2 é governado por um conjunto de regras de negócio que garantem a consistência das operações e preservam a integridade do modelo de domínio.

Essas regras representam decisões do negócio e devem permanecer independentes de detalhes de implementação, persistência ou infraestrutura.

As principais regras incluem:

- uma Parceira pode participar de diversas Colaborações ao longo do tempo;
- cada Colaboração pertence a uma única Parceira;
- uma Colaboração pode originar Briefings, Entregas, Envios, Pagamentos e Documentos;
- todo Pagamento deve estar associado a uma Colaboração;
- toda Entrega deve estar vinculada ao Briefing correspondente;
- toda Sessão deve estar associada a uma Identidade válida;
- alterações de estado devem respeitar o ciclo de vida definido para cada entidade.

Essas regras representam o comportamento esperado do domínio e não dependem da tecnologia utilizada para implementá-las.

---

# Invariantes do Domínio

Os invariantes representam condições que devem permanecer verdadeiras durante toda a existência do sistema.

Sua violação compromete a consistência do modelo de negócio.

Os principais invariantes do Projeto TEAR V2 são:

- toda entidade possui identidade única;
- toda Colaboração pertence exatamente a uma Parceira;
- nenhum Pagamento existe sem uma Colaboração correspondente;
- nenhuma Entrega existe sem um Briefing associado;
- toda Sessão está vinculada a uma Identidade existente;
- as regras de negócio permanecem independentes da infraestrutura;
- a linguagem ubíqua é utilizada de forma consistente em código, documentação e comunicação.

Esses invariantes devem ser preservados independentemente da evolução tecnológica do sistema.

---

# Limites do Domínio

O Projeto TEAR V2 concentra exclusivamente o domínio de gestão do Programa de Parcerias.

Não fazem parte deste domínio:

- processamento financeiro bancário;
- transporte ou rastreamento logístico externo;
- autenticação provida por terceiros;
- envio de e-mails;
- armazenamento físico de arquivos;
- integrações específicas com plataformas externas.

Esses serviços podem ser utilizados pelo sistema, mas pertencem a domínios distintos e são tratados como dependências externas, preservando o isolamento do modelo de negócio.  [oai_citation:0‡Microsoft Learn](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/best-practice-an-introduction-to-domain-driven-design?utm_source=chatgpt.com)

---

# Evolução do Domínio

O domínio deve evoluir acompanhando as necessidades do Programa de Parcerias.

Novos conceitos somente devem ser incorporados quando representarem uma ampliação legítima do negócio.

Mudanças no modelo conceitual devem:

- preservar a Linguagem Ubíqua;
- manter a consistência das entidades existentes;
- evitar duplicidade de conceitos;
- ser refletidas na documentação antes da implementação.

A evolução do domínio deve priorizar clareza conceitual em vez de conveniências técnicas.

---

# Relação com a Arquitetura

O domínio constitui o núcleo do Projeto TEAR V2.

A arquitetura, a infraestrutura e os mecanismos de persistência existem para suportar o domínio, nunca para defini-lo.

As camadas técnicas devem adaptar-se às necessidades do negócio, preservando o isolamento entre regras de negócio e detalhes tecnológicos.

Essa separação permite que o domínio permaneça estável mesmo diante de mudanças na implementação.

---

# Documentação Relacionada

Este documento apresenta a visão conceitual do domínio.

Os demais aspectos do projeto encontram-se distribuídos na documentação oficial.

| Documento | Objetivo |
|-----------|----------|
| `README.md` | Visão geral do projeto |
| `ARCHITECTURE.md` | Arquitetura de alto nível |
| `docs/engenharia_reversa/DOMAIN_MAP.md` | Descoberta do domínio a partir do código |
| `docs/engenharia_reversa/SYSTEM_ARCHITECTURE.md` | Arquitetura técnica detalhada |
| `docs/engenharia_reversa/DATA_FLOW.md` | Fluxo dos dados |
| `docs/adrs/` | Registro das decisões arquiteturais |

---

# Considerações Finais

O `DOMAIN.md` é a referência oficial do modelo de negócio do Projeto TEAR V2.

Seu objetivo é preservar o conhecimento do domínio ao longo da evolução do sistema, garantindo que desenvolvedores, arquitetos e especialistas do negócio compartilhem a mesma compreensão sobre os conceitos fundamentais da aplicação.

Toda alteração significativa na linguagem, nas entidades ou nas regras de negócio deve ser refletida neste documento antes de sua implementação, mantendo o domínio como a principal referência conceitual do projeto.  [oai_citation:1‡Microsoft Learn](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/best-practice-an-introduction-to-domain-driven-design?utm_source=chatgpt.com)
# Data Model

O Modelo de Dados (Data Model) descreve como as informações do Projeto TEAR V2 são organizadas sob a perspectiva do domínio da aplicação.

Seu objetivo é documentar as principais entidades, seus relacionamentos e as regras de organização dos dados, independentemente da tecnologia utilizada para persistência.

Este documento representa o modelo lógico de dados da aplicação. Ele serve como referência para o desenvolvimento, manutenção e evolução do sistema, enquanto os detalhes físicos de armazenamento permanecem isolados nas camadas de infraestrutura. Um modelo lógico descreve entidades, atributos e relacionamentos de negócio de forma independente da implementação física.  [oai_citation:0‡HHS.gov](https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/26-Logical%20Data%20Model/eplc_logical_data_model_practices_guide.pdf?utm_source=chatgpt.com)

---

# Objetivo

Este documento tem como objetivos:

- documentar o modelo lógico de dados do sistema;
- identificar as principais entidades do domínio;
- definir os relacionamentos entre essas entidades;
- estabelecer princípios para organização dos dados;
- servir como referência para desenvolvimento e evolução da aplicação.

---

# Escopo

Este documento contempla:

- entidades do domínio;
- relacionamentos entre entidades;
- organização lógica dos dados;
- responsabilidades das entidades;
- princípios de persistência.

Não fazem parte deste documento:

- estrutura física das planilhas;
- nomes de abas;
- nomes de colunas;
- detalhes das ACLs;
- implementação dos Repositories;
- tecnologias de armazenamento.

Esses assuntos pertencem à documentação de engenharia reversa e à camada de infraestrutura.

---

# Princípios do Modelo de Dados

O modelo de dados do Projeto TEAR V2 segue princípios que priorizam clareza, consistência e independência tecnológica.

## Domínio em Primeiro Lugar

As entidades representam conceitos do negócio.

O modelo não deve refletir limitações da tecnologia de persistência nem a organização física das planilhas.

---

## Independência da Persistência

O modelo lógico permanece o mesmo independentemente do mecanismo utilizado para armazenar os dados.

Mudanças na infraestrutura não devem alterar o significado das entidades do domínio.

---

## Fonte Única da Verdade

Cada informação possui apenas um local oficial de persistência.

Duplicações de dados devem ser evitadas sempre que possível.

---

## Baixo Acoplamento

As entidades não possuem conhecimento sobre:

- planilhas;
- colunas;
- abas;
- Google Drive;
- Google Apps Script.

Esses detalhes pertencem exclusivamente às camadas de infraestrutura.

---

## Consistência

As relações entre entidades devem refletir o funcionamento real do negócio.

Toda alteração no modelo deve preservar a integridade dos dados e das regras de domínio.

---

# Visão Geral

O Projeto TEAR V2 organiza suas informações em torno do ciclo operacional das parcerias.

As entidades do domínio representam os principais elementos desse processo, enquanto seus relacionamentos descrevem como essas informações evoluem ao longo do ciclo de vida de uma colaboração.

De forma simplificada, o modelo pode ser representado conforme abaixo.

```text
Parceira
     │
     │ 1:N
     ▼
Colaboração
     │
     ├────────► Briefing
     │
     ├────────► Entrega
     │
     ├────────► Documento
     │
     └────────► Pagamento
```

Essa representação evidencia apenas os relacionamentos conceituais do domínio, sem considerar detalhes de implementação ou persistência.

---

# Entidades Principais

O modelo lógico do Projeto TEAR V2 é composto pelas seguintes entidades principais.

| Entidade | Finalidade |
|----------|------------|
| Parceira | Representa uma participante do programa de parcerias |
| Colaboração | Representa um ciclo de colaboração entre a marca e a parceira |
| Briefing | Define as orientações para uma colaboração |
| Entrega | Representa os materiais enviados pela parceira |
| Documento | Representa contratos e demais documentos relacionados |
| Pagamento | Representa a remuneração devida pela colaboração |
| Usuário | Representa identidades com acesso ao Portal |

Cada entidade possui responsabilidades próprias e participa de um ou mais relacionamentos dentro do domínio.

---

# Relacionamentos Conceituais

As entidades do domínio relacionam-se de forma a representar o fluxo operacional do sistema.

De maneira geral:

- uma Parceira pode participar de diversas Colaborações;
- uma Colaboração possui um Briefing associado;
- uma Colaboração pode gerar uma ou mais Entregas;
- uma Colaboração pode possuir Documentos relacionados;
- uma Colaboração pode gerar um Pagamento;
- um Usuário interage com as informações disponibilizadas pelo Portal.

Os relacionamentos descritos neste documento representam o modelo lógico do domínio e não devem ser confundidos com a estrutura física utilizada para armazenar os dados.

---

# Estrutura do Modelo

O modelo de dados do Projeto TEAR V2 é organizado em entidades independentes que representam os principais conceitos do domínio.

Cada entidade possui responsabilidades específicas e relaciona-se com outras entidades por meio de associações definidas pelas regras de negócio.

Essa organização facilita a evolução do sistema e reduz o acoplamento entre os diferentes módulos da aplicação.

---

# Atributos das Entidades

Cada entidade é composta por um conjunto de atributos que descrevem seu estado.

Os atributos devem representar exclusivamente informações relevantes para o domínio.

Exemplos de atributos incluem:

- identificadores;
- informações cadastrais;
- estados;
- datas;
- valores;
- referências para outras entidades.

A definição dos atributos deve refletir o significado do negócio e permanecer independente da forma como serão armazenados fisicamente. Um modelo lógico documenta entidades, atributos e relacionamentos sem depender da tecnologia de persistência utilizada.  [oai_citation:0‡HHS.gov](https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/26-Logical%20Data%20Model/eplc_logical_data_model_practices_guide.pdf?utm_source=chatgpt.com)

---

# Relacionamentos

As entidades do domínio relacionam-se de acordo com as regras operacionais do sistema.

Os principais relacionamentos podem ser representados da seguinte forma.

```text
Parceira
      │
      │ 1:N
      ▼
Colaboração
      │
      ├────────► Briefing
      │
      ├────────► Entrega
      │
      ├────────► Documento
      │
      └────────► Pagamento

Usuário
      │
      └────────► Portal
```

Os relacionamentos representam dependências de negócio e não vínculos físicos entre tabelas, planilhas ou arquivos.

---

# Persistência dos Dados

O modelo lógico é independente da tecnologia utilizada para armazenamento.

A persistência é responsabilidade exclusiva da camada de infraestrutura.

No Projeto TEAR V2, a persistência pode utilizar diferentes mecanismos sem alterar o modelo lógico das entidades.

Essa separação garante que mudanças na infraestrutura não afetem o domínio da aplicação.

---

# Fluxo dos Dados

Os dados percorrem a arquitetura seguindo um fluxo padronizado.

```text
Interface

↓

Aplicação

↓

Domínio

↓

Repositórios

↓

Persistência
```

Em nenhum momento as entidades do domínio acessam diretamente mecanismos de armazenamento.

Essa responsabilidade pertence às camadas inferiores da arquitetura.

---

# Integridade dos Dados

A consistência das informações é preservada pelas regras do domínio.

Entre os princípios adotados estão:

- cada entidade possui identidade própria;
- relacionamentos devem permanecer consistentes;
- estados inválidos não devem ser persistidos;
- duplicidade de informações deve ser evitada;
- alterações devem preservar os invariantes do domínio.

As validações de negócio ocorrem antes da persistência dos dados.

---

# Independência da Implementação

O modelo descrito neste documento não depende de:

- Google Sheets;
- Google Drive;
- bancos de dados relacionais;
- bancos NoSQL;
- APIs;
- formato de armazenamento.

Esses elementos pertencem à infraestrutura da aplicação.

O objetivo do modelo lógico é representar apenas a estrutura e o significado dos dados do domínio, permitindo que diferentes tecnologias de persistência sejam utilizadas sem alterar a modelagem de negócio.  [oai_citation:1‡HHS.gov](https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/26-Logical%20Data%20Model/eplc_logical_data_model_practices_guide.pdf?utm_source=chatgpt.com)

---

# Responsabilidades

A gestão do modelo de dados é compartilhada entre as diferentes camadas da arquitetura, respeitando o princípio da separação de responsabilidades.

| Camada | Responsabilidade |
|--------|------------------|
| Domínio | Define as entidades, atributos e regras de negócio |
| Aplicação | Orquestra operações envolvendo as entidades |
| Repositórios | Manipulam entidades sem conhecer detalhes da infraestrutura |
| Infraestrutura | Realiza a persistência física dos dados |

Cada camada deve atuar exclusivamente dentro de sua responsabilidade, preservando a independência do modelo lógico em relação à implementação física.

---

# Evolução do Modelo

O modelo de dados deve evoluir juntamente com o domínio da aplicação.

Novas entidades, atributos ou relacionamentos somente devem ser adicionados quando representarem uma necessidade real do negócio.

Sempre que houver alterações no modelo, recomenda-se:

- preservar a compatibilidade com as regras existentes;
- evitar duplicação de informações;
- revisar os relacionamentos afetados;
- atualizar a documentação correspondente;
- validar os impactos sobre os demais módulos do sistema.

O modelo lógico deve permanecer alinhado aos requisitos de negócio e ser revisado periodicamente à medida que o domínio evolui.  [oai_citation:0‡HHS.gov](https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/26-Logical%20Data%20Model/eplc_logical_data_model_practices_guide.pdf?utm_source=chatgpt.com)

---

# Boas Práticas

A evolução do modelo de dados deve seguir alguns princípios fundamentais.

- utilizar nomes que representem conceitos do negócio;
- manter entidades coesas e com responsabilidades bem definidas;
- evitar redundância de informações;
- documentar novos atributos e relacionamentos;
- preservar a consistência dos relacionamentos;
- manter independência da tecnologia de persistência;
- evitar que detalhes físicos influenciem o modelo lógico.

O modelo de dados deve representar o domínio da aplicação, e não a forma como os dados são armazenados.

---

# Relação com os Demais Documentos

O Modelo de Dados complementa a documentação arquitetural do Projeto TEAR V2.

| Documento | Finalidade |
|-----------|------------|
| `README.md` | Visão geral do projeto |
| `SYSTEM_CONTEXT.md` | Contexto do sistema e integrações |
| `ARCHITECTURE.md` | Arquitetura da aplicação |
| `DOMAIN.md` | Conceitos e regras de negócio |
| `UI_ARCHITECTURE.md` | Organização da camada de apresentação |
| `DEVELOPMENT_GUIDE.md` | Processo de desenvolvimento |
| `CONTRIBUTING.md` | Processo de contribuição |

Em conjunto, esses documentos descrevem a aplicação sob diferentes perspectivas, mantendo uma separação clara entre contexto, arquitetura, domínio, interface, dados e desenvolvimento.

---

# Manutenção do Modelo

O modelo de dados deve permanecer sincronizado com a evolução do domínio.

Sempre que houver alterações significativas nas entidades ou em seus relacionamentos, este documento deverá ser atualizado para refletir o estado atual da aplicação.

A documentação deve representar fielmente o modelo implementado, servindo como referência para desenvolvedores, arquitetos e demais colaboradores do projeto.

---

# Considerações Finais

O `DATA_MODEL.md` documenta o modelo lógico de dados do Projeto TEAR V2.

Seu propósito é representar as entidades do domínio, seus atributos e relacionamentos de forma independente da tecnologia utilizada para armazenamento, preservando uma visão orientada ao negócio.

Ao manter um modelo de dados claro, consistente e desacoplado da infraestrutura, o projeto facilita a evolução da aplicação, melhora a comunicação entre os colaboradores e estabelece uma base sólida para futuras implementações e mudanças arquiteturais. Um modelo lógico bem documentado funciona como a ponte entre os requisitos de negócio e a implementação física dos dados.  [oai_citation:1‡HHS.gov](https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/26-Logical%20Data%20Model/eplc_logical_data_model_practices_guide.pdf?utm_source=chatgpt.com)
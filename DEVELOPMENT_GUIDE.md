# Development Guide

## Objetivo

Este documento define o fluxo oficial de desenvolvimento do Projeto TEAR V2.

Seu objetivo é padronizar a forma como novas funcionalidades são implementadas, testadas, documentadas e entregues, garantindo consistência entre todos os desenvolvedores que atuam no projeto.

Este guia complementa a documentação arquitetural e deve ser utilizado como referência durante todo o ciclo de desenvolvimento.

---

# Público-Alvo

Este documento destina-se a:

- desenvolvedores;
- arquitetos de software;
- revisores de código;
- colaboradores do projeto;
- agentes de IA que participam do desenvolvimento.

Não é um manual de utilização do sistema nem uma documentação funcional.

---

# Princípios de Desenvolvimento

Todo desenvolvimento realizado no Projeto TEAR deve seguir os seguintes princípios.

## Arquitetura em Primeiro Lugar

Toda implementação deve respeitar a arquitetura definida em `ARCHITECTURE.md`.

Nenhuma decisão de implementação pode violar as responsabilidades das camadas do sistema.

---

## Domínio como Fonte da Verdade

As regras de negócio pertencem exclusivamente ao domínio.

Antes de implementar qualquer funcionalidade, o desenvolvedor deve compreender os conceitos descritos em `DOMAIN.md`.

Nenhuma regra de negócio deve ser criada diretamente em Controllers, Repositories, ACLs ou componentes de interface.

---

## Documentação e Código Evoluem Juntos

Sempre que uma alteração modificar o comportamento do sistema, a documentação correspondente deve ser atualizada na mesma mudança de código, evitando divergência entre implementação e documentação.  [oai_citation:0‡Google GitHub](https://google.github.io/styleguide/docguide/best_practices.html?utm_source=chatgpt.com)

---

## Simplicidade

O projeto prioriza soluções simples, explícitas e fáceis de manter.

Complexidade somente deve ser introduzida quando existir necessidade comprovada.

---

# Ambiente de Desenvolvimento

O ambiente oficial de desenvolvimento do Projeto TEAR V2 é composto pelas seguintes ferramentas.

| Ferramenta | Finalidade |
|------------|------------|
| Visual Studio Code | Desenvolvimento principal |
| Git | Controle de versão |
| GitHub | Repositório oficial |
| Google Apps Script | Plataforma de execução |
| clasp | Sincronização entre código local e Apps Script |
| Node.js | Ferramentas de desenvolvimento e testes |

Outras ferramentas podem ser utilizadas desde que não alterem a arquitetura ou o fluxo oficial do projeto.

---

# Estrutura do Projeto

O repositório está organizado para separar claramente domínio, infraestrutura, documentação e artefatos de apoio.

```text
/
├── src/
├── docs/
├── tests/
├── scripts/
├── knowledge/
├── README.md
├── ARCHITECTURE.md
├── DOMAIN.md
└── DEVELOPMENT_GUIDE.md
```

Cada diretório possui uma responsabilidade específica e deve permanecer coeso ao longo da evolução do projeto.

---

# Preparação do Ambiente

Antes de iniciar qualquer desenvolvimento, recomenda-se:

1. clonar o repositório oficial;
2. instalar as dependências do projeto;
3. autenticar o `clasp`;
4. configurar as propriedades necessárias do Apps Script;
5. validar que o projeto sincroniza corretamente com o ambiente remoto;
6. executar os testes existentes para confirmar que o ambiente está funcional.

Nenhuma nova implementação deve começar antes da validação completa do ambiente local.

---

# Fluxo Geral de Desenvolvimento

Todo trabalho no Projeto TEAR segue, preferencialmente, o seguinte fluxo:

```text
Entendimento do domínio
        │
        ▼
Leitura da documentação
        │
        ▼
Modelagem da solução
        │
        ▼
Implementação
        │
        ▼
Testes
        │
        ▼
Atualização da documentação
        │
        ▼
Revisão
        │
        ▼
Deploy
```

Esse fluxo garante que o conhecimento do projeto permaneça consistente entre documentação, código e arquitetura, reduzindo retrabalho e facilitando a manutenção do sistema.  [oai_citation:1‡Google GitHub](https://google.github.io/styleguide/docguide/best_practices.html?utm_source=chatgpt.com)

---

# Organização do Código

O código-fonte do Projeto TEAR deve permanecer organizado de acordo com as responsabilidades definidas pela arquitetura.

Cada módulo possui um único propósito e não deve assumir responsabilidades pertencentes a outras camadas.

A estrutura lógica segue a seguinte organização:

```text
Entrypoints
        │
        ▼
Controllers
        │
        ▼
Services
        │
        ▼
Repositories
        │
        ▼
ACL
        │
        ▼
Google Sheets
```

As dependências devem ocorrer exclusivamente nesse sentido.

---

# Responsabilidades das Camadas

## Entrypoints

São responsáveis apenas por expor funcionalidades ao ambiente de execução.

Devem:

- receber chamadas externas;
- instanciar dependências;
- encaminhar a execução para os Controllers.

Não devem conter regras de negócio.

---

## Controllers

Coordenam os casos de uso da aplicação.

São responsáveis por:

- validar parâmetros de entrada;
- iniciar fluxos de execução;
- converter respostas para o formato esperado;
- tratar erros da aplicação.

Controllers não implementam regras de negócio.

---

## Services

Os Services concentram os casos de uso do sistema.

São responsáveis por:

- executar regras de negócio;
- coordenar entidades do domínio;
- aplicar validações;
- manter a consistência das operações.

Toda lógica funcional deve permanecer nesta camada ou nas entidades do domínio.

---

## Repositories

Repositories representam a abstração de persistência.

São responsáveis apenas por:

- localizar registros;
- salvar registros;
- atualizar registros;
- remover registros;
- consultar dados.

Repositories não conhecem regras de negócio.

---

## ACLs

As ACLs (Anti-Corruption Layer) isolam completamente o domínio da estrutura física da persistência.

São responsáveis por:

- resolver cabeçalhos dinamicamente;
- converter entidades para linhas da planilha;
- converter linhas para objetos do domínio;
- proteger o restante da aplicação contra mudanças na estrutura física.

Conforme a arquitetura do projeto, apenas a ACL conhece a organização das colunas da planilha. Nenhuma outra camada deve depender dessa estrutura física.

---

# Convenções de Desenvolvimento

Todo código produzido deve seguir um conjunto único de convenções.

## Clareza

O código deve ser legível antes de ser inteligente.

Nomes devem expressar claramente sua responsabilidade.

---

## Responsabilidade Única

Cada função deve possuir uma única responsabilidade.

Quando uma função passa a executar múltiplas tarefas independentes, ela deve ser dividida.

---

## Reutilização

Antes de criar uma nova implementação, verificar se já existe comportamento equivalente em outro módulo.

Duplicação de lógica deve ser evitada sempre que possível.

---

## Acoplamento Baixo

Os módulos devem conhecer apenas as dependências estritamente necessárias.

Quanto menor o acoplamento, maior a facilidade de evolução do sistema.

---

# Tratamento de Erros

O sistema utiliza tratamento explícito de erros.

As falhas devem:

- possuir mensagens claras;
- identificar corretamente a causa do problema;
- interromper a execução quando necessário;
- nunca ocultar erros silenciosamente.

Erros de infraestrutura, domínio e validação devem permanecer separados para facilitar diagnóstico e manutenção.

---

# Testes

Toda nova funcionalidade deve ser acompanhada de testes compatíveis com sua responsabilidade.

Sempre que aplicável, recomenda-se validar:

- comportamento esperado;
- casos extremos;
- entradas inválidas;
- regras de negócio;
- regressões.

A documentação deve evoluir juntamente com o código e os testes, evitando divergências entre a implementação e a descrição oficial do sistema.  [oai_citation:0‡Google GitHub](https://google.github.io/styleguide/docguide/best_practices.html?utm_source=chatgpt.com)

---

# Depuração

Durante o desenvolvimento, a investigação de problemas deve seguir uma sequência previsível:

```text
Reproduzir o problema
        │
        ▼
Identificar a camada responsável
        │
        ▼
Localizar a causa
        │
        ▼
Corrigir
        │
        ▼
Executar testes
        │
        ▼
Atualizar documentação
```

A correção de um problema somente é considerada concluída após a validação do comportamento esperado e a atualização da documentação correspondente.

---

# Controle de Versão

Todo o código do Projeto TEAR V2 é versionado utilizando Git.

Cada alteração deve representar uma mudança coesa, rastreável e facilmente revisável.

Boas práticas incluem:

- realizar mudanças pequenas e focadas;
- evitar commits com múltiplos objetivos;
- escrever mensagens de commit claras e descritivas;
- manter o histórico limpo e compreensível.

O histórico do repositório deve contar a evolução do projeto de forma consistente.

---

# Fluxo de Trabalho

O desenvolvimento de novas funcionalidades deve seguir um fluxo padronizado.

```text
Selecionar tarefa
        │
        ▼
Estudar documentação
        │
        ▼
Modelar solução
        │
        ▼
Implementar
        │
        ▼
Executar testes
        │
        ▼
Atualizar documentação
        │
        ▼
Revisão de código
        │
        ▼
Deploy
```

Cada etapa depende da conclusão da etapa anterior.

Mudanças não testadas ou não documentadas não devem ser consideradas concluídas.

---

# Deploy

O deploy oficial do Projeto TEAR V2 é realizado por meio do Google Apps Script utilizando o `clasp`.

Antes de qualquer publicação, recomenda-se:

- sincronizar o repositório local;
- validar a compilação do projeto;
- executar os testes disponíveis;
- confirmar as configurações necessárias;
- revisar as alterações pendentes.

Após a publicação, deve ser realizada uma validação funcional para garantir que o comportamento esperado permaneceu inalterado.

---

# Revisão de Código

Toda alteração relevante deve passar por revisão antes de ser incorporada ao projeto.

A revisão deve avaliar:

- aderência à arquitetura;
- respeito ao modelo de domínio;
- clareza e legibilidade do código;
- simplicidade da solução;
- impacto sobre funcionalidades existentes;
- cobertura por testes;
- atualização da documentação.

Sempre que possível, as revisões devem ocorrer em alterações pequenas e focadas, facilitando a análise e reduzindo o risco de regressões.  [oai_citation:0‡GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/helping-others-review-your-changes?utm_source=chatgpt.com)

---

# Atualização da Documentação

A documentação faz parte integrante do software.

Sempre que uma alteração modificar:

- comportamento do sistema;
- arquitetura;
- regras de negócio;
- fluxos de desenvolvimento;
- interfaces públicas;
- configurações do projeto;

a documentação correspondente deve ser atualizada na mesma alteração de código, evitando divergências entre implementação e documentação.  [oai_citation:1‡Google GitHub](https://google.github.io/styleguide/docguide/best_practices.html?utm_source=chatgpt.com)

---

# Checklist Antes da Entrega

Antes de concluir qualquer desenvolvimento, recomenda-se verificar:

- [ ] A funcionalidade atende aos requisitos definidos.
- [ ] A arquitetura foi respeitada.
- [ ] Não foram introduzidas dependências desnecessárias.
- [ ] As regras de negócio permanecem na camada de domínio.
- [ ] O código está legível e consistente.
- [ ] Os testes foram executados com sucesso.
- [ ] A documentação foi atualizada quando necessário.
- [ ] Não existem arquivos temporários ou artefatos de desenvolvimento pendentes.

Esse checklist representa o critério mínimo de qualidade esperado para contribuições ao projeto.

---

# Boas Práticas

Os desenvolvedores do Projeto TEAR V2 devem priorizar:

- simplicidade em vez de complexidade;
- clareza em vez de abstração excessiva;
- consistência em vez de soluções isoladas;
- reutilização em vez de duplicação;
- documentação atualizada em vez de conhecimento implícito;
- evolução incremental em vez de grandes mudanças simultâneas.

Esses princípios favorecem a manutenção, a colaboração e a evolução sustentável do sistema ao longo do tempo.

---

# Documentação Relacionada

Este guia complementa os demais documentos oficiais do projeto.

| Documento | Finalidade |
|-----------|------------|
| `README.md` | Visão geral do projeto |
| `ARCHITECTURE.md` | Arquitetura da aplicação |
| `DOMAIN.md` | Modelo de domínio e regras de negócio |
| `docs/adrs/` | Decisões arquiteturais |
| `docs/engenharia_reversa/` | Documentação técnica derivada da implementação |

---

# Considerações Finais

O `DEVELOPMENT_GUIDE.md` estabelece o padrão oficial de desenvolvimento do Projeto TEAR V2.

Seu objetivo é garantir que todos os colaboradores implementem funcionalidades seguindo os mesmos princípios arquiteturais, o mesmo fluxo de trabalho e os mesmos critérios de qualidade.

A manutenção deste documento é contínua e deve acompanhar a evolução do projeto, assegurando que as práticas descritas permaneçam alinhadas com a implementação e com a arquitetura oficial.  [oai_citation:2‡Google GitHub](https://google.github.io/styleguide/docguide/best_practices.html?utm_source=chatgpt.com)
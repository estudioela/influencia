# Contributing to Projeto TEAR V2

Obrigado pelo interesse em contribuir com o Projeto TEAR V2.

Este documento define o processo oficial de contribuição para o projeto, estabelecendo padrões técnicos, organizacionais e de qualidade que devem ser seguidos por todos os colaboradores.

Seu objetivo é garantir que todas as contribuições sejam consistentes com a arquitetura, o domínio de negócio e os princípios de engenharia adotados pelo projeto. As diretrizes de contribuição ajudam mantenedores e colaboradores a reduzir retrabalho e manter um processo previsível.  [oai_citation:0‡GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors?apiVersion=2022-11-28&utm_source=chatgpt.com)

---

# Quem Pode Contribuir

Podem contribuir com o projeto:

- desenvolvedores;
- arquitetos de software;
- revisores de código;
- especialistas de domínio;
- colaboradores ocasionais;
- agentes de IA autorizados.

Toda contribuição deve seguir as regras descritas neste documento, independentemente da experiência do colaborador.

---

# Princípios de Contribuição

Toda contribuição deve respeitar os princípios fundamentais do Projeto TEAR.

## Respeito à Arquitetura

Nenhuma contribuição deve violar a arquitetura oficial descrita em `ARCHITECTURE.md`.

Novas implementações devem integrar-se às camadas existentes sem criar dependências indevidas.

---

## Respeito ao Domínio

O modelo de domínio é a principal referência para as regras de negócio.

Antes de implementar qualquer funcionalidade, recomenda-se compreender os conceitos descritos em `DOMAIN.md`.

Alterações no comportamento do sistema devem preservar a Linguagem Ubíqua e os invariantes do domínio.

---

## Qualidade Acima da Velocidade

O projeto prioriza código simples, legível e sustentável.

Contribuições pequenas, bem documentadas e corretamente testadas são preferíveis a mudanças extensas e difíceis de revisar.

---

## Documentação Faz Parte da Entrega

Uma contribuição somente é considerada completa quando a documentação correspondente também estiver atualizada.

Sempre que houver alteração de comportamento, arquitetura ou regras de negócio, os documentos afetados devem ser revisados.

---

# Antes de Começar

Antes de iniciar qualquer contribuição, recomenda-se:

- ler o `README.md`;
- compreender a arquitetura do sistema;
- revisar o modelo de domínio;
- consultar os ADRs relacionados à funcionalidade;
- verificar se já existe trabalho em andamento para o mesmo objetivo.

Esse processo reduz conflitos, evita retrabalho e mantém a consistência das decisões técnicas do projeto.  [oai_citation:1‡GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors?apiVersion=2022-11-28&utm_source=chatgpt.com)

---

# Fluxo Geral de Contribuição

Toda contribuição deve seguir, preferencialmente, o fluxo abaixo.

```text
Compreender o problema
        │
        ▼
Consultar a documentação
        │
        ▼
Planejar a solução
        │
        ▼
Criar uma branch
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
Abrir Pull Request
        │
        ▼
Revisão
        │
        ▼
Merge
```

Esse fluxo busca garantir que toda alteração seja tecnicamente consistente, rastreável e facilmente revisável.

---

# Escopo das Contribuições

São exemplos de contribuições aceitas:

- correção de defeitos;
- implementação de funcionalidades;
- melhoria de desempenho;
- refatorações arquiteturalmente seguras;
- melhoria da documentação;
- ampliação da cobertura de testes;
- melhorias na experiência de desenvolvimento.

Toda contribuição deve possuir um objetivo claro e um escopo bem definido.

---

# O Que Esperamos dos Colaboradores

Os colaboradores do Projeto TEAR são incentivados a:

- compreender o problema antes de implementar uma solução;
- manter comunicação clara durante o desenvolvimento;
- seguir os padrões estabelecidos pelo projeto;
- preservar a consistência da arquitetura;
- documentar decisões relevantes;
- colaborar de forma respeitosa durante revisões de código.

O objetivo é construir uma base de código sustentável, previsível e de fácil manutenção para toda a equipe.

---

# Processo de Contribuição

Toda contribuição para o Projeto TEAR V2 deve seguir um fluxo padronizado, permitindo que alterações sejam facilmente compreendidas, revisadas e incorporadas ao projeto.

O objetivo desse processo é preservar a qualidade da base de código, facilitar a colaboração e reduzir riscos durante a evolução do sistema.

---

# Branches

Toda contribuição deve ser realizada em uma branch própria.

A branch principal (`main`) deve conter apenas código estável e aprovado.

Recomenda-se que cada branch tenha um único objetivo, como:

- implementação de uma funcionalidade;
- correção de um defeito;
- atualização da documentação;
- refatoração;
- melhoria de testes.

Evite utilizar uma mesma branch para alterações não relacionadas.

---

# Commits

Os commits devem representar mudanças pequenas, coesas e facilmente compreensíveis.

Boas práticas incluem:

- realizar commits frequentes;
- evitar commits excessivamente grandes;
- utilizar mensagens claras e objetivas;
- agrupar apenas alterações relacionadas.

Exemplos:

```text
feat: adiciona cadastro de parceiras

fix: corrige validação de briefing

docs: atualiza DEVELOPMENT_GUIDE

refactor: simplifica ParceiraService
```

O histórico do projeto deve permitir compreender a evolução do sistema sem necessidade de analisar todo o código.

---

# Pull Requests

Toda alteração deve ser submetida por meio de um Pull Request antes de ser incorporada à branch principal.

Cada Pull Request deve possuir um único objetivo e conter contexto suficiente para facilitar a revisão, como descrição das mudanças, motivação e impactos. Pull requests pequenos e focados tendem a ser revisados com mais rapidez e qualidade.  [oai_citation:0‡GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/helping-others-review-your-changes?utm_source=chatgpt.com)

Sempre que possível, o Pull Request deve informar:

- objetivo da alteração;
- principais arquivos modificados;
- impacto esperado;
- documentação atualizada;
- testes executados;
- possíveis limitações conhecidas.

---

# Revisão de Código

Toda contribuição relevante deve passar por revisão antes da aprovação.

A revisão deve verificar:

- aderência à arquitetura;
- conformidade com o domínio;
- legibilidade do código;
- simplicidade da solução;
- impacto sobre funcionalidades existentes;
- cobertura de testes;
- atualização da documentação.

Caso sejam identificadas inconsistências, o Pull Request poderá solicitar ajustes antes da aprovação.

---

# Testes Obrigatórios

Antes da abertura de um Pull Request, o colaborador deve validar que a alteração não introduziu regressões.

Sempre que aplicável, recomenda-se verificar:

- comportamento esperado;
- entradas inválidas;
- regras de negócio;
- casos extremos;
- integração com funcionalidades existentes.

Nenhuma alteração deve ser considerada concluída sem uma validação compatível com seu impacto.

---

# Documentação Obrigatória

O Projeto TEAR considera a documentação parte integrante do software.

Sempre que uma alteração modificar:

- arquitetura;
- domínio;
- comportamento funcional;
- fluxo operacional;
- interfaces públicas;
- convenções de desenvolvimento;

os documentos correspondentes devem ser atualizados na mesma contribuição.

Mudanças que alteram o comportamento do sistema sem atualização da documentação poderão ser rejeitadas durante a revisão. A manutenção conjunta de código e documentação é uma prática recomendada para projetos colaborativos.  [oai_citation:1‡GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors?apiVersion=2022-11-28&utm_source=chatgpt.com)

---

# Escopo das Alterações

Cada Pull Request deve possuir um escopo claramente definido.

Evite combinar na mesma contribuição:

- novas funcionalidades;
- correções de defeitos;
- refatorações;
- reorganizações de código;
- mudanças de documentação não relacionadas.

Alterações pequenas e focadas facilitam a revisão, reduzem conflitos de merge e tornam o histórico do projeto mais consistente.  [oai_citation:2‡GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/helping-others-review-your-changes?utm_source=chatgpt.com)

---

# Critérios de Aceitação

Uma contribuição poderá ser aprovada quando atender simultaneamente aos seguintes critérios:

- resolve o problema proposto;
- respeita a arquitetura oficial do projeto;
- preserva o modelo de domínio;
- não introduz regressões conhecidas;
- mantém a consistência da documentação;
- possui escopo claramente definido;
- foi validada por testes compatíveis com sua alteração.

O atendimento desses critérios reduz riscos durante a integração e facilita a evolução sustentável do projeto.  [oai_citation:0‡GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors?apiVersion=2022-11-28&utm_source=chatgpt.com)

---

# Contribuições Não Aceitas

Em geral, não serão aceitas contribuições que:

- violem a arquitetura oficial;
- alterem regras de negócio sem atualização da documentação;
- misturem funcionalidades distintas em uma única alteração;
- removam testes sem justificativa técnica;
- introduzam dependências desnecessárias;
- aumentem significativamente a complexidade da solução sem benefício comprovado;
- incluam código não utilizado, experimental ou temporário.

Sempre que possível, melhorias devem ser apresentadas de forma incremental.

---

# Boas Práticas

Ao contribuir com o Projeto TEAR V2, recomenda-se:

- compreender o problema antes de escrever código;
- reutilizar componentes existentes;
- manter funções pequenas e coesas;
- escrever nomes claros e descritivos;
- remover código obsoleto durante refatorações;
- evitar duplicação de lógica;
- preservar a separação entre domínio, aplicação e infraestrutura;
- atualizar a documentação sempre que necessário.

A simplicidade, a legibilidade e a previsibilidade são prioridades do projeto.

---

# Checklist do Contribuidor

Antes de solicitar a revisão de uma contribuição, confirme que:

- [ ] A alteração possui um único objetivo.
- [ ] A arquitetura foi respeitada.
- [ ] As regras de negócio permanecem no domínio.
- [ ] Não foram criadas dependências desnecessárias.
- [ ] O código segue os padrões do projeto.
- [ ] Os testes aplicáveis foram executados.
- [ ] A documentação foi atualizada quando necessário.
- [ ] Não existem arquivos temporários ou experimentais incluídos.
- [ ] O Pull Request descreve claramente o objetivo da alteração.

Esse checklist representa o padrão mínimo esperado para novas contribuições.

---

# Comunicação Durante a Revisão

A revisão de código deve ocorrer de forma colaborativa e respeitosa.

Durante esse processo, espera-se que os participantes:

- fundamentem sugestões tecnicamente;
- mantenham discussões objetivas;
- proponham melhorias de forma construtiva;
- aceitem revisões como parte natural do desenvolvimento.

O objetivo da revisão é melhorar a qualidade do projeto, e não avaliar individualmente seus colaboradores.

---

# Documentação Relacionada

Este documento complementa os demais documentos oficiais do Projeto TEAR V2.

| Documento | Finalidade |
|-----------|------------|
| `README.md` | Visão geral do projeto |
| `ARCHITECTURE.md` | Arquitetura da aplicação |
| `DOMAIN.md` | Modelo de domínio |
| `DEVELOPMENT_GUIDE.md` | Guia de desenvolvimento |
| `docs/adrs/` | Decisões arquiteturais |
| `docs/engenharia_reversa/` | Documentação técnica derivada da implementação |

Todos esses documentos devem ser considerados durante a elaboração de novas contribuições.

---

# Evolução das Diretrizes

Este documento é mantido juntamente com o restante da documentação oficial do projeto.

Sempre que o processo de desenvolvimento, revisão ou governança evoluir, estas diretrizes deverão ser atualizadas para refletir o fluxo oficial de contribuição.

Mudanças relevantes devem ser registradas e comunicadas à equipe para manter um processo consistente e previsível.  [oai_citation:1‡GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors?apiVersion=2022-11-28&utm_source=chatgpt.com)

---

# Considerações Finais

O `CONTRIBUTING.md` estabelece o processo oficial de colaboração do Projeto TEAR V2.

Seu propósito é garantir que todas as contribuições — sejam realizadas por desenvolvedores, arquitetos ou agentes de IA — sigam os mesmos princípios de qualidade, arquitetura e documentação.

Ao seguir estas diretrizes, cada contribuição torna-se mais fácil de compreender, revisar, integrar e manter, fortalecendo a consistência técnica e a evolução contínua do projeto.
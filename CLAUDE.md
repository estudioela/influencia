# CLAUDE.md

## Papel do agente
Como o agente deve atuar no Projeto Tear.

## Leitura obrigatória antes de alterar código
Lista curta de documentos oficiais.

## Regras de execução
- Não alterar arquitetura sem ADR.
- Não criar documentação duplicada.
- Não trabalhar em múltiplas frentes.
- Validar antes de commit.

## Fluxo obrigatório
Auditoria
→ Plano
→ Execução
→ Validação
→ Commit

## Regras de arquivos
- Onde procurar informações.
- Quais arquivos possuem cada responsabilidade.

## Restrições
- Não apagar dados.
- Não alterar permissões sem autorização.
- Deploy de produção: ver "Mandato de operação autônoma" abaixo.

## Mandato de operação autônoma (2026-07-16)

Autorização explícita do responsável pelo projeto, registrada nesta data:

- O agente assume responsabilidade operacional (Tech Lead de execução):
  decide a ordem de SPECs desbloqueadas, conduz integração, QA, arquitetura,
  performance, documentação, preparação para deploy e homologação sem
  aguardar confirmação a cada etapa.
- `git push` e `clasp push`/deploy para produção estão autorizados sem
  confirmação pontual, a cada unidade lógica de trabalho concluída (testes
  verdes, lint limpo).
- O agente PARA e pede decisão humana apenas quando houver: regra de negócio
  inédita (ex.: decisão de PO pendente, como Q-04), necessidade de
  credenciais/acessos que não possui, impossibilidade técnica objetiva, ou
  conflito insolúvel entre requisitos. Fora isso, decide e continua.
- Esta autorização substitui a restrição anterior "Não publicar produção"
  enquanto vigente; revogável a qualquer momento pelo responsável do projeto.

## Comandos padrão
Comandos permitidos e fluxo Git.

## Documentos oficiais

Antes de iniciar qualquer tarefa:

1. docs/PROJECT_PHILOSOPHY.md
2. docs/KNOWN_DECISIONS.md
3. docs/SYSTEM_MAP.md
4. docs/PROJECT_STATUS.md
5. docs/CHANGELOG_DE_DESENVOLVIMENTO.md
6. Documento da Sprint atual

## Fonte de decisão

Quando houver conflito:

- Filosofia operacional define comportamento.
- SYSTEM_MAP define arquitetura.
- SYSTEM_TRUTH define estado atual.
- KNOWN_DECISIONS define decisões históricas.

## Economia de contexto

O agente deve:

- Ler apenas arquivos necessários.
- Preferir grep/sed a leitura completa.
- Não explorar o repositório sem necessidade.
- Não abrir arquivos fora do escopo.

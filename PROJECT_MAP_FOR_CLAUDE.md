# PROJECT MAP FOR CLAUDE

## Estrutura final da pasta

```text
jescri-migracao/
├── mae/                                  # Projeto principal do ERP/Portal Apps Script
├── core/                                 # Links de referência para os arquivos de backend principal
├── ui/                                   # Links de referência para templates e telas do portal
├── services/                             # Links para scripts de integração/serviços
├── config/                               # Configuração do projeto Apps Script
├── views/                                # Links para telas do portal por contexto
├── assets_static/                        # Recursos estáticos auxiliares
├── scripts_legacy/                       # Scripts antigos ou de apoio preservados
├── utils_legacy/                         # Utilidades antigas preservadas por segurança
├── docs/                                 # Documentação e mapas do sistema
├── sites/                                # Sites estáticos e projetos auxiliares
├── archive/                              # Conteúdo legado, backup e itens não ativos
├── _backup_full_20260704_193027/         # Backup completo e preservado do estado original
└── CLEANUP_LOG.md                        # Registro do que foi movido/arquivado
```

## Descrição das pastas

- mae/: pasta canônica do sistema ativo. Mantém o projeto Apps Script real com backend, templates HTML, configuração e lógica do ERP/Portal.
- core/: referência organizada para os arquivos principais de lógica do sistema.
- ui/: referência organizada para as telas e componentes HTML do portal.
- services/: referência para scripts de integração e sincronização.
- config/: configuração do projeto Apps Script e metadados de execução.
- views/: agrupamento semântico das telas do portal por contexto.
- assets_static/: recursos estáticos auxiliares do portal.
- scripts_legacy/: scripts antigos ou de apoio preservados por segurança.
- utils_legacy/: utilidades antigas preservadas por segurança.
- docs/: documentação do ERP, mapas e histórico estrutural.
- sites/: sites estáticos e projetos auxiliares relacionados ao Estúdio Elã.
- archive/: área de preservação para conteúdo legado, backups antigos e itens considerados não essenciais para o fluxo ativo.

## Fluxo simples do sistema

1. A equipe usa o ERP dentro do projeto Apps Script vinculado à planilha Google.
2. O backend em mae/ controla geração de mês, ativações, pagamentos, briefing e logística.
3. O portal exposto ao público usa os mesmos dados e permite que influenciadoras visualizem pendências, enviem materiais e acompanhem pagamentos.
4. A documentação relevante foi centralizada em docs/ e a estrutura de trabalho foi simplificada para reduzir ruído.

## Pontos críticos do sistema

- mae/ é a origem da verdade operacional do ERP e do portal.
- Nenhuma lógica interna do sistema foi alterada; a reorganização foi feita de forma conservadora.
- A pasta archive/ preserva itens legados e backups sem interferir na execução do sistema ativo.
- Os diretórios sites/ e docs/ foram isolados para reduzir confusão e facilitar manutenção.

## Onde estão as principais funcionalidades

- Backend principal: mae/Código.js, mae/WebApp.js, mae/Portal.js
- Interface do portal: mae/Index.html e os arquivos em mae/views_*.html
- Configuração do projeto: mae/appsscript.json
- Integrações e sincronização: mae/Sincronizador.js e mae/SincronizarPortal.js
- Documentação: docs/INFOS SOBRE ERP - JESCRI.md e docs/MAPA_SISTEMA.txt

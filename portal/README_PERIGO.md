# NÃO RODAR `clasp push` NESTA PASTA

Este diretório (`portal/`) tem um subconjunto dos arquivos do projeto Apps Script
"[ELÃ] ERP INFLUÊNCIA" (scriptId 1fE8w10O3MwHvfa4gLgJvcUXD4HIWKNL0ar5YMmjzMamujRfwqiPfcLyK).

Ele NÃO tem Código.js, Portal.js, Sidebar.html, SidebarPagamento.html,
SincronizarPortal.js, SidebarBackend.js — que existem no projeto live.

Um `clasp push` feito a partir daqui SUBSTITUI todo o conteúdo remoto pelo
que existe localmente aqui, apagando os arquivos acima do projeto live de novo
(foi exatamente isso que causou o incidente de 2026-07-04).

O diretório canônico, com TODOS os arquivos do projeto, é:
  /Users/danielperrut/jescri-migracao/mae/

O .clasp.json desta pasta foi renomeado para .clasp.json.DISABLED de propósito,
para que `clasp push`/`clasp deploy` aqui falhem imediatamente por falta de
configuração, em vez de destruir o projeto live silenciosamente.

Se precisar reativar esta pasta para algo, copie primeiro os arquivos que
faltam a partir de mae/, ou simplesmente use mae/ diretamente.

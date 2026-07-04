# NÃO RODAR `clasp push` NESTA PASTA

Este diretório (`portal-360/`) é um snapshot parcial do projeto Apps Script
"[ELÃ] ERP INFLUÊNCIA" (scriptId 1fE8w10O3MwHvfa4gLgJvcUXD4HIWKNL0ar5YMmjzMamujRfwqiPfcLyK) —
a mesma armadilha que já causou o incidente de 2026-07-04 a partir da pasta `portal/`
(ver `../portal/README_PERIGO.md`).

Ele tem `Código.js`, `WebApp.js` e `Index.html`, mas NÃO tem `Portal.js`,
`Sidebar.html`, `SidebarPagamento.html`, `SincronizarPortal.js`,
`SidebarBackend.js` — que existem no projeto live.

Um `clasp push` feito a partir daqui apagaria esses arquivos do projeto live
de novo. Por isso o `.clasp.json` desta pasta foi renomeado para
`.clasp.json.DISABLED`.

O diretório canônico, com TODOS os arquivos do projeto, é:
  /Users/danielperrut/jescri-migracao/mae/

Se precisar reativar esta pasta para algo, copie primeiro os arquivos que
faltam a partir de mae/, ou simplesmente use mae/ diretamente.

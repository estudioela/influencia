// Portal UI integration (Apps Script server-side helpers)
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

function includeAsJs(filename) {
  return JSON.stringify(HtmlService.createTemplateFromFile(filename).evaluate().getContent());
}

function abrirPortalModal() {
  const html = HtmlService.createTemplateFromFile('PortalApp').evaluate().setWidth(1000).setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, 'Portal de Apoio');
}

// Optional: allow publishing as WebApp if desired
function doGet(e) {
  return HtmlService.createTemplateFromFile('PortalApp').evaluate();
}

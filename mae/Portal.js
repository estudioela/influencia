/**
 * ERP ELÃ - SISTEMA DE SINCRONIZAÇÃO DO PORTAL (DESATIVADO)
 * Arquivo: Portal.gs
 *
 * lancarParaPortal() apontava para uma Planilha de Apoio externa isolada
 * (ID_PLANILHA_APOIO = "1289Eu3hk-L3GnHbNwAfxgHy3UfVnjfB0LnlHEMoOg1M"),
 * que foi excluída/ficou inacessível — a função já falhava antes desta
 * limpeza. O Portal agora lê BASE DE DADOS diretamente (WebApp.gs), sem
 * nenhuma planilha de apoio intermediária. Item de menu removido de
 * onOpen() em Código.js.
 */

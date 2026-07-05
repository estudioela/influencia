/*************************************************************
 * SINCRONIZADOR ERP — PORTAL DO INFLUENCIADOR (DESATIVADO)
 *
 * BASE DE APOIO foi removida do fluxo de leitura do Portal: WebApp.gs
 * agora lê BASE DE DADOS diretamente (mesma planilha, mesmo projeto),
 * então o mirror clear()+rewrite que este arquivo fazia (puxarDadosDaMae,
 * puxarHistoricosDaMae, testarConexaoMae) ficou redundante — origem e
 * destino sempre foram a mesma planilha. Os itens de menu correspondentes
 * também foram removidos de onOpen() em Código.js.
 *
 * ID_PASTA_DRIVE, que só existia em BASE DE APOIO para uso exclusivo do
 * Portal, foi migrado para PropertiesService (chave por cupom) em
 * WebApp.gs — ver getIdPastaDriveCupom/setIdPastaDriveCupom.
 *************************************************************/

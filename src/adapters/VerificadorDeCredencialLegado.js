/**
 * ADAPTADOR: VerificadorDeCredencialLegado — mecanismo legado de credencial
 * atrás da porta do Autenticador (SPEC-025 §6.3; RN-16).
 *
 * PROVISÓRIO (🟠 P5/Q-07 — modelo de autenticação aguarda PO): implementa a
 * herança legada — identificador = cupom; segredo = 5 primeiros dígitos do
 * CNPJ. Este arquivo é o ÚNICO lugar que conhece essa regra: trocar o
 * modelo de autenticação significa trocar este adaptador na composição,
 * sem tocar Domínio/Service/Controller.
 *
 * Fail-closed: Parceira inexistente, CNPJ ausente/curto ou segredo
 * divergente → null (credencial inválida). Nada é registrado em log
 * (RN-04/INV-03 — credencial e PII nunca em claro).
 *
 * @param {ParceiraACL} parceiraACL porta do Cadastro (obterAcessoLegado).
 */

this.VerificadorDeCredencialLegado = class VerificadorDeCredencialLegado {
  constructor(parceiraACL) {
    this.parceiraACL = parceiraACL;
  }

  /**
   * Porta do Autenticador: resolve credencial → parceiraId.
   * @param {Credencial} credencial
   * @returns {string|null} parceiraId autenticada, ou null se inválida.
   */
  verificar(credencial) {
    const acesso = this.parceiraACL.obterAcessoLegado(credencial.identificador);
    if (!acesso) {
      return null;
    }
    const digitos = String(acesso.cnpj).replace(/\D/g, '');
    if (digitos.length < 5) {
      return null;
    }
    return digitos.slice(0, 5) === credencial.segredo ? acesso.parceiraId : null;
  }
};

/**
 * SERVIÇO DE DOMÍNIO: Autenticador (SPEC-025 §6.3) — porta de autenticação.
 *
 * Valida a credencial atrás da porta `verificadorDeCredencial` e aplica a
 * política de bloqueio (RN-02: 5 tentativas → 15 minutos). O mecanismo
 * concreto de verificação é injetado na composição — hoje, o adaptador
 * legado (RN-16, provisório: 🟠 P5/Q-07 aguarda PO); o domínio não o conhece.
 *
 * Lógica pura: o estado de tentativas chega e sai por parâmetro/resultado;
 * persistência é do Service/Repository.
 *
 * @param {{verificar: function(Credencial): (string|null)}}
 *   verificadorDeCredencial porta que resolve credencial → parceiraId.
 */

this.Autenticador = class Autenticador {
  /** Limite de tentativas malsucedidas antes do bloqueio (RN-02). */
  static get LIMITE_DE_TENTATIVAS() {
    return 5;
  }

  constructor(verificadorDeCredencial) {
    this.verificadorDeCredencial = verificadorDeCredencial;
  }

  /**
   * UC-025.01: avalia uma tentativa de autenticação.
   * @param {Credencial} credencial credencial apresentada.
   * @param {number} falhasAnteriores falhas acumuladas do identificador.
   * @param {Date} agora instante da tentativa.
   * @returns {{sucesso: true, parceiraId: string}
   *   |{sucesso: false, falhas: number, bloqueio: (JanelaDeBloqueio|null)}}
   *   em falha, `bloqueio` vem preenchido quando a tentativa atinge o
   *   limite (CB-01).
   */
  autenticar(credencial, falhasAnteriores, agora) {
    const parceiraId = this.verificadorDeCredencial.verificar(credencial);
    if (parceiraId) {
      return { sucesso: true, parceiraId: String(parceiraId) };
    }
    const falhas = (falhasAnteriores || 0) + 1;
    return {
      sucesso: false,
      falhas: falhas,
      bloqueio:
        falhas >= Autenticador.LIMITE_DE_TENTATIVAS
          ? new JanelaDeBloqueio(agora)
          : null,
    };
  }

  /**
   * Cria a Sessão da Parceira autenticada (INV-01; RN-03).
   * @param {string} parceiraId
   * @param {string} valorDoToken valor opaco vindo da porta geradorDeToken.
   * @param {Date} agora
   * @returns {Sessao}
   */
  criarSessao(parceiraId, valorDoToken, agora) {
    return new Sessao(parceiraId, new TokenDeSessao(valorDoToken), agora);
  }
};

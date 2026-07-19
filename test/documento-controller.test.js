const { loadGas } = require('./helpers/gasHarness');

function carregar() {
  return loadGas(['src/shared/Nucleo.js', 'src/modulos/Documento.js']);
}

const documentoGerado = {
  parceiraId: 'Maria',
  tipo: 'Contrato',
  estado: 'Gerado',
  mesReferencia: null,
  referencia: 'CONTRATO:Maria',
};

describe('DocumentoController — envelope padrão (§3.3)', () => {
  test('sucesso devolve envelope ok com a projeção do Documento + conteúdo mesclado', () => {
    const gas = carregar();
    const controller = new gas.DocumentoController({
      gerarContrato: () => ({ documento: documentoGerado, conteudo: 'texto mesclado' }),
    });

    const resposta = controller.gerarContrato({ parceiraId: 'Maria' });

    expect(resposta.success).toBe(true);
    expect(resposta.data).toEqual(
      Object.assign({}, documentoGerado, { conteudo: 'texto mesclado' })
    );
  });

  test('erro do service vira envelope de falha com a mensagem (nunca exceção crua)', () => {
    const gas = carregar();
    const controller = new gas.DocumentoController({
      gerarBriefingFormal: () => {
        throw new Error('RN-02: Parceira não sinalizada.');
      },
    });

    const resposta = controller.gerarBriefingFormal({ parceiraId: 'Maria' });

    expect(resposta.success).toBe(false);
    expect(resposta.error.mensagem).toMatch(/RN-02/);
  });
});

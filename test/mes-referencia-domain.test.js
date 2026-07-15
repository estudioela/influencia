const { loadGas } = require('./helpers/gasHarness');

function novoMesReferencia(ano, mes) {
  const gas = loadGas(['src/domain/MesReferencia.js']);
  return new gas.MesReferencia(ano, mes);
}

function mesReferenciaDeTexto(texto) {
  const gas = loadGas(['src/domain/MesReferencia.js']);
  return gas.MesReferencia.deTexto(texto);
}

describe('Value Object MesReferencia', () => {
  test('deve carregar o Value Object MesReferencia', () => {
    const gas = loadGas(['src/domain/MesReferencia.js']);

    expect(gas.MesReferencia).toBeDefined();
  });

  // Caso 1: construção válida com zero-padding no toString.
  test('construção válida gera toString no formato canônico AAAA-MM', () => {
    const mesReferencia = novoMesReferencia(2026, 7);

    expect(mesReferencia.toString()).toBe('2026-07');
  });

  // Caso 2: deTexto('2026-07') equivalente à construção direta.
  test('deTexto("2026-07") produz VO equivalente ao construído diretamente', () => {
    const viaTexto = mesReferenciaDeTexto('2026-07');
    const viaConstrutor = novoMesReferencia(2026, 7);

    expect(viaTexto.igualA(viaConstrutor)).toBe(true);
    expect(viaTexto.toString()).toBe('2026-07');
  });

  // Caso 3: invariantes de mês/ano — fail-fast com código CM-02.
  describe('invariantes (CM-02)', () => {
    test('mês 0 é inválido', () => {
      expect(() => novoMesReferencia(2026, 0)).toThrow(/CM-02/);
    });

    test('mês 13 é inválido', () => {
      expect(() => novoMesReferencia(2026, 13)).toThrow(/CM-02/);
    });

    test('ano anterior a 2020 é inválido', () => {
      expect(() => novoMesReferencia(2019, 1)).toThrow(/CM-02/);
    });

    test('ano/mês não inteiros são inválidos', () => {
      expect(() => novoMesReferencia(2026.5, 7)).toThrow(/CM-02/);
      expect(() => novoMesReferencia(2026, '07')).toThrow(/CM-02/);
      expect(() => novoMesReferencia(null, 7)).toThrow(/CM-02/);
      expect(() => novoMesReferencia(2026, undefined)).toThrow(/CM-02/);
    });
  });

  // Caso 4: deTexto com entradas não canônicas.
  describe('deTexto — entradas não canônicas (CM-02)', () => {
    test('mês sem zero-padding é inválido', () => {
      expect(() => mesReferenciaDeTexto('2026-7')).toThrow(/CM-02/);
    });

    test('ordem invertida (MM-AAAA) é inválida', () => {
      expect(() => mesReferenciaDeTexto('07-2026')).toThrow(/CM-02/);
    });

    test('separador incorreto é inválido', () => {
      expect(() => mesReferenciaDeTexto('2026/07')).toThrow(/CM-02/);
    });

    test('texto vazio é inválido', () => {
      expect(() => mesReferenciaDeTexto('')).toThrow(/CM-02/);
    });

    test('null é inválido', () => {
      expect(() => mesReferenciaDeTexto(null)).toThrow(/CM-02/);
    });
  });

  // Caso 5: igualdade estrutural.
  describe('igualA — igualdade estrutural', () => {
    test('mesmo ano e mês são iguais', () => {
      const a = novoMesReferencia(2026, 7);
      const b = novoMesReferencia(2026, 7);

      expect(a.igualA(b)).toBe(true);
    });

    test('ano diferente não são iguais', () => {
      const a = novoMesReferencia(2026, 7);
      const b = novoMesReferencia(2025, 7);

      expect(a.igualA(b)).toBe(false);
    });

    test('mês diferente não são iguais', () => {
      const a = novoMesReferencia(2026, 7);
      const b = novoMesReferencia(2026, 8);

      expect(a.igualA(b)).toBe(false);
    });
  });

  // Caso 6: ordenação total cronológica.
  describe('comparadoCom — ordenação total', () => {
    test('mês anterior é "menor" que mês posterior no mesmo ano', () => {
      const jan = novoMesReferencia(2026, 1);
      const fev = novoMesReferencia(2026, 2);

      expect(jan.comparadoCom(fev)).toBe(-1);
      expect(fev.comparadoCom(jan)).toBe(1);
    });

    test('ano anterior é "menor" independentemente do mês', () => {
      const dez2025 = novoMesReferencia(2025, 12);
      const jan2026 = novoMesReferencia(2026, 1);

      expect(dez2025.comparadoCom(jan2026)).toBe(-1);
      expect(jan2026.comparadoCom(dez2025)).toBe(1);
    });

    test('instâncias iguais retornam 0', () => {
      const a = novoMesReferencia(2026, 2);
      const b = novoMesReferencia(2026, 2);

      expect(a.comparadoCom(b)).toBe(0);
    });
  });

  // Caso 7: imutabilidade — Object.freeze.
  test('instância é imutável: tentativa de mutação não altera o VO', () => {
    const mesReferencia = novoMesReferencia(2026, 7);

    expect(() => {
      mesReferencia.ano = 1999;
    }).not.toThrow(); // em modo não-strict do vm, atribuição falha silenciosamente
    mesReferencia.mes = 1;

    expect(mesReferencia.ano).toBe(2026);
    expect(mesReferencia.mes).toBe(7);
    expect(Object.isFrozen(mesReferencia)).toBe(true);
  });
});

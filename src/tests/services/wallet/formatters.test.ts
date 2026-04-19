import { describe, it, expect } from 'vitest';
import {
  formatarEnderecoCurto,
  formatarBlockchain,
  formatarNumero,
  formatarNumeroCompleto,
  formatarUSD,
  normalizarPrecoEthUsd,
} from '@/services/wallet/formatters';

describe('formatters', () => {
  it('formatarEnderecoCurto com endereco e sem endereco', () => {
    expect(formatarEnderecoCurto('0x1234567890abcdef')).toContain('0x1234');
    expect(formatarEnderecoCurto(null)).toBe('Carteira desconectada');
  });

  it('formatarBlockchain mapeia chainId conhecido e desconhecido', () => {
    expect(formatarBlockchain(1)).toBe('Ethereum');
    expect(formatarBlockchain(999)).toBe('Chain 999');
    expect(formatarBlockchain(null)).toBe('Sem rede');
  });

  it('formatarNumero cobre casos: non-finite, compact e padrão', () => {
    expect(formatarNumero('NaN')).toContain('0');
    const big = formatarNumero('2000000', 2);
    expect(typeof big).toBe('string');
    expect(formatarNumero('123.456', 2)).toContain('123');
  });

  it('formatarNumeroCompleto e formatarUSD non-finite', () => {
    expect(formatarNumeroCompleto('NaN')).toContain('0');
    expect(formatarUSD('NaN')).toBe('$0.00');
    expect(formatarUSD('2.5')).toContain('$');
  });

  it('normalizarPrecoEthUsd cobre non-finite, grande e pequeno', () => {
    expect(normalizarPrecoEthUsd('NaN')).toBe(0);
    expect(normalizarPrecoEthUsd(1_000_000n)).toBeGreaterThan(0);
    expect(normalizarPrecoEthUsd(500)).toBe(500);
  });
});
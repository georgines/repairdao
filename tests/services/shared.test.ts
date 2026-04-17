import { describe, it, expect } from 'vitest';
import {
  ehValorPermitido,
  garantirValorPermitido,
  garantirTransicaoEstado,
  clamp,
} from '@/services/shared';
import { RepairDAODominioError } from '@/erros/errors';

describe('shared utilities', () => {
  it('ehValorPermitido retorna true para valores permitidos', () => {
    const lista = ['a', 'b'] as const;
    expect(ehValorPermitido('a', lista)).toBe(true);
    expect(ehValorPermitido('c', lista)).toBe(false);
  });

  it('garantirValorPermitido retorna o valor quando permitido', () => {
    const lista = ['x', 'y'] as const;
    expect(garantirValorPermitido('x', lista, 'err', 'msg')).toBe('x');
  });

  it('garantirValorPermitido lança RepairDAODominioError quando inválido', () => {
    const lista = ['x', 'y'] as const;
    expect(() => garantirValorPermitido('z', lista, 'err', 'msg')).toThrow(RepairDAODominioError);
  });

  it('garantirTransicaoEstado permite transição válida e retorna próximo estado', () => {
    const transicoes = { A: ['B'] } as const;
    expect(garantirTransicaoEstado('A', 'B', transicoes, 'err', 'ent')).toBe('B');
  });

  it('garantirTransicaoEstado lança quando transição inválida', () => {
    const transicoes = { A: ['C'] } as const;
    expect(() => garantirTransicaoEstado('A', 'B', transicoes, 'err', 'ent')).toThrow(RepairDAODominioError);
  });

  it('clamp limita o valor ao intervalo', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(100, 0, 50)).toBe(50);
  });
});

import { describe, it, expect } from 'vitest';
import * as v from '@/services/validacoes';
import { RepairDAODominioError } from '@/erros/errors';
import { REPAIRDAO_LIMITES } from '@/constants/constants';

describe('validacoes', () => {
  it('textoNaoVazio e garantirTextoNaoVazio', () => {
    expect(v.textoNaoVazio(' a ')).toBe(true);
    expect(v.textoNaoVazio('   ')).toBe(false);
    expect(v.garantirTextoNaoVazio(' x ')).toBe('x');
    expect(() => v.garantirTextoNaoVazio('   ', 'campo')).toThrow(RepairDAODominioError);
  });

  it('numeroMaiorQueZero e garantirNumeroMaiorQueZero', () => {
    expect(v.numeroMaiorQueZero(1)).toBe(true);
    expect(v.numeroMaiorQueZero(0)).toBe(false);
    expect(v.garantirNumeroMaiorQueZero(5)).toBe(5);
    expect(() => v.garantirNumeroMaiorQueZero(0)).toThrow(RepairDAODominioError);
  });

  it('inteiroEntre e garantirInteiroEntre', () => {
    expect(v.inteiroEntre(3, 1, 5)).toBe(true);
    expect(v.inteiroEntre(6, 1, 5)).toBe(false);
    expect(v.garantirInteiroEntre(2, 1, 5)).toBe(2);
    expect(() => v.garantirInteiroEntre(0, 1, 5)).toThrow(RepairDAODominioError);
  });

  it('notaEntreUmECinco e garantirNotaEntreUmECinco', () => {
    expect(v.notaEntreUmECinco(5)).toBe(true);
    expect(() => v.garantirNotaEntreUmECinco(0)).toThrow(RepairDAODominioError);
  });

  it('tokensPositivos e garantirTokensPositivos', () => {
    expect(v.tokensPositivos(1)).toBe(true);
    expect(v.tokensPositivos(undefined)).toBe(false);
    expect(v.garantirTokensPositivos(10)).toBe(10);
    expect(() => v.garantirTokensPositivos(undefined)).toThrow(RepairDAODominioError);
  });

  it('depositoAtivoValido e garantirDepositoAtivo', () => {
    expect(v.depositoAtivoValido(true)).toBe(true);
    expect(() => v.garantirDepositoAtivo(false, 'acao')).toThrow(RepairDAODominioError);
    expect(v.garantirDepositoAtivo(true)).toBe(true);
  });

  it('duracaoPropostaValida e garantirDuracaoProposta', () => {
    const min = REPAIRDAO_LIMITES.duracaoPropostaMinimaDias;
    const max = REPAIRDAO_LIMITES.duracaoPropostaMaximaDias;
    expect(v.duracaoPropostaValida(min)).toBe(true);
    expect(v.duracaoPropostaValida(max)).toBe(true);
    expect(v.duracaoPropostaValida(0)).toBe(false);
    expect(() => v.garantirDuracaoProposta(max + 1)).toThrow(RepairDAODominioError);
  });
});

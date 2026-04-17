import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('ethers', () => {
  return {
      Contract: function (address: any, abi: any, provider: any) {
        return {
          balanceOf: vi.fn(async (_addr: string) => 100n),
          tokensPerEth: vi.fn(async () => 200n),
          isActive: vi.fn(async () => true),
          getDeposit: vi.fn(async () => ({ isTechnician: true })),
          getLevelName: vi.fn(async () => 'Nivel 1'),
        };
      },
    JsonRpcProvider: function (url: string) {
      return {
        getStorage: vi.fn(async (_address: string, _slot: bigint) => '0x1'),
      };
    },
    formatUnits: (v: any, d: any) => String(v),
  };
});

import { carregarMetricasElegibilidadeNoServidor } from '@/services/eligibility/eligibilityMetricsServer';

describe('eligibilityMetricsServer', () => {
  beforeEach(() => {
    process.env.RPC_URL = 'http://127.0.0.1:8545';
  });

  it('retorna métricas quando endereço fornecido e depósito técnico', async () => {
    const metrics = await carregarMetricasElegibilidadeNoServidor('0xabc');
    expect(metrics.rptBalanceRaw).toBe(100n);
    expect(metrics.tokensPerEthRaw).toBe(200n);
    expect(metrics.isActive).toBe(true);
    expect(metrics.perfilAtivo).toBe('tecnico');
    expect(metrics.badgeLevel).toBe('Nivel 1');
  });

  it('retorna defaults quando endereço não fornecido', async () => {
    const metrics = await carregarMetricasElegibilidadeNoServidor(undefined);
    expect(metrics.badgeLevel).toBe('Sem carteira');
    expect(metrics.isActive).toBe(false);
    expect(metrics.perfilAtivo).toBe(null);
  });
});

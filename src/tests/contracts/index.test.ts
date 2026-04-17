import { afterEach, describe, expect, it, vi } from "vitest";

describe("contracts index", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("usa a rede local por padrao", async () => {
    vi.stubEnv("NEXT_PUBLIC_NETWORK", "");

    const { contratos } = await import("@/contracts");

    expect(contratos.RepairEscrow).toBe("0xc6e7DF5E7b4f2A278906862b61205850344D4e7d");
  });

  it("usa os enderecos de sepolia quando configurado", async () => {
    vi.stubEnv("NEXT_PUBLIC_NETWORK", "sepolia");

    const { contratos } = await import("@/contracts");

    expect(contratos.RepairEscrow).toBe("0xFDc767fb6C646027cb050B78f6bF5c3AfCDa06E7");
  });
});

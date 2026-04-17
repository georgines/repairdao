import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const providerCtor = vi.fn();
  const signerMock = vi.fn().mockResolvedValue({ kind: "signer" });
  const contractCtor = vi.fn();
  const executarMock = vi.fn().mockResolvedValue("ok");

  class BrowserProviderMock {
    readonly source: unknown;
    readonly getSigner = signerMock;

    constructor(source: unknown) {
      this.source = source;
      providerCtor(source);
    }
  }

  class ContractMock {
    readonly address: string;
    readonly abi: unknown;
    readonly runner: unknown;

    constructor(address: string, abi: unknown, runner: unknown) {
      this.address = address;
      this.abi = abi;
      this.runner = runner;
      contractCtor(address, abi, runner);
    }
  }

  return { providerCtor, signerMock, contractCtor, executarMock, BrowserProviderMock, ContractMock };
});

vi.mock("ethers", () => ({
  BrowserProvider: mocks.BrowserProviderMock,
  Contract: mocks.ContractMock,
}));

vi.mock("@/services/blockchain/contractExecutor", () => ({
  executarFuncaoContrato: mocks.executarMock,
}));

import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";

describe("browserContractClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reaproveita um BrowserProvider existente e cacheia leituras", async () => {
    const provider = new mocks.BrowserProviderMock({ kind: "provider" });
    const client = criarRepairDAOBrowserContractClient(provider as never);

    await expect(
      client.readContract({
        address: "0x0000000000000000000000000000000000000001",
        abi: [],
        functionName: "balanceOf",
        args: ["0xabc"],
      }),
    ).resolves.toBe("ok");

    await expect(
      client.readContract({
        address: "0x0000000000000000000000000000000000000001",
        abi: [],
        functionName: "balanceOf",
        args: ["0xabc"],
      }),
    ).resolves.toBe("ok");

    expect(mocks.providerCtor).toHaveBeenCalledTimes(1);
    expect(mocks.contractCtor).toHaveBeenCalledTimes(1);
    expect(mocks.executarMock).toHaveBeenCalledTimes(2);
    expect(mocks.executarMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ address: "0x0000000000000000000000000000000000000001", runner: provider }),
      "balanceOf",
      ["0xabc"],
    );
  });

  it("cria BrowserProvider a partir do ethereum e cacheia escritas", async () => {
    const ethereum = { provider: "ethereum" };
    const client = criarRepairDAOBrowserContractClient(ethereum as never);

    await expect(
      client.writeContract({
        address: "0x0000000000000000000000000000000000000002",
        abi: [],
        functionName: "createOrder",
        args: ["Servico"],
      }),
    ).resolves.toBe("ok");

    await expect(
      client.writeContract({
        address: "0x0000000000000000000000000000000000000002",
        abi: [],
        functionName: "createOrder",
        args: ["Servico"],
      }),
    ).resolves.toBe("ok");

    expect(mocks.providerCtor).toHaveBeenCalledWith(ethereum);
    expect(mocks.signerMock).toHaveBeenCalledTimes(1);
    expect(mocks.contractCtor).toHaveBeenCalledTimes(1);
    expect(mocks.executarMock).toHaveBeenCalledTimes(2);
  });
});

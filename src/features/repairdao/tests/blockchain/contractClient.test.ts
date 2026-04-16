import { beforeEach, describe, expect, it, vi } from "vitest";

const { contractCtor, providerCtor, walletCtor, contractSpy, providerSpy, walletSpy, getFunctionMock, staticCallMock, sendMock } = vi.hoisted(() => {
  const staticCallMock = vi.fn().mockResolvedValue("read-result");
  const sendMock = vi.fn().mockResolvedValue("write-result");
  const getFunctionMock = vi.fn().mockReturnValue({
    staticCall: staticCallMock,
    send: sendMock,
  });
  const contractSpy = vi.fn();
  const providerSpy = vi.fn();
  class JsonRpcProviderMock {
    readonly rpcUrl: string;

    constructor(rpcUrl: string) {
      this.rpcUrl = rpcUrl;
      providerSpy(rpcUrl);
    }
  }

  const walletSpy = vi.fn();
  class WalletMock {
    readonly privateKey: string;

    readonly provider: unknown;

    constructor(privateKey: string, provider: unknown) {
      this.privateKey = privateKey;
      this.provider = provider;
      walletSpy(privateKey, provider);
    }
  }

  class ContractMock {
    getFunction = getFunctionMock;

    constructor(...args: unknown[]) {
      contractSpy(...args);
    }
  }

  return {
    contractCtor: ContractMock,
    providerCtor: JsonRpcProviderMock,
    walletCtor: WalletMock,
    contractSpy,
    providerSpy,
    walletSpy,
    getFunctionMock,
    staticCallMock,
    sendMock,
  };
});

vi.mock("ethers", () => ({
  Contract: contractCtor,
  JsonRpcProvider: providerCtor,
  Wallet: walletCtor,
}));

import { criarRepairDAOContractClient } from "@/features/repairdao/services/blockchain/contractClient";

describe("contractClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria provider e wallet a partir das configuracoes", async () => {
    const client = criarRepairDAOContractClient({
      rpcUrl: "http://localhost:8545",
      privateKey: "0xabc123",
    });

    await expect(
      client.readContract({
        address: "0x0000000000000000000000000000000000000001",
        abi: [],
        functionName: "getOrder",
      }),
    ).resolves.toBe("read-result");

    await expect(
      client.writeContract({
        address: "0x0000000000000000000000000000000000000001",
        abi: [],
        functionName: "createOrder",
        args: ["troca"],
      }),
    ).resolves.toBe("write-result");

    await expect(
      client.writeContract({
        address: "0x0000000000000000000000000000000000000001",
        abi: [],
        functionName: "acceptOrder",
      }),
    ).resolves.toBe("write-result");

    expect(providerSpy).toHaveBeenCalledWith("http://localhost:8545");
    expect(walletSpy).toHaveBeenCalledWith("0xabc123", expect.anything());
    expect(contractSpy).toHaveBeenCalledTimes(3);
    expect(getFunctionMock).toHaveBeenNthCalledWith(1, "getOrder");
    expect(getFunctionMock).toHaveBeenNthCalledWith(2, "createOrder");
    expect(getFunctionMock).toHaveBeenNthCalledWith(3, "acceptOrder");
    expect(staticCallMock).toHaveBeenCalledWith();
    expect(sendMock).toHaveBeenNthCalledWith(1, "troca");
    expect(sendMock).toHaveBeenNthCalledWith(2);
  });

  it("valida configuracoes vazias", () => {
    expect(() => criarRepairDAOContractClient({ rpcUrl: "", privateKey: "0xabc" })).toThrow(/URL RPC/);
    expect(() => criarRepairDAOContractClient({ rpcUrl: "http://localhost:8545", privateKey: "" })).toThrow(/chave privada/);
  });
});
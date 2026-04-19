// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ethersMocks = vi.hoisted(() => ({
	jsonRpcProviderInstances: [] as Array<{ rpcUrl: string }>,
	contractCalls: [] as unknown[],
	nextContracts: [] as Array<{
		balanceOf: ReturnType<typeof vi.fn>;
		tokensPerEth: ReturnType<typeof vi.fn>;
	}>,
	formatUnitsMock: vi.fn(),
}));

vi.mock("ethers", () => ({
	JsonRpcProvider: class {
		rpcUrl: string;

		constructor(rpcUrl: string) {
			this.rpcUrl = rpcUrl;
			ethersMocks.jsonRpcProviderInstances.push({ rpcUrl });
		}
	},
	Contract: class {
		constructor(...args: unknown[]) {
			ethersMocks.contractCalls.push(args);
			return ethersMocks.nextContracts.shift();
		}
	},
	formatUnits: ethersMocks.formatUnitsMock,
}));

import { carregarMetricasDaLojaNoServidor } from "@/services/store/storeMetricsServer";

describe("carregarMetricasDaLojaNoServidor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ethersMocks.jsonRpcProviderInstances.length = 0;
		ethersMocks.contractCalls.length = 0;
		ethersMocks.nextContracts.length = 0;
		vi.stubEnv("NEXT_PUBLIC_NETWORK", "local");
		delete process.env.RPC_URL;
		delete process.env.NEXT_PUBLIC_RPC_URL;
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("lê a taxa atual e o saldo quando há endereço", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(1500000000000000000n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("1.5");
		ethersMocks.nextContracts.push(tokenContract);

		await expect(carregarMetricasDaLojaNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
		});

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:8545");
		expect(tokenContract.balanceOf).toHaveBeenCalledWith("0xabc");
		expect(tokenContract.tokensPerEth).toHaveBeenCalledTimes(1);
	});

	it("usa saldo zero quando o endereço nao existe", async () => {
		const tokenContract = {
			balanceOf: vi.fn(),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("0");
		ethersMocks.nextContracts.push(tokenContract);

		await expect(carregarMetricasDaLojaNoServidor(null)).resolves.toEqual({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
		});

		expect(tokenContract.balanceOf).not.toHaveBeenCalled();
		expect(tokenContract.tokensPerEth).toHaveBeenCalledTimes(1);
	});

	it("prioriza RPC_URL quando configurado", async () => {
		process.env.RPC_URL = "http://127.0.0.1:9545";

		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("0");
		ethersMocks.nextContracts.push(tokenContract);

		await carregarMetricasDaLojaNoServidor(null);

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:9545");
	});

	it("usa NEXT_PUBLIC_RPC_URL quando RPC_URL nao esta definido", async () => {
		process.env.NEXT_PUBLIC_RPC_URL = "http://127.0.0.1:8645";

		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("0");
		ethersMocks.nextContracts.push(tokenContract);

		await carregarMetricasDaLojaNoServidor(null);

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:8645");
	});

	it("usa saldo zero quando balanceOf falha", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockRejectedValue(new Error("falha no saldo")),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("0");
		ethersMocks.nextContracts.push(tokenContract);

		await expect(carregarMetricasDaLojaNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
		});
	});

	it("usa taxa zero quando tokensPerEth falha", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockRejectedValue(new Error("falha na taxa")),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("0");
		ethersMocks.nextContracts.push(tokenContract);

		await expect(carregarMetricasDaLojaNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 0n,
			tokensPerEth: "0",
		});
	});
});

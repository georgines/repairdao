// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const ethersMocks = vi.hoisted(() => ({
	browserProviderInstances: [] as Array<{
		send: ReturnType<typeof vi.fn>;
		getNetwork: ReturnType<typeof vi.fn>;
		getBalance: ReturnType<typeof vi.fn>;
	}>,
	nextBrowserProviders: [] as Array<{
		send: ReturnType<typeof vi.fn>;
		getNetwork: ReturnType<typeof vi.fn>;
		getBalance: ReturnType<typeof vi.fn>;
	}>,
	nextContracts: [] as Array<{
		balanceOf: ReturnType<typeof vi.fn>;
		tokensPerEth: ReturnType<typeof vi.fn>;
	}>,
	contractCalls: [] as unknown[],
	formatUnitsMock: vi.fn(),
}));

vi.mock("ethers", () => ({
	BrowserProvider: class {
		send: ReturnType<typeof vi.fn>;
		getNetwork: ReturnType<typeof vi.fn>;
		getBalance: ReturnType<typeof vi.fn>;

		constructor() {
			const instance = ethersMocks.nextBrowserProviders.shift() ?? {
				send: vi.fn(),
				getNetwork: vi.fn(),
				getBalance: vi.fn(),
			};

			this.send = instance.send;
			this.getNetwork = instance.getNetwork;
			this.getBalance = instance.getBalance;
			ethersMocks.browserProviderInstances.push(instance);
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

import { carregarMetricasDaLoja } from "@/services/store/storeMetrics";

describe("carregarMetricasDaLoja", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ethersMocks.browserProviderInstances.length = 0;
		ethersMocks.nextBrowserProviders.length = 0;
		ethersMocks.nextContracts.length = 0;
		ethersMocks.contractCalls.length = 0;
	});

	it("lê o saldo de RPT e a taxa atual do contrato", async () => {
		const ethereum = { request: vi.fn() };
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(1500000000000000000n),
			tokensPerEth: vi.fn().mockResolvedValue(250n),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("1.5");
		ethersMocks.nextContracts.push(tokenContract);
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn(),
			getNetwork: vi.fn(),
			getBalance: vi.fn(),
		});

		await expect(carregarMetricasDaLoja(ethereum, "0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
		});

		expect(ethersMocks.contractCalls.at(-1)).toEqual(
			expect.arrayContaining([expect.any(String), expect.any(Array), expect.any(Object)]),
		);
		expect(tokenContract.balanceOf).toHaveBeenCalledWith("0xabc");
		expect(tokenContract.tokensPerEth).toHaveBeenCalledTimes(1);
		expect(ethersMocks.formatUnitsMock).toHaveBeenCalledWith(1500000000000000000n, 18);
	});

	it("usa taxa zero quando a leitura do contrato falha", async () => {
		const ethereum = { request: vi.fn() };
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockRejectedValue(new Error("falha")),
		};

		ethersMocks.formatUnitsMock.mockReturnValue("0");
		ethersMocks.nextContracts.push(tokenContract);
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn(),
			getNetwork: vi.fn(),
			getBalance: vi.fn(),
		});

		await expect(carregarMetricasDaLoja(ethereum, "0xabc")).resolves.toEqual({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 0n,
			tokensPerEth: "0",
		});
	});
});

// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const ethersMocks = vi.hoisted(() => ({
	jsonRpcProviderInstances: [] as Array<{ rpcUrl: string }>,
	contractCalls: [] as unknown[],
	nextContracts: [] as Array<{
		balanceOf: ReturnType<typeof vi.fn>;
		tokensPerEth: ReturnType<typeof vi.fn>;
		isActive: ReturnType<typeof vi.fn>;
		minDeposit: ReturnType<typeof vi.fn>;
		getLevelName: ReturnType<typeof vi.fn>;
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

import { carregarMetricasElegibilidadeNoServidor } from "@/services/eligibility/eligibilityMetricsServer";

describe("carregarMetricasElegibilidadeNoServidor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ethersMocks.jsonRpcProviderInstances.length = 0;
		ethersMocks.contractCalls.length = 0;
		ethersMocks.nextContracts.length = 0;
		ethersMocks.formatUnitsMock.mockImplementation((value: bigint) => {
			if (value === 1500000000000000000n) {
				return "1.5";
			}
			if (value === 100000000000000000000n) {
				return "100";
			}
			return "0";
		});
		delete process.env.RPC_URL;
		delete process.env.NEXT_PUBLIC_RPC_URL;
	});

	it("lê saldo, atividade e nível quando há endereço", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(1500000000000000000n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(true),
			getDeposit: vi.fn().mockResolvedValue({ isTechnician: false }),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("bronze"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await expect(carregarMetricasElegibilidadeNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
	});

	it("usa valores padrao quando o endereco nao existe", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(false),
			getDeposit: vi.fn().mockResolvedValue({ isTechnician: false }),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Sem carteira"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await expect(carregarMetricasElegibilidadeNoServidor(null)).resolves.toEqual({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			badgeLevel: "Sem carteira",
			isActive: false,
			perfilAtivo: null,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
	});

	it("prioriza RPC_URL quando configurado", async () => {
		process.env.RPC_URL = "http://127.0.0.1:9545";

		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(false),
			getDeposit: vi.fn().mockResolvedValue({ isTechnician: false }),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("bronze"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await carregarMetricasElegibilidadeNoServidor(null);

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:9545");
	});

	it("usa NEXT_PUBLIC_RPC_URL quando RPC_URL nao esta definido", async () => {
		process.env.NEXT_PUBLIC_RPC_URL = "http://127.0.0.1:8645";

		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(false),
			getDeposit: vi.fn().mockResolvedValue({ isTechnician: false }),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("bronze"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await carregarMetricasElegibilidadeNoServidor(null);

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:8645");
	});

	it("usa fallbacks quando balanceOf, isActive ou getLevelName falham", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockRejectedValue(new Error("falha no saldo")),
			tokensPerEth: vi.fn().mockResolvedValue(0n),
		};
		const depositContract = {
			isActive: vi.fn().mockRejectedValue(new Error("falha no estado")),
			getDeposit: vi.fn().mockRejectedValue(new Error("falha no deposito")),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockRejectedValue(new Error("falha no nivel")),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await expect(carregarMetricasElegibilidadeNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 0n,
			tokensPerEth: "0",
			badgeLevel: "Sem badge",
			isActive: false,
			perfilAtivo: null,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
	});

	it("usa fallback quando a leitura do minimo falha", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(1500000000000000000n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(true),
			getDeposit: vi.fn().mockResolvedValue({ isTechnician: true }),
			minDeposit: vi.fn().mockRejectedValueOnce(new Error("falha no minimo")),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("bronze"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await expect(carregarMetricasElegibilidadeNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "tecnico",
			minDepositRaw: 0n,
			minDeposit: "0",
		});
	});

	it("usa fallback quando o tokensPerEth falha", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(1500000000000000000n),
			tokensPerEth: vi.fn().mockRejectedValue(new Error("falha nos tokens por eth")),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(true),
			getDeposit: vi.fn().mockResolvedValue({ isTechnician: false }),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("bronze"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await expect(carregarMetricasElegibilidadeNoServidor("0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 0n,
			tokensPerEth: "0",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
	});

	it("usa o perfil do deposito quando o contrato indica tecnico", async () => {
		const tokenContract = {
			balanceOf: vi.fn().mockResolvedValue(0n),
			tokensPerEth: vi.fn().mockResolvedValue(1000n),
		};
		const depositContract = {
			isActive: vi.fn().mockResolvedValue(true),
			getDeposit: vi.fn().mockResolvedValue([0n, 0n, 0n, 0n, true, true]),
			minDeposit: vi.fn().mockResolvedValue(100000000000000000000n),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("bronze"),
		};

		ethersMocks.nextContracts.push(tokenContract, depositContract, badgeContract);

		await expect(carregarMetricasElegibilidadeNoServidor("0xabc")).resolves.toMatchObject({
			perfilAtivo: "tecnico",
			isActive: true,
		});
	});
});

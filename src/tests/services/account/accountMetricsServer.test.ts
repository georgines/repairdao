// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const ethersMocks = vi.hoisted(() => ({
	jsonRpcProviderInstances: [] as Array<{ rpcUrl: string }>,
	contractCalls: [] as unknown[],
	nextContracts: [] as Array<{
		getDeposit: ReturnType<typeof vi.fn>;
		getRewards: ReturnType<typeof vi.fn>;
		isActive: ReturnType<typeof vi.fn>;
		getLevelName: ReturnType<typeof vi.fn>;
		getReputation: ReturnType<typeof vi.fn>;
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

import { carregarMetricasDaContaNoServidor } from "@/services/account/accountMetricsServer";

describe("carregarMetricasDaContaNoServidor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ethersMocks.jsonRpcProviderInstances.length = 0;
		ethersMocks.contractCalls.length = 0;
		ethersMocks.nextContracts.length = 0;
		delete process.env.RPC_URL;
		delete process.env.NEXT_PUBLIC_RPC_URL;
		ethersMocks.formatUnitsMock.mockImplementation((value: bigint, decimals: number) => {
			if (decimals === 18 && value === 150000000000000000000n) {
				return "150";
			}
			if (decimals === 18 && value === 5000000000000000000n) {
				return "5";
			}
			return String(value);
		});
	});

	it("lê deposito, rendimento e reputacao quando há endereço", async () => {
		const depositContract = {
			getDeposit: vi.fn().mockResolvedValue({ amount: 150000000000000000000n, isTechnician: true }),
			getRewards: vi.fn().mockResolvedValue(5000000000000000000n),
			isActive: vi.fn().mockResolvedValue(true),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Ouro"),
		};
		const reputationContract = {
			getReputation: vi.fn().mockResolvedValue({
				level: 4n,
				totalPoints: 32n,
				positiveRatings: 8n,
				negativeRatings: 1n,
				totalRatings: 9n,
				ratingSum: 41n,
			}),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await expect(carregarMetricasDaContaNoServidor("0xabc")).resolves.toEqual({
			depositRaw: 150000000000000000000n,
			deposit: "150",
			rewardsRaw: 5000000000000000000n,
			rewards: "5",
			isActive: true,
			perfilAtivo: "tecnico",
			badgeLevel: "Ouro",
			reputationLevelName: "Platinum",
			totalPointsRaw: 32n,
			totalPoints: "32",
			positiveRatingsRaw: 8n,
			positiveRatings: "8",
			negativeRatingsRaw: 1n,
			negativeRatings: "1",
			totalRatingsRaw: 9n,
			totalRatings: "9",
			ratingSumRaw: 41n,
			ratingSum: "41",
			averageRating: "4,6",
		});
	});

	it("usa valores padrao quando o endereco nao existe", async () => {
		const depositContract = {
			getDeposit: vi.fn(),
			getRewards: vi.fn(),
			isActive: vi.fn(),
		};
		const badgeContract = {
			getLevelName: vi.fn(),
		};
		const reputationContract = {
			getReputation: vi.fn(),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await expect(carregarMetricasDaContaNoServidor(null)).resolves.toEqual({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: false,
			perfilAtivo: null,
			badgeLevel: "Sem carteira",
			reputationLevelName: "None",
			totalPointsRaw: 0n,
			totalPoints: "0",
			positiveRatingsRaw: 0n,
			positiveRatings: "0",
			negativeRatingsRaw: 0n,
			negativeRatings: "0",
			totalRatingsRaw: 0n,
			totalRatings: "0",
			ratingSumRaw: 0n,
			ratingSum: "0",
			averageRating: "0,0",
		});
	});

	it("prioriza RPC_URL quando configurado", async () => {
		process.env.RPC_URL = "http://127.0.0.1:9545";

		const depositContract = {
			getDeposit: vi.fn().mockResolvedValue(null),
			getRewards: vi.fn().mockResolvedValue(0n),
			isActive: vi.fn().mockResolvedValue(false),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Sem carteira"),
		};
		const reputationContract = {
			getReputation: vi.fn().mockResolvedValue(null),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await carregarMetricasDaContaNoServidor(null);

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:9545");
	});

	it("usa NEXT_PUBLIC_RPC_URL quando RPC_URL nao esta definido", async () => {
		process.env.NEXT_PUBLIC_RPC_URL = "http://127.0.0.1:8645";

		const depositContract = {
			getDeposit: vi.fn().mockResolvedValue(null),
			getRewards: vi.fn().mockResolvedValue(0n),
			isActive: vi.fn().mockResolvedValue(false),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Sem carteira"),
		};
		const reputationContract = {
			getReputation: vi.fn().mockResolvedValue(null),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await carregarMetricasDaContaNoServidor(null);

		expect(ethersMocks.jsonRpcProviderInstances.at(-1)?.rpcUrl).toBe("http://127.0.0.1:8645");
	});

	it("usa fallbacks quando as leituras falham", async () => {
		const depositContract = {
			getDeposit: vi.fn().mockRejectedValue(new Error("falha no deposito")),
			getRewards: vi.fn().mockRejectedValue(new Error("falha no rendimento")),
			isActive: vi.fn().mockRejectedValue(new Error("falha no estado")),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockRejectedValue(new Error("falha no badge")),
		};
		const reputationContract = {
			getReputation: vi.fn().mockRejectedValue(new Error("falha na reputacao")),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await expect(carregarMetricasDaContaNoServidor("0xabc")).resolves.toEqual({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: false,
			perfilAtivo: null,
			badgeLevel: "Sem carteira",
			reputationLevelName: "None",
			totalPointsRaw: 0n,
			totalPoints: "0",
			positiveRatingsRaw: 0n,
			positiveRatings: "0",
			negativeRatingsRaw: 0n,
			negativeRatings: "0",
			totalRatingsRaw: 0n,
			totalRatings: "0",
			ratingSumRaw: 0n,
			ratingSum: "0",
			averageRating: "0,0",
		});
	});

	it("interpreta tuplas em formato posicional", async () => {
		const depositContract = {
			getDeposit: vi.fn().mockResolvedValue([200000000000000000000n, 0n, 0n, 0n, true, false]),
			getRewards: vi.fn().mockResolvedValue(1000000000000000000n),
			isActive: vi.fn().mockResolvedValue(true),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Prata"),
		};
		const reputationContract = {
			getReputation: vi.fn().mockResolvedValue([2n, 15n, 3n, 1n, 4n, 18n]),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await expect(carregarMetricasDaContaNoServidor("0xabc")).resolves.toMatchObject({
			perfilAtivo: "cliente",
			reputationLevelName: "Silver",
			averageRating: "4,5",
		});
	});

	it("usa fallback booleano quando o deposito nao entrega um valor valido", async () => {
		const depositContract = {
			getDeposit: vi.fn().mockResolvedValue({ amount: 50000000000000000000n, isTechnician: "sim" }),
			getRewards: vi.fn().mockResolvedValue(0n),
			isActive: vi.fn().mockResolvedValue(true),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Prata"),
		};
		const reputationContract = {
			getReputation: vi.fn().mockResolvedValue(null),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await expect(carregarMetricasDaContaNoServidor("0xabc")).resolves.toMatchObject({
			perfilAtivo: "cliente",
		});
	});

	it("usa fallback booleano quando o deposito vem em formato primitivo", async () => {
		const depositContract = {
			getDeposit: vi.fn().mockResolvedValue(50000000000000000000n),
			getRewards: vi.fn().mockResolvedValue(0n),
			isActive: vi.fn().mockResolvedValue(true),
		};
		const badgeContract = {
			getLevelName: vi.fn().mockResolvedValue("Prata"),
		};
		const reputationContract = {
			getReputation: vi.fn().mockResolvedValue(null),
		};

		ethersMocks.nextContracts.push(depositContract, badgeContract, reputationContract);

		await expect(carregarMetricasDaContaNoServidor("0xabc")).resolves.toMatchObject({
			perfilAtivo: "cliente",
		});
	});
});

// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const blockchainMocks = vi.hoisted(() => ({
	obterConfiguracaoRpcNoServidor: vi.fn(),
	criarRepairDAOContractClient: vi.fn(),
	criarGatewaysRepairDAO: vi.fn(),
	obterRepairDAOContractos: vi.fn(),
	loadDepositConfiguration: vi.fn(),
	upsertDepositConfiguration: vi.fn(),
	formatUnits: vi.fn(),
}));

vi.mock("@/services/blockchain/rpcConfig.server", () => ({
	obterConfiguracaoRpcNoServidor: blockchainMocks.obterConfiguracaoRpcNoServidor,
}));

vi.mock("@/services/blockchain/contractClient", () => ({
	criarRepairDAOContractClient: blockchainMocks.criarRepairDAOContractClient,
}));

vi.mock("@/services/blockchain/gateway", () => ({
	criarGatewaysRepairDAO: blockchainMocks.criarGatewaysRepairDAO,
}));

vi.mock("@/services/blockchain/gateways/contracts", () => ({
	obterRepairDAOContractos: blockchainMocks.obterRepairDAOContractos,
}));

vi.mock("@/services/deposit/depositConfigurationRepository", () => ({
	loadDepositConfiguration: blockchainMocks.loadDepositConfiguration,
	upsertDepositConfiguration: blockchainMocks.upsertDepositConfiguration,
}));

vi.mock("ethers", () => ({
	formatUnits: blockchainMocks.formatUnits,
}));

import {
	carregarConfiguracaoDepositoDaBlockchainNoServidor,
	carregarConfiguracaoDepositoPersistidaNoServidor,
	sincronizarConfiguracaoDepositoNoServidor,
} from "@/services/deposit/depositConfigurationBlockchain";

describe("depositConfigurationBlockchain", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		blockchainMocks.obterConfiguracaoRpcNoServidor.mockResolvedValue({
			rede: "local",
			nome: "Local",
			chainId: 31337,
			rpcUrl: "http://127.0.0.1:8545",
			contratos: {
				RepairToken: "0x1",
				RepairBadge: "0x2",
				RepairDeposit: "0xdeposit",
				RepairReputation: "0x3",
				RepairEscrow: "0x4",
				RepairGovernance: "0x5",
			},
		});
		blockchainMocks.obterRepairDAOContractos.mockReturnValue({
			deposit: { address: "0xdeposit" },
		});
		blockchainMocks.formatUnits.mockImplementation((value: bigint) => (value === 100000000000000000000n ? "100" : "0"));
	});

	it("lÃª a configuracao on-chain", async () => {
		const depositGateway = {
			readContract: vi.fn((input: { functionName: string }) => {
				if (input.functionName === "owner") {
					return Promise.resolve("0xowner");
				}
				if (input.functionName === "minDeposit") {
					return Promise.resolve(100000000000000000000n);
				}
				return Promise.reject(new Error("unexpected"));
			}),
		};

		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: depositGateway,
		});

		await expect(carregarConfiguracaoDepositoDaBlockchainNoServidor()).resolves.toEqual({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			syncedAt: expect.any(String),
		});
	});

	it("sincroniza a configuracao no banco", async () => {
		const depositGateway = {
			readContract: vi.fn((input: { functionName: string }) => {
				if (input.functionName === "owner") {
					return Promise.resolve("0xowner");
				}
				if (input.functionName === "minDeposit") {
					return Promise.resolve(100000000000000000000n);
				}
				return Promise.reject(new Error("unexpected"));
			}),
		};

		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: depositGateway,
		});
		blockchainMocks.upsertDepositConfiguration.mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
			updatedAt: "2026-04-19T12:00:00.000Z",
		});

		await expect(sincronizarConfiguracaoDepositoNoServidor()).resolves.toMatchObject({
			network: "local",
			ownerAddress: "0xowner",
			minDeposit: "100",
		});

		expect(blockchainMocks.upsertDepositConfiguration).toHaveBeenCalledWith(
			expect.objectContaining({
				network: "local",
				contractAddress: "0xdeposit",
				ownerAddress: "0xowner",
				minDepositRaw: 100000000000000000000n,
			}),
		);
	});

	it("usa o valor persistido quando a leitura on-chain falha", async () => {
		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: {
				readContract: vi.fn().mockRejectedValue(new Error("rpc indisponivel")),
			},
		});
		blockchainMocks.loadDepositConfiguration.mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});

		await expect(carregarConfiguracaoDepositoDaBlockchainNoServidor()).resolves.toEqual({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("carrega a configuracao persistida sem ler a blockchain", async () => {
		blockchainMocks.loadDepositConfiguration.mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});

		await expect(carregarConfiguracaoDepositoPersistidaNoServidor()).resolves.toEqual({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("lança erro quando a leitura on-chain e o fallback persistido falham", async () => {
		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: {
				readContract: vi.fn().mockRejectedValue(new Error("rpc indisponivel")),
			},
		});
		blockchainMocks.loadDepositConfiguration.mockResolvedValue(null);

		await expect(carregarConfiguracaoDepositoDaBlockchainNoServidor()).rejects.toThrow("Nao foi possivel carregar a configuracao do deposito.");
	});
});

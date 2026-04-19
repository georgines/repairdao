// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const blockchainMocks = vi.hoisted(() => ({
	obterConfiguracaoRpcNoServidor: vi.fn(),
	criarRepairDAOContractClient: vi.fn(),
	criarGatewaysRepairDAO: vi.fn(),
	obterRepairDAOContractos: vi.fn(),
	loadSystemConfiguration: vi.fn(),
	upsertSystemConfiguration: vi.fn(),
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

vi.mock("@/services/system/systemConfigurationRepository", () => ({
	loadSystemConfiguration: blockchainMocks.loadSystemConfiguration,
	upsertSystemConfiguration: blockchainMocks.upsertSystemConfiguration,
}));

vi.mock("ethers", () => ({
	formatUnits: blockchainMocks.formatUnits,
}));

import {
	carregarConfiguracaoSistemaDaBlockchainNoServidor,
	carregarConfiguracaoSistemaPersistidaNoServidor,
	sincronizarConfiguracaoSistemaNoServidor,
} from "@/services/system/systemConfigurationBlockchain";

describe("systemConfigurationBlockchain", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		blockchainMocks.obterConfiguracaoRpcNoServidor.mockResolvedValue({
			rede: "local",
			nome: "Local",
			chainId: 31337,
			rpcUrl: "http://127.0.0.1:8545",
			contratos: {
				RepairToken: "0xtoken",
				RepairBadge: "0x2",
				RepairDeposit: "0xdeposit",
				RepairReputation: "0x3",
				RepairEscrow: "0x4",
				RepairGovernance: "0x5",
			},
		});
		blockchainMocks.obterRepairDAOContractos.mockReturnValue({
			deposit: { address: "0xdeposit" },
			token: { address: "0xtoken" },
		});
		blockchainMocks.formatUnits.mockImplementation((value: bigint) => (value === 100000000000000000000n ? "100" : "0"));
	});

	it("lê a configuracao on-chain do sistema", async () => {
		const depositGateway = {
			readContract: vi.fn((input: { functionName: string }) => {
				if (input.functionName === "owner") {
					return Promise.resolve("0xdeposit-owner");
				}
				if (input.functionName === "minDeposit") {
					return Promise.resolve(100000000000000000000n);
				}
				return Promise.reject(new Error("unexpected"));
			}),
		};

		const tokenGateway = {
			readContract: vi.fn((input: { functionName: string }) => {
				if (input.functionName === "owner") {
					return Promise.resolve("0xtoken-owner");
				}
				if (input.functionName === "tokensPerEth") {
					return Promise.resolve(1000n);
				}
				return Promise.reject(new Error("unexpected"));
			}),
		};

		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: depositGateway,
			token: tokenGateway,
		});

		await expect(carregarConfiguracaoSistemaDaBlockchainNoServidor()).resolves.toEqual({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			syncedAt: expect.any(String),
		});
	});

	it("sincroniza a configuracao no banco", async () => {
		const depositGateway = {
			readContract: vi.fn((input: { functionName: string }) => {
				if (input.functionName === "owner") {
					return Promise.resolve("0xdeposit-owner");
				}
				if (input.functionName === "minDeposit") {
					return Promise.resolve(100000000000000000000n);
				}
				return Promise.reject(new Error("unexpected"));
			}),
		};

		const tokenGateway = {
			readContract: vi.fn((input: { functionName: string }) => {
				if (input.functionName === "owner") {
					return Promise.resolve("0xtoken-owner");
				}
				if (input.functionName === "tokensPerEth") {
					return Promise.resolve(1000n);
				}
				return Promise.reject(new Error("unexpected"));
			}),
		};

		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: depositGateway,
			token: tokenGateway,
		});
		blockchainMocks.upsertSystemConfiguration.mockResolvedValue({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: "1000",
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
			updatedAt: "2026-04-19T12:00:00.000Z",
		});

		await expect(sincronizarConfiguracaoSistemaNoServidor()).resolves.toMatchObject({
			network: "local",
			depositOwnerAddress: "0xdeposit-owner",
			tokenOwnerAddress: "0xtoken-owner",
		});

		expect(blockchainMocks.upsertSystemConfiguration).toHaveBeenCalledWith(
			expect.objectContaining({
				network: "local",
				depositContractAddress: "0xdeposit",
				tokenContractAddress: "0xtoken",
				minDepositRaw: 100000000000000000000n,
				tokensPerEthRaw: 1000n,
			}),
		);
	});

	it("usa o valor persistido quando a leitura on-chain falha", async () => {
		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: {
				readContract: vi.fn().mockRejectedValue(new Error("rpc indisponivel")),
			},
			token: {
				readContract: vi.fn().mockRejectedValue(new Error("rpc indisponivel")),
			},
		});
		blockchainMocks.loadSystemConfiguration.mockResolvedValue({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});

		await expect(carregarConfiguracaoSistemaDaBlockchainNoServidor()).resolves.toEqual({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("carrega a configuracao persistida sem ler a blockchain", async () => {
		blockchainMocks.loadSystemConfiguration.mockResolvedValue({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});

		await expect(carregarConfiguracaoSistemaPersistidaNoServidor()).resolves.toEqual({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("lança erro quando a leitura on-chain e o fallback persistido falham", async () => {
		blockchainMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: {
				readContract: vi.fn().mockRejectedValue(new Error("rpc indisponivel")),
			},
			token: {
				readContract: vi.fn().mockRejectedValue(new Error("rpc indisponivel")),
			},
		});
		blockchainMocks.loadSystemConfiguration.mockResolvedValue(null);

		await expect(carregarConfiguracaoSistemaDaBlockchainNoServidor()).rejects.toThrow("Nao foi possivel carregar a configuracao do sistema.");
	});
});

import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMocks = vi.hoisted(() => ({
	upsert: vi.fn(),
	findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
	prisma: {
		depositConfiguration: {
			upsert: prismaMocks.upsert,
			findUnique: prismaMocks.findUnique,
		},
	},
}));

import { loadSystemConfiguration, upsertSystemConfiguration } from "@/services/system/systemConfigurationRepository";

describe("systemConfigurationRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("persiste a configuracao do sistema convertendo os valores para texto", async () => {
		prismaMocks.upsert.mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xdeposit-owner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: "1000",
			tokensPerEth: "1000",
			syncedAt: new Date("2026-04-19T12:00:00.000Z"),
			updatedAt: new Date("2026-04-19T12:00:00.000Z"),
		});

		await expect(
			upsertSystemConfiguration({
				network: "local",
				depositContractAddress: "0xdeposit",
				depositOwnerAddress: "0xdeposit-owner",
				minDepositRaw: 100000000000000000000n,
				minDeposit: "100",
				tokenContractAddress: "0xtoken",
				tokenOwnerAddress: "0xtoken-owner",
				tokensPerEthRaw: 1000n,
				tokensPerEth: "1000",
			}),
		).resolves.toEqual({
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
	});

	it("carrega a configuracao persistida e converte os valores numericos", async () => {
		prismaMocks.findUnique.mockResolvedValue({
			network: "sepolia",
			contractAddress: "0xdeposit",
			ownerAddress: "0xdeposit-owner",
			minDepositRaw: "250000000000000000000",
			minDeposit: "250",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: "2000",
			tokensPerEth: "2000",
			syncedAt: new Date("2026-04-19T12:00:00.000Z"),
			updatedAt: new Date("2026-04-19T12:00:00.000Z"),
		});

		await expect(loadSystemConfiguration("sepolia")).resolves.toEqual({
			network: "sepolia",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 250000000000000000000n,
			minDeposit: "250",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 2000n,
			tokensPerEth: "2000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("retorna null quando nao existe registro", async () => {
		prismaMocks.findUnique.mockResolvedValue(null);

		await expect(loadSystemConfiguration("local")).resolves.toBeNull();
	});
});

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

import { loadDepositConfiguration, upsertDepositConfiguration } from "@/services/deposit/depositConfigurationRepository";

describe("depositConfigurationRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("persiste a configuracao convertendo o valor para texto", async () => {
		prismaMocks.upsert.mockResolvedValue({
			network: "local",
			contractAddress: "0x123",
			ownerAddress: "0xowner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			syncedAt: new Date("2026-04-19T12:00:00.000Z"),
			updatedAt: new Date("2026-04-19T12:00:00.000Z"),
		});

		await expect(
			upsertDepositConfiguration({
				network: "local",
				contractAddress: "0x123",
				ownerAddress: "0xowner",
				minDepositRaw: 100000000000000000000n,
				minDeposit: "100",
			}),
		).resolves.toEqual({
			network: "local",
			contractAddress: "0x123",
			ownerAddress: "0xowner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
			updatedAt: "2026-04-19T12:00:00.000Z",
		});

		expect(prismaMocks.upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { network: "local" },
				create: expect.objectContaining({
					minDepositRaw: "100000000000000000000",
				}),
				update: expect.objectContaining({
					minDepositRaw: "100000000000000000000",
				}),
			}),
		);
	});

	it("carrega a configuracao salva e converte o valor para bigint", async () => {
		prismaMocks.findUnique.mockResolvedValue({
			network: "sepolia",
			contractAddress: "0xabc",
			ownerAddress: "0xowner",
			minDepositRaw: "250000000000000000000",
			minDeposit: "250",
			syncedAt: new Date("2026-04-19T12:00:00.000Z"),
			updatedAt: new Date("2026-04-19T12:00:00.000Z"),
		});

		await expect(loadDepositConfiguration("sepolia")).resolves.toEqual({
			network: "sepolia",
			contractAddress: "0xabc",
			ownerAddress: "0xowner",
			minDepositRaw: 250000000000000000000n,
			minDeposit: "250",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("retorna null quando nao existe registro", async () => {
		prismaMocks.findUnique.mockResolvedValue(null);

		await expect(loadDepositConfiguration("local")).resolves.toBeNull();
	});
});


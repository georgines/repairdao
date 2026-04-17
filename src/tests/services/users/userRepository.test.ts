import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
	$transaction: vi.fn(async (arg: unknown) => {
		if (typeof arg === "function") {
			return await (arg as (tx: typeof prismaMocks) => Promise<unknown>)(prismaMocks);
		}

		return Promise.all(arg as Promise<unknown>[]);
	}),
	userProfile: {
		upsert: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	userAuditEvent: {
		create: vi.fn(),
		deleteMany: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMocks,
}));

import {
	getUserDetails,
	listEligibleTechnicians,
	listUsers,
	registerUser,
	saveOrUpdateUser,
	updateUserProfile,
	updateUserRole,
	withdrawUser,
} from "@/services/users";

describe("userRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("saves or updates the projection without extra audit", async () => {
		prismaMocks.userProfile.upsert.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await expect(
			saveOrUpdateUser({
				address: " 0xABC ",
				name: " Ana ",
				expertiseArea: " Eletrica ",
				role: "tecnico",
				badgeLevel: " bronze ",
				reputation: 12.4,
				depositLevel: 1.8,
				isActive: true,
				isEligible: true,
			}),
		).resolves.toEqual({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		expect(prismaMocks.userProfile.upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { address: "0xabc" },
				create: expect.objectContaining({
					address: "0xabc",
					searchName: "ana",
					expertiseArea: "Eletrica",
					role: "TECNICO",
					syncedAt: expect.any(Date),
				}),
				update: expect.objectContaining({
					searchName: "ana",
					expertiseArea: "Eletrica",
					role: "TECNICO",
					syncedAt: expect.any(Date),
				}),
			}),
		);
		expect(prismaMocks.userAuditEvent.create).not.toHaveBeenCalled();
	});

	it("saves a client profile without expertise area", async () => {
		prismaMocks.userProfile.upsert.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: null,
			role: "CLIENTE",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 0,
			isActive: true,
			isEligible: false,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await expect(
			saveOrUpdateUser({
				address: "0xABC",
				name: "Ana",
				role: "cliente",
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 0,
				isActive: true,
				isEligible: false,
			}),
		).resolves.toMatchObject({
			role: "cliente",
			expertiseArea: null,
		});
	});

	it("registers audit when creating a user", async () => {
		prismaMocks.userProfile.upsert.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await registerUser({
			address: "0xABC",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
		});

		expect(prismaMocks.$transaction).toHaveBeenCalledTimes(1);
		expect(prismaMocks.userAuditEvent.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				address: "0xabc",
				eventType: "REGISTERED",
			}),
		});
	});

	it("updates a user and registers audit", async () => {
		prismaMocks.userProfile.upsert.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Redes",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await updateUserProfile({
			address: "0xABC",
			name: "Ana",
			expertiseArea: "Redes",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
		});

		expect(prismaMocks.userAuditEvent.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				address: "0xabc",
				eventType: "UPDATED",
			}),
		});
	});

	it("updates the role and disables eligibility when changing to client", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});
		prismaMocks.userProfile.update.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: null,
			role: "CLIENTE",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: false,
			updatedAt: new Date("2026-04-17T10:05:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await expect(updateUserRole(" 0xABC ", "cliente")).resolves.toEqual({
			address: "0xabc",
			name: "Ana",
			expertiseArea: null,
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: false,
			updatedAt: "2026-04-17T10:05:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		expect(prismaMocks.userProfile.update).toHaveBeenCalledWith({
			where: { address: "0xabc" },
			data: { role: "CLIENTE", isEligible: false, expertiseArea: null },
		});
		expect(prismaMocks.userAuditEvent.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				address: "0xabc",
				eventType: "ROLE_CHANGED",
			}),
		});
	});

	it("returns null when the role does not exist", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue(null);

		await expect(updateUserRole("0xabc", "tecnico")).resolves.toBeNull();
		expect(prismaMocks.userProfile.update).not.toHaveBeenCalled();
	});

	it("preserva area de atuacao quando altera para tecnico", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "CLIENTE",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: false,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});
		prismaMocks.userProfile.update.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:05:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await expect(updateUserRole("0xabc", "tecnico")).resolves.toMatchObject({
			role: "tecnico",
			expertiseArea: "Eletrica",
			isEligible: true,
		});
		expect(prismaMocks.userProfile.update).toHaveBeenCalledWith({
			where: { address: "0xabc" },
			data: { role: "TECNICO", isEligible: true, expertiseArea: "Eletrica" },
		});
	});

	it("removes the user projection on withdrawal", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await expect(withdrawUser("0xABC")).resolves.toBe(true);

		expect(prismaMocks.$transaction).toHaveBeenCalledTimes(1);
		expect(prismaMocks.userAuditEvent.deleteMany).toHaveBeenCalledWith({
			where: { address: "0xabc" },
		});
		expect(prismaMocks.userProfile.delete).toHaveBeenCalledWith({
			where: { address: "0xabc" },
		});
	});

	it("returns false when withdrawal does not find the user", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue(null);

		await expect(withdrawUser("0xabc")).resolves.toBe(false);
		expect(prismaMocks.userProfile.delete).not.toHaveBeenCalled();
	});

	it("lists only eligible technicians ordered by reputation", async () => {
		prismaMocks.userProfile.findMany.mockResolvedValue([
			{
				address: "0xbbb",
				name: "Bruno",
				expertiseArea: "Redes",
				role: "TECNICO",
				badgeLevel: "bronze",
				reputation: 12,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: new Date("2026-04-17T10:00:00.000Z"),
				syncedAt: new Date("2026-04-17T10:01:00.000Z"),
			},
		]);

		await expect(listEligibleTechnicians()).resolves.toEqual([
			{
				address: "0xbbb",
				name: "Bruno",
				expertiseArea: "Redes",
				role: "tecnico",
				badgeLevel: "bronze",
				reputation: 12,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: "2026-04-17T10:00:00.000Z",
			},
		]);

		expect(prismaMocks.userProfile.findMany).toHaveBeenCalledWith({
			where: {
				role: "TECNICO",
				isActive: true,
				isEligible: true,
			},
			orderBy: [{ reputation: "desc" }, { name: "asc" }],
		});
	});

	it("lists all users ordered by name", async () => {
		prismaMocks.userProfile.findMany.mockResolvedValue([
			{
				address: "0xbbb",
				name: "Bruno",
				expertiseArea: "Redes",
				role: "TECNICO",
				badgeLevel: "bronze",
				reputation: 12,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: new Date("2026-04-17T10:00:00.000Z"),
				syncedAt: new Date("2026-04-17T10:01:00.000Z"),
			},
		]);

		await expect(listUsers()).resolves.toEqual([
			{
				address: "0xbbb",
				name: "Bruno",
				expertiseArea: "Redes",
				role: "tecnico",
				badgeLevel: "bronze",
				reputation: 12,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: "2026-04-17T10:00:00.000Z",
			},
		]);
	});

	it("returns normalized details for a user", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "TECNICO",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			syncedAt: new Date("2026-04-17T10:01:00.000Z"),
		});

		await expect(getUserDetails(" 0xABC ")).resolves.toEqual({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});
	});

	it("returns null when the user details are missing", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue(null);

		await expect(getUserDetails("0x999")).resolves.toBeNull();
	});
});

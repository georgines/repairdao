import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
	userProfile: {
		upsert: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	userAuditEvent: {
		create: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMocks,
}));

import {
	getUserDetails,
	listEligibleTechnicians,
	registerUser,
	saveOrUpdateUser,
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
					role: "TECNICO",
					syncedAt: expect.any(Date),
				}),
				update: expect.objectContaining({
					searchName: "ana",
					role: "TECNICO",
					syncedAt: expect.any(Date),
				}),
			}),
		);
		expect(prismaMocks.userAuditEvent.create).not.toHaveBeenCalled();
	});

	it("registers audit when creating a user", async () => {
		prismaMocks.userProfile.upsert.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
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
				eventType: "REGISTERED",
			}),
		});
	});

	it("updates the role and disables eligibility when changing to client", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
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
			data: { role: "CLIENTE", isEligible: false },
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

	it("removes the user projection on withdrawal and registers audit", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
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

		expect(prismaMocks.userProfile.delete).toHaveBeenCalledWith({
			where: { address: "0xabc" },
		});
		expect(prismaMocks.userAuditEvent.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				address: "0xabc",
				eventType: "WITHDRAWN",
			}),
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

	it("returns normalized details for a user", async () => {
		prismaMocks.userProfile.findUnique.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
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

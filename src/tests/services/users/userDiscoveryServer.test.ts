import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	listEligibleTechnicians: vi.fn(),
	getUserDetails: vi.fn(),
}));

vi.mock("@/services/users/userRepository", () => ({
	listEligibleTechnicians: serviceMocks.listEligibleTechnicians,
	getUserDetails: serviceMocks.getUserDetails,
}));

import {
	applyUserFilters,
	loadTechniciansForDiscovery,
	loadUserDetails,
} from "@/services/users/userDiscoveryServer";
import type { UserSummary } from "@/services/users";

const users: UserSummary[] = [
	{
		address: "0xbbb",
		name: "Bruno Silva",
		expertiseArea: "Redes",
		role: "tecnico",
		badgeLevel: "bronze",
		reputation: 12,
		depositLevel: 1,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T10:00:00.000Z",
	},
	{
		address: "0xaaa",
		name: "Ana Costa",
		expertiseArea: "Eletrica",
		role: "tecnico",
		badgeLevel: "silver",
		reputation: 18,
		depositLevel: 2,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T11:00:00.000Z",
	},
];

describe("userDiscoveryServer", () => {
	it("loads eligible technicians ordered", async () => {
		serviceMocks.listEligibleTechnicians.mockResolvedValue([users[0], users[1]]);

		await expect(loadTechniciansForDiscovery()).resolves.toEqual([users[1], users[0]]);
	});

	it("applies combined text and reputation filters", () => {
		expect(
			applyUserFilters(users, {
				query: "ana",
				minReputation: 10,
			}),
		).toEqual([users[1]]);
	});

	it("loads user details through the repository reference", async () => {
		serviceMocks.getUserDetails.mockResolvedValue(users[0]);

		await expect(loadUserDetails("0xbbb")).resolves.toEqual(users[0]);
		expect(serviceMocks.getUserDetails).toHaveBeenCalledWith("0xbbb");
	});
});

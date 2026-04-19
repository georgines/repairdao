import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	listEligibleTechnicians: vi.fn(),
	getUserDetails: vi.fn(),
	listUsers: vi.fn(),
	carregarMetricasDaContaNoServidor: vi.fn(),
}));

vi.mock("@/services/users/userRepository", () => ({
	listEligibleTechnicians: serviceMocks.listEligibleTechnicians,
	getUserDetails: serviceMocks.getUserDetails,
	listUsers: serviceMocks.listUsers,
}));

vi.mock("@/services/account/accountMetricsServer", () => ({
	carregarMetricasDaContaNoServidor: serviceMocks.carregarMetricasDaContaNoServidor,
}));

import {
	applyUserFilters,
	loadTechniciansForDiscovery,
	loadUserDetails,
	loadUsersForDiscovery,
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
		serviceMocks.carregarMetricasDaContaNoServidor.mockImplementation(async (address: string) => {
			if (address === "0xbbb") {
				return {
					badgeLevel: "platinum",
					totalPointsRaw: 10n,
					isActive: true,
					perfilAtivo: "tecnico",
				};
			}

			return {
				badgeLevel: "silver",
				totalPointsRaw: 30n,
				isActive: true,
				perfilAtivo: "tecnico",
			};
		});

		await expect(loadTechniciansForDiscovery()).resolves.toEqual([
			{
				...users[1],
				badgeLevel: "silver",
				reputation: 30,
				isActive: true,
				isEligible: true,
			},
			{
				...users[0],
				badgeLevel: "platinum",
				reputation: 10,
				isActive: true,
				isEligible: true,
			},
		]);
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
		serviceMocks.carregarMetricasDaContaNoServidor.mockResolvedValue({
			badgeLevel: "gold",
			totalPointsRaw: 99n,
			isActive: true,
			perfilAtivo: "tecnico",
		});

		await expect(loadUserDetails("0xbbb")).resolves.toEqual({
			...users[0],
			badgeLevel: "gold",
			reputation: 99,
			isActive: true,
			isEligible: true,
		});
		expect(serviceMocks.getUserDetails).toHaveBeenCalledWith("0xbbb");
	});

	it("loads the user list with blockchain values", async () => {
		serviceMocks.listUsers.mockResolvedValue([users[0]]);
		serviceMocks.carregarMetricasDaContaNoServidor.mockResolvedValue({
			badgeLevel: "diamond",
			totalPointsRaw: 77n,
			isActive: true,
			perfilAtivo: "tecnico",
		});

		await expect(loadUsersForDiscovery()).resolves.toEqual([
			{
				...users[0],
				badgeLevel: "diamond",
				reputation: 77,
				isActive: true,
				isEligible: true,
			},
		]);
	});

	it("retorna null quando o usuario nao existe", async () => {
		serviceMocks.getUserDetails.mockResolvedValueOnce(null);

		await expect(loadUserDetails("0x404")).resolves.toBeNull();
	});
});

import { describe, expect, it } from "vitest";
import {
	filterUsersByReputation,
	findUserDetails,
	normalizeText,
	searchUsers,
	sortUsers,
} from "@/services/users";
import type { UserSummary } from "@/services/users";

const users: UserSummary[] = [
	{
		address: "0xbbb",
		name: "Bruno Silva",
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
		role: "tecnico",
		badgeLevel: "silver",
		reputation: 18,
		depositLevel: 2,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T11:00:00.000Z",
	},
	{
		address: "0xccc",
		name: "Carlos Lima",
		role: "cliente",
		badgeLevel: "bronze",
		reputation: 4,
		depositLevel: 0,
		isActive: false,
		isEligible: false,
		updatedAt: "2026-04-17T12:00:00.000Z",
	},
];

describe("userSearch", () => {
	it("normalizes text with spaces and accents", () => {
		expect(normalizeText("  Ána Costa  ")).toBe("ana costa");
	});

	it("searches by name, address or badge", () => {
		expect(searchUsers(users, "ana")).toHaveLength(1);
		expect(searchUsers(users, "0xbbb")).toHaveLength(1);
		expect(searchUsers(users, "silver")).toHaveLength(1);
		expect(searchUsers(users, "")).toHaveLength(3);
	});

	it("filters by minimum reputation", () => {
		expect(filterUsersByReputation(users, 13)).toEqual([users[1]]);
		expect(filterUsersByReputation(users, -1)).toHaveLength(3);
		expect(filterUsersByReputation(users, Number.NaN)).toHaveLength(3);
	});

	it("sorts by reputation and name", () => {
		expect(sortUsers(users).map((user) => user.address)).toEqual(["0xaaa", "0xbbb", "0xccc"]);
	});

	it("sorts names when reputation ties", () => {
		const tied = [
			{
				...users[0],
				address: "0x111",
				name: "Ze",
				reputation: 10,
			},
			{
				...users[1],
				address: "0x222",
				name: "Ana",
				reputation: 10,
			},
		];

		expect(sortUsers(tied).map((user) => user.name)).toEqual(["Ana", "Ze"]);
	});

	it("returns the details for a user or null", () => {
		expect(findUserDetails(users, "0xaaa")).toEqual(users[1]);
		expect(findUserDetails(users, "   ")).toBeNull();
		expect(findUserDetails(users, "0x999")).toBeNull();
	});
});

import type { UserSummary } from "@/services/users/userTypes";

export type UserSearchFilters = {
	query: string;
	minReputation: number;
};

export function normalizeText(text: string) {
	return text
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

export function searchUsers(users: UserSummary[], query: string) {
	const term = normalizeText(query);

	if (!term) {
		return users;
	}

	return users.filter((user) => {
		const name = normalizeText(user.name);
		const address = normalizeText(user.address);
		const badge = normalizeText(user.badgeLevel);

		return name.includes(term) || address.includes(term) || badge.includes(term);
	});
}

export function filterUsersByReputation(users: UserSummary[], minReputation: number) {
	const minimum = Number.isFinite(minReputation) ? Math.max(0, Math.trunc(minReputation)) : 0;

	return users.filter((user) => user.reputation >= minimum);
}

export function findUserDetails(users: UserSummary[], address: string) {
	const normalizedAddress = normalizeText(address);

	if (!normalizedAddress) {
		return null;
	}

	return users.find((user) => normalizeText(user.address) === normalizedAddress) ?? null;
}

export function sortUsers(users: UserSummary[]) {
	return [...users].sort((a, b) => {
		if (b.reputation !== a.reputation) {
			return b.reputation - a.reputation;
		}

		return a.name.localeCompare(b.name, "pt-BR");
	});
}

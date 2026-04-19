import { getUserDetails, listEligibleTechnicians, listUsers } from "@/services/users/userRepository";
import {
	filterUsersByReputation,
	searchUsers,
	sortUsers,
	type UserSearchFilters,
} from "@/services/users/userSearch";
import {
	hydrateUserDetailsFromBlockchain,
	hydrateUserSummariesFromBlockchain,
} from "@/services/users/userBlockchainMetrics";
import type { UserDetails, UserSummary } from "@/services/users/userTypes";

export async function loadTechniciansForDiscovery(): Promise<UserSummary[]> {
	const technicians = await listEligibleTechnicians();
	const tecnicosAtualizados = await hydrateUserSummariesFromBlockchain(technicians);

	return sortUsers(tecnicosAtualizados.filter((tecnico) => tecnico.role === "tecnico" && tecnico.isActive && tecnico.isEligible));
}

export function applyUserFilters(users: UserSummary[], filters: UserSearchFilters) {
	const byText = searchUsers(users, filters.query);
	const byReputation = filterUsersByReputation(byText, filters.minReputation);

	return sortUsers(byReputation);
}

export async function loadUserDetails(address: string): Promise<UserDetails | null> {
	const user = await getUserDetails(address);

	if (!user) {
		return null;
	}

	return hydrateUserDetailsFromBlockchain(user);
}

export async function loadUsersForDiscovery(): Promise<UserSummary[]> {
	const users = await listUsers();
	return hydrateUserSummariesFromBlockchain(users);
}

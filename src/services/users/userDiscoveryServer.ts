import { getUserDetails, listEligibleTechnicians } from "@/services/users/userRepository";
import {
	filterUsersByReputation,
	searchUsers,
	sortUsers,
	type UserSearchFilters,
} from "@/services/users/userSearch";
import type { UserDetails, UserSummary } from "@/services/users/userTypes";

export async function loadTechniciansForDiscovery(): Promise<UserSummary[]> {
	const technicians = await listEligibleTechnicians();
	return sortUsers(technicians);
}

export function applyUserFilters(users: UserSummary[], filters: UserSearchFilters) {
	const byText = searchUsers(users, filters.query);
	const byReputation = filterUsersByReputation(byText, filters.minReputation);

	return sortUsers(byReputation);
}

export async function loadUserDetails(address: string): Promise<UserDetails | null> {
	return getUserDetails(address);
}

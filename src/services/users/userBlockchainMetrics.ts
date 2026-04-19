import { carregarMetricasDaContaNoServidor } from "@/services/account/accountMetricsServer";
import type { UserDetails, UserSummary } from "@/services/users/userTypes";

function toFiniteNumber(value: bigint) {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) ? numberValue : 0;
}

function mergeBlockchainMetrics<T extends UserSummary>(user: T, metrics: Awaited<ReturnType<typeof carregarMetricasDaContaNoServidor>>) {
	return {
		...user,
		badgeLevel: metrics.badgeLevel,
		reputation: toFiniteNumber(metrics.totalPointsRaw),
		isActive: metrics.isActive,
		isEligible: metrics.isActive && metrics.perfilAtivo === "tecnico",
	};
}

export async function hydrateUserSummariesFromBlockchain(users: UserSummary[]): Promise<UserSummary[]> {
	const metrics = await Promise.all(users.map((user) => carregarMetricasDaContaNoServidor(user.address)));

	return users.map((user, index) => mergeBlockchainMetrics(user, metrics[index]));
}

export async function hydrateUserDetailsFromBlockchain(user: UserDetails): Promise<UserDetails> {
	const metrics = await carregarMetricasDaContaNoServidor(user.address);

	return {
		...mergeBlockchainMetrics(user, metrics),
		syncedAt: user.syncedAt,
	};
}

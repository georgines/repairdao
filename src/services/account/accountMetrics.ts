export type { AccountMetrics } from "@/services/account/accountMetricsServer";

export async function carregarMetricasDaConta(address?: string | null) {
	const params = new URLSearchParams();

	if (address) {
		params.set("address", address);
	}

	const resposta = await fetch(`/api/account/metrics${params.size > 0 ? `?${params.toString()}` : ""}`, {
		cache: "no-store",
	});

	if (!resposta.ok) {
		throw new Error("Nao foi possivel carregar as metricas da conta.");
	}

	const dados = (await resposta.json()) as {
		depositRaw: string;
		deposit: string;
		rewardsRaw: string;
		rewards: string;
		isActive: boolean;
		perfilAtivo: "cliente" | "tecnico" | null;
		badgeLevel: string;
		reputationLevel: number;
		totalPointsRaw: string;
		totalPoints: string;
		positiveRatingsRaw: string;
		positiveRatings: string;
		negativeRatingsRaw: string;
		negativeRatings: string;
		totalRatingsRaw: string;
		totalRatings: string;
		ratingSumRaw: string;
		ratingSum: string;
		averageRating: string;
	};

	return {
		depositRaw: BigInt(dados.depositRaw),
		deposit: dados.deposit,
		rewardsRaw: BigInt(dados.rewardsRaw),
		rewards: dados.rewards,
		isActive: dados.isActive,
		perfilAtivo: dados.perfilAtivo,
		badgeLevel: dados.badgeLevel,
		reputationLevel: dados.reputationLevel,
		totalPointsRaw: BigInt(dados.totalPointsRaw),
		totalPoints: dados.totalPoints,
		positiveRatingsRaw: BigInt(dados.positiveRatingsRaw),
		positiveRatings: dados.positiveRatings,
		negativeRatingsRaw: BigInt(dados.negativeRatingsRaw),
		negativeRatings: dados.negativeRatings,
		totalRatingsRaw: BigInt(dados.totalRatingsRaw),
		totalRatings: dados.totalRatings,
		ratingSumRaw: BigInt(dados.ratingSumRaw),
		ratingSum: dados.ratingSum,
		averageRating: dados.averageRating,
	};
}

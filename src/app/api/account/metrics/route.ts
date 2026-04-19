import { NextResponse } from "next/server";
import { carregarMetricasDaContaNoServidor } from "@/services/account/accountMetricsServer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const address = url.searchParams.get("address");
	const metricas = await carregarMetricasDaContaNoServidor(address);

	return NextResponse.json({
		depositRaw: metricas.depositRaw.toString(),
		deposit: metricas.deposit,
		rewardsRaw: metricas.rewardsRaw.toString(),
		rewards: metricas.rewards,
		isActive: metricas.isActive,
		perfilAtivo: metricas.perfilAtivo,
		badgeLevel: metricas.badgeLevel,
		reputationLevelName: metricas.reputationLevelName,
		totalPointsRaw: metricas.totalPointsRaw.toString(),
		totalPoints: metricas.totalPoints,
		positiveRatingsRaw: metricas.positiveRatingsRaw.toString(),
		positiveRatings: metricas.positiveRatings,
		negativeRatingsRaw: metricas.negativeRatingsRaw.toString(),
		negativeRatings: metricas.negativeRatings,
		totalRatingsRaw: metricas.totalRatingsRaw.toString(),
		totalRatings: metricas.totalRatings,
		ratingSumRaw: metricas.ratingSumRaw.toString(),
		ratingSum: metricas.ratingSum,
		averageRating: metricas.averageRating,
	});
}

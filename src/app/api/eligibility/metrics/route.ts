import { NextResponse } from "next/server";
import { carregarMetricasElegibilidadeNoServidor } from "@/services/eligibility/eligibilityMetricsServer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const address = url.searchParams.get("address");
	const metricas = await carregarMetricasElegibilidadeNoServidor(address);

	return NextResponse.json({
		rptBalanceRaw: metricas.rptBalanceRaw.toString(),
		rptBalance: metricas.rptBalance,
		tokensPerEthRaw: metricas.tokensPerEthRaw.toString(),
		tokensPerEth: metricas.tokensPerEth,
		badgeLevel: metricas.badgeLevel,
		isActive: metricas.isActive,
		perfilAtivo: metricas.perfilAtivo,
		minDepositRaw: metricas.minDepositRaw.toString(),
		minDeposit: metricas.minDeposit,
	});
}

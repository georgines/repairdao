import { NextResponse } from "next/server";
import { carregarMetricasDaLojaNoServidor } from "@/services/store/storeMetricsServer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const address = url.searchParams.get("address");
	const metricas = await carregarMetricasDaLojaNoServidor(address);

	return NextResponse.json({
		rptBalanceRaw: metricas.rptBalanceRaw.toString(),
		rptBalance: metricas.rptBalance,
		tokensPerEthRaw: metricas.tokensPerEthRaw.toString(),
		tokensPerEth: metricas.tokensPerEth,
	});
}

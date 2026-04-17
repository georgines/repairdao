export type { StoreMetrics } from "@/services/store/storeMetricsServer";

export async function carregarMetricasDaLoja(address?: string | null) {
	const params = new URLSearchParams();

	if (address) {
		params.set("address", address);
	}

	const resposta = await fetch(`/api/store/metrics${params.size > 0 ? `?${params.toString()}` : ""}`, {
		cache: "no-store",
	});

	if (!resposta.ok) {
		throw new Error("Nao foi possivel carregar as metricas da loja.");
	}

	const dados = (await resposta.json()) as {
		rptBalanceRaw: string;
		rptBalance: string;
		tokensPerEthRaw: string;
		tokensPerEth: string;
	};

	return {
		rptBalanceRaw: BigInt(dados.rptBalanceRaw),
		rptBalance: dados.rptBalance,
		tokensPerEthRaw: BigInt(dados.tokensPerEthRaw),
		tokensPerEth: dados.tokensPerEth,
	};
}

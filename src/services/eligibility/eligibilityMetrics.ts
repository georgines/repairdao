export type { EligibilityMetrics } from "@/services/eligibility/eligibilityMetricsServer";

export async function carregarMetricasElegibilidade(address?: string | null) {
	const params = new URLSearchParams();

	if (address) {
		params.set("address", address);
	}

	const resposta = await fetch(`/api/eligibility/metrics${params.size > 0 ? `?${params.toString()}` : ""}`, {
		cache: "no-store",
	});

	if (!resposta.ok) {
		throw new Error("Nao foi possivel carregar as metricas de elegibilidade.");
	}

	const dados = (await resposta.json()) as {
		rptBalanceRaw: string;
		rptBalance: string;
		badgeLevel: string;
		isActive: boolean;
		minDepositRaw: string;
		minDeposit: string;
	};

	return {
		rptBalanceRaw: BigInt(dados.rptBalanceRaw),
		rptBalance: dados.rptBalance,
		badgeLevel: dados.badgeLevel,
		isActive: dados.isActive,
		minDepositRaw: BigInt(dados.minDepositRaw),
		minDeposit: dados.minDeposit,
	};
}

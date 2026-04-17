import type { CSSProperties } from "react";
import { criarResumoSaldo } from "@/services/balance/balanceSummary";
import { BalanceSummaryView } from "@/components/balance/BalanceSummaryView";

export type BalanceSummaryProps = {
	rptBalance: string;
	tokensPerEth: string;
	ethUsdPrice: string;
	ethBalance: string;
	usdBalance: string;
	note?: string | null;
	title?: string;
	style?: CSSProperties;
};

export function BalanceSummary({
	rptBalance,
	tokensPerEth,
	ethUsdPrice,
	ethBalance,
	usdBalance,
	note = null,
	title = "Saldo atual",
	style,
}: BalanceSummaryProps) {
	const resumo = criarResumoSaldo({
		title,
		rptBalance,
		tokensPerEth,
		ethUsdPrice,
		ethBalance,
		usdBalance,
		note,
	});

	return <BalanceSummaryView {...resumo} style={style} />;
}

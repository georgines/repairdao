import { formatarNumeroCompleto, formatarUSD } from "@/services/wallet/formatters";

export type BalanceSummarySection = {
	separatorText?: string;
	lines: string[];
};

export type BalanceSummaryModel = {
	title: string;
	primaryText: string;
	sections: BalanceSummarySection[];
	note: string | null;
};

type BalanceSummaryInput = {
	title?: string;
	rptBalance: string;
	tokensPerEth: string;
	ethUsdPrice: string;
	ethBalance: string;
	usdBalance: string;
	note?: string | null;
};

export function criarResumoSaldo({
	title = "Saldo atual",
	rptBalance,
	tokensPerEth,
	ethUsdPrice,
	ethBalance,
	usdBalance,
	note = null,
}: BalanceSummaryInput): BalanceSummaryModel {
	const rptNumero = Number(rptBalance);
	const taxaTokensPorEth = Number(tokensPerEth);
	const taxaEthUsd = Number(ethUsdPrice);
	const valorEthSistema = Number.isFinite(rptNumero) && Number.isFinite(taxaTokensPorEth) && taxaTokensPorEth > 0 ? rptNumero / taxaTokensPorEth : 0;
	const valorUsdSistema = Number.isFinite(taxaEthUsd) && taxaEthUsd > 0 ? valorEthSistema * taxaEthUsd : 0;

	return {
		title,
		primaryText: `RPT ${formatarNumeroCompleto(rptBalance, 2)}`,
		sections: [
			{
				separatorText: "No sistema",
				lines: [
					`ETH comprado ${formatarNumeroCompleto(String(valorEthSistema), 4)}`,
					`USD comprado ${formatarUSD(String(valorUsdSistema))}`,
				],
			},
			{
				separatorText: "Na carteira",
				lines: [
					`ETH ${formatarNumeroCompleto(ethBalance, 4)}`,
					`USD ${formatarUSD(usdBalance)}`,
				],
			},
		],
		note,
	};
}

const CHAIN_NAMES: Record<string, string> = {
	"1": "Ethereum",
	"5": "Goerli",
	"10": "Optimism",
	"137": "Polygon",
	"31337": "Local",
	"42161": "Arbitrum",
	"8453": "Base",
	"11155111": "Sepolia",
};

export function formatarEnderecoCurto(address?: string | null) {
	if (!address) {
		return "Carteira desconectada";
	}

	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatarBlockchain(chainId?: bigint | number | null) {
	if (chainId === undefined || chainId === null) {
		return "Sem rede";
	}

	const chave = String(chainId);
	return CHAIN_NAMES[chave] ?? `Chain ${chave}`;
}

export function formatarNumero(valor: string, casasDecimais = 2) {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return new Intl.NumberFormat("pt-BR", {
			minimumFractionDigits: casasDecimais,
			maximumFractionDigits: casasDecimais,
		}).format(0);
	}

	const abs = Math.abs(numero);

	if (abs >= 1_000_000) {
		return new Intl.NumberFormat("pt-BR", {
			notation: "compact",
			maximumFractionDigits: casasDecimais,
		}).format(numero);
	}

	return new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: casasDecimais,
		maximumFractionDigits: casasDecimais,
	}).format(numero);
}

export function formatarUSD(valor: string) {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return "$0.00";
	}

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numero);
}

export function normalizarPrecoEthUsd(valor: bigint | number | string) {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return 0;
	}

	return Math.abs(numero) >= 1_000_000 ? numero / 100_000_000 : numero;
}

export type WalletSnapshot = {
	connected: boolean;
	address: string | null;
	chainLabel: string;
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
};

export const ESTADO_INICIAL_CARTEIRA: WalletSnapshot = {
	connected: false,
	address: null,
	chainLabel: "Sem conexao",
	ethBalance: "0",
	usdBalance: "$0.00",
	ethUsdPrice: "0",
};

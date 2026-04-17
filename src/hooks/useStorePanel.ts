"use client";

import { useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { comprarToken } from "@/services/wallet/tokenPurchase";

type UseStorePanelResult = {
	connected: boolean;
	ethBalance: string;
	usdBalance: string;
	walletNotice: string | null;
	quantityEth: string;
	buying: boolean;
	error: string | null;
	handleQuantityEthChange: (value: string) => void;
	handleBuy: () => Promise<void>;
};

export function useStorePanel(onPurchased: () => void): UseStorePanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [quantityEth, setQuantityEth] = useState("0,10");
	const [buying, setBuying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const connected = state.connected;
	const ethBalance = connected ? state.ethBalance : "0";
	const usdBalance = connected ? state.usdBalance : "0";
	const walletNotice = connected ? null : "Carteira desconectada";

	async function handleBuy() {
		if (!ethereum || !connected) {
			setError("Conecte a carteira para trocar ETH por RPT.");
			return;
		}

		setBuying(true);
		setError(null);

		try {
			await comprarToken(ethereum, quantityEth);
			onPurchased();
		} catch (purchaseError) {
			setError(purchaseError instanceof Error ? purchaseError.message : "Nao foi possivel concluir a compra de tokens.");
		} finally {
			setBuying(false);
		}
	}

	return {
		connected,
		ethBalance,
		usdBalance,
		walletNotice,
		quantityEth,
		buying,
		error,
		handleQuantityEthChange: setQuantityEth,
		handleBuy,
	};
}

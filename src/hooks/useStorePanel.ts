"use client";

import { useEffect, useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { comprarToken } from "@/services/wallet/tokenPurchase";
import { depositarTokens } from "@/services/store/tokenDeposit";
import { carregarMetricasDaLoja, type StoreMetrics } from "@/services/store/storeMetrics";

type UseStorePanelResult = {
	connected: boolean;
	ethBalance: string;
	usdBalance: string;
	rptBalance: string;
	tokensPerEth: string;
	rptPreview: string;
	walletNotice: string | null;
	quantityEth: string;
	buying: boolean;
	depositing: boolean;
	error: string | null;
	handleQuantityEthChange: (value: string) => void;
	handleBuy: () => Promise<void>;
	handleDeposit: () => Promise<void>;
};

const METRICAS_PADRAO: StoreMetrics = {
	rptBalanceRaw: 0n,
	rptBalance: "0",
	tokensPerEthRaw: 0n,
	tokensPerEth: "0",
};

function normalizarQuantidadeEth(valor: string) {
	const texto = valor.trim().replace(",", ".");
	const numero = Number(texto);

	if (!Number.isFinite(numero) || numero <= 0) {
		return 0;
	}

	return numero;
}

export function useStorePanel(onPurchased: () => void): UseStorePanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [quantityEth, setQuantityEth] = useState("0,10");
	const [buying, setBuying] = useState(false);
	const [depositing, setDepositing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metricas, setMetricas] = useState<StoreMetrics>(METRICAS_PADRAO);
	const connected = state.connected;
	const ethBalance = connected ? state.ethBalance : "0";
	const usdBalance = connected ? state.usdBalance : "0";
	const walletNotice = connected ? null : "Carteira desconectada";
	const quantidadeNumerica = normalizarQuantidadeEth(quantityEth);
	const rptPreview = connected ? String(quantidadeNumerica * Number(metricas.tokensPerEth)) : "0";

	useEffect(() => {
		let ativo = true;

		async function sincronizarMetricas() {
			if (!ethereum || !connected || !state.address) {
				setMetricas(METRICAS_PADRAO);

				return;
			}

			try {
				const dados = await carregarMetricasDaLoja(ethereum, state.address);

				if (ativo) {
					setMetricas(dados);
				}
			} catch {
				if (ativo) {
					setMetricas(METRICAS_PADRAO);
				}
			}
		}

		void sincronizarMetricas();

		const intervalo = window.setInterval(() => {
			void sincronizarMetricas();
		}, 15000);

		return () => {
			ativo = false;
			window.clearInterval(intervalo);
		};
	}, [connected, ethereum, state.address]);

	function handleQuantityEthChange(value: string) {
		setQuantityEth(value);
		setError(null);
	}

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

	async function handleDeposit() {
		if (!ethereum || !connected) {
			setError("Conecte a carteira para depositar os RPT.");
			return;
		}

		if (metricas.rptBalanceRaw <= 0n) {
			setError("Nao ha RPT disponivel para depositar.");
			return;
		}

		setDepositing(true);
		setError(null);

		try {
			await depositarTokens(ethereum, metricas.rptBalanceRaw);
			onPurchased();
		} catch (depositError) {
			setError(depositError instanceof Error ? depositError.message : "Nao foi possivel concluir o deposito dos RPT.");
		} finally {
			setDepositing(false);
		}
	}

	return {
		connected,
		ethBalance,
		usdBalance,
		rptBalance: connected ? metricas.rptBalance : "0",
		tokensPerEth: connected ? metricas.tokensPerEth : "0",
		rptPreview,
		walletNotice,
		quantityEth,
		buying,
		depositing,
		error,
		handleQuantityEthChange,
		handleBuy,
		handleDeposit,
	};
}

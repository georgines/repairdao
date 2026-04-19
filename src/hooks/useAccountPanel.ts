"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccountMetrics } from "@/hooks/useAccountMetrics";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { carregarMetricasElegibilidade, type EligibilityMetrics } from "@/services/eligibility/eligibilityMetrics";
import { sacarDeposito, sacarRendimento } from "@/services/account/accountActions";
import { deleteUserProfile } from "@/services/users/userClient";

type UseAccountPanelResult = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	deposit: string;
	rewards: string;
	badgeLevel: string;
	reputationLevelName: string;
	perfilAtivo: "cliente" | "tecnico" | null;
	isActive: boolean;
	totalPoints: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
	ratingSum: string;
	averageRating: string;
	withdrawingDeposit: boolean;
	withdrawingRewards: boolean;
	error: string | null;
	canWithdrawDeposit: boolean;
	canWithdrawRewards: boolean;
	handleWithdrawDeposit: () => Promise<void>;
	handleWithdrawRewards: () => Promise<void>;
};

const METRICAS_ELEGIBILIDADE_PADRAO: EligibilityMetrics = {
	rptBalanceRaw: 0n,
	rptBalance: "0",
	tokensPerEthRaw: 0n,
	tokensPerEth: "0",
	badgeLevel: "Sem carteira",
	isActive: false,
	perfilAtivo: null,
	minDepositRaw: 0n,
	minDeposit: "0",
};

export function useAccountPanel(): UseAccountPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [refreshIndex, setRefreshIndex] = useState(0);
	const metricas = useAccountMetrics({ refreshKey: refreshIndex });
	const [metricasElegibilidade, setMetricasElegibilidade] = useState<EligibilityMetrics>(METRICAS_ELEGIBILIDADE_PADRAO);
	const [withdrawingDeposit, setWithdrawingDeposit] = useState(false);
	const [withdrawingRewards, setWithdrawingRewards] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const connected = state.connected;
	const walletAddress = connected ? state.address : null;
	const walletNotice = connected ? null : "Carteira desconectada";
	const canWithdrawDeposit = connected && metricas.isActive && metricas.depositRaw > 0n && !withdrawingDeposit && !withdrawingRewards;
	const canWithdrawRewards = connected && metricas.isActive && metricas.rewardsRaw > 0n && !withdrawingDeposit && !withdrawingRewards;

	useEffect(() => {
		let ativo = true;

		async function sincronizarMetricasElegibilidade() {
			try {
				const dados = await carregarMetricasElegibilidade(connected ? state.address : null);

				if (ativo) {
					setMetricasElegibilidade(dados);
				}
			} catch {
				if (ativo) {
					setMetricasElegibilidade(METRICAS_ELEGIBILIDADE_PADRAO);
				}
			}
		}

		void sincronizarMetricasElegibilidade();

		return () => {
			ativo = false;
		};
	}, [connected, state.address]);

	async function executarSaque(
		acao: () => Promise<unknown>,
		setLoading: (value: boolean) => void,
		mensagemSemCarteira: string,
		mensagemFallback: string,
	) {
		if (!ethereum || !connected) {
			setError(mensagemSemCarteira);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await acao();
			setRefreshIndex((value) => value + 1);
		} catch (withdrawError) {
			setError(withdrawError instanceof Error ? withdrawError.message : mensagemFallback);
		} finally {
			setLoading(false);
		}
	}

	async function handleWithdrawDeposit() {
		if (!ethereum || !connected) {
			setError("Conecte a carteira para sacar o deposito.");
			return;
		}

		if (!metricas.isActive || metricas.depositRaw <= 0n) {
			setError("Nao ha deposito disponivel para saque.");
			return;
		}

		await executarSaque(
			async () => {
				await sacarDeposito(ethereum);
				if (state.address) {
					await deleteUserProfile(state.address);
				}
			},
			setWithdrawingDeposit,
			"Conecte a carteira para sacar o deposito.",
			"Nao foi possivel concluir o saque do deposito.",
		);
	}

	async function handleWithdrawRewards() {
		if (!ethereum || !connected) {
			setError("Conecte a carteira para sacar os rendimentos.");
			return;
		}

		if (!metricas.isActive || metricas.rewardsRaw <= 0n) {
			setError("Nao ha rendimentos disponiveis para saque.");
			return;
		}

		await executarSaque(
			() => sacarRendimento(ethereum),
			setWithdrawingRewards,
			"Conecte a carteira para sacar os rendimentos.",
			"Nao foi possivel concluir o saque dos rendimentos.",
		);
	}

	return {
		connected,
		walletAddress,
		walletNotice,
		ethBalance: connected ? state.ethBalance : "0",
		usdBalance: connected ? state.usdBalance : "0",
		ethUsdPrice: connected ? state.ethUsdPrice : "0",
		tokensPerEth: connected ? metricasElegibilidade.tokensPerEth : "0",
		rptBalance: connected ? metricasElegibilidade.rptBalance : "0",
		deposit: connected ? metricas.deposit : "0",
		rewards: connected ? metricas.rewards : "0",
		badgeLevel: connected ? metricas.badgeLevel : "Sem carteira",
		reputationLevelName: connected ? metricas.reputationLevelName : "None",
		perfilAtivo: connected ? metricas.perfilAtivo : null,
		isActive: connected ? metricas.isActive : false,
		totalPoints: connected ? metricas.totalPoints : "0",
		positiveRatings: connected ? metricas.positiveRatings : "0",
		negativeRatings: connected ? metricas.negativeRatings : "0",
		totalRatings: connected ? metricas.totalRatings : "0",
		ratingSum: connected ? metricas.ratingSum : "0",
		averageRating: connected ? metricas.averageRating : "0,0",
		withdrawingDeposit,
		withdrawingRewards,
		error,
		canWithdrawDeposit,
		canWithdrawRewards,
		handleWithdrawDeposit,
		handleWithdrawRewards,
	};
}

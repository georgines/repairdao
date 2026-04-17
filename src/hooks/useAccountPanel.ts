"use client";

import { useEffect, useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { carregarMetricasDaConta, type AccountMetrics } from "@/services/account/accountMetrics";
import { sacarDeposito, sacarRendimento } from "@/services/account/accountActions";
import { deleteUserProfile } from "@/services/users/userClient";

type UseAccountPanelResult = {
	connected: boolean;
	walletNotice: string | null;
	deposit: string;
	rewards: string;
	badgeLevel: string;
	reputationLevel: number;
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

const METRICAS_PADRAO: AccountMetrics = {
	depositRaw: 0n,
	deposit: "0",
	rewardsRaw: 0n,
	rewards: "0",
	isActive: false,
	perfilAtivo: null,
	badgeLevel: "Sem carteira",
	reputationLevel: 0,
	totalPointsRaw: 0n,
	totalPoints: "0",
	positiveRatingsRaw: 0n,
	positiveRatings: "0",
	negativeRatingsRaw: 0n,
	negativeRatings: "0",
	totalRatingsRaw: 0n,
	totalRatings: "0",
	ratingSumRaw: 0n,
	ratingSum: "0",
	averageRating: "0,0",
};

export function useAccountPanel(): UseAccountPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [metricas, setMetricas] = useState<AccountMetrics>(METRICAS_PADRAO);
	const [refreshIndex, setRefreshIndex] = useState(0);
	const [withdrawingDeposit, setWithdrawingDeposit] = useState(false);
	const [withdrawingRewards, setWithdrawingRewards] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const connected = state.connected;
	const walletNotice = connected ? null : "Carteira desconectada";
	const canWithdrawDeposit = connected && metricas.isActive && metricas.depositRaw > 0n && !withdrawingDeposit && !withdrawingRewards;
	const canWithdrawRewards = connected && metricas.isActive && metricas.rewardsRaw > 0n && !withdrawingDeposit && !withdrawingRewards;

	useEffect(() => {
		let ativo = true;

		async function sincronizarMetricas() {
			try {
				const dados = await carregarMetricasDaConta(connected ? state.address : null);

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
	}, [connected, state.address, refreshIndex]);

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
		if (!metricas.isActive || metricas.depositRaw <= 0n) {
			setError("Nao ha deposito disponivel para saque.");
			return;
		}

		if (!ethereum) {
			setError("Conecte a carteira para sacar o deposito.");
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
		if (!metricas.isActive || metricas.rewardsRaw <= 0n) {
			setError("Nao ha rendimentos disponiveis para saque.");
			return;
		}

		if (!ethereum) {
			setError("Conecte a carteira para sacar os rendimentos.");
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
		walletNotice,
		deposit: connected ? metricas.deposit : "0",
		rewards: connected ? metricas.rewards : "0",
		badgeLevel: connected ? metricas.badgeLevel : "Sem carteira",
		reputationLevel: connected ? metricas.reputationLevel : 0,
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

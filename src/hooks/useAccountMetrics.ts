"use client";

import { useEffect, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { carregarMetricasDaConta, type AccountMetrics } from "@/services/account/accountMetrics";

type UseAccountMetricsOptions = {
	refreshKey?: number;
	pollingIntervalMs?: number;
};

const METRICAS_PADRAO: AccountMetrics = {
	depositRaw: 0n,
	deposit: "0",
	rewardsRaw: 0n,
	rewards: "0",
	isActive: false,
	perfilAtivo: null,
	badgeLevel: "Sem carteira",
	reputationLevelName: "None",
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

export function useAccountMetrics({ refreshKey = 0, pollingIntervalMs = 15_000 }: UseAccountMetricsOptions = {}) {
	const { state } = useWalletStatus();
	const [metricas, setMetricas] = useState<AccountMetrics>(METRICAS_PADRAO);

	useEffect(() => {
		let ativo = true;

		async function sincronizarMetricas() {
			if (!state.connected) {
				if (ativo) {
					setMetricas(METRICAS_PADRAO);
				}

				return;
			}

			try {
				const dados = await carregarMetricasDaConta(state.address ?? null);

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
		}, pollingIntervalMs);

		return () => {
			ativo = false;
			window.clearInterval(intervalo);
		};
	}, [pollingIntervalMs, refreshKey, state.address, state.connected]);

	return {
		...metricas,
		connected: state.connected,
		walletAddress: state.connected ? state.address : null,
		walletNotice: state.connected ? null : "Carteira desconectada",
	};
}

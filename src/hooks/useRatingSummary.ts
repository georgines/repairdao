"use client";

import { useEffect, useState } from "react";
import { carregarMetricasDaConta } from "@/services/account/accountMetrics";

export type RatingSummaryState = {
	averageRating: number;
	totalRatings: number;
	loading: boolean;
};

export type RatingSummarySource = "account" | "technician";

function normalizarNumero(valor: string | number | null | undefined) {
	if (typeof valor === "number") {
		return Number.isFinite(valor) ? valor : 0;
	}

	if (typeof valor === "string") {
		const parsed = Number(valor.replace(",", "."));
		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}

export function useRatingSummary(address?: string | null, source: RatingSummarySource = "technician"): RatingSummaryState {
	const [state, setState] = useState<RatingSummaryState>({
		averageRating: 0,
		totalRatings: 0,
		loading: Boolean(address),
	});

	useEffect(() => {
		if (!address) {
			setState({
				averageRating: 0,
				totalRatings: 0,
				loading: false,
			});
			return;
		}

		let ativo = true;
		async function carregarResumo() {
			setState((current) => ({
				...current,
				loading: true,
			}));

			const resumo = await carregarMetricasDaConta(address)
				.then((metricas) => ({
					averageRating: normalizarNumero(metricas.averageRating),
					totalRatings: normalizarNumero(metricas.totalRatings),
				}))
				.catch(() => ({
					averageRating: 0,
					totalRatings: 0,
				}));

			if (!ativo) {
				return;
			}

			setState({
				averageRating: resumo?.averageRating ?? 0,
				totalRatings: resumo?.totalRatings ?? 0,
				loading: false,
			});
		}

		void carregarResumo();
		const intervalo = window.setInterval(() => {
			void carregarResumo();
		}, 15000);

		return () => {
			ativo = false;
			window.clearInterval(intervalo);
		};
	}, [address, source]);

	return state;
}

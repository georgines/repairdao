"use client";

import { useEffect, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { carregarMetricasDaConta } from "@/services/account/accountMetrics";

export type ActiveAccountProfile = "cliente" | "tecnico" | null;

export function useAccountProfile() {
	const { state } = useWalletStatus();
	const [perfilAtivo, setPerfilAtivo] = useState<ActiveAccountProfile>(null);

	useEffect(() => {
		let ativo = true;

		async function carregarPerfilAtivo() {
			if (!state.connected || !state.address) {
				setPerfilAtivo(null);
				return;
			}

			setPerfilAtivo(null);

			try {
				const metricas = await carregarMetricasDaConta(state.address);

				if (ativo) {
					setPerfilAtivo(metricas.perfilAtivo);
				}
			} catch {
				if (ativo) {
					setPerfilAtivo(null);
				}
			}
		}

		void carregarPerfilAtivo();

		return () => {
			ativo = false;
		};
	}, [state.address, state.connected]);

	return {
		perfilAtivo,
		connected: state.connected,
		walletAddress: state.address ?? null,
	};
}

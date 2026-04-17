"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { carregarCarteira, obterRedeAtual } from "@/services/wallet/walletReader";
import { definirReconexaoAutomatica, reconexaoAutomaticaHabilitada } from "@/services/wallet/preferences";
import { ESTADO_INICIAL_CARTEIRA } from "@/services/wallet/walletSnapshot";
import { obterEthereumProvider } from "@/services/wallet/provider";
import {
	assinarEstadoCarteira,
	atualizarEstadoCarteira,
	obterEstadoCarteira,
	redefinirEstadoCarteira,
	type WalletStoreState,
} from "@/services/wallet/walletStatusStore";

const selecionarEstado = () => obterEstadoCarteira();

export function useWalletStatus() {
	const state = useSyncExternalStore<WalletStoreState>(assinarEstadoCarteira, selecionarEstado, selecionarEstado);
	const ethereum = useMemo(() => obterEthereumProvider(), []);

	useEffect(() => {
		if (!ethereum) {
			redefinirEstadoCarteira();
			return;
		}

		let ativo = true;

		async function sincronizar() {
			try {
				if (!reconexaoAutomaticaHabilitada()) {
					const chainLabel = await obterRedeAtual(ethereum).catch(() => ESTADO_INICIAL_CARTEIRA.chainLabel);

					if (ativo) {
						atualizarEstadoCarteira({
							...ESTADO_INICIAL_CARTEIRA,
							chainLabel,
							loading: false,
						});
					}

					return;
				}

				const dados = await carregarCarteira(ethereum, false);

				if (ativo) {
					atualizarEstadoCarteira({
						...dados,
						loading: false,
					});
				}
			} catch {
				if (ativo) {
					redefinirEstadoCarteira();
				}
			}
		}

		void sincronizar();

		const handleAccountsChanged = () => {
			void sincronizar();
		};

		const handleChainChanged = () => {
			void sincronizar();
		};

		ethereum.on?.("accountsChanged", handleAccountsChanged);
		ethereum.on?.("chainChanged", handleChainChanged);

		return () => {
			ativo = false;
			ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
			ethereum.removeListener?.("chainChanged", handleChainChanged);
		};
	}, [ethereum]);

	async function conectar() {
		if (!ethereum) {
			return;
		}

		const estadoAnterior = obterEstadoCarteira();
		atualizarEstadoCarteira({ ...estadoAnterior, loading: true });

		try {
			const dados = await carregarCarteira(ethereum, true);
			definirReconexaoAutomatica(true);
			atualizarEstadoCarteira({
				...dados,
				loading: false,
			});
		} catch {
			atualizarEstadoCarteira({
				...estadoAnterior,
				loading: false,
			});
		}
	}

	function desconectar() {
		definirReconexaoAutomatica(false);
		redefinirEstadoCarteira();
	}

	return {
		state,
		actionLabel: state.connected ? "Desconectar carteira" : "Conectar carteira",
		actionHandler: state.connected ? desconectar : conectar,
	};
}

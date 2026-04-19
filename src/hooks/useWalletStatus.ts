"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { carregarCarteira, obterRedeAtual } from "@/services/wallet/walletReader";
import { definirReconexaoAutomatica, reconexaoAutomaticaHabilitada } from "@/services/wallet/preferences";
import { ESTADO_INICIAL_CARTEIRA } from "@/services/wallet/walletSnapshot";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { EVENTO_REDE_RPC_ALTERADA } from "@/services/blockchain/rpcConfig";
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

	useEffect(() => {
		const provider = ethereum;

		if (!provider) {
			redefinirEstadoCarteira();
			return;
		}

		const ethereumProvider = provider as NonNullable<typeof provider>;

		let ativo = true;

		async function sincronizar() {
			try {
				if (!reconexaoAutomaticaHabilitada()) {
					const chainLabel = await obterRedeAtual(ethereumProvider).catch(() => ESTADO_INICIAL_CARTEIRA.chainLabel);

					if (ativo) {
						atualizarEstadoCarteira({
							...ESTADO_INICIAL_CARTEIRA,
							chainLabel,
							loading: false,
						});
					}

					return;
				}

				const dados = await carregarCarteira(ethereumProvider, false);

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

		ethereumProvider.on?.("accountsChanged", handleAccountsChanged);
		ethereumProvider.on?.("chainChanged", handleChainChanged);
		window.addEventListener(EVENTO_REDE_RPC_ALTERADA, desconectar);

		return () => {
			ativo = false;
			ethereumProvider.removeListener?.("accountsChanged", handleAccountsChanged);
			ethereumProvider.removeListener?.("chainChanged", handleChainChanged);
			window.removeEventListener(EVENTO_REDE_RPC_ALTERADA, desconectar);
		};
	}, [ethereum]);

	return {
		state,
		actionLabel: state.connected ? "Desconectar carteira" : "Conectar carteira",
		actionHandler: state.connected ? desconectar : conectar,
	};
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { carregarCarteira, obterRedeAtual } from "@/services/wallet/walletReader";
import { definirReconexaoAutomatica, reconexaoAutomaticaHabilitada } from "@/services/wallet/preferences";
import { ESTADO_INICIAL_CARTEIRA, type WalletSnapshot } from "@/services/wallet/walletSnapshot";
import { obterEthereumProvider } from "@/services/wallet/provider";

type WalletState = WalletSnapshot & {
	loading: boolean;
};

const estadoInicial: WalletState = {
	...ESTADO_INICIAL_CARTEIRA,
	loading: false,
};

export function useWalletStatus() {
	const [state, setState] = useState<WalletState>(estadoInicial);
	const ethereum = useMemo(() => obterEthereumProvider(), []);

	useEffect(() => {
		if (!ethereum) {
			return;
		}

		let ativo = true;

		async function sincronizar() {
			try {
				if (!reconexaoAutomaticaHabilitada()) {
					const chainLabel = await obterRedeAtual(ethereum).catch(() => ESTADO_INICIAL_CARTEIRA.chainLabel);

					if (ativo) {
						setState({
							...estadoInicial,
							chainLabel,
						});
					}

					return;
				}

				const dados = await carregarCarteira(ethereum, false);

				if (ativo) {
					setState({
						...dados,
						loading: false,
					});
				}
			} catch {
				if (ativo) {
					setState((current) => ({
						...current,
						connected: false,
						loading: false,
					}));
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

		setState((current) => ({ ...current, loading: true }));

		try {
			const dados = await carregarCarteira(ethereum, true);
			definirReconexaoAutomatica(true);
			setState({
				...dados,
				loading: false,
			});
		} catch {
			setState((current) => ({
				...current,
				loading: false,
			}));
		}
	}

	function desconectar() {
		definirReconexaoAutomatica(false);
		setState(estadoInicial);
	}

	return {
		state,
		actionLabel: state.connected ? "Desconectar carteira" : "Conectar carteira",
		actionHandler: state.connected ? desconectar : conectar,
	};
}

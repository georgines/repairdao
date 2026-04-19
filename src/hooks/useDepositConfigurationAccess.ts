"use client";

import { useEffect, useMemo, useState } from "react";
import { assinarMudancaDeRedeNoCliente } from "@/services/blockchain/rpcConfig";
import { carregarConfiguracaoDeposito } from "@/services/deposit/depositConfigurationClient";
import { formatarEnderecoCurto, normalizarEnderecoComparacao } from "@/services/wallet/formatters";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import type { DepositConfigurationSerialized } from "@/services/deposit/depositConfigurationTypes";

type DepositConfigurationAccessState = {
	loading: boolean;
	error: string | null;
	configuracao: DepositConfigurationSerialized | null;
	donoAtual: string | null;
	donoAtualCurto: string;
	isOwner: boolean;
	connected: boolean;
	walletAddress: string | null;
	refresh: () => Promise<DepositConfigurationSerialized | null>;
};

export function useDepositConfigurationAccess(): DepositConfigurationAccessState {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [configuracao, setConfiguracao] = useState<DepositConfigurationSerialized | null>(null);

	async function refresh() {
		setLoading(true);
		setError(null);

		try {
			const dados = await carregarConfiguracaoDeposito();
			setConfiguracao(dados);
			return dados;
		} catch (refreshError) {
			setError(refreshError instanceof Error ? refreshError.message : "Nao foi possivel carregar a configuracao do deposito.");
			return null;
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		let ativo = true;

		async function carregar() {
			if (!ethereum) {
				if (ativo) {
					setConfiguracao(null);
					setLoading(false);
				}

				return;
			}

			setLoading(true);

			try {
				const dados = await carregarConfiguracaoDeposito();

				if (!ativo) {
					return;
				}

				setConfiguracao(dados);
				setError(null);
			} catch (refreshError) {
				if (ativo) {
					setConfiguracao(null);
					setError(refreshError instanceof Error ? refreshError.message : "Nao foi possivel carregar a configuracao do deposito.");
				}
			} finally {
				if (ativo) {
					setLoading(false);
				}
			}
		}

		void carregar();

		const limpar = assinarMudancaDeRedeNoCliente(() => {
			void carregar();
		});

		return () => {
			ativo = false;
			limpar();
		};
	}, [ethereum, state.address]);

	const donoAtual = configuracao?.ownerAddress ?? null;
	const donoAtualCurto = formatarEnderecoCurto(donoAtual);
	const isOwner = Boolean(
		state.connected &&
		state.address &&
		donoAtual &&
		normalizarEnderecoComparacao(state.address) === normalizarEnderecoComparacao(donoAtual),
	);

	return {
		loading,
		error,
		configuracao,
		donoAtual,
		donoAtualCurto,
		isOwner,
		connected: state.connected,
		walletAddress: state.address,
		refresh,
	};
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { assinarMudancaDeRedeNoCliente } from "@/services/blockchain/rpcConfig";
import { carregarConfiguracaoSistema } from "@/services/system/systemConfigurationClient";
import { formatarEnderecoCurto, normalizarEnderecoComparacao } from "@/services/wallet/formatters";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import type { SystemConfigurationSerialized } from "@/services/system/systemConfigurationTypes";

type SystemConfigurationAccessState = {
	loading: boolean;
	error: string | null;
	configuracao: SystemConfigurationSerialized | null;
	donoDepositoAtual: string | null;
	donoDepositoAtualCurto: string;
	isDepositOwner: boolean;
	donoTokenAtual: string | null;
	donoTokenAtualCurto: string;
	isTokenOwner: boolean;
	isOwner: boolean;
	connected: boolean;
	walletAddress: string | null;
	refresh: () => Promise<SystemConfigurationSerialized | null>;
};

export function useSystemConfigurationAccess(): SystemConfigurationAccessState {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [configuracao, setConfiguracao] = useState<SystemConfigurationSerialized | null>(null);

	async function refresh() {
		setLoading(true);
		setError(null);

		try {
			const dados = await carregarConfiguracaoSistema();
			setConfiguracao(dados);
			return dados;
		} catch (refreshError) {
			setError(refreshError instanceof Error ? refreshError.message : "Nao foi possivel carregar a configuracao do sistema.");
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
				const dados = await carregarConfiguracaoSistema();

				if (!ativo) {
					return;
				}

				setConfiguracao(dados);
				setError(null);
			} catch (refreshError) {
				if (ativo) {
					setConfiguracao(null);
					setError(refreshError instanceof Error ? refreshError.message : "Nao foi possivel carregar a configuracao do sistema.");
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

	const donoDepositoAtual = configuracao?.depositOwnerAddress ?? null;
	const donoDepositoAtualCurto = formatarEnderecoCurto(donoDepositoAtual);
	const isDepositOwner = Boolean(
		state.connected &&
		state.address &&
		donoDepositoAtual &&
		normalizarEnderecoComparacao(state.address) === normalizarEnderecoComparacao(donoDepositoAtual),
	);

	const donoTokenAtual = configuracao?.tokenOwnerAddress ?? null;
	const donoTokenAtualCurto = formatarEnderecoCurto(donoTokenAtual);
	const isTokenOwner = Boolean(
		state.connected &&
		state.address &&
		donoTokenAtual &&
		normalizarEnderecoComparacao(state.address) === normalizarEnderecoComparacao(donoTokenAtual),
	);

	return {
		loading,
		error,
		configuracao,
		donoDepositoAtual,
		donoDepositoAtualCurto,
		isDepositOwner,
		donoTokenAtual,
		donoTokenAtualCurto,
		isTokenOwner,
		isOwner: isDepositOwner || isTokenOwner,
		connected: state.connected,
		walletAddress: state.address,
		refresh,
	};
}

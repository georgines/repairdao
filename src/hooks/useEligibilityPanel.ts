"use client";

import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "ethers";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { depositarTokens, sacarDeposito } from "@/services/eligibility/tokenDeposit";
import { carregarMetricasElegibilidade, type EligibilityMetrics } from "@/services/eligibility/eligibilityMetrics";

const VALOR_MINIMO_DEPOSITO_PADRAO = 100;

type QuantidadeRpt = string | number | null;

type UseEligibilityPanelResult = {
	connected: boolean;
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	badgeLevel: string;
	isActive: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	quantidadeRpt: QuantidadeRpt;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	walletNotice: string | null;
	depositing: boolean;
	error: string | null;
	handlePerfilChange: (value: "cliente" | "tecnico") => void;
	handleQuantidadeChange: (value: QuantidadeRpt) => void;
	handleDeposit: () => Promise<void>;
};

const METRICAS_PADRAO: EligibilityMetrics = {
	rptBalanceRaw: 0n,
	rptBalance: "0",
	tokensPerEthRaw: 0n,
	tokensPerEth: "0",
	badgeLevel: "Sem carteira",
	isActive: false,
};

export function useEligibilityPanel(): UseEligibilityPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [perfilSelecionado, setPerfilSelecionado] = useState<"cliente" | "tecnico">("cliente");
	const [quantidadeRpt, setQuantidadeRpt] = useState<QuantidadeRpt>(null);
	const [depositing, setDepositing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metricas, setMetricas] = useState<EligibilityMetrics>(METRICAS_PADRAO);
	const connected = state.connected;
	const ethBalance = connected ? state.ethBalance : "0";
	const usdBalance = connected ? state.usdBalance : "0";
	const ethUsdPrice = connected ? state.ethUsdPrice : "0";
	const walletNotice = connected ? null : "Carteira desconectada";
	const quantidadeMinima = Number(metricas.minDeposit) > 0 ? Number(metricas.minDeposit) : VALOR_MINIMO_DEPOSITO_PADRAO;
	const quantidadeTexto = typeof quantidadeRpt === "number"
		? String(quantidadeRpt)
		: typeof quantidadeRpt === "string"
			? quantidadeRpt.trim()
			: "";
	const quantidadeNumerica = quantidadeTexto === "" ? null : Number(quantidadeTexto.replace(",", "."));
	const quantidadeErro = quantidadeNumerica === null || Number.isNaN(quantidadeNumerica) || !Number.isFinite(quantidadeNumerica)
		? "Informe um valor para depositar."
		: quantidadeNumerica < quantidadeMinima
			? `O valor para deposito deve ser maior ou igual a ${quantidadeMinima} RPT.`
			: null;
	const acaoLabel = perfilSelecionado === "cliente"
		? (metricas.isActive ? "Mudar para cliente" : "Ativar como cliente")
		: (metricas.isActive ? "Depositar mais como tecnico" : "Ativar como tecnico");
	const mensagemAcao = perfilSelecionado === "cliente"
		? (metricas.isActive
			? "Ao mudar para cliente, todo o valor atual sera sacado e o valor digitado sera o inicio do novo nivel."
			: "Ao ativar como cliente, o valor digitado sera o inicio do novo nivel.")
		: (metricas.isActive
			? "Ao manter tecnico, voce pode depositar mais RPT sem sacar o saldo atual."
			: "Ao ativar como tecnico, o valor digitado sera o inicio do novo nivel.");

	useEffect(() => {
		let ativo = true;

		async function sincronizarMetricas() {
			try {
				const dados = await carregarMetricasElegibilidade(connected ? state.address : null);

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
	}, [connected, state.address]);

	function handleQuantidadeChange(value: QuantidadeRpt) {
		setQuantidadeRpt(value);
		setError(null);
	}

	async function handleDeposit() {
		if (!ethereum || !connected) {
			setError("Conecte a carteira para depositar os RPT.");
			return;
		}

		if (quantidadeErro) {
			setError(quantidadeErro);
			return;
		}

		const quantidade = parseUnits(String(quantidadeNumerica), 18);

		setDepositing(true);
		setError(null);

		try {
			if (perfilSelecionado === "cliente" && metricas.isActive) {
				await sacarDeposito(ethereum);
			}

			await depositarTokens(ethereum, quantidade, perfilSelecionado === "tecnico");
		} catch (depositError) {
			setError(depositError instanceof Error ? depositError.message : "Nao foi possivel concluir o deposito dos RPT.");
		} finally {
			setDepositing(false);
		}
	}

	function handlePerfilChange(value: "cliente" | "tecnico") {
		setPerfilSelecionado(value);
		setError(null);
	}

	return {
		connected,
		ethBalance,
		usdBalance,
		ethUsdPrice,
		tokensPerEth: metricas.tokensPerEth,
		rptBalance: connected ? metricas.rptBalance : "0",
		badgeLevel: connected ? metricas.badgeLevel : "Sem carteira",
		isActive: connected ? metricas.isActive : false,
		perfilSelecionado,
		quantidadeRpt,
		quantidadeErro,
		quantidadeMinima,
		acaoLabel,
		mensagemAcao,
		walletNotice,
		depositing,
		error,
		handlePerfilChange,
		handleQuantidadeChange,
		handleDeposit,
	};
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { parseUnits } from "ethers";
import { useAccountMetrics } from "@/hooks/useAccountMetrics";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { depositarTokens, sacarDeposito } from "@/services/eligibility/tokenDeposit";
import { carregarMetricasElegibilidade, type EligibilityMetrics } from "@/services/eligibility/eligibilityMetrics";
import { loadUserProfile, persistUserProfile } from "@/services/users/userClient";
import { validateUserActivationForm } from "@/services/users/userValidation";

const VALOR_MINIMO_DEPOSITO_PADRAO = 100;

type QuantidadeRpt = string | number | null;
type PerfilUsuario = "cliente" | "tecnico";

type UseEligibilityPanelResult = {
	connected: boolean;
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: PerfilUsuario | null;
	mostrarSeletoresPapel: boolean;
	perfilSelecionado: PerfilUsuario;
	perfilConfirmacao: PerfilUsuario;
	nome: string;
	areaAtuacao: string;
	identificadorCarteira: string;
	quantidadeRpt: QuantidadeRpt;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	walletNotice: string | null;
	depositing: boolean;
	error: string | null;
	handlePerfilChange: (value: PerfilUsuario) => void;
	handleNomeChange: (value: string) => void;
	handleAreaAtuacaoChange: (value: string) => void;
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
	perfilAtivo: null,
};

function obterPerfilOposto(perfil: "cliente" | "tecnico"): "cliente" | "tecnico" {
	return perfil === "cliente" ? "tecnico" : "cliente";
}

function validarQuantidadeRpt(quantidadeRpt: QuantidadeRpt, quantidadeMinima: number) {
	const quantidadeTexto = typeof quantidadeRpt === "number"
		? String(quantidadeRpt)
		: typeof quantidadeRpt === "string"
			? quantidadeRpt.trim()
			: "";

	if (quantidadeTexto === "") {
		return "Informe um valor para depositar.";
	}

	const quantidadeNumerica = Number(quantidadeTexto.replace(",", "."));

	if (Number.isNaN(quantidadeNumerica) || !Number.isFinite(quantidadeNumerica)) {
		return "Informe um valor para depositar.";
	}

	if (quantidadeNumerica < quantidadeMinima) {
		return `O valor para deposito deve ser maior ou igual a ${quantidadeMinima} RPT.`;
	}

	return null;
}

async function carregarMetricasAtualizadas(address?: string | null) {
	try {
		return await carregarMetricasElegibilidade(address ?? null);
	} catch {
		return METRICAS_PADRAO;
	}
}

export function useEligibilityPanel(): UseEligibilityPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilUsuario>("cliente");
	const [nome, setNome] = useState("");
	const [areaAtuacao, setAreaAtuacao] = useState("");
	const [quantidadeRpt, setQuantidadeRpt] = useState<QuantidadeRpt>(null);
	const [quantidadeRptDebounced] = useDebouncedValue(quantidadeRpt, 500);
	const [depositing, setDepositing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshIndex, setRefreshIndex] = useState(0);
	const accountMetrics = useAccountMetrics({ refreshKey: refreshIndex });
	const [metricas, setMetricas] = useState<EligibilityMetrics>(METRICAS_PADRAO);
	const connected = state.connected;
	const ethBalance = connected ? state.ethBalance : "0";
	const usdBalance = connected ? state.usdBalance : "0";
	const ethUsdPrice = connected ? state.ethUsdPrice : "0";
	const walletNotice = connected ? null : "Carteira desconectada";
	const perfilRegistrado = accountMetrics.perfilAtivo ?? perfilSelecionado;
	const mostrarSeletoresPapel = !metricas.isActive;
	const perfilConfirmacao = metricas.isActive ? obterPerfilOposto(perfilRegistrado) : perfilSelecionado;
	const perfilConfirmacaoEhTecnico = perfilConfirmacao === "tecnico";
	const quantidadeMinima = Number(metricas.minDeposit) > 0 ? Number(metricas.minDeposit) : VALOR_MINIMO_DEPOSITO_PADRAO;
	const quantidadeErro = quantidadeRpt === null
		? null
		: quantidadeRpt === quantidadeRptDebounced
			? validarQuantidadeRpt(quantidadeRptDebounced, quantidadeMinima)
			: null;

	const nomeTexto = nome.trim();
	const areaAtuacaoTexto = areaAtuacao.trim();
	const acaoLabel = metricas.isActive
		? `Trocar para ${perfilConfirmacao}`
		: `Ativar como ${perfilSelecionado}`;
	const mensagemAcao = metricas.isActive
		? `Ao trocar para ${perfilConfirmacao}, o saldo atual sera sacado, a confirmacao sera aguardada e o cadastro sera salvo depois da confirmacao.`
		: `Ao ativar como ${perfilSelecionado}, o valor digitado sera confirmado antes de salvar o cadastro.`;

	useEffect(() => {
		let ativo = true;

		async function sincronizarMetricas() {
			const dados = await carregarMetricasAtualizadas(connected ? state.address : null);

			if (!ativo) {
				return;
			}

			setMetricas(dados);
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

	useEffect(() => {
		let ativo = true;

		async function sincronizarPerfilSalvo() {
			if (!connected || !state.address || !metricas.isActive) {
				return;
			}

			try {
				const perfilSalvo = await loadUserProfile(state.address);

				if (!ativo) {
					return;
				}

				setNome(perfilSalvo?.name ?? "");
				setAreaAtuacao(perfilSalvo?.expertiseArea ?? "");
			} catch {
				if (ativo) {
					setNome("");
					setAreaAtuacao("");
				}
			}
		}

		void sincronizarPerfilSalvo();

		return () => {
			ativo = false;
		};
	}, [connected, metricas.isActive, state.address]);

	function handleQuantidadeChange(value: QuantidadeRpt) {
		setQuantidadeRpt(value);
		setError(null);
	}

	function handleNomeChange(value: string) {
		setNome(value);
		setError(null);
	}

	function handleAreaAtuacaoChange(value: string) {
		setAreaAtuacao(value);
		setError(null);
	}

	async function handleDeposit() {
		if (!ethereum || !connected) {
			setError("Conecte a carteira para depositar os RPT.");
			return;
		}

		const quantidadeErroValidacao = validarQuantidadeRpt(quantidadeRpt, quantidadeMinima);

		if (quantidadeErroValidacao) {
			setError(quantidadeErroValidacao);
			return;
		}

		try {
			validateUserActivationForm(nomeTexto, areaAtuacaoTexto, perfilConfirmacao);
		} catch (validationError) {
			setError(validationError instanceof Error ? validationError.message : "Dados invalidos para ativacao.");
			return;
		}

		const quantidadeTexto = typeof quantidadeRpt === "number"
			? String(quantidadeRpt)
			: typeof quantidadeRpt === "string"
				? quantidadeRpt.trim()
				: "";
		const quantidade = parseUnits(String(quantidadeTexto).replace(",", "."), 18);
		const address = state.address?.trim();
		let depositou = false;

		setDepositing(true);
		setError(null);

		try {
			if (metricas.isActive) {
				await sacarDeposito(ethereum);
			}

			await depositarTokens(ethereum, quantidade, perfilConfirmacaoEhTecnico);
			depositou = true;

			const metricasAtualizadas = await carregarMetricasAtualizadas(address);

			if (!address) {
				throw new Error("Endereco da carteira indisponivel.");
			}

			await persistUserProfile({
				address,
				name: nomeTexto,
				expertiseArea: perfilConfirmacaoEhTecnico ? areaAtuacaoTexto : null,
				role: perfilConfirmacao,
				badgeLevel: accountMetrics.badgeLevel,
				reputation: 0,
				depositLevel: Number(metricasAtualizadas.rptBalanceRaw / 10n ** 18n),
				isActive: true,
				isEligible: true,
			});

			setMetricas(metricasAtualizadas);
			setRefreshIndex((value) => value + 1);
		} catch (depositError) {
			if (depositou) {
				await sacarDeposito(ethereum).catch(() => undefined);
			}

			setError(depositError instanceof Error ? depositError.message : "Nao foi possivel concluir o deposito dos RPT.");
		} finally {
			setDepositing(false);
		}
	}

	function handlePerfilChange(value: "cliente" | "tecnico") {
		if (metricas.isActive) {
			return;
		}

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
		badgeLevel: connected ? accountMetrics.badgeLevel : "Sem carteira",
		isActive: connected ? metricas.isActive : false,
		perfilAtivo: connected ? accountMetrics.perfilAtivo : null,
		mostrarSeletoresPapel: connected ? mostrarSeletoresPapel : false,
		perfilSelecionado,
		perfilConfirmacao,
		nome,
		areaAtuacao,
		identificadorCarteira: state.address ?? "",
		quantidadeRpt,
		quantidadeErro,
		quantidadeMinima,
		acaoLabel,
		mensagemAcao,
		walletNotice,
		depositing,
		error,
		handlePerfilChange,
		handleNomeChange,
		handleAreaAtuacaoChange,
		handleQuantidadeChange,
		handleDeposit,
	};
}

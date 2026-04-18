"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { carregarMetricasElegibilidade, type EligibilityMetrics } from "@/services/eligibility/eligibilityMetrics";
import { loadServiceRequests, type ServiceRequestSummary } from "@/services/serviceRequests/serviceRequestClient";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import {
	carregarDisputaNoContrato,
	carregarEvidenciasDaDisputaNoContrato,
	enviarEvidenciaNaDisputaNoContrato,
	resolverDisputaNoContrato,
	votarNaDisputaNoContrato,
} from "@/services/disputes/disputeBlockchain";
import type { ContextoPapelRepairDAO } from "@/types";

type DisputeItem = {
	request: ServiceRequestSummary;
	contract: DisputaContratoDominio | null;
};

type UseDisputesPanelResult = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	hasVotingTokens: boolean;
	loading: boolean;
	error: string | null;
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	selectedDisputeId: number | null;
	selectedDispute: DisputeItem | null;
	selectedEvidence: EvidenciaContratoDominio[];
	evidenceDraft: string;
	voteSupportOpener: boolean;
	busyDisputeId: number | null;
	votedDisputeIds: number[];
	evidenceSubmittedDisputeIds: number[];
	onRefresh: () => Promise<void>;
	onSelectDispute: (disputeId: number) => void;
	onCloseDispute: () => void;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
	onResolveDispute: () => Promise<void>;
};

const EMPTY_METRICS: EligibilityMetrics = {
	rptBalanceRaw: 0n,
	rptBalance: "0",
	tokensPerEthRaw: 0n,
	tokensPerEth: "0",
	badgeLevel: "Sem carteira",
	isActive: false,
	perfilAtivo: null,
	minDepositRaw: 0n,
	minDeposit: "0",
};

function ehDisputaAtiva(contract: DisputaContratoDominio | null) {
	return contract === null || contract.resolved !== true && contract.estado !== "resolvida";
}

export function useDisputesPanel(): UseDisputesPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metrics, setMetrics] = useState<EligibilityMetrics>(EMPTY_METRICS);
	const [disputes, setDisputes] = useState<DisputeItem[]>([]);
	const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
	const [selectedEvidence, setSelectedEvidence] = useState<EvidenciaContratoDominio[]>([]);
	const [evidenceDraft, setEvidenceDraft] = useState("");
	const [voteSupportOpener, setVoteSupportOpener] = useState(true);
	const [votedDisputeIds, setVotedDisputeIds] = useState<number[]>([]);
	const [evidenceSubmittedDisputeIds, setEvidenceSubmittedDisputeIds] = useState<number[]>([]);
	const [busyDisputeId, setBusyDisputeId] = useState<number | null>(null);

	const walletAddress = state.connected ? state.address ?? null : null;
	const walletNotice = state.connected ? null : "Conecte a carteira para interagir com uma disputa.";

	const carregarMetricas = useCallback(async () => {
		if (!walletAddress) {
			setMetrics(EMPTY_METRICS);
			return EMPTY_METRICS;
		}

		try {
			const dados = await carregarMetricasElegibilidade(walletAddress);
			setMetrics(dados);
			return dados;
		} catch {
			setMetrics(EMPTY_METRICS);
			return EMPTY_METRICS;
		}
	}, [walletAddress]);

	const carregarDisputas = useCallback(async () => {
		const requests = await loadServiceRequests();
		const disputaRequests = requests.filter((request) => request.status === "disputada");

		if (!ethereum || disputaRequests.length === 0) {
			setDisputes(disputaRequests.map((request) => ({ request, contract: null })));
			return disputaRequests;
		}

		const contracts = await Promise.all(
			disputaRequests.map(async (request) => {
				try {
					const contract = await carregarDisputaNoContrato(ethereum, request.id);
					return { request, contract };
				} catch {
					return { request, contract: null };
				}
			}),
		);

		setDisputes(contracts);
		return contracts.map(({ request }) => request);
	}, [ethereum]);

	const carregarEvidencias = useCallback(
		async (disputeId: number) => {
			if (!ethereum) {
				setSelectedEvidence([]);
				return;
			}

			try {
				const evidencias = await carregarEvidenciasDaDisputaNoContrato(ethereum, disputeId);
				setSelectedEvidence(evidencias);
			} catch {
				setSelectedEvidence([]);
			}
		},
		[ethereum],
	);

	const onRefresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			await Promise.all([carregarMetricas(), carregarDisputas()]);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar as disputas.");
		} finally {
			setLoading(false);
		}
	}, [carregarDisputas, carregarMetricas]);

	useEffect(() => {
		void onRefresh();

		const timer = window.setInterval(() => {
			void onRefresh();
		}, 15000);

		return () => {
			window.clearInterval(timer);
		};
	}, [onRefresh]);

	useEffect(() => {
		if (selectedDisputeId === null) {
			setSelectedEvidence([]);
			return;
		}

		const selected = disputes.find((dispute) => dispute.request.id === selectedDisputeId) ?? null;
		if (!selected) {
			setSelectedEvidence([]);
			return;
		}

		void carregarEvidencias(selectedDisputeId);
	}, [carregarEvidencias, disputes, selectedDisputeId]);

	useEffect(() => {
		if (selectedDisputeId === null) {
			return;
		}

		if (!disputes.some((dispute) => dispute.request.id === selectedDisputeId)) {
			setSelectedDisputeId(null);
		}
	}, [disputes, selectedDisputeId]);

	const visibleDisputes = useMemo(
		() => disputes.filter((dispute) => ehDisputaAtiva(dispute.contract)),
		[disputes],
	);

	const selectedDispute = useMemo(
		() => disputes.find((dispute) => dispute.request.id === selectedDisputeId) ?? null,
		[disputes, selectedDisputeId],
	);

	function onSelectDispute(disputeId: number) {
		setSelectedDisputeId(disputeId);
		setEvidenceDraft("");
		setVoteSupportOpener(true);
		setError(null);
	}

	function onCloseDispute() {
		setSelectedDisputeId(null);
		setEvidenceDraft("");
		setVoteSupportOpener(true);
		setError(null);
	}

	function onEvidenceDraftChange(value: string) {
		setEvidenceDraft(value);
	}

	function onVoteSupportChange(value: boolean) {
		setVoteSupportOpener(value);
	}

	function criarContextoDisputa(papel: "cliente" | "tecnico" | "outsider", isParticipant: boolean): ContextoPapelRepairDAO {
		return {
			papel,
			depositoAtivo: metrics.isActive,
			tokens: metrics.rptBalanceRaw > 0n ? 1 : 0,
			envolvidoEmDisputa: isParticipant,
		};
	}

	async function onSubmitEvidence() {
		if (!ethereum) {
			setError("Conecte a carteira para enviar evidencia.");
			return;
		}

		if (!walletAddress) {
			setError("Conecte a carteira para enviar evidencia.");
			return;
		}

		if (!selectedDispute) {
			setError("Selecione uma disputa para enviar evidencia.");
			return;
		}

		if (selectedDispute.contract?.estado !== "janela_votacao") {
			setError("A evidencia so pode ser enviada durante a janela de votacao.");
			return;
		}

		if (walletAddress !== selectedDispute.request.clientAddress && walletAddress !== selectedDispute.request.technicianAddress) {
			setError("Apenas cliente ou tecnico da ordem podem enviar evidencia.");
			return;
		}

		const conteudo = evidenceDraft.trim();
		if (!conteudo) {
			setError("Informe o conteudo da evidencia.");
			return;
		}

		setBusyDisputeId(selectedDispute.request.id);
		setError(null);

		try {
			const papel = walletAddress === selectedDispute.request.clientAddress ? "cliente" : "tecnico";
			await enviarEvidenciaNaDisputaNoContrato(
				ethereum,
				criarContextoDisputa(papel, true),
				selectedDispute.request.id,
				walletAddress,
				conteudo,
			);
			setEvidenceSubmittedDisputeIds((current) => (current.includes(selectedDispute.request.id) ? current : [...current, selectedDispute.request.id]));
			setEvidenceDraft("");
			await carregarEvidencias(selectedDispute.request.id);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel enviar a evidencia.");
		} finally {
			setBusyDisputeId(null);
		}
	}

	async function onSubmitVote() {
		if (!ethereum) {
			setError("Conecte a carteira para votar.");
			return;
		}

		if (!walletAddress) {
			setError("Conecte a carteira para votar.");
			return;
		}

		if (!selectedDispute) {
			setError("Selecione uma disputa para votar.");
			return;
		}

		if (selectedDispute.contract?.estado !== "janela_votacao") {
			setError("O voto so pode ser registrado durante a janela de votacao.");
			return;
		}

		const isParticipant = walletAddress === selectedDispute.request.clientAddress || walletAddress === selectedDispute.request.technicianAddress;
		if (isParticipant) {
			setError("Quem participa da disputa nao pode votar nela.");
			return;
		}

		if (metrics.rptBalanceRaw <= 0n) {
			setError("E necessario ter RPT para votar.");
			return;
		}

		setBusyDisputeId(selectedDispute.request.id);
		setError(null);

		try {
			await votarNaDisputaNoContrato(
				ethereum,
				criarContextoDisputa("outsider", false),
				selectedDispute.request.id,
				walletAddress,
				voteSupportOpener,
			);
			setVotedDisputeIds((current) => (current.includes(selectedDispute.request.id) ? current : [...current, selectedDispute.request.id]));
			await carregarDisputas();
			await carregarEvidencias(selectedDispute.request.id);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel registrar o voto.");
		} finally {
			setBusyDisputeId(null);
		}
	}

	async function onResolveDispute() {
		if (!ethereum) {
			setError("Conecte a carteira para resolver a disputa.");
			return;
		}

		if (!selectedDispute) {
			setError("Selecione uma disputa para resolver.");
			return;
		}

		if (selectedDispute.contract?.estado !== "encerrada") {
			setError("A disputa so pode ser resolvida depois do prazo terminar.");
			return;
		}

		setBusyDisputeId(selectedDispute.request.id);
		setError(null);

		try {
			await resolverDisputaNoContrato(ethereum, selectedDispute.request.id);
			await carregarDisputas();
			await carregarEvidencias(selectedDispute.request.id);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel resolver a disputa.");
		} finally {
			setBusyDisputeId(null);
		}
	}

	return {
		connected: state.connected,
		walletAddress,
		walletNotice,
		perfilAtivo: metrics.perfilAtivo,
		hasVotingTokens: metrics.rptBalanceRaw > 0n,
		loading,
		error,
		disputes,
		visibleDisputes,
		selectedDisputeId,
		selectedDispute,
		selectedEvidence,
		evidenceDraft,
		voteSupportOpener,
		busyDisputeId,
		votedDisputeIds,
		evidenceSubmittedDisputeIds,
		onRefresh,
		onSelectDispute,
		onCloseDispute,
		onEvidenceDraftChange,
		onVoteSupportChange,
		onSubmitEvidence,
		onSubmitVote,
		onResolveDispute,
	};
}

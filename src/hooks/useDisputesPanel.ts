"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { carregarMetricasElegibilidade, type EligibilityMetrics } from "@/services/eligibility/eligibilityMetrics";
import { statusLabel } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import { loadServiceRequests } from "@/services/serviceRequests/serviceRequestClient";
import type { ServiceRequestSummary } from "@/services/serviceRequests/serviceRequestTypes";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import { normalizarEnderecoComparacao } from "@/services/wallet/formatters";
import {
	carregarDisputaNoContrato,
	carregarEvidenciasDaDisputaNoContrato,
	carregarStatusVotoDaDisputaNoContrato,
	enviarEvidenciaNaDisputaNoContrato,
	resolverDisputaNoContrato,
	votarNaDisputaNoContrato,
} from "@/services/disputes/disputeBlockchain";
import type { ContextoPapelRepairDAO } from "@/types";
import type { EstadoDisputaRepairDAO } from "@/types";

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
	query: string;
	statusFilter: EstadoDisputaRepairDAO | "all";
	selectedDisputeId: number | null;
	selectedDispute: DisputeItem | null;
	selectedEvidence: EvidenciaContratoDominio[];
	evidenceDraft: string;
	voteSupportOpener: boolean;
	busyDisputeId: number | null;
	votedDisputeIds: number[];
	votedDisputeChoices: Record<number, boolean>;
	evidenceSubmittedDisputeIds: number[];
	onRefresh: () => Promise<void>;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
	onSelectDispute: (disputeId: number) => Promise<void>;
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

function normalizarTexto(valor: string) {
	return valor.trim().toLowerCase();
}

export function useDisputesPanel(): UseDisputesPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metrics, setMetrics] = useState<EligibilityMetrics>(EMPTY_METRICS);
	const [disputes, setDisputes] = useState<DisputeItem[]>([]);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<EstadoDisputaRepairDAO | "all">("all");
	const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
	const [selectedEvidence, setSelectedEvidence] = useState<EvidenciaContratoDominio[]>([]);
	const [evidenceDraft, setEvidenceDraft] = useState("");
	const [voteSupportOpener, setVoteSupportOpener] = useState(true);
	const [votedDisputeIds, setVotedDisputeIds] = useState<number[]>([]);
	const [votedDisputeChoices, setVotedDisputeChoices] = useState<Record<number, boolean>>({});
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
		() =>
			disputes.filter((dispute) => {
				if (!ehDisputaAtiva(dispute.contract)) {
					return false;
				}

				if (statusFilter !== "all" && dispute.contract?.estado !== statusFilter) {
					return false;
				}

				if (!query.trim()) {
					return true;
				}

				const searchable = normalizarTexto(
					[
						dispute.request.technicianName,
						dispute.request.technicianAddress,
						dispute.request.clientName,
						dispute.request.clientAddress,
						dispute.request.disputeReason ?? "",
						statusLabel(dispute.contract?.estado),
						dispute.contract?.motivo ?? "",
						dispute.contract?.openedBy ?? "",
						dispute.contract?.opposingParty ?? "",
						dispute.contract?.votesForOpener?.toString() ?? "",
						dispute.contract?.votesForOpposing?.toString() ?? "",
						dispute.request.id.toString(),
						dispute.contract?.ordemId ?? "",
					].join(" "),
				);

				return searchable.includes(normalizarTexto(query));
			}),
		[disputes, query, statusFilter],
	);

	const selectedDispute = useMemo(
		() => disputes.find((dispute) => dispute.request.id === selectedDisputeId) ?? null,
		[disputes, selectedDisputeId],
	);

	async function carregarStatusVotoDisputa(disputeId: number) {
		if (!ethereum || !walletAddress) {
			return { hasVoted: false, supportOpener: null as boolean | null };
		}

		return carregarStatusVotoDaDisputaNoContrato(ethereum, disputeId, walletAddress);
	}

	async function onSelectDispute(disputeId: number) {
		setEvidenceDraft("");
		setError(null);

		if (!ethereum || !walletAddress) {
			setSelectedDisputeId(disputeId);
			setVoteSupportOpener(true);
			return;
		}

		try {
			const statusVoto = await carregarStatusVotoDisputa(disputeId);

			if (statusVoto.hasVoted) {
				setVotedDisputeIds((current) => (current.includes(disputeId) ? current : [...current, disputeId]));
				setVotedDisputeChoices((current) => ({
					...current,
					[disputeId]: statusVoto.supportOpener ?? true,
				}));
				setVoteSupportOpener(statusVoto.supportOpener ?? true);
			} else {
				setVotedDisputeIds((current) => current.filter((value) => value !== disputeId));
				setVotedDisputeChoices((current) => {
					const next = { ...current };
					delete next[disputeId];
					return next;
				});
				setVoteSupportOpener(true);
			}

			setSelectedDisputeId(disputeId);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel verificar o voto da disputa.");
		}
	}

	function onCloseDispute() {
		setSelectedDisputeId(null);
		setEvidenceDraft("");
		setVoteSupportOpener(true);
		setError(null);
	}

	function onQueryChange(value: string) {
		setQuery(value);
	}

	function onStatusFilterChange(value: string | null) {
		if (value === null || value === "all") {
			setStatusFilter("all");
			return;
		}

		if (value === "aberta" || value === "janela_votacao" || value === "encerrada" || value === "resolvida") {
			setStatusFilter(value);
		}
	}

	function onClearFilters() {
		setQuery("");
		setStatusFilter("all");
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

	function pertenceADisputa(endereco: string | null | undefined, disputa: DisputeItem | null) {
		if (!endereco || !disputa) {
			return false;
		}

		const enderecoNormalizado = normalizarEnderecoComparacao(endereco);

		return enderecoNormalizado === normalizarEnderecoComparacao(disputa.request.clientAddress)
			|| enderecoNormalizado === normalizarEnderecoComparacao(disputa.request.technicianAddress);
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

		if (!pertenceADisputa(walletAddress, selectedDispute)) {
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
			const papel = normalizarEnderecoComparacao(walletAddress) === normalizarEnderecoComparacao(selectedDispute.request.clientAddress)
				? "cliente"
				: "tecnico";
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

		const isParticipant = pertenceADisputa(walletAddress, selectedDispute);
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
			setVotedDisputeChoices((current) => ({
				...current,
				[selectedDispute.request.id]: voteSupportOpener,
			}));
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
		query,
		statusFilter,
		selectedDisputeId,
		selectedDispute,
		selectedEvidence,
		evidenceDraft,
		voteSupportOpener,
		busyDisputeId,
		votedDisputeIds,
		votedDisputeChoices,
		evidenceSubmittedDisputeIds,
		onRefresh,
		onQueryChange,
		onStatusFilterChange,
		onClearFilters,
		onSelectDispute,
		onCloseDispute,
		onEvidenceDraftChange,
		onVoteSupportChange,
		onSubmitEvidence,
		onSubmitVote,
		onResolveDispute,
	};
}

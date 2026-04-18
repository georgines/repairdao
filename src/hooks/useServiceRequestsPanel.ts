"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccountProfile } from "@/hooks/useAccountProfile";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import {
	aceitarOrcamentoNoContrato,
	avaliarServicoNoContrato,
	concluirOrdemNoContrato,
	autorizarPagamentoNoContrato,
	enviarOrcamentoNoContrato,
} from "@/services/serviceRequests/serviceRequestBlockchain";
import {
	acceptServiceBudget,
	completeServiceRequest,
	loadServiceRequests,
	sendServiceBudget,
	type ServiceRequestSummary,
} from "@/services/serviceRequests/serviceRequestClient";
import type { ServiceRequestStatus } from "@/services/serviceRequests";

type RequestModalAction = "details" | "budget" | "pay" | "complete" | "rate";

type UseServiceRequestsPanelResult = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	loading: boolean;
	error: string | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	requestModalOpened: boolean;
	requestModalRequest: ServiceRequestSummary | null;
	requestModalAction: RequestModalAction | null;
	requestModalBudget: number | null;
	requestModalRating: number;
	busyRequestId: number | null;
	onRefresh: () => Promise<void>;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
	onOpenRequestModal: (requestId: number, action: RequestModalAction) => void;
	onCloseRequestModal: () => void;
	onRequestModalBudgetChange: (value: number | null) => void;
	onRequestModalRatingChange: (value: number) => void;
	onSubmitBudget: () => Promise<void>;
	onPayBudget: () => Promise<void>;
	onCompleteOrder: () => Promise<void>;
	onRateService: () => Promise<void>;
};

export function useServiceRequestsPanel(): UseServiceRequestsPanelResult {
	const { state } = useWalletStatus();
	const { perfilAtivo } = useAccountProfile();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [clientRequests, setClientRequests] = useState<ServiceRequestSummary[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | "all">("all");
	const [requestModalId, setRequestModalId] = useState<number | null>(null);
	const [requestModalAction, setRequestModalAction] = useState<RequestModalAction | null>(null);
	const [requestModalBudget, setRequestModalBudget] = useState<number | null>(null);
	const [requestModalRating, setRequestModalRating] = useState(5);
	const [busyRequestId, setBusyRequestId] = useState<number | null>(null);

	const walletAddress = state.connected ? state.address ?? null : null;
	const walletNotice = state.connected ? null : "Conecte a carteira para ver suas ordens como cliente ou tecnico.";

	const onRefresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			if (!walletAddress) {
				setClientRequests([]);
				return;
			}

			const [asClient, asTechnician] = await Promise.all([
				loadServiceRequests({ clientAddress: walletAddress }),
				loadServiceRequests({ technicianAddress: walletAddress }),
			]);
			const requestsById = new Map<number, ServiceRequestSummary>();

			for (const request of [...asClient, ...asTechnician]) {
				requestsById.set(request.id, request);
			}

			setClientRequests(
				Array.from(requestsById.values()).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || right.id - left.id),
			);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar as ordens de servico.");
		} finally {
			setLoading(false);
		}
	}, [walletAddress]);

	useEffect(() => {
		void onRefresh();

		const timer = window.setInterval(() => {
			void onRefresh();
		}, 15000);

		return () => {
			window.clearInterval(timer);
		};
	}, [onRefresh]);

	const visibleRequests = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return clientRequests.filter((request) => {
			const statusMatches = statusFilter === "all" || request.status === statusFilter;

			if (!statusMatches) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				request.clientName,
				request.clientAddress,
				request.technicianName,
				request.technicianAddress,
				request.description,
				request.status,
				request.budgetAmount?.toString(),
			]
				.filter((value): value is string => Boolean(value))
				.some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}, [clientRequests, query, statusFilter]);

	const requestModalRequest = useMemo(() => {
		if (requestModalId === null) {
			return null;
		}

		return clientRequests.find((request) => request.id === requestModalId) ?? null;
	}, [clientRequests, requestModalId]);

	function updateRequest(nextRequest: ServiceRequestSummary) {
		setClientRequests((current) => current.map((request) => (request.id === nextRequest.id ? nextRequest : request)));
	}

	function onQueryChange(value: string) {
		setQuery(value);
	}

	function onStatusFilterChange(value: string | null) {
		setStatusFilter((value === null ? "all" : value) as ServiceRequestStatus | "all");
	}

	function onClearFilters() {
		setQuery("");
		setStatusFilter("all");
	}

	function onOpenRequestModal(requestId: number, action: RequestModalAction) {
		setRequestModalId(requestId);
		setRequestModalAction(action);
		setRequestModalBudget(null);
		setRequestModalRating(5);
		setError(null);
	}

	function onCloseRequestModal() {
		setRequestModalId(null);
		setRequestModalAction(null);
		setRequestModalBudget(null);
		setRequestModalRating(5);
		setError(null);
	}

	function onRequestModalBudgetChange(value: number | null) {
		setRequestModalBudget(value);
	}

	function onRequestModalRatingChange(value: number) {
		setRequestModalRating(value);
	}

	async function onSubmitBudget() {
		if (!walletAddress) {
			setError("Conecte a carteira para enviar o orcamento.");
			return;
		}

		if (!requestModalRequest) {
			setError("Selecione uma ordem de servico para enviar o orcamento.");
			return;
		}

		if (requestModalAction !== "budget") {
			setError("Selecione uma ordem de servico para enviar o orcamento.");
			return;
		}

		if (requestModalRequest.technicianAddress !== walletAddress) {
			setError("A ordem nao pertence a este tecnico.");
			return;
		}

		if (requestModalRequest.status !== "aberta" && requestModalRequest.status !== "aceita") {
			setError("A ordem precisa estar aberta para receber o orcamento.");
			return;
		}

		if (requestModalBudget === null || requestModalBudget <= 0) {
			setError("Informe um valor valido para o servico.");
			return;
		}

		setBusyRequestId(requestModalRequest.id);
		setError(null);

		try {
			await enviarOrcamentoNoContrato(ethereum, requestModalRequest.id, requestModalBudget);
			const nextRequest = await sendServiceBudget({
				id: requestModalRequest.id,
				technicianAddress: walletAddress,
				budgetAmount: requestModalBudget,
			});
			updateRequest(nextRequest);
			setRequestModalBudget(null);
			onCloseRequestModal();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel enviar o orcamento.");
		} finally {
			setBusyRequestId(null);
		}
	}

	async function onPayBudget() {
		if (!walletAddress) {
			setError("Conecte a carteira para pagar o orcamento.");
			return;
		}

		if (!requestModalRequest) {
			setError("Selecione uma ordem de servico para pagar o orcamento.");
			return;
		}

		if (requestModalAction !== "pay") {
			setError("Selecione uma ordem de servico para pagar o orcamento.");
			return;
		}

		if (requestModalRequest.clientAddress !== walletAddress) {
			setError("A ordem nao pertence a este cliente.");
			return;
		}

		if (requestModalRequest.status !== "orcada" || requestModalRequest.budgetAmount === null) {
			setError("A ordem precisa ter um orcamento enviado antes do pagamento.");
			return;
		}

		setBusyRequestId(requestModalRequest.id);
		setError(null);

		try {
			await autorizarPagamentoNoContrato(ethereum, requestModalRequest.budgetAmount);
			await aceitarOrcamentoNoContrato(ethereum, requestModalRequest.id);
			const nextRequest = await acceptServiceBudget({
				id: requestModalRequest.id,
				clientAddress: walletAddress,
			});
			updateRequest(nextRequest);
			onCloseRequestModal();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel pagar o orcamento em RPT.");
		} finally {
			setBusyRequestId(null);
		}
	}

	async function onCompleteOrder() {
		if (!walletAddress) {
			setError("Conecte a carteira para concluir a ordem.");
			return;
		}

		if (!requestModalRequest) {
			setError("Selecione uma ordem de servico para concluir.");
			return;
		}

		if (requestModalAction !== "complete") {
			setError("Selecione uma ordem de servico para concluir.");
			return;
		}

		if (requestModalRequest.status !== "aceito_cliente") {
			setError("A ordem precisa ter o orcamento aceito pelo cliente antes da conclusao.");
			return;
		}

		if (requestModalRequest.technicianAddress !== walletAddress) {
			setError("A ordem nao pertence a este tecnico.");
			return;
		}

		setBusyRequestId(requestModalRequest.id);
		setError(null);

		try {
			await concluirOrdemNoContrato(ethereum, requestModalRequest.id);
			const nextRequest = await completeServiceRequest({
				id: requestModalRequest.id,
				technicianAddress: walletAddress,
			});
			updateRequest(nextRequest);
			onCloseRequestModal();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel concluir a ordem de servico.");
		} finally {
			setBusyRequestId(null);
		}
	}

	async function onRateService() {
		if (!walletAddress) {
			setError("Conecte a carteira para avaliar o servico.");
			return;
		}

		if (!requestModalRequest) {
			setError("Selecione uma ordem de servico para avaliar.");
			return;
		}

		if (requestModalAction !== "rate") {
			setError("Selecione uma ordem de servico para avaliar.");
			return;
		}

		const ehCliente = walletAddress === requestModalRequest.clientAddress;
		const ehTecnico = walletAddress === requestModalRequest.technicianAddress;

		if (!ehCliente && !ehTecnico) {
			setError("A ordem nao pertence a esta carteira.");
			return;
		}

		if (requestModalRequest.status !== "concluida") {
			setError("A ordem precisa estar concluida antes da avaliacao.");
			return;
		}

		const nota = Math.max(1, Math.min(5, Math.trunc(requestModalRating)));

		setBusyRequestId(requestModalRequest.id);
		setError(null);

		try {
			await avaliarServicoNoContrato(ethereum, requestModalRequest.id, nota);
			onCloseRequestModal();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel avaliar o servico.");
		} finally {
			setBusyRequestId(null);
		}
	}

	return {
		connected: state.connected,
		walletAddress,
		walletNotice,
		perfilAtivo,
		loading,
		error,
		clientRequests,
		visibleRequests,
		query,
		statusFilter,
		requestModalOpened: requestModalRequest !== null && requestModalAction !== null,
		requestModalRequest,
		requestModalAction,
		requestModalBudget,
		requestModalRating,
		busyRequestId,
		onRefresh,
		onQueryChange,
		onStatusFilterChange,
		onClearFilters,
		onOpenRequestModal,
		onCloseRequestModal,
		onRequestModalBudgetChange,
		onRequestModalRatingChange,
		onSubmitBudget,
		onPayBudget,
		onCompleteOrder,
		onRateService,
	};
}

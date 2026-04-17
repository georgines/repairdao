"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { aceitarOrcamentoNoContrato } from "@/services/serviceRequests/serviceRequestBlockchain";
import { acceptServiceBudget, loadServiceRequests, type ServiceRequestSummary } from "@/services/serviceRequests/serviceRequestClient";
import type { ServiceRequestStatus } from "@/services/serviceRequests";

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
	busyRequestId: number | null;
	onRefresh: () => Promise<void>;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
	onOpenRequestModal: (requestId: number) => void;
	onCloseRequestModal: () => void;
	onAcceptBudget: () => Promise<void>;
};

export function useServiceRequestsPanel(): UseServiceRequestsPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [clientRequests, setClientRequests] = useState<ServiceRequestSummary[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | "all">("all");
	const [requestModalId, setRequestModalId] = useState<number | null>(null);
	const [busyRequestId, setBusyRequestId] = useState<number | null>(null);

	const walletAddress = state.connected ? state.address ?? null : null;
	const walletNotice = state.connected ? null : "Conecte a carteira para ver e aceitar suas ordens.";

	const onRefresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			if (!walletAddress) {
				setClientRequests([]);
				return;
			}

			const requests = await loadServiceRequests({ clientAddress: walletAddress });
			setClientRequests(requests);
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

	function onOpenRequestModal(requestId: number) {
		setRequestModalId(requestId);
		setError(null);
	}

	function onCloseRequestModal() {
		setRequestModalId(null);
		setError(null);
	}

	async function onAcceptBudget() {
		if (!walletAddress) {
			setError("Conecte a carteira para aceitar o orcamento.");
			return;
		}

		if (!requestModalRequest) {
			setError("Selecione uma ordem de servico para aceitar o orcamento.");
			return;
		}

		if (requestModalRequest.status !== "orcada" || requestModalRequest.budgetAmount === null) {
			setError("A ordem precisa ter um orcamento enviado antes da aceitacao.");
			return;
		}

		setBusyRequestId(requestModalRequest.id);
		setError(null);

		try {
			await aceitarOrcamentoNoContrato(ethereum, requestModalRequest.id);
			const nextRequest = await acceptServiceBudget({
				id: requestModalRequest.id,
				clientAddress: walletAddress,
			});
			updateRequest(nextRequest);
			onCloseRequestModal();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Nao foi possivel aceitar o orcamento.");
		} finally {
			setBusyRequestId(null);
		}
	}

	return {
		connected: state.connected,
		walletAddress,
		walletNotice,
		loading,
		error,
		clientRequests,
		visibleRequests,
		query,
		statusFilter,
		requestModalOpened: requestModalRequest !== null,
		requestModalRequest,
		busyRequestId,
		onRefresh,
		onQueryChange,
		onStatusFilterChange,
		onClearFilters,
		onOpenRequestModal,
		onCloseRequestModal,
		onAcceptBudget,
	};
}

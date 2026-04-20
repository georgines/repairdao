"use client";

import { ServiceRequestsPanelView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelView";
import { useServiceRequestsPanel } from "@/hooks/useServiceRequestsPanel";

export function ServiceRequestsPanel() {
	const panel = useServiceRequestsPanel();

	return (
		<ServiceRequestsPanelView
			header={{
				connected: panel.connected,
				walletAddress: panel.walletAddress,
				walletNotice: panel.walletNotice,
				perfilAtivo: panel.perfilAtivo,
				clientRequests: panel.clientRequests,
				visibleRequests: panel.visibleRequests,
				loading: panel.loading,
				onRefresh: panel.onRefresh,
			}}
			filters={{
				query: panel.query,
				statusFilter: panel.statusFilter,
				visibleRequests: panel.visibleRequests.length,
				onQueryChange: panel.onQueryChange,
				onStatusFilterChange: panel.onStatusFilterChange,
				onClearFilters: panel.onClearFilters,
			}}
			table={{
				connected: panel.connected,
				visibleRequests: panel.visibleRequests,
				perfilAtivo: panel.perfilAtivo,
				walletAddress: panel.walletAddress,
				busyRequestId: panel.busyRequestId,
				onOpenRequestModal: panel.onOpenRequestModal,
			}}
			modal={{
				requestModalOpened: panel.requestModalOpened,
				requestModalRequest: panel.requestModalRequest,
				requestModalAction: panel.requestModalAction,
				requestModalBudget: panel.requestModalBudget,
				requestModalRating: panel.requestModalRating,
				requestModalDisputeReason: panel.requestModalDisputeReason,
				busyRequestId: panel.busyRequestId,
				onCloseRequestModal: panel.onCloseRequestModal,
				onRequestModalBudgetChange: panel.onRequestModalBudgetChange,
				onRequestModalRatingChange: panel.onRequestModalRatingChange,
				onRequestModalDisputeReasonChange: panel.onRequestModalDisputeReasonChange,
				onSubmitBudget: panel.onSubmitBudget,
				onPayBudget: panel.onPayBudget,
				onCompleteOrder: panel.onCompleteOrder,
				onConfirmDelivery: panel.onConfirmDelivery,
				onRateService: panel.onRateService,
				onOpenDispute: panel.onOpenDispute,
			}}
			error={panel.error}
		/>
	);
}

import type { ServiceRequestStatus, ServiceRequestSummary } from "@/services/serviceRequests";

export type ServiceRequestsPanelAction = "details" | "budget" | "pay" | "complete" | "confirm" | "rate" | "dispute";

export type ServiceRequestsPanelHeaderProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	loading: boolean;
	onRefresh: () => void;
};

export type ServiceRequestsPanelFiltersProps = {
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	visibleRequests: number;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
};

export type ServiceRequestsPanelTableProps = {
	connected: boolean;
	visibleRequests: ServiceRequestSummary[];
	perfilAtivo: "cliente" | "tecnico" | null;
	walletAddress: string | null;
	busyRequestId: number | null;
	onOpenRequestModal: (requestId: number, action: ServiceRequestsPanelAction) => void;
};

export type ServiceRequestsPanelModalProps = {
	requestModalOpened: boolean;
	requestModalRequest: ServiceRequestSummary | null;
	requestModalAction: ServiceRequestsPanelAction | null;
	requestModalBudget: number | null;
	requestModalRating: number;
	requestModalDisputeReason: string;
	busyRequestId: number | null;
	onCloseRequestModal: () => void;
	onRequestModalBudgetChange: (value: number | null) => void;
	onRequestModalRatingChange: (value: number) => void;
	onRequestModalDisputeReasonChange: (value: string) => void;
	onSubmitBudget: () => Promise<void>;
	onPayBudget: () => Promise<void>;
	onCompleteOrder: () => Promise<void>;
	onConfirmDelivery: () => Promise<void>;
	onRateService: () => Promise<void>;
	onOpenDispute: () => Promise<void>;
};

export type ServiceRequestsPanelViewState = {
	header: ServiceRequestsPanelHeaderProps;
	filters: ServiceRequestsPanelFiltersProps;
	table: ServiceRequestsPanelTableProps;
	modal: ServiceRequestsPanelModalProps;
	error: string | null;
};

export type ServiceRequestsPanelViewProps = ServiceRequestsPanelViewState;

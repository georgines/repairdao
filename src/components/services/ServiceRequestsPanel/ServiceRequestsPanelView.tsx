import { Stack } from "@mantine/core";
import styles from "./ServiceRequestsPanelView.module.css";
import { ServiceRequestsPanelHeader } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelHeader/ServiceRequestsPanelHeader";
import { ServiceRequestsPanelFilters } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelFilters/ServiceRequestsPanelFilters";
import { ServiceRequestsPanelTable } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelTable/ServiceRequestsPanelTable";
import { ServiceRequestsPanelModal } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModal/ServiceRequestsPanelModal";
import type { ServiceRequestsPanelAction, ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";
import type { ServiceRequestSummary, ServiceRequestStatus } from "@/services/serviceRequests";

export type ServiceRequestsPanelViewProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	loading: boolean;
	error: string | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	requestModalOpened: boolean;
	requestModalRequest: ServiceRequestSummary | null;
	requestModalAction: ServiceRequestsPanelAction | null;
	requestModalBudget: number | null;
	requestModalRating: number;
	requestModalDisputeReason: string;
	busyRequestId: number | null;
	onRefresh: () => void;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
	onOpenRequestModal: (requestId: number, action: ServiceRequestsPanelAction) => void;
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

export function ServiceRequestsPanelView(props: ServiceRequestsPanelViewProps) {
	const modalProps: ServiceRequestsPanelModalProps = {
		requestModalOpened: props.requestModalOpened,
		requestModalRequest: props.requestModalRequest,
		requestModalAction: props.requestModalAction,
		requestModalBudget: props.requestModalBudget,
		requestModalRating: props.requestModalRating,
		requestModalDisputeReason: props.requestModalDisputeReason,
		busyRequestId: props.busyRequestId,
		onCloseRequestModal: props.onCloseRequestModal,
		onRequestModalBudgetChange: props.onRequestModalBudgetChange,
		onRequestModalRatingChange: props.onRequestModalRatingChange,
		onRequestModalDisputeReasonChange: props.onRequestModalDisputeReasonChange,
		onSubmitBudget: props.onSubmitBudget,
		onPayBudget: props.onPayBudget,
		onCompleteOrder: props.onCompleteOrder,
		onConfirmDelivery: props.onConfirmDelivery,
		onRateService: props.onRateService,
		onOpenDispute: props.onOpenDispute,
	};
	const errorNode = props.error ? (
		<div className={styles.errorCard} role="status" aria-live="assertive">
			{props.error}
		</div>
	) : null;

	return (
		<Stack gap="lg" className={styles.root}>
			<ServiceRequestsPanelHeader
				connected={props.connected}
				walletAddress={props.walletAddress}
				walletNotice={props.walletNotice}
				perfilAtivo={props.perfilAtivo}
				clientRequests={props.clientRequests}
				visibleRequests={props.visibleRequests}
				loading={props.loading}
				onRefresh={props.onRefresh}
			/>

			{errorNode}

			<ServiceRequestsPanelFilters
				query={props.query}
				statusFilter={props.statusFilter}
				visibleRequests={props.visibleRequests.length}
				onQueryChange={props.onQueryChange}
				onStatusFilterChange={props.onStatusFilterChange}
				onClearFilters={props.onClearFilters}
			/>

			<ServiceRequestsPanelTable
				connected={props.connected}
				visibleRequests={props.visibleRequests}
				perfilAtivo={props.perfilAtivo}
				walletAddress={props.walletAddress}
				busyRequestId={props.busyRequestId}
				onOpenRequestModal={props.onOpenRequestModal}
			/>

			<ServiceRequestsPanelModal {...modalProps} />
		</Stack>
	);
}

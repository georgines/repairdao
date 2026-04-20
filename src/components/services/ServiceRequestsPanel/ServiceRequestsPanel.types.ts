import type { ServiceRequestSummary } from "@/services/serviceRequests";

export type ServiceRequestsPanelAction = "details" | "budget" | "pay" | "complete" | "confirm" | "rate" | "dispute";

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

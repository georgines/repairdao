"use client";

import { ServiceRequestsPanelTableRowView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelTableRow/ServiceRequestsPanelTableRowView";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type ServiceRequestsPanelTableRowProps = {
	request: ServiceRequestSummary;
	perfilAtivo: "cliente" | "tecnico" | null;
	walletAddress: string | null;
	busyRequestId: number | null;
	onOpenRequestModal: (requestId: number, action: "details" | "budget" | "pay" | "complete" | "confirm" | "rate" | "dispute") => void;
};

export function ServiceRequestsPanelTableRow(props: ServiceRequestsPanelTableRowProps) {
	return <ServiceRequestsPanelTableRowView {...props} />;
}

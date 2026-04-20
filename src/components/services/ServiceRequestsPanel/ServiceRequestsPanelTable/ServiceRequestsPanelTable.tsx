"use client";

import { ServiceRequestsPanelTableView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelTable/ServiceRequestsPanelTableView";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type ServiceRequestsPanelTableProps = {
	connected: boolean;
	visibleRequests: ServiceRequestSummary[];
	perfilAtivo: "cliente" | "tecnico" | null;
	walletAddress: string | null;
	busyRequestId: number | null;
	onOpenRequestModal: (requestId: number, action: "details" | "budget" | "pay" | "complete" | "confirm" | "rate" | "dispute") => void;
};

export function ServiceRequestsPanelTable(props: ServiceRequestsPanelTableProps) {
	return <ServiceRequestsPanelTableView {...props} />;
}

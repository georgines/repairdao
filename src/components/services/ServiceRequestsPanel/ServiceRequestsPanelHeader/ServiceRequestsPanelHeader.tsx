"use client";

import { ServiceRequestsPanelHeaderView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelHeader/ServiceRequestsPanelHeaderView";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type ServiceRequestsPanelHeaderProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	loading: boolean;
	onRefresh: () => void;
};

export function ServiceRequestsPanelHeader(props: ServiceRequestsPanelHeaderProps) {
	return <ServiceRequestsPanelHeaderView {...props} />;
}

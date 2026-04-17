"use client";

import { ServiceRequestsPanelView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelView";
import { useServiceRequestsPanel } from "@/hooks/useServiceRequestsPanel";

export function ServiceRequestsPanel() {
	const panel = useServiceRequestsPanel();

	return <ServiceRequestsPanelView {...panel} />;
}

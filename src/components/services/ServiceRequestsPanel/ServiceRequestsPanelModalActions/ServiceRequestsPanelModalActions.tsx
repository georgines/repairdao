"use client";

import { ServiceRequestsPanelModalActionsView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalActions/ServiceRequestsPanelModalActionsView";
import type { ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";

export function ServiceRequestsPanelModalActions(props: ServiceRequestsPanelModalProps) {
	return <ServiceRequestsPanelModalActionsView {...props} />;
}

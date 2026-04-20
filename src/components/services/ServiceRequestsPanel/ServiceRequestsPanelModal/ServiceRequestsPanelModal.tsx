"use client";

import { ServiceRequestsPanelModalView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModal/ServiceRequestsPanelModalView";
import type { ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";

export function ServiceRequestsPanelModal(props: ServiceRequestsPanelModalProps) {
	return <ServiceRequestsPanelModalView {...props} />;
}

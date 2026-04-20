"use client";

import { ServiceRequestsPanelModalFieldView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalField/ServiceRequestsPanelModalFieldView";
import type { ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";

export function ServiceRequestsPanelModalField(props: ServiceRequestsPanelModalProps) {
	return <ServiceRequestsPanelModalFieldView {...props} />;
}

"use client";

import { ServiceRequestsPanelModalHeaderView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalHeader/ServiceRequestsPanelModalHeaderView";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type ServiceRequestsPanelModalHeaderProps = {
	requestModalRequest: ServiceRequestSummary;
};

export function ServiceRequestsPanelModalHeader(props: ServiceRequestsPanelModalHeaderProps) {
	return <ServiceRequestsPanelModalHeaderView {...props} />;
}

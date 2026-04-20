"use client";

import { ServiceRequestsPanelModalDetailsView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalDetails/ServiceRequestsPanelModalDetailsView";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import type { ServiceRequestsPanelAction } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";

type ServiceRequestsPanelModalDetailsProps = {
	requestModalRequest: ServiceRequestSummary;
	requestModalAction: ServiceRequestsPanelAction;
};

export function ServiceRequestsPanelModalDetails(props: ServiceRequestsPanelModalDetailsProps) {
	return <ServiceRequestsPanelModalDetailsView {...props} />;
}

"use client";

import { ServiceRequestsPanelEmptyStateView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelEmptyState/ServiceRequestsPanelEmptyStateView";

type ServiceRequestsPanelEmptyStateProps = {
	hasWallet: boolean;
	hasResults: boolean;
};

export function ServiceRequestsPanelEmptyState(props: ServiceRequestsPanelEmptyStateProps) {
	return <ServiceRequestsPanelEmptyStateView {...props} />;
}

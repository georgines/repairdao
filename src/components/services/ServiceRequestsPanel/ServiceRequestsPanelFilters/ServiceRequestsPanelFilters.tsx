"use client";

import { ServiceRequestsPanelFiltersView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelFilters/ServiceRequestsPanelFiltersView";
import type { ServiceRequestStatus } from "@/services/serviceRequests";

type ServiceRequestsPanelFiltersProps = {
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	visibleRequests: number;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
};

export function ServiceRequestsPanelFilters(props: ServiceRequestsPanelFiltersProps) {
	return <ServiceRequestsPanelFiltersView {...props} />;
}

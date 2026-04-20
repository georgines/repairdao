"use client";

import { DisputesPanelFiltersView } from "@/components/disputes/DisputesPanel/DisputesPanelFilters/DisputesPanelFiltersView";

type DisputesPanelFiltersProps = {
	query?: string;
	statusFilter?: string;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
};

export function DisputesPanelFilters(props: DisputesPanelFiltersProps) {
	return <DisputesPanelFiltersView {...props} />;
}


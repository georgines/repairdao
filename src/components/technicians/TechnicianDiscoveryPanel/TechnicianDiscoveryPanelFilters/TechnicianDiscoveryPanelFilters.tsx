"use client";

import { TechnicianDiscoveryPanelFiltersView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelFilters/TechnicianDiscoveryPanelFiltersView";

type TechnicianDiscoveryPanelFiltersProps = {
	query: string;
	minReputation: number;
	resultsNotice: string;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onClearFilters: () => void;
};

export function TechnicianDiscoveryPanelFilters({
	query,
	minReputation,
	resultsNotice,
	onQueryChange,
	onMinReputationChange,
	onClearFilters,
}: TechnicianDiscoveryPanelFiltersProps) {
	return (
		<TechnicianDiscoveryPanelFiltersView
			query={query}
			minReputation={minReputation}
			resultsNotice={resultsNotice}
			onQueryChange={onQueryChange}
			onMinReputationChange={onMinReputationChange}
			onClearFilters={onClearFilters}
		/>
	);
}


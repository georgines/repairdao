"use client";

import { TechnicianDiscoveryPanelView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelView";
import { useTechnicianDiscoveryPanel } from "@/hooks/useTechnicianDiscoveryPanel";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelProps = {
	initialTechnicians: UserSummary[];
};

export function TechnicianDiscoveryPanel({ initialTechnicians }: TechnicianDiscoveryPanelProps) {
	const panel = useTechnicianDiscoveryPanel({ initialTechnicians });

	return (
		<TechnicianDiscoveryPanelView
			header={{
				totalTechnicians: panel.totalTechnicians,
				filteredTechnicians: panel.filteredTechnicians,
				selectedTechnician: panel.selectedTechnician,
				contractedTechnician: panel.contractedTechnician,
				hasOpenOrder: panel.hasOpenOrder,
			}}
			filters={{
				query: panel.query,
				minReputation: panel.minReputation,
				hasResults: panel.hasResults,
				onQueryChange: panel.onQueryChange,
				onMinReputationChange: panel.onMinReputationChange,
				onClearFilters: panel.onClearFilters,
			}}
			table={{
				filteredTechnicians: panel.filteredTechnicians,
				selectedTechnician: panel.selectedTechnician,
				canHire: panel.canHire,
				onSelectTechnician: panel.onSelectTechnician,
				onHireTechnician: panel.onHireTechnician,
			}}
			modal={{
				technicianModalMode: panel.technicianModalMode,
				technicianModalOpened: panel.technicianModalOpened,
				selectedTechnician: panel.selectedTechnician,
				serviceDescription: panel.serviceDescription,
				submittingRequest: panel.submittingRequest,
				requestError: panel.requestError,
				onCloseTechnicianModal: panel.onCloseTechnicianModal,
				onServiceDescriptionChange: panel.onServiceDescriptionChange,
				onConfirmTechnicianHire: panel.onConfirmTechnicianHire,
			}}
		/>
	);
}

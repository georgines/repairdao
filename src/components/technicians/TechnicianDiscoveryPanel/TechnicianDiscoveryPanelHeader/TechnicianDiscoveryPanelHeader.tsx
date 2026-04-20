"use client";

import { TechnicianDiscoveryPanelHeaderView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelHeader/TechnicianDiscoveryPanelHeaderView";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelHeaderProps = {
	totalTechnicians: number;
	filteredTechniciansCount: number;
	selectedTechnician: UserSummary | null;
	contractedTechnician: UserSummary | null;
	hasOpenOrder: boolean;
};

export function TechnicianDiscoveryPanelHeader({
	totalTechnicians,
	filteredTechniciansCount,
	selectedTechnician,
	contractedTechnician,
	hasOpenOrder,
}: TechnicianDiscoveryPanelHeaderProps) {
	return (
		<TechnicianDiscoveryPanelHeaderView
			totalTechnicians={totalTechnicians}
			filteredTechniciansCount={filteredTechniciansCount}
			selectedTechnician={selectedTechnician}
			contractedTechnician={contractedTechnician}
			hasOpenOrder={hasOpenOrder}
		/>
	);
}


"use client";

import { TechnicianDiscoveryPanelTableView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelTable/TechnicianDiscoveryPanelTableView";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelTableProps = {
	technicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	canHire: boolean;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
};

export function TechnicianDiscoveryPanelTable({
	technicians,
	selectedTechnician,
	canHire,
	onSelectTechnician,
	onHireTechnician,
}: TechnicianDiscoveryPanelTableProps) {
	return (
		<TechnicianDiscoveryPanelTableView
			technicians={technicians}
			selectedTechnician={selectedTechnician}
			canHire={canHire}
			onSelectTechnician={onSelectTechnician}
			onHireTechnician={onHireTechnician}
		/>
	);
}


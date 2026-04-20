"use client";

import { TechnicianDiscoveryPanelTableRowView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelTableRow/TechnicianDiscoveryPanelTableRowView";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelTableRowProps = {
	technician: UserSummary;
	selected: boolean;
	canHire: boolean;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
};

export function TechnicianDiscoveryPanelTableRow({
	technician,
	selected,
	canHire,
	onSelectTechnician,
	onHireTechnician,
}: TechnicianDiscoveryPanelTableRowProps) {
	return (
		<TechnicianDiscoveryPanelTableRowView
			technician={technician}
			selected={selected}
			canHire={canHire}
			onSelectTechnician={onSelectTechnician}
			onHireTechnician={onHireTechnician}
		/>
	);
}


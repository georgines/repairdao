"use client";

import { TechnicianDiscoveryPanelModalDetailsView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModalDetails/TechnicianDiscoveryPanelModalDetailsView";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelModalDetailsProps = {
	selectedTechnician: UserSummary;
};

export function TechnicianDiscoveryPanelModalDetails({ selectedTechnician }: TechnicianDiscoveryPanelModalDetailsProps) {
	return <TechnicianDiscoveryPanelModalDetailsView selectedTechnician={selectedTechnician} />;
}


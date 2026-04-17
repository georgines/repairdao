"use client";

import { TechnicianDiscoveryPanelView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelView";
import { useTechnicianDiscoveryPanel } from "@/hooks/useTechnicianDiscoveryPanel";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelProps = {
	initialTechnicians: UserSummary[];
};

export function TechnicianDiscoveryPanel({ initialTechnicians }: TechnicianDiscoveryPanelProps) {
	const panel = useTechnicianDiscoveryPanel({ initialTechnicians });

	return <TechnicianDiscoveryPanelView {...panel} />;
}

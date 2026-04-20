"use client";

import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelHeaderBadgesView } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderBadges/DisputesPanelHeaderBadgesView";

type DisputesPanelHeaderBadgesProps = {
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	connected: boolean;
	walletAddress: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
};

export function DisputesPanelHeaderBadges(props: DisputesPanelHeaderBadgesProps) {
	return <DisputesPanelHeaderBadgesView {...props} />;
}

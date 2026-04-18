"use client";

import { useDisputesPanel } from "@/hooks/useDisputesPanel";
import { DisputesPanelView } from "@/components/disputes/DisputesPanel/DisputesPanelView";

export function DisputesPanel() {
	const panel = useDisputesPanel();

	return <DisputesPanelView {...panel} />;
}

"use client";

import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelTableView } from "@/components/disputes/DisputesPanel/DisputesPanelTable/DisputesPanelTableView";

type DisputesPanelTableProps = {
	visibleDisputes: DisputeItem[];
	selectedDisputeId: number | null;
	onSelectDispute: (disputeId: number) => Promise<void>;
};

export function DisputesPanelTable(props: DisputesPanelTableProps) {
	return <DisputesPanelTableView {...props} />;
}


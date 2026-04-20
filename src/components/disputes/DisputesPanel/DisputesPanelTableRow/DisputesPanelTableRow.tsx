"use client";

import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelTableRowView } from "@/components/disputes/DisputesPanel/DisputesPanelTableRow/DisputesPanelTableRowView";

type DisputesPanelTableRowProps = {
	dispute: DisputeItem;
	selected: boolean;
	onSelectDispute: (disputeId: number) => Promise<void>;
};

export function DisputesPanelTableRow(props: DisputesPanelTableRowProps) {
	return <DisputesPanelTableRowView {...props} />;
}

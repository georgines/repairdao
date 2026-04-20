"use client";

import type { DisputesPanelTableProps } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelTableView } from "@/components/disputes/DisputesPanel/DisputesPanelTable/DisputesPanelTableView";

export function DisputesPanelTable(props: DisputesPanelTableProps) {
	return <DisputesPanelTableView {...props} />;
}

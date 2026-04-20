"use client";

import type { DisputesPanelHeaderProps } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelHeaderView } from "@/components/disputes/DisputesPanel/DisputesPanelHeader/DisputesPanelHeaderView";

export function DisputesPanelHeader(props: DisputesPanelHeaderProps) {
	return <DisputesPanelHeaderView {...props} />;
}

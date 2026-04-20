"use client";

import type { DisputesPanelFiltersProps } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelFiltersView } from "@/components/disputes/DisputesPanel/DisputesPanelFilters/DisputesPanelFiltersView";

export function DisputesPanelFilters(props: DisputesPanelFiltersProps) {
	return <DisputesPanelFiltersView {...props} />;
}

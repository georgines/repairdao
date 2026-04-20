"use client";

import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelModalDetailsView } from "@/components/disputes/DisputesPanel/DisputesPanelModalDetails/DisputesPanelModalDetailsView";

type DisputesPanelModalDetailsProps = {
	selectedDispute: DisputeItem;
};

export function DisputesPanelModalDetails(props: DisputesPanelModalDetailsProps) {
	return <DisputesPanelModalDetailsView {...props} />;
}

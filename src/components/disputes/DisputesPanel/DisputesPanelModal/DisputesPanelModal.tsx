"use client";

import type { DisputesPanelModalProps } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelModalView } from "@/components/disputes/DisputesPanel/DisputesPanelModal/DisputesPanelModalView";

export function DisputesPanelModal(props: DisputesPanelModalProps) {
	return <DisputesPanelModalView {...props} />;
}

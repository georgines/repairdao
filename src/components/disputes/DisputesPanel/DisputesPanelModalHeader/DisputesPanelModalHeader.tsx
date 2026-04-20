"use client";

import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
import { DisputesPanelModalHeaderView } from "@/components/disputes/DisputesPanel/DisputesPanelModalHeader/DisputesPanelModalHeaderView";

type DisputesPanelModalHeaderProps = {
	disputeTitle: string;
	disputeSubtitle: string;
	status?: DisputaContratoDominio["estado"];
};

export function DisputesPanelModalHeader(props: DisputesPanelModalHeaderProps) {
	return <DisputesPanelModalHeaderView {...props} />;
}

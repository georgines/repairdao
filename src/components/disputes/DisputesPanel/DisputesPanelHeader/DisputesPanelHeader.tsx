"use client";

import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelHeaderView } from "@/components/disputes/DisputesPanel/DisputesPanelHeader/DisputesPanelHeaderView";

type DisputesPanelHeaderProps = {
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	loading: boolean;
	onRefresh: () => void;
};

export function DisputesPanelHeader(props: DisputesPanelHeaderProps) {
	return <DisputesPanelHeaderView {...props} />;
}

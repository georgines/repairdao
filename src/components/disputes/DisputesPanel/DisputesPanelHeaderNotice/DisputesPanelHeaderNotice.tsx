"use client";

import { DisputesPanelHeaderNoticeView } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderNotice/DisputesPanelHeaderNoticeView";

type DisputesPanelHeaderNoticeProps = {
	walletNotice: string | null;
	loading: boolean;
	onRefresh: () => void;
};

export function DisputesPanelHeaderNotice(props: DisputesPanelHeaderNoticeProps) {
	return <DisputesPanelHeaderNoticeView {...props} />;
}

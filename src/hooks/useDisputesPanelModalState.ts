"use client";

import { useMemo } from "react";
import type { DisputesPanelModalDispute, DisputesPanelModalState } from "@/services/disputes/disputesPanelModal";
import { buildDisputesPanelModalState } from "@/services/disputes/disputesPanelModal";

type UseDisputesPanelModalStateInput = {
	selectedDispute: DisputesPanelModalDispute | null;
	walletAddress: string | null;
	connected: boolean;
	voteSupportOpener: boolean;
	votedDisputeIds: number[];
	votedDisputeChoices: Record<number, boolean>;
	evidenceSubmittedDisputeIds: number[];
};

export function useDisputesPanelModalState({
	selectedDispute,
	walletAddress,
	connected,
	voteSupportOpener,
	votedDisputeIds,
	votedDisputeChoices,
	evidenceSubmittedDisputeIds,
}: UseDisputesPanelModalStateInput): DisputesPanelModalState | null {
	return useMemo(
		() =>
			buildDisputesPanelModalState({
				selectedDispute,
				walletAddress,
				connected,
				voteSupportOpener,
				votedDisputeIds,
				votedDisputeChoices,
				evidenceSubmittedDisputeIds,
			}),
		[
			connected,
			evidenceSubmittedDisputeIds,
			selectedDispute,
			voteSupportOpener,
			votedDisputeChoices,
			votedDisputeIds,
			walletAddress,
		],
	);
}

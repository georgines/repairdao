"use client";

import type { EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelModalView } from "@/components/disputes/DisputesPanel/DisputesPanelModal/DisputesPanelModalView";

type DisputesPanelModalProps = {
	connected: boolean;
	hasVotingTokens: boolean;
	busyDisputeId: number | null;
	selectedDispute: DisputeItem | null;
	selectedEvidence: EvidenciaContratoDominio[];
	evidenceDraft: string;
	voteSupportOpener: boolean;
	votedDisputeIds: number[];
	votedDisputeChoices: Record<number, boolean>;
	evidenceSubmittedDisputeIds: number[];
	onCloseDispute: () => void;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
	onResolveDispute: () => Promise<void>;
	walletAddress: string | null;
};

export function DisputesPanelModal(props: DisputesPanelModalProps) {
	return <DisputesPanelModalView {...props} />;
}


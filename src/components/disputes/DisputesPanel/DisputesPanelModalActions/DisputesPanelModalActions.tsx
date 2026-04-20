"use client";

import { useDisputesPanelModalActions } from "@/hooks/useDisputesPanelModalActions";
import { DisputesPanelModalActionsView } from "@/components/disputes/DisputesPanel/DisputesPanelModalActions/DisputesPanelModalActionsView";

type DisputesPanelModalActionsProps = {
	connected: boolean;
	hasVotingTokens: boolean;
	busyDisputeId: number | null;
	selectedDisputeId: number;
	selectedResolved: boolean;
	selectedCanSendEvidence: boolean;
	selectedCanVote: boolean;
	selectedCanResolve: boolean;
	selectedVoteLocked: boolean;
	selectedVoteSupportOpener: boolean;
	voteOptionLabels: { openerLabel: string; opposingLabel: string };
	evidenceDraft: string;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
	onResolveDispute: () => Promise<void>;
};

export function DisputesPanelModalActions(props: DisputesPanelModalActionsProps) {
	const kind = useDisputesPanelModalActions({
		connected: props.connected,
		selectedResolved: props.selectedResolved,
		selectedCanSendEvidence: props.selectedCanSendEvidence,
		selectedCanVote: props.selectedCanVote,
		selectedCanResolve: props.selectedCanResolve,
	});

	return <DisputesPanelModalActionsView {...props} kind={kind} />;
}

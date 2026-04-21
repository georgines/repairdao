"use client";

import { GovernancePanelView } from "@/components/governance/GovernancePanel/GovernancePanelView";
import { useGovernancePanel } from "@/hooks/useGovernancePanel";

export function GovernancePanel() {
	const panel = useGovernancePanel();

	return (
		<GovernancePanelView
			summary={{
				loading: panel.loading,
				error: panel.error,
				connected: panel.connected,
				canCreateProposal: panel.canCreateProposal,
				canVote: panel.canVote,
				votingPower: panel.votingPower,
				walletAddress: panel.walletAddress,
				quorum: panel.snapshot?.quorum ?? 0n,
				totalProposals: panel.snapshot?.totalProposals ?? 0,
				syncedAt: panel.snapshot?.syncedAt ?? null,
			}}
			form={{
				action: panel.form.action,
				description: panel.form.description,
				value: panel.form.value,
				saving: panel.savingProposal,
				error: panel.formError,
				onActionChange: panel.setFormAction,
				onDescriptionChange: panel.setFormDescription,
				onValueChange: panel.setFormValue,
				onSubmit: panel.submitProposal,
			}}
			proposals={panel.proposals}
			selectedProposal={panel.selectedProposal}
			selectedProposalMode={panel.selectedProposalMode}
			actionError={panel.actionError}
			votingProposalId={panel.votingProposalId}
			executingProposalId={panel.executingProposalId}
			onOpenDetailsModal={panel.openDetailsModal}
			onOpenVoteModal={panel.openVoteModal}
			onCloseVoteModal={panel.closeVoteModal}
			onVote={panel.voteSelectedProposal}
			onExecute={panel.executeProposal}
		/>
	);
}

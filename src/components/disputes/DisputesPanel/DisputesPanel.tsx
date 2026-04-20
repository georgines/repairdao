"use client";

import { useDisputesPanel } from "@/hooks/useDisputesPanel";
import { DisputesPanelView } from "@/components/disputes/DisputesPanel/DisputesPanelView";

export function DisputesPanel() {
	const panel = useDisputesPanel();

	return (
		<DisputesPanelView
			header={{
				disputes: panel.disputes,
				visibleDisputes: panel.visibleDisputes,
				connected: panel.connected,
				walletAddress: panel.walletAddress,
				walletNotice: panel.walletNotice,
				perfilAtivo: panel.perfilAtivo,
				loading: panel.loading,
				onRefresh: panel.onRefresh,
			}}
			filters={{
				query: panel.query,
				statusFilter: panel.statusFilter,
				onQueryChange: panel.onQueryChange,
				onStatusFilterChange: panel.onStatusFilterChange,
				onClearFilters: panel.onClearFilters,
			}}
			table={{
				visibleDisputes: panel.visibleDisputes,
				selectedDisputeId: panel.selectedDisputeId,
				onSelectDispute: panel.onSelectDispute,
			}}
			modal={{
				connected: panel.connected,
				hasVotingTokens: panel.hasVotingTokens,
				busyDisputeId: panel.busyDisputeId,
				selectedDispute: panel.selectedDispute,
				selectedEvidence: panel.selectedEvidence,
				evidenceDraft: panel.evidenceDraft,
				voteSupportOpener: panel.voteSupportOpener,
				votedDisputeIds: panel.votedDisputeIds,
				votedDisputeChoices: panel.votedDisputeChoices,
				evidenceSubmittedDisputeIds: panel.evidenceSubmittedDisputeIds,
				onCloseDispute: panel.onCloseDispute,
				onEvidenceDraftChange: panel.onEvidenceDraftChange,
				onVoteSupportChange: panel.onVoteSupportChange,
				onSubmitEvidence: panel.onSubmitEvidence,
				onSubmitVote: panel.onSubmitVote,
				onResolveDispute: panel.onResolveDispute,
				walletAddress: panel.walletAddress,
			}}
			error={panel.error}
		/>
	);
}

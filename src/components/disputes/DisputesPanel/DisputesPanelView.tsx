import { Stack } from "@mantine/core";
import type { DisputesPanelViewProps } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelHeader } from "@/components/disputes/DisputesPanel/DisputesPanelHeader/DisputesPanelHeader";
import { DisputesPanelFilters } from "@/components/disputes/DisputesPanel/DisputesPanelFilters/DisputesPanelFilters";
import { DisputesPanelTable } from "@/components/disputes/DisputesPanel/DisputesPanelTable/DisputesPanelTable";
import { DisputesPanelModal } from "@/components/disputes/DisputesPanel/DisputesPanelModal/DisputesPanelModal";
import { Card, Text } from "@mantine/core";
import styles from "./DisputesPanelView.module.css";

export function DisputesPanelView(props: DisputesPanelViewProps) {
	let errorCard = null;

	if (props.error) {
		errorCard = (
			<Card withBorder radius="sm" shadow="none" padding="md" className={styles.card}>
				<Text size="sm" c="red" role="status" aria-live="assertive">
					{props.error}
				</Text>
			</Card>
		);
	}

	return (
		<Stack gap="lg" className={styles.root}>
			<DisputesPanelHeader
				disputes={props.disputes}
				visibleDisputes={props.visibleDisputes}
				connected={props.connected}
				walletAddress={props.walletAddress}
				walletNotice={props.walletNotice}
				perfilAtivo={props.perfilAtivo}
				loading={props.loading}
				onRefresh={props.onRefresh}
			/>

			{errorCard}

			<DisputesPanelFilters
				query={props.query}
				statusFilter={props.statusFilter}
				onQueryChange={props.onQueryChange ?? (() => {})}
				onStatusFilterChange={props.onStatusFilterChange ?? (() => {})}
				onClearFilters={props.onClearFilters ?? (() => {})}
			/>

			<DisputesPanelTable
				visibleDisputes={props.visibleDisputes}
				selectedDisputeId={props.selectedDisputeId}
				onSelectDispute={props.onSelectDispute}
			/>

			<DisputesPanelModal
				connected={props.connected}
				hasVotingTokens={props.hasVotingTokens}
				busyDisputeId={props.busyDisputeId}
				selectedDispute={props.selectedDispute}
				selectedEvidence={props.selectedEvidence}
				evidenceDraft={props.evidenceDraft}
				voteSupportOpener={props.voteSupportOpener}
				votedDisputeIds={props.votedDisputeIds}
				votedDisputeChoices={props.votedDisputeChoices}
				evidenceSubmittedDisputeIds={props.evidenceSubmittedDisputeIds}
				onCloseDispute={props.onCloseDispute}
				onEvidenceDraftChange={props.onEvidenceDraftChange}
				onVoteSupportChange={props.onVoteSupportChange}
				onSubmitEvidence={props.onSubmitEvidence}
				onSubmitVote={props.onSubmitVote}
				onResolveDispute={props.onResolveDispute}
				walletAddress={props.walletAddress}
			/>
		</Stack>
	);
}

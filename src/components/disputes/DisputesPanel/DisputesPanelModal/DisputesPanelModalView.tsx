import { Modal, ScrollArea, Stack } from "@mantine/core";
import type { EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelModalHeader } from "@/components/disputes/DisputesPanel/DisputesPanelModalHeader/DisputesPanelModalHeader";
import { DisputesPanelModalDetails } from "@/components/disputes/DisputesPanel/DisputesPanelModalDetails/DisputesPanelModalDetails";
import { DisputesPanelModalEvidenceSection } from "@/components/disputes/DisputesPanel/DisputesPanelModalEvidenceSection/DisputesPanelModalEvidenceSection";
import { DisputesPanelModalActions } from "@/components/disputes/DisputesPanel/DisputesPanelModalActions/DisputesPanelModalActions";
import { useDisputesPanelModalState } from "@/hooks/useDisputesPanelModalState";
import styles from "./DisputesPanelModalView.module.css";

type DisputesPanelModalViewProps = {
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

export function DisputesPanelModalView({
	connected,
	hasVotingTokens,
	busyDisputeId,
	selectedDispute,
	selectedEvidence,
	evidenceDraft,
	voteSupportOpener,
	votedDisputeIds,
	votedDisputeChoices,
	evidenceSubmittedDisputeIds,
	onCloseDispute,
	onEvidenceDraftChange,
	onVoteSupportChange,
	onSubmitEvidence,
	onSubmitVote,
	onResolveDispute,
	walletAddress,
}: DisputesPanelModalViewProps) {
	const activeDispute = selectedDispute;
	const modalState = useDisputesPanelModalState({
		selectedDispute: activeDispute,
		walletAddress,
		connected,
		voteSupportOpener,
		votedDisputeIds,
		votedDisputeChoices,
		evidenceSubmittedDisputeIds,
	});

	if (activeDispute === null || modalState === null) {
		return null;
	}

	return (
		<Modal
			opened
			onClose={onCloseDispute}
			title={modalState.disputeTitle}
			size="xl"
			centered={false}
			fullScreen={false}
			scrollAreaComponent={ScrollArea.Autosize}
			transitionProps={{ transition: "fade", duration: 150 }}
			overlayProps={{ opacity: 0.55, blur: 3 }}
		>
			<Stack gap="lg" className={styles.modalBody}>
				<DisputesPanelModalHeader
					disputeTitle={modalState.disputeTitle}
					disputeSubtitle={modalState.disputeSubtitle}
					status={modalState.selectedState}
				/>
				<DisputesPanelModalDetails selectedDispute={activeDispute} />
				<DisputesPanelModalEvidenceSection dispute={activeDispute} selectedEvidence={selectedEvidence} />
				<DisputesPanelModalActions
					connected={connected}
					hasVotingTokens={hasVotingTokens}
					busyDisputeId={busyDisputeId}
					selectedDisputeId={activeDispute.request.id}
					selectedResolved={modalState.selectedResolved}
					selectedCanSendEvidence={modalState.selectedCanSendEvidence}
					selectedCanVote={modalState.selectedCanVote}
					selectedCanResolve={modalState.selectedCanResolve}
					selectedVoteLocked={modalState.selectedVoteLocked}
					selectedVoteSupportOpener={modalState.selectedVoteSupportOpener}
					voteOptionLabels={modalState.voteOptionLabels}
					evidenceDraft={evidenceDraft}
					onEvidenceDraftChange={onEvidenceDraftChange}
					onVoteSupportChange={onVoteSupportChange}
					onSubmitEvidence={onSubmitEvidence}
					onSubmitVote={onSubmitVote}
					onResolveDispute={onResolveDispute}
				/>
			</Stack>
		</Modal>
	);
}


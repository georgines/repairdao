import { Button, Group, Modal, Stack } from "@mantine/core";
import { formatUnits } from "ethers";
import type { ReactNode } from "react";
import type { GovernanceProposal } from "@/services/governance/governanceTypes";
import styles from "./GovernancePanelProposalModalView.module.css";
import { GovernancePanelProposalDetailsSection } from "./GovernancePanelProposalDetailsSection/GovernancePanelProposalDetailsSection";
import { GovernancePanelProposalVoteActions } from "./GovernancePanelProposalVoteActions/GovernancePanelProposalVoteActions";

type ProposalModalMode = "details" | "vote" | null;

export type GovernancePanelProposalModalViewProps = {
	selectedProposal: GovernanceProposal | null;
	selectedProposalMode: ProposalModalMode;
	quorum: bigint;
	connected: boolean;
	votingPower: string;
	onClose: () => void;
	onVote: (support: boolean) => Promise<void>;
	votingProposalId: string | null;
};

export function GovernancePanelProposalModalView({
	selectedProposal,
	selectedProposalMode,
	quorum,
	connected,
	votingPower,
	onClose,
	onVote,
	votingProposalId,
}: GovernancePanelProposalModalViewProps) {
	const opened = selectedProposal !== null;
	let title = "Detalhes da proposta";

	if (selectedProposalMode === "vote") {
		title = "Confirmar voto";
	}

	let content: ReactNode = null;

	if (selectedProposal) {
		let votePowerLabel = "0 RPT";

		if (connected) {
			votePowerLabel = `${formatUnits(BigInt(votingPower || "0"), 18)} RPT`;
		}

		if (selectedProposalMode === "vote") {
			content = (
				<Stack gap="md">
					<GovernancePanelProposalDetailsSection proposal={selectedProposal} quorum={quorum} />
					<GovernancePanelProposalVoteActions
						votingPowerLabel={votePowerLabel}
						votingProposalId={votingProposalId}
						proposalId={selectedProposal.id}
						onVote={onVote}
					/>
				</Stack>
			);
		} else {
			content = (
				<Stack gap="md">
					<GovernancePanelProposalDetailsSection proposal={selectedProposal} quorum={quorum} />
					<Group justify="flex-end">
						<Button onClick={onClose}>Fechar</Button>
					</Group>
				</Stack>
			);
		}
	}

	return (
		<Modal opened={opened} onClose={onClose} title={title} centered>
			<div className={styles.root}>{content}</div>
		</Modal>
	);
}

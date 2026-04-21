import { Badge, Group, Stack, Text } from "@mantine/core";
import type { GovernanceProposal } from "@/services/governance/governanceTypes";
import {
	formatGovernanceProposalActionValue,
	getGovernanceProposalActionLabel,
	getGovernanceProposalShortStatusLabel,
	getGovernanceProposalStatusColor,
} from "@/services/governance/governancePresentation";
import { formatUnits } from "ethers";
import styles from "./GovernancePanelProposalDetailsSectionView.module.css";

export type GovernancePanelProposalDetailsSectionViewProps = {
	proposal: GovernanceProposal;
	quorum: bigint;
};

export function GovernancePanelProposalDetailsSectionView({ proposal, quorum }: GovernancePanelProposalDetailsSectionViewProps) {
	const statusColor = getGovernanceProposalStatusColor(proposal, quorum);
	const shortStatusLabel = getGovernanceProposalShortStatusLabel(proposal, quorum);

	return (
		<Stack gap="md" className={styles.root}>
			<Stack gap={2}>
				<Text fw={700}>Detalhes da proposta</Text>
				<Text size="sm" c="dimmed">
					{proposal.description}
				</Text>
			</Stack>
			<Group gap="xs">
				<Badge color="gray" variant="light">
					#{proposal.id}
				</Badge>
				<Badge color={statusColor} variant="light">
					{shortStatusLabel}
				</Badge>
			</Group>
			<Text size="sm">
				{getGovernanceProposalActionLabel(proposal.action)} - {formatGovernanceProposalActionValue(proposal.action, proposal.actionValue)}
			</Text>
			<Text size="sm" c="dimmed">
				Prazo: {new Date(proposal.deadline).toLocaleString("pt-BR")}
			</Text>
			<Text size="sm" c="dimmed">
				Votos: {formatUnits(proposal.votesFor, 18)} a favor e {formatUnits(proposal.votesAgainst, 18)} contra
			</Text>
		</Stack>
	);
}

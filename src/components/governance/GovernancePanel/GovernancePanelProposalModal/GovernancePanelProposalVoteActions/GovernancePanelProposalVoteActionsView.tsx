import { Button, Group, Stack, Text } from "@mantine/core";
import styles from "./GovernancePanelProposalVoteActionsView.module.css";

export type GovernancePanelProposalVoteActionsViewProps = {
	votingPowerLabel: string;
	votingProposalId: string | null;
	proposalId: string;
	onVote: (support: boolean) => Promise<void>;
};

export function GovernancePanelProposalVoteActionsView({
	votingPowerLabel,
	votingProposalId,
	proposalId,
	onVote,
}: GovernancePanelProposalVoteActionsViewProps) {
	const loading = votingProposalId === proposalId;

	return (
		<Stack gap="md" className={styles.root}>
			<Text size="sm" c="dimmed">
				Seu poder de voto: {votingPowerLabel}
			</Text>
			<Text fw={700}>Aprova esta proposta?</Text>
			<Group justify="space-between">
				<Button variant="light" color="red" onClick={() => void onVote(false)} loading={loading}>
					Nao
				</Button>
				<Button color="teal" onClick={() => void onVote(true)} loading={loading}>
					Sim
				</Button>
			</Group>
		</Stack>
	);
}

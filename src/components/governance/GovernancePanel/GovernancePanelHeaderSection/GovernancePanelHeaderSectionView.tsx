import { Badge, Button, Card, Group, Select, Stack, Text } from "@mantine/core";
import styles from "./GovernancePanelHeaderSectionView.module.css";

export type GovernancePanelHeaderSectionViewProps = {
	quorumLabel: string;
	totalProposals: number;
	votingPowerLabel: string;
	statusText: string;
	connected: boolean;
	canCreateProposal: boolean;
	proposalFilter: string;
	proposalFilterOptions: Array<{ value: string; label: string }>;
	onProposalFilterChange: (value: string) => void;
	onOpenCreateProposal: () => void;
};

export function GovernancePanelHeaderSectionView({
	quorumLabel,
	totalProposals,
	votingPowerLabel,
	statusText,
	connected,
	canCreateProposal,
	proposalFilter,
	proposalFilterOptions,
	onProposalFilterChange,
	onOpenCreateProposal,
}: GovernancePanelHeaderSectionViewProps) {
	const createButtonDisabled = !connected || !canCreateProposal;

	return (
		<Card radius="sm" withBorder shadow="none" padding="lg" className={styles.root}>
			<Stack gap="md">
				<Group justify="space-between" align="flex-start">
					<Stack gap={2}>
						<Text fw={700} size="lg">
							Governanca
						</Text>
						<Text size="sm" c="dimmed">
							As propostas para alterar parametros globais ficam publicas para qualquer pessoa acompanhar.
						</Text>
					</Stack>
					<Badge color="teal" variant="light">
						Quorum: {quorumLabel} RPT
					</Badge>
				</Group>

				<Group grow align="stretch">
					<Card withBorder radius="sm" shadow="none" padding="sm">
						<Text size="xs" tt="uppercase" c="dimmed">
							Propostas
						</Text>
						<Text fw={700}>{totalProposals}</Text>
					</Card>
					<Card withBorder radius="sm" shadow="none" padding="sm">
						<Text size="xs" tt="uppercase" c="dimmed">
							Poder de voto
						</Text>
						<Text fw={700}>{votingPowerLabel}</Text>
					</Card>
					<Card withBorder radius="sm" shadow="none" padding="sm">
						<Text size="xs" tt="uppercase" c="dimmed">
							Status
						</Text>
						<Text fw={700}>{statusText}</Text>
					</Card>
				</Group>

				<Group grow align="flex-end" wrap="wrap">
					<Select
						label="Visibilidade"
						data={proposalFilterOptions}
						value={proposalFilter}
						onChange={(value) => onProposalFilterChange(value ?? "open")}
						clearable={false}
						w={360}
						style={{ flex: "1 1 360px" }}
					/>

					<Button onClick={onOpenCreateProposal} disabled={createButtonDisabled}>
						Nova proposta
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

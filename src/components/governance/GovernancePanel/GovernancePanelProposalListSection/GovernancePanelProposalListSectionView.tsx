import { Alert, Badge, Button, Card, Group, Loader, ScrollArea, Stack, Table, Text } from "@mantine/core";
import type { ReactNode } from "react";
import type { GovernanceProposal } from "@/services/governance/governanceTypes";
import {
	getGovernanceProposalShortStatusLabel,
	getGovernanceProposalStatusColor,
} from "@/services/governance/governancePresentation";
import { formatarEnderecoCurto } from "@/services/wallet/formatters";
import styles from "./GovernancePanelProposalListSectionView.module.css";

export type GovernancePanelProposalListSectionViewProps = {
	loading: boolean;
	error: string | null;
	actionError: string | null;
	connected: boolean;
	quorum: bigint;
	syncedAt: string | null;
	proposals: GovernanceProposal[];
	visibleProposals: GovernanceProposal[];
	votingProposalId: string | null;
	executingProposalId: string | null;
	onOpenDetailsModal: (proposalId: string) => void;
	onOpenVoteModal: (proposalId: string) => void;
	onExecute: (proposalId: string) => Promise<void>;
	now: Date;
};

export function GovernancePanelProposalListSectionView({
	loading,
	error,
	actionError,
	connected,
	quorum,
	syncedAt,
	proposals,
	visibleProposals,
	votingProposalId,
	executingProposalId,
	onOpenDetailsModal,
	onOpenVoteModal,
	onExecute,
	now,
}: GovernancePanelProposalListSectionViewProps) {
	const loadingNode = loading && proposals.length === 0 ? (
		<Group justify="center" py="xl">
			<Loader />
		</Group>
	) : null;

	const emptyNode = !loading && proposals.length === 0 ? (
		<Alert color="blue" title="Nenhuma proposta cadastrada">
			Ainda nao existem propostas para exibir.
		</Alert>
	) : null;

	const errorNode = error ? (
		<Alert color="red" title="Falha ao carregar a governanca">
			{error}
		</Alert>
	) : null;

	const actionErrorNode = actionError ? (
		<Alert color="red" title="Falha na operacao">
			{actionError}
		</Alert>
	) : null;

	const syncedAtNode = syncedAt ? (
		<Text size="xs" c="dimmed">
			Atualizado em {new Date(syncedAt).toLocaleString("pt-BR")}
		</Text>
	) : null;

	let tableNode: ReactNode = null;

	if (visibleProposals.length > 0) {
		tableNode = (
			<ScrollArea type="auto" offsetScrollbars scrollbarSize={8}>
				<Table withTableBorder withColumnBorders highlightOnHover miw={1180} tabularNums>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>ID</Table.Th>
							<Table.Th>Proposta</Table.Th>
							<Table.Th>Prazo</Table.Th>
							<Table.Th>Status</Table.Th>
							<Table.Th>Acoes</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{visibleProposals.map((proposal) => {
							const statusColor = getGovernanceProposalStatusColor(proposal, quorum, now);
							const shortStatusLabel = getGovernanceProposalShortStatusLabel(proposal, quorum, now);
							const votacaoAberta = now.getTime() <= new Date(proposal.deadline).getTime() && !proposal.executed;
							const podeExecutar = !proposal.executed && now.getTime() > new Date(proposal.deadline).getTime();
							const canVoteOnProposal = connected && !proposal.hasVoted && votacaoAberta;
							let proposerLabel = formatarEnderecoCurto(proposal.proposer);
							let voteButton: React.ReactNode = null;
							let executeButton: React.ReactNode = null;

							if (proposal.hasVoted) {
								proposerLabel = "Seu voto ja foi registrado.";
							}

							if (canVoteOnProposal) {
								voteButton = (
									<Button onClick={() => onOpenVoteModal(proposal.id)} loading={votingProposalId === proposal.id}>
										Votar
									</Button>
								);
							}

							if (podeExecutar) {
								executeButton = (
									<Button onClick={() => void onExecute(proposal.id)} loading={executingProposalId === proposal.id} color="teal">
										Executar
									</Button>
								);
							}

							return (
								<Table.Tr key={proposal.id}>
									<Table.Td>#{proposal.id}</Table.Td>
									<Table.Td>
										<Stack gap={4}>
											<Text fw={700}>{proposal.description}</Text>
											<Text size="xs" c="dimmed">
												{proposerLabel}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td>{new Date(proposal.deadline).toLocaleString("pt-BR")}</Table.Td>
									<Table.Td>
										<Badge color={statusColor} variant="light">
											{shortStatusLabel}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Group gap="xs" wrap="nowrap">
											<Button onClick={() => onOpenDetailsModal(proposal.id)} variant="light">
												Detalhes
											</Button>
											{voteButton}
											{executeButton}
										</Group>
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</ScrollArea>
		);
	}

	return (
		<Card padding="lg" withBorder radius="sm" shadow="none" className={styles.root}>
			<Stack gap="md">
				<Stack gap={2}>
					<Text fw={700} size="lg">
						Lista de propostas
					</Text>
				</Stack>

				{errorNode}
				{actionErrorNode}
				{loadingNode}
				{emptyNode}
				{tableNode}
				{syncedAtNode}
			</Stack>
		</Card>
	);
}

"use client";

import { useMemo, useState } from "react";
import {
	Alert,
	Badge,
	Button,
	Card,
	Group,
	Loader,
	Modal,
	Select,
	ScrollArea,
	SegmentedControl,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput,
} from "@mantine/core";
import { formatUnits } from "ethers";
import { formatarEnderecoCurto } from "@/services/wallet/formatters";
import {
	formatGovernanceProposalActionValue,
	getGovernanceProposalActionDescription,
	getGovernanceProposalActionLabel,
	getGovernanceProposalShortStatusLabel,
	getGovernanceProposalStatusColor,
} from "@/services/governance/governancePresentation";
import type { GovernanceProposal, GovernanceProposalAction } from "@/services/governance/governanceTypes";
import styles from "./GovernancePanelView.module.css";

type GovernancePanelSummaryProps = {
	loading: boolean;
	error: string | null;
	connected: boolean;
	canCreateProposal: boolean;
	canVote: boolean;
	votingPower: string;
	walletAddress: string | null;
	quorum: bigint;
	totalProposals: number;
	syncedAt: string | null;
};

type GovernancePanelFormProps = {
	action: GovernanceProposalAction;
	description: string;
	value: string;
	saving: boolean;
	error: string | null;
	onActionChange: (value: GovernanceProposalAction) => void;
	onDescriptionChange: (value: string) => void;
	onValueChange: (value: string) => void;
	onSubmit: () => Promise<boolean>;
};

type GovernancePanelViewProps = {
	summary: GovernancePanelSummaryProps;
	form: GovernancePanelFormProps;
	proposals: GovernanceProposal[];
	selectedProposal: GovernanceProposal | null;
	selectedProposalMode: "details" | "vote" | null;
	actionError: string | null;
	votingProposalId: string | null;
	executingProposalId: string | null;
	onOpenDetailsModal: (proposalId: string) => void;
	onOpenVoteModal: (proposalId: string) => void;
	onCloseVoteModal: () => void;
	onVote: (support: boolean) => Promise<void>;
	onExecute: (proposalId: string) => Promise<void>;
};

type ProposalListFilter = "open" | "voted" | "approved" | "rejected" | "all";

function formatarValorRPT(valor: bigint) {
	return formatUnits(valor, 18);
}

function proposalActionOptions() {
	return [
		{ value: "min_deposit", label: "Deposito minimo" },
		{ value: "tokens_per_eth", label: "Taxa de cambio" },
	];
}

function getValueLabel(action: GovernanceProposalAction) {
	return action === "min_deposit" ? "Novo deposito minimo (RPT)" : "Nova taxa de cambio (RPT por ETH)";
}

function getValuePlaceholder(action: GovernanceProposalAction) {
	return action === "min_deposit" ? "Ex: 150" : "Ex: 10000000";
}

function isProposalOpen(proposal: GovernanceProposal, agora: Date) {
	return !proposal.executed && agora.getTime() <= new Date(proposal.deadline).getTime();
}

function isProposalApproved(proposal: GovernanceProposal, quorum: bigint, agora: Date) {
	const deadline = new Date(proposal.deadline);
	const passouPrazo = agora.getTime() > deadline.getTime();
	const totalVotos = proposal.votesFor + proposal.votesAgainst;
	const aprovadoPelasRegras = totalVotos >= quorum && proposal.votesFor > proposal.votesAgainst;

	return proposal.executed ? proposal.approved : passouPrazo && aprovadoPelasRegras;
}

function isProposalRejected(proposal: GovernanceProposal, quorum: bigint, agora: Date) {
	return !isProposalApproved(proposal, quorum, agora) && (proposal.executed || agora.getTime() > new Date(proposal.deadline).getTime());
}

function getProposalFilterOptions() {
	return [
		{ value: "all", label: "Todas as propostas" },
		{ value: "open", label: "Abertas" },
		{ value: "voted", label: "Votadas" },
		{ value: "approved", label: "Aprovadas" },
		{ value: "rejected", label: "Rejeitadas" },
	];
}

function filterProposals(proposals: GovernanceProposal[], filter: ProposalListFilter, quorum: bigint, agora: Date) {
	if (filter === "all") {
		return proposals;
	}

	return proposals.filter((proposal) => {
		const aberta = isProposalOpen(proposal, agora);
		const votada = aberta && proposal.hasVoted;
		const aprovada = isProposalApproved(proposal, quorum, agora);
		const rejeitada = isProposalRejected(proposal, quorum, agora);

		if (filter === "open") {
			return aberta && !proposal.hasVoted;
		}

		if (filter === "voted") {
			return votada;
		}

		if (filter === "approved") {
			return aprovada;
		}

		return rejeitada;
	});
}

export function GovernancePanelView({
	summary,
	form,
	proposals,
	selectedProposal,
	selectedProposalMode,
	actionError,
	votingProposalId,
	executingProposalId,
	onOpenDetailsModal,
	onOpenVoteModal,
	onCloseVoteModal,
	onVote,
	onExecute,
}: GovernancePanelViewProps) {
	const quorumLabel = useMemo(() => formatarValorRPT(summary.quorum), [summary.quorum]);
	const [proposalFilter, setProposalFilter] = useState<ProposalListFilter>("open");
	const [createProposalOpened, setCreateProposalOpened] = useState(false);
	const now = new Date();
	const visibleProposals = filterProposals(proposals, proposalFilter, summary.quorum, now);
	const statusText = summary.canCreateProposal ? "Pode criar proposta" : summary.canVote ? "Pode votar" : "Somente leitura";

	async function handleCreateProposal() {
		const success = await form.onSubmit();

		if (success) {
			setCreateProposalOpened(false);
		}
	}

	return (
		<Stack gap="lg" className={styles.root}>
			<Card radius="sm" withBorder shadow="none" padding="lg" className={styles.card}>
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
							<Text fw={700}>{summary.totalProposals}</Text>
						</Card>
						<Card withBorder radius="sm" shadow="none" padding="sm">
							<Text size="xs" tt="uppercase" c="dimmed">
								Poder de voto
							</Text>
							<Text fw={700}>{summary.connected ? `${formatarValorRPT(BigInt(summary.votingPower))} RPT` : "0 RPT"}</Text>
						</Card>
						<Card withBorder radius="sm" shadow="none" padding="sm">
							<Text size="xs" tt="uppercase" c="dimmed">
								Status
							</Text>
							<Text fw={700}>{statusText}</Text>
						</Card>
					</Group>

					<Group justify="space-between" align="flex-end" wrap="wrap">
						<Select
							label="Visibilidade"
							data={getProposalFilterOptions()}
							value={proposalFilter}
							onChange={(value) => setProposalFilter((value as ProposalListFilter) ?? "open")}
							clearable={false}
							w={360}
							style={{ flex: "1 1 360px" }}
						/>

						<Button onClick={() => setCreateProposalOpened(true)} disabled={!summary.connected || !summary.canCreateProposal}>
							Nova proposta
						</Button>
					</Group>
				</Stack>
			</Card>

			{summary.error ? <Alert color="red" title="Falha ao carregar a governanca">{summary.error}</Alert> : null}

			<Card padding="lg" withBorder radius="sm" shadow="none" className={styles.card}>
				<Stack gap="md">
					<Stack gap={2}>
						<Text fw={700} size="lg">
							Lista de propostas
						</Text>
					</Stack>

					{actionError ? <Alert color="red" title="Falha na operacao">{actionError}</Alert> : null}

					{summary.loading && proposals.length === 0 ? (
						<Group justify="center" py="xl">
							<Loader />
						</Group>
					) : null}

					{!summary.loading && proposals.length === 0 ? (
						<Alert color="blue" title="Nenhuma proposta cadastrada">
							Ainda nao existem propostas para exibir.
						</Alert>
					) : null}

					{visibleProposals.length > 0 ? (
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
										const statusColor = getGovernanceProposalStatusColor(proposal, summary.quorum, now);
										const shortStatusLabel = getGovernanceProposalShortStatusLabel(proposal, summary.quorum, now);
										const votacaoAberta = isProposalOpen(proposal, now);
										const podeExecutar = !proposal.executed && now.getTime() > new Date(proposal.deadline).getTime();
										const hasVotePermission = summary.connected && summary.canVote && !proposal.hasVoted && votacaoAberta;
										return (
											<Table.Tr key={proposal.id}>
												<Table.Td>#{proposal.id}</Table.Td>
												<Table.Td>
													<Stack gap={4}>
														<Text fw={700}>{proposal.description}</Text>
														<Text size="xs" c="dimmed">
															{proposal.hasVoted ? "Seu voto ja foi registrado." : formatarEnderecoCurto(proposal.proposer)}
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

														{hasVotePermission ? (
															<Button onClick={() => onOpenVoteModal(proposal.id)} loading={votingProposalId === proposal.id}>
																Votar
															</Button>
														) : null}

														{podeExecutar ? (
															<Button onClick={() => void onExecute(proposal.id)} loading={executingProposalId === proposal.id} color="teal">
																Executar
															</Button>
														) : null}
													</Group>
												</Table.Td>
											</Table.Tr>
										);
									})}
								</Table.Tbody>
							</Table>
						</ScrollArea>
					) : null}

					{summary.syncedAt ? (
						<Text size="xs" c="dimmed">
							Atualizado em {new Date(summary.syncedAt).toLocaleString("pt-BR")}
						</Text>
					) : null}
				</Stack>
			</Card>

			<Modal opened={createProposalOpened} onClose={() => setCreateProposalOpened(false)} title="Criar proposta" centered>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						Selecione o tipo de modificacao, descreva o motivo e informe o novo valor. A proposta entra direto na tabela de votacao.
					</Text>

					{!summary.connected ? (
						<Alert color="gray" title="Carteira desconectada">
							Conecte uma carteira para criar propostas.
						</Alert>
					) : null}

					{summary.connected && !summary.canCreateProposal ? (
						<Alert color="yellow" title="Sem permissao para propor">
							Esta carteira pode acompanhar as votacoes, mas ainda nao pode criar novas propostas.
						</Alert>
					) : null}

					{form.error ? <Alert color="red" title="Nao foi possivel criar a proposta">{form.error}</Alert> : null}

					<SegmentedControl
						value={form.action}
						onChange={(value) => form.onActionChange(value as GovernanceProposalAction)}
						data={proposalActionOptions()}
						fullWidth
					/>

					<Textarea
						label="Descricao"
						description="Explique o motivo da mudanca. O texto fica visivel para todos os votantes."
						minRows={4}
						value={form.description}
						onChange={(event) => form.onDescriptionChange(event.currentTarget.value)}
						disabled={form.saving || !summary.connected || !summary.canCreateProposal}
					/>

					<TextInput
						label={getValueLabel(form.action)}
						description={getGovernanceProposalActionDescription(form.action)}
						placeholder={getValuePlaceholder(form.action)}
						value={form.value}
						onChange={(event) => form.onValueChange(event.currentTarget.value)}
						disabled={form.saving || !summary.connected || !summary.canCreateProposal}
					/>

					<Group justify="space-between" align="center">
						<Text size="sm" c="dimmed">
							{summary.connected ? `Carteira: ${summary.walletAddress ?? "desconhecida"}` : "Conecte a carteira para continuar"}
						</Text>
						<Button
							onClick={() => void handleCreateProposal()}
							loading={form.saving}
							disabled={!summary.connected || !summary.canCreateProposal}
						>
							Criar proposta
						</Button>
					</Group>
				</Stack>
			</Modal>

			<Modal
				opened={selectedProposal !== null}
				onClose={onCloseVoteModal}
				title={selectedProposalMode === "vote" ? "Confirmar voto" : "Detalhes da proposta"}
				centered
			>
				{selectedProposal ? (
					<Stack gap="md">
						<Stack gap={2}>
							<Text fw={700}>Detalhes da proposta</Text>
							<Text size="sm" c="dimmed">
								{selectedProposal.description}
							</Text>
						</Stack>
						<Group gap="xs">
							<Badge color="gray" variant="light">
								#{selectedProposal.id}
							</Badge>
							<Badge color={getGovernanceProposalStatusColor(selectedProposal, summary.quorum, now)} variant="light">
								{getGovernanceProposalShortStatusLabel(selectedProposal, summary.quorum, now)}
							</Badge>
						</Group>
						<Text size="sm">
							{getGovernanceProposalActionLabel(selectedProposal.action)} -{" "}
							{formatGovernanceProposalActionValue(selectedProposal.action, selectedProposal.actionValue)}
						</Text>
						<Text size="sm" c="dimmed">
							Prazo: {new Date(selectedProposal.deadline).toLocaleString("pt-BR")}
						</Text>
						<Text size="sm" c="dimmed">
							Votos: {formatarValorRPT(selectedProposal.votesFor)} a favor e {formatarValorRPT(selectedProposal.votesAgainst)} contra
						</Text>
						{selectedProposalMode === "vote" ? (
							<>
								<Text size="sm" c="dimmed">
									Seu poder de voto: {summary.connected ? `${formatUnits(BigInt(summary.votingPower || "0"), 18)} RPT` : "0 RPT"}
								</Text>
								<Text fw={700}>Aprova esta proposta?</Text>
								<Group justify="space-between">
									<Button variant="light" color="red" onClick={() => void onVote(false)} loading={votingProposalId === selectedProposal.id}>
										Nao
									</Button>
									<Button color="teal" onClick={() => void onVote(true)} loading={votingProposalId === selectedProposal.id}>
										Sim
									</Button>
								</Group>
							</>
						) : (
							<Group justify="flex-end">
								<Button onClick={onCloseVoteModal}>Fechar</Button>
							</Group>
						)}
					</Stack>
				) : null}
			</Modal>
		</Stack>
	);
}

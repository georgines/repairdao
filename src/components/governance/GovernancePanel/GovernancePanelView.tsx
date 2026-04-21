"use client";

import { useMemo, useState } from "react";
import { formatUnits } from "ethers";
import type { GovernanceProposal, GovernanceProposalAction } from "@/services/governance/governanceTypes";
import { GovernancePanelHeaderSection } from "./GovernancePanelHeaderSection/GovernancePanelHeaderSection";
import { GovernancePanelProposalListSection } from "./GovernancePanelProposalListSection/GovernancePanelProposalListSection";
import { GovernancePanelCreateProposalModal } from "./GovernancePanelCreateProposalModal/GovernancePanelCreateProposalModal";
import { GovernancePanelProposalModal } from "./GovernancePanelProposalModal/GovernancePanelProposalModal";
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

function getProposalFilterOptions() {
	return [
		{ value: "all", label: "Todas as propostas" },
		{ value: "open", label: "Abertas" },
		{ value: "voted", label: "Votadas" },
		{ value: "approved", label: "Aprovadas" },
		{ value: "rejected", label: "Rejeitadas" },
	];
}

function isProposalOpen(proposal: GovernanceProposal, agora: Date) {
	return !proposal.executed && agora.getTime() <= new Date(proposal.deadline).getTime();
}

function isProposalApproved(proposal: GovernanceProposal, quorum: bigint, agora: Date) {
	const deadline = new Date(proposal.deadline);
	const passouPrazo = agora.getTime() > deadline.getTime();
	const totalVotos = proposal.votesFor + proposal.votesAgainst;
	const aprovadoPelasRegras = totalVotos >= quorum && proposal.votesFor > proposal.votesAgainst;

	if (proposal.executed) {
		return proposal.approved;
	}

	return passouPrazo && aprovadoPelasRegras;
}

function isProposalRejected(proposal: GovernanceProposal, quorum: bigint, agora: Date) {
	return !isProposalApproved(proposal, quorum, agora) && (proposal.executed || agora.getTime() > new Date(proposal.deadline).getTime());
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

function getVotingPowerLabel(connected: boolean, votingPower: string) {
	if (!connected) {
		return "0 RPT";
	}

	return `${formatUnits(BigInt(votingPower || "0"), 18)} RPT`;
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
	const [proposalFilter, setProposalFilter] = useState<ProposalListFilter>("open");
	const [createProposalOpened, setCreateProposalOpened] = useState(false);
	const now = new Date();
	const visibleProposals = filterProposals(proposals, proposalFilter, summary.quorum, now);
	const quorumLabel = useMemo(() => formatUnits(summary.quorum, 18), [summary.quorum]);
	const votingPowerLabel = getVotingPowerLabel(summary.connected, summary.votingPower);
	let statusText = "Somente leitura";

	if (summary.canVote) {
		statusText = "Pode votar";
	}

	if (summary.canCreateProposal) {
		statusText = "Pode criar proposta";
	}

	return (
		<main className={styles.root}>
			<GovernancePanelHeaderSection
				quorumLabel={quorumLabel}
				totalProposals={summary.totalProposals}
				votingPowerLabel={votingPowerLabel}
				statusText={statusText}
				connected={summary.connected}
				canCreateProposal={summary.canCreateProposal}
				proposalFilter={proposalFilter}
				proposalFilterOptions={getProposalFilterOptions()}
				onProposalFilterChange={setProposalFilter}
				onOpenCreateProposal={() => setCreateProposalOpened(true)}
			/>

			<GovernancePanelProposalListSection
				loading={summary.loading}
				error={summary.error}
				actionError={actionError}
				connected={summary.connected}
				quorum={summary.quorum}
				syncedAt={summary.syncedAt}
				proposals={proposals}
				visibleProposals={visibleProposals}
				votingProposalId={votingProposalId}
				executingProposalId={executingProposalId}
				onOpenDetailsModal={onOpenDetailsModal}
				onOpenVoteModal={onOpenVoteModal}
				onExecute={onExecute}
				now={now}
			/>

			<GovernancePanelCreateProposalModal
				opened={createProposalOpened}
				connected={summary.connected}
				canCreateProposal={summary.canCreateProposal}
				walletAddress={summary.walletAddress}
				form={form}
				onClose={() => setCreateProposalOpened(false)}
			/>

			<GovernancePanelProposalModal
				selectedProposal={selectedProposal}
				selectedProposalMode={selectedProposalMode}
				quorum={summary.quorum}
				connected={summary.connected}
				votingPower={summary.votingPower}
				onClose={onCloseVoteModal}
				onVote={onVote}
				votingProposalId={votingProposalId}
			/>
		</main>
	);
}

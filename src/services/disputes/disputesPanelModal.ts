import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { normalizarEnderecoComparacao } from "@/services/wallet/formatters";
import { getVoteOptionLabels, isParticipant } from "@/services/disputes/disputesPanelDomain";

export type DisputesPanelModalDispute = {
	request: ServiceRequestSummary;
	contract: DisputaContratoDominio | null;
};

export type DisputesPanelModalState = {
	selectedState: DisputaContratoDominio["estado"] | undefined;
	selectedResolved: boolean;
	selectedVotingWindow: boolean;
	selectedEncerrada: boolean;
	selectedIsParticipant: boolean;
	selectedVoteAlreadySubmitted: boolean;
	selectedVoteChoice: boolean | undefined;
	selectedVoteLocked: boolean;
	selectedVoteSupportOpener: boolean;
	selectedEvidenceAlreadySubmitted: boolean;
	selectedCanSendEvidence: boolean;
	selectedCanVote: boolean;
	selectedCanResolve: boolean;
	voteOptionLabels: { openerLabel: string; opposingLabel: string };
	disputeTitle: string;
	disputeSubtitle: string;
};

export type BuildDisputesPanelModalStateInput = {
	selectedDispute: DisputesPanelModalDispute | null;
	walletAddress: string | null;
	connected: boolean;
	voteSupportOpener: boolean;
	votedDisputeIds: number[];
	votedDisputeChoices: Record<number, boolean>;
	evidenceSubmittedDisputeIds: number[];
};

export function buildDisputesPanelModalState({
	selectedDispute,
	walletAddress,
	connected,
	voteSupportOpener,
	votedDisputeIds,
	votedDisputeChoices,
	evidenceSubmittedDisputeIds,
}: BuildDisputesPanelModalStateInput): DisputesPanelModalState | null {
	if (selectedDispute === null) {
		return null;
	}

	const selectedState = selectedDispute.contract?.estado;
	const selectedResolved = selectedDispute.contract?.resolved === true || selectedState === "resolvida";
	const selectedVotingWindow = selectedState === "janela_votacao";
	const selectedEncerrada = selectedState === "encerrada";
	const selectedIsParticipant = isParticipant(walletAddress, selectedDispute);
	const selectedVoteAlreadySubmitted = votedDisputeIds.includes(selectedDispute.request.id);
	const selectedVoteChoice = votedDisputeChoices[selectedDispute.request.id];
	const selectedVoteLocked = selectedVoteAlreadySubmitted && selectedVoteChoice !== undefined;
	const selectedVoteSupportOpener = selectedVoteChoice ?? voteSupportOpener;
	const selectedEvidenceAlreadySubmitted = evidenceSubmittedDisputeIds.includes(selectedDispute.request.id);
	const selectedCanSendEvidence = connected && selectedVotingWindow && selectedIsParticipant && !selectedEvidenceAlreadySubmitted;
	const selectedCanVote = connected && selectedVotingWindow && !selectedIsParticipant;
	const selectedCanResolve = connected && selectedEncerrada;
	const voteOptionLabels = getVoteOptionLabels(selectedDispute);
	const disputeTitle = selectedDispute.request.description ?? "Disputa";
	const disputeSubtitle = `Ordem ${selectedDispute.request.id} · ${selectedDispute.request.clientName} x ${selectedDispute.request.technicianName}`;

	return {
		selectedState,
		selectedResolved,
		selectedVotingWindow,
		selectedEncerrada,
		selectedIsParticipant,
		selectedVoteAlreadySubmitted,
		selectedVoteChoice,
		selectedVoteLocked,
		selectedVoteSupportOpener,
		selectedEvidenceAlreadySubmitted,
		selectedCanSendEvidence,
		selectedCanVote,
		selectedCanResolve,
		voteOptionLabels,
		disputeTitle,
		disputeSubtitle,
	};
}

export type DisputesPanelModalActionKind = "disconnected" | "resolved" | "evidence" | "vote" | "resolve" | "fallback";

export type BuildDisputesPanelModalActionKindInput = {
	connected: boolean;
	selectedResolved: boolean;
	selectedCanSendEvidence: boolean;
	selectedCanVote: boolean;
	selectedCanResolve: boolean;
};

export function buildDisputesPanelModalActionKind({
	connected,
	selectedResolved,
	selectedCanSendEvidence,
	selectedCanVote,
	selectedCanResolve,
}: BuildDisputesPanelModalActionKindInput): DisputesPanelModalActionKind {
	if (!connected) {
		return "disconnected";
	}

	if (selectedResolved) {
		return "resolved";
	}

	if (selectedCanSendEvidence) {
		return "evidence";
	}

	if (selectedCanVote) {
		return "vote";
	}

	if (selectedCanResolve) {
		return "resolve";
	}

	return "fallback";
}

export function formatDisputesPanelModalDateTime(value?: string) {
	if (!value) {
		return "-";
	}

	return new Date(value).toLocaleString("pt-BR");
}

export function getDisputesPanelEvidenceRoleLabel(
	submittedBy: string,
	dispute: DisputesPanelModalDispute,
) {
	const author = normalizarEnderecoComparacao(submittedBy);
	const client = normalizarEnderecoComparacao(dispute.request.clientAddress);
	const technician = normalizarEnderecoComparacao(dispute.request.technicianAddress);

	if (author && author === client) {
		return "Cliente";
	}

	if (author && author === technician) {
		return "Tecnico";
	}

	return null;
}

import { formatUnits } from "ethers";
import type { GovernanceProposal, GovernanceProposalAction } from "@/services/governance/governanceTypes";

export function getGovernanceProposalActionLabel(action: GovernanceProposalAction) {
	if (action === "tokens_per_eth") {
		return "Taxa de cambio";
	}

	return "Deposito minimo";
}

export function getGovernanceProposalActionDescription(action: GovernanceProposalAction) {
	if (action === "tokens_per_eth") {
		return "Ajusta a taxa de cambio: quantos RPT valem 1 ETH.";
	}

	return "Ajusta o valor minimo de deposito em RPT.";
}

export function formatGovernanceProposalActionValue(action: GovernanceProposalAction, actionValue: bigint) {
	if (action === "tokens_per_eth") {
		return `${actionValue.toString()} RPT por ETH`;
	}

	return `${formatUnits(actionValue, 18)} RPT`;
}

export function getGovernanceProposalStatusLabel(
	proposal: GovernanceProposal,
	quorum: bigint,
	agora = new Date(),
) {
	const deadline = new Date(proposal.deadline);
	const passouPrazo = agora.getTime() > deadline.getTime();
	const totalVotos = proposal.votesFor + proposal.votesAgainst;
	const aprovadoPelasRegras = totalVotos >= quorum && proposal.votesFor > proposal.votesAgainst;

	if (proposal.executed) {
		return proposal.approved ? "Aprovada" : "Rejeitada";
	}

	if (!passouPrazo) {
		return "Em votacao";
	}

	return aprovadoPelasRegras ? "Aprovada, aguardando execucao" : "Rejeitada, aguardando execucao";
}

export function getGovernanceProposalStatusColor(
	proposal: GovernanceProposal,
	quorum: bigint,
	agora = new Date(),
) {
	const label = getGovernanceProposalStatusLabel(proposal, quorum, agora);

	if (label.startsWith("Aprovada")) {
		return "teal" as const;
	}

	if (label.startsWith("Rejeitada")) {
		return "red" as const;
	}

	return "yellow" as const;
}

export function getGovernanceProposalShortStatusLabel(
	proposal: GovernanceProposal,
	quorum: bigint,
	agora = new Date(),
) {
	const deadline = new Date(proposal.deadline);
	const passouPrazo = agora.getTime() > deadline.getTime();
	const totalVotos = proposal.votesFor + proposal.votesAgainst;
	const aprovadoPelasRegras = totalVotos >= quorum && proposal.votesFor > proposal.votesAgainst;

	if (proposal.executed) {
		return proposal.approved ? "Aprovada" : "Rejeitada";
	}

	if (passouPrazo) {
		return aprovadoPelasRegras ? "Aprovada" : "Rejeitada";
	}

	if (proposal.hasVoted) {
		return "Votada";
	}

	return "Aberta";
}

export function getGovernanceProposalResultLabel(
	proposal: GovernanceProposal,
	quorum: bigint,
	agora = new Date(),
) {
	const label = getGovernanceProposalStatusLabel(proposal, quorum, agora);

	if (label === "Em votacao") {
		return "Resultado pendente";
	}

	if (label.startsWith("Aprovada")) {
		return "Aprovada";
	}

	return "Rejeitada";
}

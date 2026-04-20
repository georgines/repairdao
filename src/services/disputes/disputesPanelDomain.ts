import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { normalizarEnderecoComparacao } from "@/services/wallet/formatters";

export type DisputesPanelDomainDispute = {
	request: ServiceRequestSummary;
	contract: DisputaContratoDominio | null;
};

export function getDisputeParticipantRoleLabel(address: string | null | undefined, dispute: DisputesPanelDomainDispute | null) {
	const normalizedAddress = normalizarEnderecoComparacao(address);
	const client = normalizarEnderecoComparacao(dispute?.request.clientAddress);
	const technician = normalizarEnderecoComparacao(dispute?.request.technicianAddress);

	if (normalizedAddress && normalizedAddress === client) {
		return "Cliente";
	}

	if (normalizedAddress && normalizedAddress === technician) {
		return "Tecnico";
	}

	return null;
}

export function getEvidenceRoleLabel(evidence: EvidenciaContratoDominio, dispute: DisputesPanelDomainDispute | null) {
	const author = normalizarEnderecoComparacao(evidence.submittedBy);
	const client = normalizarEnderecoComparacao(dispute?.request.clientAddress);
	const technician = normalizarEnderecoComparacao(dispute?.request.technicianAddress);

	if (author && author === client) {
		return "Cliente";
	}

	if (author && author === technician) {
		return "Tecnico";
	}

	return null;
}

export function isParticipant(walletAddress: string | null, dispute: DisputesPanelDomainDispute | null) {
	if (!walletAddress || !dispute) {
		return false;
	}

	const normalizedWallet = normalizarEnderecoComparacao(walletAddress);

	return normalizedWallet === normalizarEnderecoComparacao(dispute.request.clientAddress)
		|| normalizedWallet === normalizarEnderecoComparacao(dispute.request.technicianAddress);
}

export function getVoteOptionLabels(dispute: DisputesPanelDomainDispute | null) {
	const openerRole = getDisputeParticipantRoleLabel(dispute?.contract?.openedBy, dispute);
	const opposingRole = openerRole === "Cliente" ? "Tecnico" : openerRole === "Tecnico" ? "Cliente" : null;

	return {
		openerLabel: openerRole ? `Apoiar quem abriu (${openerRole})` : "Apoiar quem abriu",
		opposingLabel: opposingRole ? `Apoiar a outra parte (${opposingRole})` : "Apoiar a outra parte",
	};
}

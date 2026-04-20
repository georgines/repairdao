import { formatUnits } from "ethers";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { normalizarEnderecoComparacao } from "@/services/wallet/formatters";

export function formatDateTime(value?: string) {
	if (!value) {
		return "-";
	}

	return new Date(value).toLocaleString("pt-BR");
}

export function formatVoteValue(value?: bigint) {
	if (value === undefined) {
		return "0";
	}

	const rawValue = formatUnits(value, 18);
	const [integerPart, fractionPart] = rawValue.split(".");
	const formattedInteger = new Intl.NumberFormat("pt-BR").format(BigInt(integerPart));

	if (!fractionPart) {
		return formattedInteger;
	}

	const trimmedFraction = fractionPart.replace(/0+$/, "");

	return trimmedFraction.length > 0 ? `${formattedInteger},${trimmedFraction}` : formattedInteger;
}

export function statusLabel(status?: DisputaContratoDominio["estado"]) {
	switch (status) {
		case "aberta":
			return "Aberta";
		case "janela_votacao":
			return "Votacao aberta";
		case "encerrada":
			return "Votacao encerrada";
		case "resolvida":
			return "Resolvida";
		default:
			return "Em disputa";
	}
}

export function statusColor(status?: DisputaContratoDominio["estado"]) {
	switch (status) {
		case "aberta":
			return "blue";
		case "janela_votacao":
			return "yellow";
		case "encerrada":
			return "orange";
		case "resolvida":
			return "gray";
		default:
			return "red";
	}
}

export function isEnderecoLike(valor: string | null | undefined) {
	return typeof valor === "string" && /^0x[a-fA-F0-9]{6,}$/.test(valor.trim());
}

export function formatParticipantIdentity(name: string | null | undefined, address: string | null | undefined) {
	const trimmedName = name?.trim();

	if (trimmedName && !isEnderecoLike(trimmedName)) {
		return trimmedName;
	}

	return address ?? "-";
}

export function getDisputeParticipantRoleLabel(address: string | null | undefined, dispute: DisputeItem | null) {
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

export function getEvidenceRoleLabel(evidence: EvidenciaContratoDominio, dispute: DisputeItem | null) {
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

export function getVoteOptionLabels(dispute: DisputeItem | null) {
	const openerRole = getDisputeParticipantRoleLabel(dispute?.contract?.openedBy, dispute);
	const opposingRole = openerRole === "Cliente" ? "Tecnico" : openerRole === "Tecnico" ? "Cliente" : null;

	return {
		openerLabel: openerRole ? `Apoiar quem abriu (${openerRole})` : "Apoiar quem abriu",
		opposingLabel: opposingRole ? `Apoiar a outra parte (${opposingRole})` : "Apoiar a outra parte",
	};
}

export function isParticipant(walletAddress: string | null, dispute: DisputeItem | null) {
	if (!walletAddress || !dispute) {
		return false;
	}

	const normalizedWallet = normalizarEnderecoComparacao(walletAddress);

	return normalizedWallet === normalizarEnderecoComparacao(dispute.request.clientAddress)
		|| normalizedWallet === normalizarEnderecoComparacao(dispute.request.technicianAddress);
}

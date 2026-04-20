import { formatUnits } from "ethers";
import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
export {
	getDisputeParticipantRoleLabel,
	getEvidenceRoleLabel,
	getVoteOptionLabels,
	isParticipant,
	type DisputesPanelDomainDispute,
} from "@/services/disputes/disputesPanelDomain";

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

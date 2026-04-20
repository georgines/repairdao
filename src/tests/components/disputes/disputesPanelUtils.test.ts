// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { formatDateTime, formatParticipantIdentity, formatVoteValue, getDisputeParticipantRoleLabel, getEvidenceRoleLabel, getVoteOptionLabels, isEnderecoLike, isParticipant, statusColor, statusLabel } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";

describe("disputes panel utils", () => {
	const disputeRequest = {
		id: 21,
		clientAddress: "0xcliente",
		clientName: "Cliente 1",
		technicianAddress: "0xtec",
		technicianName: "Tecnico 1",
		description: "Troca de tomadas",
		status: "disputada",
		budgetAmount: 250,
		acceptedAt: "2026-04-17T10:00:00.000Z",
		budgetSentAt: "2026-04-17T11:00:00.000Z",
		clientAcceptedAt: "2026-04-17T12:00:00.000Z",
		completedAt: "2026-04-17T13:00:00.000Z",
		disputedAt: "2026-04-17T14:00:00.000Z",
		disputeReason: "Servico fora do combinado",
		createdAt: "2026-04-17T09:00:00.000Z",
		updatedAt: "2026-04-17T14:00:00.000Z",
	} satisfies DisputeItem["request"];

	const disputeContract = {
		id: "21",
		estado: "janela_votacao",
		ordemId: "21",
		motivo: "Servico fora do combinado",
		openedBy: "0xcliente",
		opposingParty: "0xtec",
		votesForOpener: 3n,
		votesForOpposing: 1n,
		deadline: "2026-04-18T12:00:00.000Z",
		resolved: false,
	} satisfies DisputaContratoDominio;

	const dispute = {
		request: disputeRequest,
		contract: disputeContract,
	} satisfies DisputeItem;

	it("cobre formatações e labels base", () => {
		expect(formatDateTime()).toBe("-");
		expect(formatDateTime("2026-04-17T10:00:00.000Z")).toContain("17/04/2026");
		expect(formatVoteValue()).toBe("0");
		expect(formatVoteValue(3n)).toBe("0,000000000000000003");
		expect(statusLabel()).toBe("Em disputa");
		expect(statusLabel("aberta")).toBe("Aberta");
		expect(statusLabel("janela_votacao")).toBe("Votacao aberta");
		expect(statusLabel("encerrada")).toBe("Votacao encerrada");
		expect(statusLabel("resolvida")).toBe("Resolvida");
		expect(statusColor()).toBe("red");
		expect(statusColor("aberta")).toBe("blue");
		expect(statusColor("janela_votacao")).toBe("yellow");
		expect(statusColor("encerrada")).toBe("orange");
		expect(statusColor("resolvida")).toBe("gray");
	});

	it("cobre identificacao e participacao", () => {
		expect(isEnderecoLike("0x123456")).toBe(true);
		expect(isEnderecoLike("Cliente 1")).toBe(false);
		expect(formatParticipantIdentity("Cliente 1", "0xcliente")).toBe("Cliente 1");
		expect(formatParticipantIdentity("0x123456", "0xcliente")).toBe("0xcliente");
		expect(getDisputeParticipantRoleLabel("0xCLIENTE", dispute)).toBe("Cliente");
		expect(getDisputeParticipantRoleLabel("0xTEC", dispute)).toBe("Tecnico");
		expect(getDisputeParticipantRoleLabel("0xoutro", dispute)).toBeNull();
		const evidence: EvidenciaContratoDominio = { submittedBy: "0xtec", content: "Resposta", timestamp: "2026-04-17T16:00:00.000Z" };
		expect(getEvidenceRoleLabel(evidence, dispute)).toBe("Tecnico");
		expect(getVoteOptionLabels(dispute).openerLabel).toContain("Cliente");
		expect(getVoteOptionLabels(dispute).opposingLabel).toContain("Tecnico");
		expect(isParticipant("0xcliente", dispute)).toBe(true);
		expect(isParticipant("0xoutra", dispute)).toBe(false);
	});
});
import { describe, expect, it } from "vitest";
import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import {
	buildDisputesPanelModalActionKind,
	buildDisputesPanelModalState,
} from "@/services/disputes/disputesPanelModal";

const request: ServiceRequestSummary = {
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
};

const contract: DisputaContratoDominio = {
	id: "21",
	estado: "janela_votacao",
	ordemId: "21",
	motivo: "Servico fora do combinado",
	openedBy: "0xcliente",
	opposingParty: "0xtec",
	votesForOpener: 3,
	votesForOpposing: 1,
	deadline: "2026-04-18T12:00:00.000Z",
	resolved: false,
};

describe("services/disputes/disputesPanelModal", () => {
	it("deriva o estado da disputa aberta corretamente", () => {
		const state = buildDisputesPanelModalState({
			selectedDispute: { request, contract },
			walletAddress: "0xOUTRO",
			connected: true,
			voteSupportOpener: true,
			votedDisputeIds: [],
			votedDisputeChoices: {},
			evidenceSubmittedDisputeIds: [],
		});

		expect(state?.disputeTitle).toBe("Troca de tomadas");
		expect(state?.selectedCanVote).toBe(true);
		expect(state?.selectedCanSendEvidence).toBe(false);
		expect(state?.selectedCanResolve).toBe(false);
		expect(state?.voteOptionLabels.openerLabel).toContain("quem abriu");
	});

	it("deriva estados alternativos e retornos nulos", () => {
		expect(
			buildDisputesPanelModalState({
				selectedDispute: null,
				walletAddress: null,
				connected: false,
				voteSupportOpener: false,
				votedDisputeIds: [],
				votedDisputeChoices: {},
				evidenceSubmittedDisputeIds: [],
			}),
		).toBeNull();

		const resolvedState = buildDisputesPanelModalState({
			selectedDispute: { request, contract: { ...contract, estado: "resolvida", resolved: true } },
			walletAddress: "0xcliente",
			connected: true,
			voteSupportOpener: false,
			votedDisputeIds: [21],
			votedDisputeChoices: { 21: false },
			evidenceSubmittedDisputeIds: [21],
		});
		expect(resolvedState?.selectedResolved).toBe(true);
		expect(resolvedState?.selectedVoteLocked).toBe(true);
		expect(resolvedState?.selectedEvidenceAlreadySubmitted).toBe(true);

		const evidenceState = buildDisputesPanelModalState({
			selectedDispute: { request, contract: { ...contract } },
			walletAddress: "0xcliente",
			connected: true,
			voteSupportOpener: false,
			votedDisputeIds: [],
			votedDisputeChoices: {},
			evidenceSubmittedDisputeIds: [],
		});
		expect(evidenceState?.selectedCanSendEvidence).toBe(true);
		expect(evidenceState?.selectedCanVote).toBe(false);

		const resolveState = buildDisputesPanelModalState({
			selectedDispute: { request, contract: { ...contract, estado: "encerrada" } },
			walletAddress: "0xcliente",
			connected: true,
			voteSupportOpener: false,
			votedDisputeIds: [],
			votedDisputeChoices: {},
			evidenceSubmittedDisputeIds: [],
		});
		expect(resolveState?.selectedCanResolve).toBe(true);
	});

	it("seleciona a primeira acao valida na ordem esperada", () => {
		expect(
			buildDisputesPanelModalActionKind({
				connected: false,
				selectedResolved: false,
				selectedCanSendEvidence: false,
				selectedCanVote: false,
				selectedCanResolve: false,
			}),
		).toBe("disconnected");

		expect(
			buildDisputesPanelModalActionKind({
				connected: true,
				selectedResolved: false,
				selectedCanSendEvidence: false,
				selectedCanVote: true,
				selectedCanResolve: true,
			}),
		).toBe("vote");

		expect(
			buildDisputesPanelModalActionKind({
				connected: true,
				selectedResolved: false,
				selectedCanSendEvidence: false,
				selectedCanVote: false,
				selectedCanResolve: false,
			}),
		).toBe("fallback");
	});
});

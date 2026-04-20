// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { useDisputesPanelModalState } from "@/hooks/useDisputesPanelModalState";
import { useDisputesPanelModalActions } from "@/hooks/useDisputesPanelModalActions";

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
	votesForOpener: 3n,
	votesForOpposing: 1n,
	deadline: "2026-04-18T12:00:00.000Z",
	resolved: false,
};

describe("hooks/useDisputesPanelModal", () => {
	it("deriva o estado do modal da disputa", () => {
		const { result } = renderHook(() =>
			useDisputesPanelModalState({
				selectedDispute: { request, contract },
				walletAddress: "0xOUTRO",
				connected: true,
				voteSupportOpener: true,
				votedDisputeIds: [21],
				votedDisputeChoices: { 21: false },
				evidenceSubmittedDisputeIds: [99],
			}),
		);

		expect(result.current?.selectedResolved).toBe(false);
		expect(result.current?.selectedCanVote).toBe(true);
		expect(result.current?.selectedVoteLocked).toBe(true);
		expect(result.current?.selectedVoteSupportOpener).toBe(false);
		expect(result.current?.selectedEvidenceAlreadySubmitted).toBe(false);
	});

	it("define a acao do modal na ordem esperada", () => {
		const disconnected = renderHook(() =>
			useDisputesPanelModalActions({
				connected: false,
				selectedResolved: false,
				selectedCanSendEvidence: false,
				selectedCanVote: false,
				selectedCanResolve: false,
			}),
		);

		const evidence = renderHook(() =>
			useDisputesPanelModalActions({
				connected: true,
				selectedResolved: false,
				selectedCanSendEvidence: true,
				selectedCanVote: true,
				selectedCanResolve: true,
			}),
		);

		expect(disconnected.result.current).toBe("disconnected");
		expect(evidence.result.current).toBe("evidence");
	});
});

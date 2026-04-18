// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import { DisputesPanelView } from "@/components/disputes/DisputesPanel/DisputesPanelView";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

const disputeRequest: ServiceRequestSummary = {
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

const disputeContract: DisputaContratoDominio = {
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

const disputeEvidence: EvidenciaContratoDominio[] = [
	{
		submittedBy: "0xcliente",
		content: "Fotos do defeito",
		timestamp: "2026-04-17T15:00:00.000Z",
	},
];

describe("components/disputes/DisputesPanelView", () => {
	beforeEach(() => {
		(globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("mostra o formulario de evidencia para quem participa", () => {
		const onSubmitEvidence = vi.fn();

		renderWithMantine(
			<DisputesPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				perfilAtivo="cliente"
				loading={false}
				error={null}
				disputes={[{ request: disputeRequest, contract: disputeContract }]}
				visibleDisputes={[{ request: disputeRequest, contract: disputeContract }]}
				selectedDisputeId={21}
				selectedDispute={{ request: disputeRequest, contract: disputeContract }}
				selectedEvidence={disputeEvidence}
				evidenceDraft="Nova prova"
				voteSupportOpener
				busyDisputeId={null}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={vi.fn()}
				onSubmitEvidence={onSubmitEvidence}
				onSubmitVote={vi.fn()}
			/>,
		);

		expect(screen.getByText("Acompanhe e participe das disputas")).toBeDefined();
		expect(screen.getByRole("heading", { name: "Enviar evidencia" })).toBeDefined();
		expect(screen.queryByText("Votar na disputa")).toBeNull();
		expect(screen.getByText("Fotos do defeito")).toBeDefined();

		fireEvent.click(screen.getByRole("button", { name: "Enviar evidencia" }));
		expect(onSubmitEvidence).toHaveBeenCalledTimes(1);
	});

	it("mostra o voto para quem nao participa", () => {
		const onVoteSupportChange = vi.fn();
		const onSubmitVote = vi.fn();

		renderWithMantine(
			<DisputesPanelView
				connected
				walletAddress="0xvotante"
				walletNotice={null}
				perfilAtivo={null}
				loading={false}
				error={null}
				disputes={[{ request: disputeRequest, contract: disputeContract }]}
				visibleDisputes={[{ request: disputeRequest, contract: disputeContract }]}
				selectedDisputeId={21}
				selectedDispute={{ request: disputeRequest, contract: disputeContract }}
				selectedEvidence={disputeEvidence}
				evidenceDraft=""
				voteSupportOpener={true}
				busyDisputeId={null}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={onVoteSupportChange}
				onSubmitEvidence={vi.fn()}
				onSubmitVote={onSubmitVote}
			/>,
		);

		expect(screen.getByText("Votar na disputa")).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: "Apoiar a outra parte" }));
		expect(onVoteSupportChange).toHaveBeenCalledWith(false);
		fireEvent.click(screen.getByRole("button", { name: "Registrar voto" }));
		expect(onSubmitVote).toHaveBeenCalledTimes(1);
	});
});

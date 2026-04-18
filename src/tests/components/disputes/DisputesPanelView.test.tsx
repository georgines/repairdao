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

const pairedEvidence: EvidenciaContratoDominio[] = [
	{
		submittedBy: "0xcliente",
		content: "Fotos do defeito",
		timestamp: "2026-04-17T15:00:00.000Z",
	},
	{
		submittedBy: "0xtec",
		content: "Resposta do tecnico",
		timestamp: "2026-04-17T16:00:00.000Z",
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
				hasVotingTokens
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
				votedDisputeIds={[]}
				evidenceSubmittedDisputeIds={[]}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onCloseDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={vi.fn()}
				onSubmitEvidence={onSubmitEvidence}
				onSubmitVote={vi.fn()}
				onResolveDispute={vi.fn()}
			/>,
		);

		expect(screen.getByText("Acesse disputas em um único modal vertical")).toBeDefined();
		expect(screen.getByRole("heading", { name: "Enviar evidência" })).toBeDefined();
		expect(screen.queryByText("Votar na disputa")).toBeNull();
		expect(screen.getByText("Fotos do defeito")).toBeDefined();

		fireEvent.click(screen.getByRole("button", { name: "Enviar evidência" }));
		expect(onSubmitEvidence).toHaveBeenCalledTimes(1);
	});

	it("posiciona a evidência do autor à esquerda e a outra parte à direita", () => {
		renderWithMantine(
			<DisputesPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				perfilAtivo="cliente"
				hasVotingTokens
				loading={false}
				error={null}
				disputes={[{ request: disputeRequest, contract: disputeContract }]}
				visibleDisputes={[{ request: disputeRequest, contract: disputeContract }]}
				selectedDisputeId={21}
				selectedDispute={{ request: disputeRequest, contract: disputeContract }}
				selectedEvidence={pairedEvidence}
				evidenceDraft="Nova prova"
				voteSupportOpener
				busyDisputeId={null}
				votedDisputeIds={[]}
				evidenceSubmittedDisputeIds={[]}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onCloseDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={vi.fn()}
				onSubmitEvidence={vi.fn()}
				onSubmitVote={vi.fn()}
				onResolveDispute={vi.fn()}
			/>,
		);

		expect(screen.getByText("Quem abriu")).toBeDefined();
		expect(screen.getByText("Outra parte")).toBeDefined();
		expect(screen.getByText("Fotos do defeito").closest('[data-evidence-side="left"]')).not.toBeNull();
		expect(screen.getByText("Resposta do tecnico").closest('[data-evidence-side="right"]')).not.toBeNull();
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
				hasVotingTokens
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
				votedDisputeIds={[]}
				evidenceSubmittedDisputeIds={[]}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onCloseDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={onVoteSupportChange}
				onSubmitEvidence={vi.fn()}
				onSubmitVote={onSubmitVote}
				onResolveDispute={vi.fn()}
			/>,
		);

		expect(screen.getByText("Votar na disputa")).toBeDefined();
		fireEvent.click(screen.getByRole("radio", { name: "Apoiar a outra parte" }));
		expect(onVoteSupportChange).toHaveBeenCalledWith(false);
		fireEvent.click(screen.getByRole("button", { name: "Registrar voto" }));
		expect(onSubmitVote).toHaveBeenCalledTimes(1);
	});

	it("mostra a acao de resolucao quando a janela termina", () => {
		renderWithMantine(
			<DisputesPanelView
				connected
				walletAddress="0xvotante"
				walletNotice={null}
				perfilAtivo={null}
				hasVotingTokens
				loading={false}
				error={null}
				disputes={[{ request: disputeRequest, contract: { ...disputeContract, estado: "encerrada" } }]}
				visibleDisputes={[{ request: disputeRequest, contract: { ...disputeContract, estado: "encerrada" } }]}
				selectedDisputeId={21}
				selectedDispute={{ request: disputeRequest, contract: { ...disputeContract, estado: "encerrada" } }}
				selectedEvidence={disputeEvidence}
				evidenceDraft=""
				voteSupportOpener={true}
				busyDisputeId={null}
				votedDisputeIds={[]}
				evidenceSubmittedDisputeIds={[]}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onCloseDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={vi.fn()}
				onSubmitEvidence={vi.fn()}
				onSubmitVote={vi.fn()}
				onResolveDispute={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "Resolver disputa" })).toBeDefined();
		expect(screen.queryByText("Votar na disputa")).toBeNull();
		expect(screen.queryByText("Enviar evidencia")).toBeNull();
	});

	it("mantem o card de voto visivel apos registrar o voto", () => {
		renderWithMantine(
			<DisputesPanelView
				connected
				walletAddress="0xvotante"
				walletNotice={null}
				perfilAtivo={null}
				hasVotingTokens
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
				votedDisputeIds={[21]}
				evidenceSubmittedDisputeIds={[]}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onCloseDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={vi.fn()}
				onSubmitEvidence={vi.fn()}
				onSubmitVote={vi.fn()}
				onResolveDispute={vi.fn()}
			/>,
		);

		expect(screen.queryByRole("heading", { name: "Votar na disputa" })).toBeNull();
		expect(screen.queryByText("Seu voto ja foi registrado nesta sessao. O card de votacao foi ocultado.")).toBeNull();
	});

	it("oculta o card de evidencia apos registrar a evidencia", () => {
		renderWithMantine(
			<DisputesPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				perfilAtivo="cliente"
				hasVotingTokens
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
				votedDisputeIds={[]}
				evidenceSubmittedDisputeIds={[21]}
				onRefresh={vi.fn()}
				onSelectDispute={vi.fn()}
				onCloseDispute={vi.fn()}
				onEvidenceDraftChange={vi.fn()}
				onVoteSupportChange={vi.fn()}
				onSubmitEvidence={vi.fn()}
				onSubmitVote={vi.fn()}
				onResolveDispute={vi.fn()}
			/>,
		);

		expect(screen.queryByRole("heading", { name: "Enviar evidencia" })).toBeNull();
		expect(screen.queryByText("Sua evidencia ja foi registrada nesta sessao. O card de envio foi ocultado.")).toBeNull();
	});
});

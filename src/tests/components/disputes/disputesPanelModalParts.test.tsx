// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelHeaderBadges } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderBadges/DisputesPanelHeaderBadges";
import { DisputesPanelHeaderNotice } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderNotice/DisputesPanelHeaderNotice";
import { DisputesPanelModalHeader } from "@/components/disputes/DisputesPanel/DisputesPanelModalHeader/DisputesPanelModalHeader";
import { DisputesPanelModalDetails } from "@/components/disputes/DisputesPanel/DisputesPanelModalDetails/DisputesPanelModalDetails";
import { DisputesPanelModalEvidenceSection } from "@/components/disputes/DisputesPanel/DisputesPanelModalEvidenceSection/DisputesPanelModalEvidenceSection";
import { DisputesPanelModalActions } from "@/components/disputes/DisputesPanel/DisputesPanelModalActions/DisputesPanelModalActions";

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

const request = {
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

const contract = {
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
	request,
	contract,
} satisfies DisputeItem;

const evidence: EvidenciaContratoDominio[] = [
	{
		submittedBy: "0xcliente",
		content: "Fotos do defeito",
		timestamp: "2026-04-17T15:00:00.000Z",
	},
];

describe("disputes panel modal parts", () => {
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

	it("renderiza os badges do header da lista", () => {
		renderWithMantine(
			<DisputesPanelHeaderBadges
				disputes={[dispute]}
				visibleDisputes={[dispute]}
				connected={true}
				walletAddress="0xabc123"
				perfilAtivo="cliente"
			/>,
		);

		expect(screen.getByText("1 registrada")).toBeDefined();
		expect(screen.getByText("1 visivel")).toBeDefined();
		expect(screen.getByText("cliente")).toBeDefined();
		expect(screen.getByText(/carteira:/)).toBeDefined();
	});

	it("mostra a mensagem e o botao de atualizar do header", () => {
		const onRefresh = vi.fn();

		renderWithMantine(<DisputesPanelHeaderNotice walletNotice={null} loading={true} onRefresh={onRefresh} />);

		expect(screen.getByText("Selecione uma disputa para abrir o modal e interagir.")).toBeDefined();
		expect(screen.getByRole("button", { name: "Atualizar" })).toBeDefined();
	});

	it("mostra o cabeçalho do modal com status", () => {
		renderWithMantine(
			<DisputesPanelModalHeader disputeTitle="Troca de tomadas" disputeSubtitle="Ordem 21" status="janela_votacao" />,
		);

		expect(screen.getByText("Troca de tomadas")).toBeDefined();
		expect(screen.getByText("Ordem 21")).toBeDefined();
		expect(screen.getByText("Votacao aberta")).toBeDefined();
	});

	it("mostra os detalhes da disputa", () => {
		renderWithMantine(<DisputesPanelModalDetails selectedDispute={dispute} />);

		expect(screen.getByText(/Cliente \(quem abriu\)/)).toBeDefined();
		expect(screen.getByText(/Tecnico \(outra parte\)/)).toBeDefined();
		expect(screen.getByText(/Servico fora do combinado/)).toBeDefined();
		expect(screen.getByText(/Total de RPT a favor de quem abriu/)).toBeDefined();
		expect(screen.getByText(/Prazo:/)).toBeDefined();
	});

	it("mostra a linha do tempo das evidencias e o estado vazio", () => {
		renderWithMantine(<DisputesPanelModalEvidenceSection dispute={dispute} selectedEvidence={evidence} />);

		expect(screen.getByText((content) => content.includes("Linha do tempo das"))).toBeDefined();
		expect(screen.getByText("Fotos do defeito")).toBeDefined();
		expect(screen.getAllByText("Cliente").length).toBeGreaterThan(0);
	});

	it("mostra a mensagem de evidencia vazia quando nao ha itens", () => {
		renderWithMantine(<DisputesPanelModalEvidenceSection dispute={dispute} selectedEvidence={[]} />);

		expect(screen.getByText((content) => content.includes("Ainda nao ha"))).toBeDefined();
	});

	it("mostra o aviso quando a carteira esta desconectada", () => {
		renderWithMantine(
			<DisputesPanelModalActions
				connected={false}
				hasVotingTokens={false}
				busyDisputeId={null}
				selectedDisputeId={21}
				selectedResolved={false}
				selectedCanSendEvidence={false}
				selectedCanVote={false}
				selectedCanResolve={false}
				selectedVoteLocked={false}
				selectedVoteSupportOpener={true}
				voteOptionLabels={{ openerLabel: "Apoiar quem abriu", opposingLabel: "Apoiar a outra parte" }}
				evidenceDraft=""
				onEvidenceDraftChange={() => {}}
				onVoteSupportChange={() => {}}
				onSubmitEvidence={async () => {}}
				onSubmitVote={async () => {}}
				onResolveDispute={async () => {}}
			/>,
		);

		expect(screen.getByText("Conecte a carteira para interagir com o contrato.")).toBeDefined();
	});

	it("mostra o formulario de evidencia quando a janela permite", () => {
		const onSubmitEvidence = vi.fn();

		renderWithMantine(
			<DisputesPanelModalActions
				connected={true}
				hasVotingTokens={true}
				busyDisputeId={null}
				selectedDisputeId={21}
				selectedResolved={false}
				selectedCanSendEvidence={true}
				selectedCanVote={false}
				selectedCanResolve={false}
				selectedVoteLocked={false}
				selectedVoteSupportOpener={true}
				voteOptionLabels={{ openerLabel: "Apoiar quem abriu", opposingLabel: "Apoiar a outra parte" }}
				evidenceDraft="Nova prova"
				onEvidenceDraftChange={() => {}}
				onVoteSupportChange={() => {}}
				onSubmitEvidence={onSubmitEvidence}
				onSubmitVote={async () => {}}
				onResolveDispute={async () => {}}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Enviar evidência" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Enviar evidência" })).toBeDefined();
	});

	it("mostra o formulario de voto e bloqueio do voto", () => {
		const onSubmitVote = vi.fn();

		renderWithMantine(
			<DisputesPanelModalActions
				connected={true}
				hasVotingTokens={true}
				busyDisputeId={null}
				selectedDisputeId={21}
				selectedResolved={false}
				selectedCanSendEvidence={false}
				selectedCanVote={true}
				selectedCanResolve={false}
				selectedVoteLocked={true}
				selectedVoteSupportOpener={true}
				voteOptionLabels={{ openerLabel: "Apoiar quem abriu", opposingLabel: "Apoiar a outra parte" }}
				evidenceDraft=""
				onEvidenceDraftChange={() => {}}
				onVoteSupportChange={() => {}}
				onSubmitEvidence={async () => {}}
				onSubmitVote={onSubmitVote}
				onResolveDispute={async () => {}}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Votar na disputa" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Registrar voto" })).toBeDefined();
	});

	it("mostra a acao de resolver quando apropriado", () => {
		renderWithMantine(
			<DisputesPanelModalActions
				connected={true}
				hasVotingTokens={true}
				busyDisputeId={null}
				selectedDisputeId={21}
				selectedResolved={false}
				selectedCanSendEvidence={false}
				selectedCanVote={false}
				selectedCanResolve={true}
				selectedVoteLocked={false}
				selectedVoteSupportOpener={true}
				voteOptionLabels={{ openerLabel: "Apoiar quem abriu", opposingLabel: "Apoiar a outra parte" }}
				evidenceDraft=""
				onEvidenceDraftChange={() => {}}
				onVoteSupportChange={() => {}}
				onSubmitEvidence={async () => {}}
				onSubmitVote={async () => {}}
				onResolveDispute={async () => {}}
			/>,
		);

		expect(screen.getByRole("button", { name: "Resolver disputa" })).toBeDefined();
	});
});

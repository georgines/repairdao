// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider, Table } from "@mantine/core";
import type { ReactElement } from "react";
import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelTableEmpty } from "@/components/disputes/DisputesPanel/DisputesPanelTableEmpty/DisputesPanelTableEmpty";
import { DisputesPanelTableRow } from "@/components/disputes/DisputesPanel/DisputesPanelTableRow/DisputesPanelTableRow";
import { DisputesPanelHeaderBadges } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderBadges/DisputesPanelHeaderBadges";
import { DisputesPanelModalDetails } from "@/components/disputes/DisputesPanel/DisputesPanelModalDetails/DisputesPanelModalDetails";
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

const contractBase = {
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
	contract: contractBase,
} satisfies DisputeItem;

describe("disputes panel supporting parts", () => {
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

	it("mostra a linha vazia da tabela", () => {
		renderWithMantine(<DisputesPanelTableEmpty />);

		expect(screen.getByText("Sem disputas para exibir.")).toBeDefined();
	});

	it("mostra os badges do cabeçalho no estado desconectado", () => {
		renderWithMantine(
			<DisputesPanelHeaderBadges
				disputes={[]}
				visibleDisputes={[]}
				connected={false}
				walletAddress={null}
				perfilAtivo={null}
			/>,
		);

		expect(screen.getByText("0 registradas")).toBeDefined();
		expect(screen.getByText("0 visiveis")).toBeDefined();
		expect(screen.getByText("carteira desconectada")).toBeDefined();
	});

	it("mostra a linha da disputa e o estado selecionado", async () => {
		const onSelectDispute = vi.fn().mockResolvedValue(undefined);

		renderWithMantine(
			<Table>
				<Table.Tbody>
					<DisputesPanelTableRow dispute={dispute} selected={true} onSelectDispute={onSelectDispute} />
				</Table.Tbody>
			</Table>,
		);

		const row = screen.getByRole("row");

		expect(row.textContent).toContain("Disputa #21");
		expect(row.textContent).toContain("Detalhes");
		expect(row.getAttribute("data-selected")).toBe("true");
	});

	it("mostra a linha da disputa com fallback de motivo", async () => {
		const onSelectDispute = vi.fn().mockResolvedValue(undefined);
		const fallbackDispute = {
			request: {
				...request,
				disputeReason: null,
			},
			contract: {
				...contractBase,
				motivo: null,
			},
		} satisfies DisputeItem;

		renderWithMantine(
			<Table>
				<Table.Tbody>
					<DisputesPanelTableRow dispute={fallbackDispute} selected={false} onSelectDispute={onSelectDispute} />
				</Table.Tbody>
			</Table>,
		);

		expect(screen.getByText("-")).toBeDefined();
		expect(screen.getByRole("row").getAttribute("data-selected")).toBeNull();
	});

	it("mostra detalhes com fallback quando faltam campos do contrato", () => {
		const fallbackDispute = {
			request: {
				...request,
				disputeReason: null,
			},
			contract: {
				...contractBase,
				motivo: null,
				votesForOpener: undefined,
				votesForOpposing: undefined,
				deadline: undefined,
			},
		} satisfies DisputeItem;

		renderWithMantine(<DisputesPanelModalDetails selectedDispute={fallbackDispute} />);

		expect(screen.getByText(/Motivo: -/)).toBeDefined();
		expect(screen.getByText(/Total de RPT a favor de quem abriu: 0/)).toBeDefined();
		expect(screen.getByText(/Total de RPT a favor da outra parte: 0/)).toBeDefined();
		expect(screen.getByText(/Prazo: -/)).toBeDefined();
	});

	it("mostra o estado fallback das acoes do modal", () => {
		renderWithMantine(
			<DisputesPanelModalActions
				connected={true}
				hasVotingTokens={true}
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

		expect(screen.getByText("A disputa ainda nao esta em uma janela valida para interacoes.")).toBeDefined();
	});
});

// @vitest-environment jsdom

import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { GovernancePanelView } from "@/components/governance/GovernancePanel/GovernancePanelView";

function mockMatchMedia() {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation(() => ({
			matches: false,
			media: "",
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
}

function mockResizeObserver() {
	Object.defineProperty(window, "ResizeObserver", {
		writable: true,
		value: class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	});
}

const baseProps = {
	summary: {
		loading: false,
		error: null as string | null,
		connected: true,
		canCreateProposal: true,
		canVote: true,
		votingPower: "1000000000000000000",
		walletAddress: "0xowner",
		quorum: 1000000000000000000000n,
		totalProposals: 3,
		syncedAt: "2026-04-21T12:00:00.000Z",
	},
	form: {
		action: "min_deposit" as const,
		description: "Nova proposta",
		value: "150",
		saving: false,
		error: null as string | null,
		onActionChange: () => {},
		onDescriptionChange: () => {},
		onValueChange: () => {},
		onSubmit: async () => true,
	},
	proposals: [
		{
			id: "1",
			proposer: "0xabc",
			description: "Proposta ativa",
			votesFor: 10n,
			votesAgainst: 2n,
			deadline: "2030-04-21T12:10:00.000Z",
			executed: false,
			approved: false,
			action: "min_deposit" as const,
			actionValue: 150000000000000000000n,
			hasVoted: false,
		},
		{
			id: "2",
			proposer: "0xdef",
			description: "Proposta expirada",
			votesFor: 7n,
			votesAgainst: 1n,
			deadline: "2000-04-21T11:40:00.000Z",
			executed: false,
			approved: false,
			action: "tokens_per_eth" as const,
			actionValue: 10000000n,
			hasVoted: false,
		},
		{
			id: "3",
			proposer: "0xghi",
			description: "Proposta votada",
			votesFor: 9n,
			votesAgainst: 0n,
			deadline: "2030-04-21T12:10:00.000Z",
			executed: false,
			approved: false,
			action: "min_deposit" as const,
			actionValue: 200000000000000000000n,
			hasVoted: true,
		},
	],
	selectedProposal: null as null,
	selectedProposalMode: null as "details" | "vote" | null,
	actionError: null as string | null,
	votingProposalId: null as string | null,
	executingProposalId: null as string | null,
	onOpenVoteModal: () => {},
	onOpenDetailsModal: () => {},
	onCloseVoteModal: () => {},
	onVote: async () => {},
	onExecute: async () => {},
};

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends (...args: unknown[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function mergeProps(overrides: DeepPartial<typeof baseProps> = {}) {
	return {
		...baseProps,
		...overrides,
		summary: {
			...baseProps.summary,
			...(overrides.summary ?? {}),
		},
		form: {
			...baseProps.form,
			...(overrides.form ?? {}),
		},
		proposals: overrides.proposals ?? baseProps.proposals,
	};
}

function GovernancePanelViewHarness() {
	const [selectedProposal, setSelectedProposal] = useState<typeof baseProps.selectedProposal>(baseProps.selectedProposal);
	const [selectedProposalMode, setSelectedProposalMode] = useState<typeof baseProps.selectedProposalMode>(baseProps.selectedProposalMode);

	return (
		<MantineProvider>
			<GovernancePanelView
				{...mergeProps({
					selectedProposal,
					selectedProposalMode,
					onOpenDetailsModal: (proposalId: string) => {
						setSelectedProposal(baseProps.proposals.find((proposal) => proposal.id === proposalId) ?? null);
						setSelectedProposalMode("details");
					},
					onOpenVoteModal: (proposalId: string) => {
						setSelectedProposal(baseProps.proposals.find((proposal) => proposal.id === proposalId) ?? null);
						setSelectedProposalMode("vote");
					},
					onCloseVoteModal: () => {
						setSelectedProposal(null);
						setSelectedProposalMode(null);
					},
				})}
			/>
		</MantineProvider>
	);
}

describe("GovernancePanelView", () => {
	beforeEach(() => {
		mockMatchMedia();
		mockResizeObserver();
	});

	afterEach(() => {
		cleanup();
	});

	it("mostra apenas propostas abertas e nao votadas no filtro padrao", () => {
		render(
			<MantineProvider>
				<GovernancePanelView {...mergeProps()} />
			</MantineProvider>,
		);

		expect(screen.getByText("Governanca")).toBeTruthy();
		expect(screen.getByText("Lista de propostas")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Nova proposta" })).toBeTruthy();
		expect(screen.getByText("Proposta ativa")).toBeTruthy();
		expect(screen.getByRole("columnheader", { name: "ID" })).toBeTruthy();
		expect(screen.getByRole("columnheader", { name: "Proposta" })).toBeTruthy();
		expect(screen.getByRole("columnheader", { name: "Prazo" })).toBeTruthy();
		expect(screen.getByRole("columnheader", { name: "Status" })).toBeTruthy();
		expect(screen.getByRole("columnheader", { name: "Acoes" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Detalhes" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Votar" })).toBeTruthy();
		expect(screen.queryByText("Proposta expirada")).toBeNull();
		expect(screen.queryByText("Proposta votada")).toBeNull();
	});

	it("mostra a mensagem unica quando nao existem propostas", () => {
		render(
			<MantineProvider>
				<GovernancePanelView
					{...mergeProps({
						summary: {
							totalProposals: 0,
						},
						proposals: [],
					})}
				/>
			</MantineProvider>,
		);

		expect(screen.getByText("Nenhuma proposta cadastrada")).toBeTruthy();
		expect(screen.getByText("Ainda nao existem propostas para exibir.")).toBeTruthy();
		expect(screen.queryByRole("table")).toBeNull();
	});

	it("mostra o modal de detalhes e o modal de voto", async () => {
		render(<GovernancePanelViewHarness />);

		fireEvent.click(screen.getByRole("button", { name: "Detalhes" }));
		expect(await screen.findByRole("heading", { name: "Detalhes da proposta" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Sim" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Nao" })).toBeNull();
		expect(screen.getByRole("button", { name: "Fechar" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
		await waitFor(() => expect(screen.queryByRole("heading", { name: "Detalhes da proposta" })).toBeNull());

		fireEvent.click(screen.getByRole("button", { name: "Votar" }));
		expect(await screen.findByRole("heading", { name: "Confirmar voto" })).toBeTruthy();
		expect(screen.getByText("Aprova esta proposta?")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Sim" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Nao" })).toBeTruthy();
	});
});

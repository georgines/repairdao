// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import { GovernancePanelHeaderSection } from "@/components/governance/GovernancePanel/GovernancePanelHeaderSection/GovernancePanelHeaderSection";
import { GovernancePanelProposalListSection } from "@/components/governance/GovernancePanel/GovernancePanelProposalListSection/GovernancePanelProposalListSection";
import { GovernancePanelCreateProposalModal } from "@/components/governance/GovernancePanel/GovernancePanelCreateProposalModal/GovernancePanelCreateProposalModal";

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

function mockViewportApis() {
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
	Object.defineProperty(window, "ResizeObserver", {
		writable: true,
		value: class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	});
}

function createProposalForm(onSubmitResult: boolean) {
	return {
		action: "min_deposit" as const,
		description: "Nova proposta",
		value: "150",
		saving: false,
		error: null as string | null,
		onActionChange: vi.fn(),
		onDescriptionChange: vi.fn(),
		onValueChange: vi.fn(),
		onSubmit: vi.fn().mockResolvedValue(onSubmitResult),
	};
}

describe("GovernancePanel parts", () => {
	beforeEach(() => {
		mockViewportApis();
	});

	afterEach(() => {
		cleanup();
	});

	it("desabilita a criacao quando a carteira nao pode propor", () => {
		renderWithMantine(
			<GovernancePanelHeaderSection
				quorumLabel="1000"
				totalProposals={0}
				votingPowerLabel="0 RPT"
				statusText="Somente leitura"
				connected={false}
				canCreateProposal={false}
				proposalFilter="open"
				proposalFilterOptions={[
					{ value: "open", label: "Abertas" },
					{ value: "all", label: "Todas as propostas" },
				]}
				onProposalFilterChange={vi.fn()}
				onOpenCreateProposal={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "Nova proposta" }).hasAttribute("disabled")).toBe(true);
	});

	it("mostra loading na lista de propostas", () => {
		renderWithMantine(
			<GovernancePanelProposalListSection
				loading={true}
				error={null}
				actionError={null}
				connected={false}
				quorum={1000n}
				syncedAt={null}
				proposals={[]}
				visibleProposals={[]}
				votingProposalId={null}
				executingProposalId={null}
				onOpenDetailsModal={vi.fn()}
				onOpenVoteModal={vi.fn()}
				onExecute={vi.fn().mockResolvedValue(undefined)}
				now={new Date("2026-04-21T12:00:00.000Z")}
			/>,
		);

		expect(screen.getByText("Lista de propostas")).toBeDefined();
		expect(screen.queryByText("Nenhuma proposta cadastrada")).toBeNull();
		expect(screen.queryByRole("table")).toBeNull();
	});

	it("fecha o modal de criacao quando a submissao conclui com sucesso", async () => {
		const onClose = vi.fn();
		const proposalForm = createProposalForm(true);

		renderWithMantine(
			<GovernancePanelCreateProposalModal
				opened={true}
				connected={true}
				canCreateProposal={true}
				walletAddress="0xowner"
				form={proposalForm}
				onClose={onClose}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Criar proposta" }));

		await waitFor(() => expect(proposalForm.onSubmit).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	});

	it("mantem o modal aberto quando a submissao falha", async () => {
		const onClose = vi.fn();
		const proposalForm = createProposalForm(false);

		renderWithMantine(
			<GovernancePanelCreateProposalModal
				opened={true}
				connected={true}
				canCreateProposal={true}
				walletAddress="0xowner"
				form={proposalForm}
				onClose={onClose}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Criar proposta" }));

		await waitFor(() => expect(proposalForm.onSubmit).toHaveBeenCalledTimes(1));
		expect(onClose).not.toHaveBeenCalled();
	});
});

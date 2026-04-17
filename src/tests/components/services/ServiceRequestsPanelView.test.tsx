// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { ServiceRequestsPanelView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelView";

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

const openRequest: ServiceRequestSummary = {
	id: 1,
	clientAddress: "0xcliente",
	clientName: "Cliente 1",
	technicianAddress: "0xtec",
	technicianName: "Tecnico 1",
	description: "Troca de tomadas",
	status: "aberta",
	budgetAmount: null,
	acceptedAt: null,
	budgetSentAt: null,
	clientAcceptedAt: null,
	createdAt: "2026-04-17T10:00:00.000Z",
	updatedAt: "2026-04-17T10:00:00.000Z",
};

const budgetRequest: ServiceRequestSummary = {
	id: 2,
	clientAddress: "0xcliente",
	clientName: "Cliente 1",
	technicianAddress: "0xtec",
	technicianName: "Tecnico conectado",
	description: "Instalacao de luminaria",
	status: "orcada",
	budgetAmount: 240,
	acceptedAt: "2026-04-17T10:00:00.000Z",
	budgetSentAt: "2026-04-17T11:00:00.000Z",
	clientAcceptedAt: null,
	createdAt: "2026-04-17T09:00:00.000Z",
	updatedAt: "2026-04-17T11:00:00.000Z",
};

describe("components/services/ServiceRequestsPanelView", () => {
	beforeEach(() => {
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
		vi.restoreAllMocks();
	});

	it("exibe o resumo e a tabela das ordens do cliente", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[openRequest, budgetRequest]}
				visibleRequests={[openRequest, budgetRequest]}
				query=""
				statusFilter="all"
				requestModalOpened={false}
				requestModalRequest={null}
				busyRequestId={null}
				onRefresh={vi.fn()}
				onQueryChange={vi.fn()}
				onStatusFilterChange={vi.fn()}
				onClearFilters={vi.fn()}
				onOpenRequestModal={vi.fn()}
				onCloseRequestModal={vi.fn()}
				onAcceptBudget={vi.fn()}
			/>,
		);

		expect(screen.getByText("Acompanhe suas ordens de servico")).toBeDefined();
		expect(screen.getByText("Troca de tomadas")).toBeDefined();
		expect(screen.getByText("Instalacao de luminaria")).toBeDefined();
		expect(screen.getAllByRole("button", { name: "Detalhes" })).toHaveLength(2);
		expect(screen.getByRole("button", { name: "Aceitar orcamento" })).toBeDefined();
	});

	it("mostra o modal de aceite do orcamento", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[budgetRequest]}
				visibleRequests={[budgetRequest]}
				query=""
				statusFilter="all"
				requestModalOpened
				requestModalRequest={budgetRequest}
				busyRequestId={null}
				onRefresh={vi.fn()}
				onQueryChange={vi.fn()}
				onStatusFilterChange={vi.fn()}
				onClearFilters={vi.fn()}
				onOpenRequestModal={vi.fn()}
				onCloseRequestModal={vi.fn()}
				onAcceptBudget={vi.fn()}
			/>,
		);

		expect(screen.getByText("Tecnico: Tecnico conectado")).toBeDefined();
		expect(screen.getAllByRole("button", { name: "Aceitar orcamento" })).toHaveLength(2);
	});

	it("propaga as interacoes principais", () => {
		const onRefresh = vi.fn();
		const onQueryChange = vi.fn();
		const onStatusFilterChange = vi.fn();
		const onClearFilters = vi.fn();
		const onOpenRequestModal = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[openRequest, budgetRequest]}
				visibleRequests={[openRequest, budgetRequest]}
				query=""
				statusFilter="all"
				requestModalOpened={false}
				requestModalRequest={null}
				busyRequestId={null}
				onRefresh={onRefresh}
				onQueryChange={onQueryChange}
				onStatusFilterChange={onStatusFilterChange}
				onClearFilters={onClearFilters}
				onOpenRequestModal={onOpenRequestModal}
				onCloseRequestModal={vi.fn()}
				onAcceptBudget={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
		fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
		fireEvent.click(screen.getAllByRole("button", { name: "Detalhes" })[0]);
		fireEvent.click(screen.getAllByRole("button", { name: "Detalhes" })[1]);
		fireEvent.click(screen.getByRole("button", { name: "Aceitar orcamento" }));

		expect(onRefresh).toHaveBeenCalled();
		expect(onClearFilters).toHaveBeenCalled();
		expect(onOpenRequestModal).toHaveBeenCalledWith(1);
		expect(onOpenRequestModal).toHaveBeenCalledWith(2);
	});
});

// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

	it("mostra estado vazio e propaga as mudancas dos filtros", () => {
		const onQueryChange = vi.fn();
		const onStatusFilterChange = vi.fn();
		const onCloseRequestModal = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				connected={false}
				walletAddress={null}
				walletNotice={"Conecte a carteira para ver e aceitar suas ordens."}
				loading={false}
				error={"falha"}
				clientRequests={[]}
				visibleRequests={[]}
				query=""
				statusFilter="all"
				requestModalOpened
				requestModalRequest={null}
				busyRequestId={null}
				onRefresh={vi.fn()}
				onQueryChange={onQueryChange}
				onStatusFilterChange={onStatusFilterChange}
				onClearFilters={vi.fn()}
				onOpenRequestModal={vi.fn()}
				onCloseRequestModal={onCloseRequestModal}
				onAcceptBudget={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByRole("textbox", { name: "Buscar ordem" }), {
			target: { value: "lampada" },
		});
		fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
		fireEvent.click(screen.getByText("Orcadas"));
		fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

		expect(screen.getByText("Conecte a carteira para ver suas ordens de servico.")).toBeDefined();
		expect(screen.getByText("Nenhuma ordem encontrou este criterio.")).toBeDefined();
		expect(onQueryChange).toHaveBeenCalledWith("lampada");
		expect(onStatusFilterChange).toHaveBeenCalled();
		expect(onCloseRequestModal).not.toHaveBeenCalled();
	});

	it("dispara o aceite do modal quando a ordem tem orcamento", () => {
		const onAcceptBudget = vi.fn();

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
				onAcceptBudget={onAcceptBudget}
			/>,
		);

		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Aceitar orcamento" }));

		expect(onAcceptBudget).toHaveBeenCalledTimes(1);
	});

	it("exibe os estados textuais e o endereco resumido", () => {
		const acceptedRequest = {
			...budgetRequest,
			id: 3,
			status: "aceita" as const,
		};
		const clientAcceptedRequest = {
			...budgetRequest,
			id: 4,
			status: "aceito_cliente" as const,
		};

		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress="0x1234567890abcdef1234567890abcdef12345678"
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[acceptedRequest, clientAcceptedRequest]}
				visibleRequests={[acceptedRequest, clientAcceptedRequest]}
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

		expect(screen.getByText("Aceita")).toBeDefined();
		expect(screen.getByText("Aceita pelo cliente")).toBeDefined();
		expect(screen.getByText("carteira: 0x1234...5678")).toBeDefined();
	});

	it("mostra o aviso quando a ordem do modal ainda nao recebeu orcamento", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress="0xcliente"
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[openRequest]}
				visibleRequests={[openRequest]}
				query=""
				statusFilter="all"
				requestModalOpened
				requestModalRequest={openRequest}
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

		expect(screen.getByText("Esta ordem ainda nao recebeu orcamento.")).toBeDefined();
	});

	it("usa o endereco curto e estado vazio quando nao ha ordens visiveis", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress="0x1234567890abcdef1234567890abcdef12345678"
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[]}
				visibleRequests={[]}
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

		expect(screen.getByText("Nenhuma ordem foi encontrada para esta carteira.")).toBeDefined();
		expect(screen.getByText("carteira: 0x1234...5678")).toBeDefined();
	});

	it("mostra o endereco vazio quando a carteira nao esta informada", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				connected
				walletAddress={null}
				walletNotice={null}
				loading={false}
				error={null}
				clientRequests={[]}
				visibleRequests={[]}
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

		expect(document.body.textContent).toContain("carteira:");
	});
});

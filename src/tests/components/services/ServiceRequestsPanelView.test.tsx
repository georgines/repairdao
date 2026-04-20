// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ComponentProps, ReactElement } from "react";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { ServiceRequestsPanelView } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelView";

type PanelProps = ComponentProps<typeof ServiceRequestsPanelView>;
type PanelOverrides = {
	error?: string | null;
	header?: Partial<PanelProps["header"]>;
	filters?: Partial<PanelProps["filters"]>;
	table?: Partial<PanelProps["table"]>;
	modal?: Partial<PanelProps["modal"]>;
};

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

function createPanelProps(overrides: PanelOverrides = {}): PanelProps {
	const header: PanelProps["header"] = {
		connected: true,
		walletAddress: "0xcliente",
		walletNotice: null,
		perfilAtivo: "cliente",
		clientRequests: [budgetRequest, concludedRequest],
		visibleRequests: [budgetRequest, concludedRequest],
		loading: false,
		onRefresh: vi.fn(),
	};

	const filters: PanelProps["filters"] = {
		query: "",
		statusFilter: "all",
		visibleRequests: 2,
		onQueryChange: vi.fn(),
		onStatusFilterChange: vi.fn(),
		onClearFilters: vi.fn(),
	};

	const table: PanelProps["table"] = {
		connected: true,
		visibleRequests: [budgetRequest, concludedRequest],
		perfilAtivo: "cliente",
		walletAddress: "0xcliente",
		busyRequestId: null,
		onOpenRequestModal: vi.fn(),
	};

	const modal: PanelProps["modal"] = {
		requestModalOpened: false,
		requestModalRequest: null,
		requestModalAction: null,
		requestModalBudget: null,
		requestModalRating: 5,
		requestModalDisputeReason: "",
		busyRequestId: null,
		onCloseRequestModal: vi.fn(),
		onRequestModalBudgetChange: vi.fn(),
		onRequestModalRatingChange: vi.fn(),
		onRequestModalDisputeReasonChange: vi.fn(),
		onSubmitBudget: vi.fn(),
		onPayBudget: vi.fn(),
		onCompleteOrder: vi.fn(),
		onConfirmDelivery: vi.fn(),
		onRateService: vi.fn(),
		onOpenDispute: vi.fn(),
	};

	return {
		error: null,
		header: { ...header, ...overrides.header },
		filters: { ...filters, ...overrides.filters },
		table: { ...table, ...overrides.table },
		modal: { ...modal, ...overrides.modal },
		...("error" in overrides ? { error: overrides.error ?? null } : {}),
	};
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
	completedAt: null,
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
	completedAt: null,
	createdAt: "2026-04-17T09:00:00.000Z",
	updatedAt: "2026-04-17T11:00:00.000Z",
};

const concludedRequest: ServiceRequestSummary = {
	...budgetRequest,
	id: 3,
	status: "concluida",
	clientAcceptedAt: "2026-04-17T12:00:00.000Z",
	completedAt: "2026-04-17T13:00:00.000Z",
	updatedAt: "2026-04-17T13:00:00.000Z",
};

const disputedRequest: ServiceRequestSummary = {
	...concludedRequest,
	id: 4,
	status: "disputada",
	disputedAt: "2026-04-17T14:00:00.000Z",
	disputeReason: "Servico fora do combinado",
	updatedAt: "2026-04-17T14:00:00.000Z",
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

	it("exibe os botoes principais conforme o perfil", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: {
						clientRequests: [budgetRequest, concludedRequest],
						visibleRequests: [budgetRequest, concludedRequest],
					},
					filters: { visibleRequests: 2 },
					table: { visibleRequests: [budgetRequest, concludedRequest] },
				})}
			/>,
		);

		expect(screen.getByText("Acompanhe suas ordens de servico")).toBeDefined();
		expect(screen.getAllByText("Instalacao de luminaria")).toHaveLength(2);
		expect(screen.getByRole("button", { name: "Pagar" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Confirmar entrega" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Disputar" })).toBeDefined();
	});

	it("esconde o botao de avaliacao para quem ja avaliou", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: {
						clientRequests: [{ ...concludedRequest, clientRated: true }],
						visibleRequests: [{ ...concludedRequest, clientRated: true }],
					},
					table: { visibleRequests: [{ ...concludedRequest, clientRated: true }] },
					filters: { visibleRequests: 1 },
				})}
			/>,
		);

		expect(screen.queryByRole("button", { name: "Avaliar" })).toBeNull();
	});

	it("mostra ordens em disputa com status destacado", () => {
		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: { clientRequests: [disputedRequest], visibleRequests: [disputedRequest] },
					table: { visibleRequests: [disputedRequest] },
					filters: { visibleRequests: 1 },
				})}
			/>,
		);

		expect(screen.getAllByText("Em disputa")).toHaveLength(2);
		expect(screen.queryByRole("button", { name: "Disputar" })).toBeNull();
	});

	it("mostra o modal de orcamento para o tecnico", () => {
		const onSubmitBudget = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: { clientRequests: [openRequest], visibleRequests: [openRequest] },
					table: { visibleRequests: [openRequest] },
					filters: { visibleRequests: 1 },
					modal: {
						requestModalOpened: true,
						requestModalRequest: openRequest,
						requestModalAction: "budget",
						requestModalBudget: 250,
						onSubmitBudget,
					},
				})}
			/>,
		);

		expect(screen.getByText("Definir valor do servico")).toBeDefined();
		expect(screen.getByRole("button", { name: "Aceitar orcamento" })).toBeDefined();
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Aceitar orcamento" }));
		expect(onSubmitBudget).toHaveBeenCalledTimes(1);
	});

	it("mostra o modal de pagamento", () => {
		const onPayBudget = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: { clientRequests: [budgetRequest], visibleRequests: [budgetRequest] },
					table: { visibleRequests: [budgetRequest] },
					filters: { visibleRequests: 1 },
					modal: {
						requestModalOpened: true,
						requestModalRequest: budgetRequest,
						requestModalAction: "pay",
						onPayBudget,
					},
				})}
			/>,
		);

		expect(screen.getByText("Confirmar pagamento do orcamento")).toBeDefined();
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Pagar" }));
		expect(onPayBudget).toHaveBeenCalledTimes(1);
	});

	it("mostra o modal de confirmacao de entrega", () => {
		const onConfirmDelivery = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: { clientRequests: [concludedRequest], visibleRequests: [concludedRequest] },
					table: { visibleRequests: [concludedRequest] },
					filters: { visibleRequests: 1 },
					modal: {
						requestModalOpened: true,
						requestModalRequest: concludedRequest,
						requestModalAction: "confirm",
						onConfirmDelivery,
					},
				})}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Confirmar entrega" })).toBeDefined();
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Confirmar entrega" }));
		expect(onConfirmDelivery).toHaveBeenCalledTimes(1);
	});

	it("mostra o modal de avaliacao", () => {
		const onRateService = vi.fn();
		const onRequestModalRatingChange = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: { clientRequests: [concludedRequest], visibleRequests: [concludedRequest] },
					table: { visibleRequests: [concludedRequest] },
					filters: { visibleRequests: 1 },
					modal: {
						requestModalOpened: true,
						requestModalRequest: concludedRequest,
						requestModalAction: "rate",
						onRequestModalRatingChange,
						onRateService,
					},
				})}
			/>,
		);

		expect(screen.getByText("Avaliar servico")).toBeDefined();
		expect(screen.getByText("5 de 5")).toBeDefined();
		const starInput = within(screen.getByRole("dialog")).getByLabelText("Avaliar com 4 estrelas");
		fireEvent.click(starInput.nextElementSibling as Element);
		expect(onRequestModalRatingChange).toHaveBeenCalledWith(4);
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Avaliar" }));
		expect(onRateService).toHaveBeenCalledTimes(1);
	});

	it("mostra o modal de disputa", () => {
		const onOpenDispute = vi.fn();
		const onRequestModalDisputeReasonChange = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: { clientRequests: [concludedRequest], visibleRequests: [concludedRequest] },
					table: { visibleRequests: [concludedRequest] },
					filters: { visibleRequests: 1 },
					modal: {
						requestModalOpened: true,
						requestModalRequest: concludedRequest,
						requestModalAction: "dispute",
						requestModalDisputeReason: "Servico fora do combinado",
						onRequestModalDisputeReasonChange,
						onOpenDispute,
					},
				})}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Abrir disputa" })).toBeDefined();
		expect(screen.getByDisplayValue("Servico fora do combinado")).toBeDefined();
		fireEvent.change(screen.getByLabelText("Motivo da disputa"), {
			target: { value: "Servico com defeito" },
		});
		expect(onRequestModalDisputeReasonChange).toHaveBeenCalledWith("Servico com defeito");
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Abrir disputa" }));
		expect(onOpenDispute).toHaveBeenCalledTimes(1);
	});

	it("propaga as interacoes da busca e dos filtros", () => {
		const onRefresh = vi.fn();
		const onQueryChange = vi.fn();
		const onStatusFilterChange = vi.fn();
		const onClearFilters = vi.fn();
		const onOpenRequestModal = vi.fn();

		renderWithMantine(
			<ServiceRequestsPanelView
				{...createPanelProps({
					header: {
						clientRequests: [openRequest, budgetRequest],
						visibleRequests: [openRequest, budgetRequest],
						onRefresh,
					},
					filters: {
						onQueryChange,
						onStatusFilterChange,
						onClearFilters,
						visibleRequests: 2,
					},
					table: {
						visibleRequests: [openRequest, budgetRequest],
						onOpenRequestModal,
					},
				})}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
		fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
		fireEvent.click(screen.getAllByRole("button", { name: "Detalhes" })[0]);

		expect(onRefresh).toHaveBeenCalled();
		expect(onClearFilters).toHaveBeenCalled();
		expect(onOpenRequestModal).toHaveBeenCalledWith(1, "details");
		fireEvent.change(screen.getByRole("textbox", { name: "Buscar ordem" }), {
			target: { value: "lampada" },
		});
		expect(onQueryChange).toHaveBeenCalledWith("lampada");
	});
});

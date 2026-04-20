// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from "vitest";
import { afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MantineProvider, Table } from "@mantine/core";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { ServiceRequestsPanelHeader } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelHeader/ServiceRequestsPanelHeader";
import { ServiceRequestsPanelFilters } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelFilters/ServiceRequestsPanelFilters";
import { ServiceRequestsPanelEmptyState } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelEmptyState/ServiceRequestsPanelEmptyState";
import { ServiceRequestsPanelTableRow } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelTableRow/ServiceRequestsPanelTableRow";
import { ServiceRequestsPanelModalField } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalField/ServiceRequestsPanelModalField";
import { ServiceRequestsPanelModalActions } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalActions/ServiceRequestsPanelModalActions";

const request: ServiceRequestSummary = {
	id: 2,
	clientAddress: "0xcliente",
	clientName: "Cliente 1",
	technicianAddress: "0xtec",
	technicianName: "Tecnico 1",
	description: "Instalacao de luminaria",
	status: "concluida",
	budgetAmount: 240,
	acceptedAt: "2026-04-17T10:00:00.000Z",
	budgetSentAt: "2026-04-17T11:00:00.000Z",
	clientAcceptedAt: "2026-04-17T12:00:00.000Z",
	completedAt: "2026-04-17T13:00:00.000Z",
	createdAt: "2026-04-17T09:00:00.000Z",
	updatedAt: "2026-04-17T13:00:00.000Z",
};

describe("ServiceRequestsPanel parts", () => {
	beforeAll(() => {
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

	it("mostra o cabeçalho e filtros", () => {
		render(
			<MantineProvider>
				<ServiceRequestsPanelHeader
					connected={true}
					walletAddress="0xcliente"
					walletNotice="Use a lista"
					perfilAtivo="cliente"
					clientRequests={[request]}
					visibleRequests={[request]}
					loading={false}
					onRefresh={vi.fn()}
				/>
				<ServiceRequestsPanelFilters
					query="lampada"
					statusFilter="all"
					visibleRequests={1}
					onQueryChange={vi.fn()}
					onStatusFilterChange={vi.fn()}
					onClearFilters={vi.fn()}
				/>
			</MantineProvider>,
		);

		expect(screen.getByText("Acompanhe suas ordens de servico")).toBeDefined();
		expect(screen.getByText("Atualizar")).toBeDefined();
		expect(screen.getByText("Use a lista")).toBeDefined();
		expect(screen.getByText("Use a lista para acompanhar suas ordens.")).toBeDefined();
	});

	it("mostra o estado vazio", () => {
		render(
			<MantineProvider>
				<ServiceRequestsPanelEmptyState hasWallet={false} hasResults={false} />
			</MantineProvider>,
		);

		expect(screen.getByText("Conecte a carteira para ver suas ordens de servico.")).toBeDefined();
	});

	it("mostra a linha da tabela e suas acoes", () => {
		const onOpenRequestModal = vi.fn();

		render(
			<MantineProvider>
				<Table>
					<Table.Tbody>
						<ServiceRequestsPanelTableRow
							request={request}
							perfilAtivo="cliente"
							walletAddress="0xcliente"
							busyRequestId={null}
							onOpenRequestModal={onOpenRequestModal}
						/>
					</Table.Tbody>
				</Table>
			</MantineProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Detalhes" }));
		expect(onOpenRequestModal).toHaveBeenCalledWith(2, "details");
		expect(screen.getByRole("button", { name: "Disputar" })).toBeDefined();
	});

	it("mostra os campos do modal", () => {
		render(
			<MantineProvider>
				<ServiceRequestsPanelModalField
					requestModalOpened={true}
					requestModalRequest={request}
					requestModalAction="rate"
					requestModalBudget={null}
					requestModalRating={4}
					requestModalDisputeReason=""
					busyRequestId={null}
					onCloseRequestModal={vi.fn()}
					onRequestModalBudgetChange={vi.fn()}
					onRequestModalRatingChange={vi.fn()}
					onRequestModalDisputeReasonChange={vi.fn()}
					onSubmitBudget={vi.fn()}
					onPayBudget={vi.fn()}
					onCompleteOrder={vi.fn()}
					onConfirmDelivery={vi.fn()}
					onRateService={vi.fn()}
					onOpenDispute={vi.fn()}
				/>
			</MantineProvider>,
		);

		expect(screen.getByText("Nota")).toBeDefined();
		expect(screen.getByText("4 de 5")).toBeDefined();
	});

	it("mostra as acoes do modal", () => {
		const onRateService = vi.fn();

		render(
			<MantineProvider>
				<ServiceRequestsPanelModalActions
					requestModalOpened={true}
					requestModalRequest={request}
					requestModalAction="rate"
					requestModalBudget={null}
					requestModalRating={4}
					requestModalDisputeReason=""
					busyRequestId={null}
					onCloseRequestModal={vi.fn()}
					onRequestModalBudgetChange={vi.fn()}
					onRequestModalRatingChange={vi.fn()}
					onRequestModalDisputeReasonChange={vi.fn()}
					onSubmitBudget={vi.fn()}
					onPayBudget={vi.fn()}
					onCompleteOrder={vi.fn()}
					onConfirmDelivery={vi.fn()}
					onRateService={onRateService}
					onOpenDispute={vi.fn()}
				/>
			</MantineProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));
		expect(onRateService).toHaveBeenCalledTimes(1);
	});
});

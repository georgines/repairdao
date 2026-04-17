// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { useServiceRequestsPanel } from "@/hooks/useServiceRequestsPanel";

const serviceMocks = vi.hoisted(() => ({
	loadServiceRequests: vi.fn(),
	acceptServiceBudget: vi.fn(),
	aceitarOrcamentoNoContrato: vi.fn(),
}));

const walletState = {
	connected: true,
	address: "0xcliente",
};

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: () => ({
		state: walletState,
	}),
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: () => ({}),
}));

vi.mock("@/services/serviceRequests/serviceRequestBlockchain", () => ({
	aceitarOrcamentoNoContrato: serviceMocks.aceitarOrcamentoNoContrato,
}));

vi.mock("@/services/serviceRequests/serviceRequestClient", () => ({
	loadServiceRequests: serviceMocks.loadServiceRequests,
	acceptServiceBudget: serviceMocks.acceptServiceBudget,
}));

const initialRequests: ServiceRequestSummary[] = [
	{
		id: 1,
		clientAddress: "0xcliente",
		clientName: "Cliente",
		technicianAddress: "0xtec",
		technicianName: "Tecnico",
		description: "Troca de lampada",
		status: "aberta",
		budgetAmount: null,
		acceptedAt: null,
		budgetSentAt: null,
		clientAcceptedAt: null,
		createdAt: "2026-04-17T10:00:00.000Z",
		updatedAt: "2026-04-17T10:00:00.000Z",
	},
	{
		id: 2,
		clientAddress: "0xcliente",
		clientName: "Cliente",
		technicianAddress: "0xtec",
		technicianName: "Tecnico conectado",
		description: "Ajuste de rede",
		status: "orcada",
		budgetAmount: 240,
		acceptedAt: "2026-04-17T11:00:00.000Z",
		budgetSentAt: "2026-04-17T12:00:00.000Z",
		clientAcceptedAt: null,
		createdAt: "2026-04-17T09:00:00.000Z",
		updatedAt: "2026-04-17T12:00:00.000Z",
	},
];

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useServiceRequestsPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useServiceRequestsPanel>) => void>();

	function Probe() {
		capture(useServiceRequestsPanel());
		return null;
	}

	function getLatest() {
		return capture.mock.calls.at(-1)?.[0];
	}

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
		serviceMocks.loadServiceRequests.mockResolvedValue(initialRequests);
		serviceMocks.acceptServiceBudget.mockResolvedValue({
			...initialRequests[1],
			status: "aceito_cliente",
			clientAcceptedAt: "2026-04-17T13:00:00.000Z",
			updatedAt: "2026-04-17T13:00:00.000Z",
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("carrega apenas as ordens do cliente", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.loadServiceRequests).toHaveBeenCalledWith({
			clientAddress: "0xcliente",
		});
		expect(getLatest()?.clientRequests).toHaveLength(2);
		expect(getLatest()?.visibleRequests).toHaveLength(2);
		expect(getLatest()?.walletAddress).toBe("0xcliente");
	});

	it("abre o modal da ordem e aceita o orcamento passando pelo contrato primeiro", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(2);
			await flush();
		});

		expect(getLatest()?.requestModalOpened).toBe(true);
		expect(getLatest()?.requestModalRequest?.id).toBe(2);

		await act(async () => {
			await getLatest()?.onAcceptBudget();
			await flush();
		});

		expect(serviceMocks.aceitarOrcamentoNoContrato).toHaveBeenCalledWith({}, 2);
		expect(serviceMocks.acceptServiceBudget).toHaveBeenCalledWith({
			id: 2,
			clientAddress: "0xcliente",
		});
		expect(getLatest()?.requestModalOpened).toBe(false);
		expect(getLatest()?.busyRequestId).toBeNull();
	});

	it("aplica filtros locais de busca e status", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onQueryChange("rede");
			getLatest()?.onStatusFilterChange("orcada");
			await flush();
		});

		expect(getLatest()?.visibleRequests).toHaveLength(1);
		expect(getLatest()?.visibleRequests[0]?.id).toBe(2);
	});
});

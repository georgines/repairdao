// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { useServiceRequestsPanel } from "@/hooks/useServiceRequestsPanel";

const serviceMocks = vi.hoisted(() => ({
	loadServiceRequests: vi.fn(),
	abrirDisputaNoContrato: vi.fn(),
	enviarOrcamentoNoContrato: vi.fn(),
	autorizarPagamentoNoContrato: vi.fn(),
	acceptServiceBudget: vi.fn(),
	aceitarOrcamentoNoContrato: vi.fn(),
	completeServiceRequest: vi.fn(),
	concluirOrdemNoContrato: vi.fn(),
	confirmarEntregaNoContrato: vi.fn(),
	avaliarServicoNoContrato: vi.fn(),
	carregarEstadoAvaliacaoNoContrato: vi.fn(),
	carregarEstadoConfirmacaoEntregaNoContrato: vi.fn(),
	openServiceDispute: vi.fn(),
	sendServiceBudget: vi.fn(),
}));

const profileState = vi.hoisted(() => ({
	perfilAtivo: "cliente" as "cliente" | "tecnico" | null,
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

vi.mock("@/hooks/useAccountProfile", () => ({
	useAccountProfile: () => ({
		perfilAtivo: profileState.perfilAtivo,
	}),
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: () => ({}),
}));

vi.mock("@/services/serviceRequests/serviceRequestBlockchain", () => ({
	abrirDisputaNoContrato: serviceMocks.abrirDisputaNoContrato,
	enviarOrcamentoNoContrato: serviceMocks.enviarOrcamentoNoContrato,
	autorizarPagamentoNoContrato: serviceMocks.autorizarPagamentoNoContrato,
	aceitarOrcamentoNoContrato: serviceMocks.aceitarOrcamentoNoContrato,
	concluirOrdemNoContrato: serviceMocks.concluirOrdemNoContrato,
	confirmarEntregaNoContrato: serviceMocks.confirmarEntregaNoContrato,
	avaliarServicoNoContrato: serviceMocks.avaliarServicoNoContrato,
	carregarEstadoAvaliacaoNoContrato: serviceMocks.carregarEstadoAvaliacaoNoContrato,
	carregarEstadoConfirmacaoEntregaNoContrato: serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato,
}));

vi.mock("@/services/serviceRequests/serviceRequestClient", () => ({
	loadServiceRequests: serviceMocks.loadServiceRequests,
	acceptServiceBudget: serviceMocks.acceptServiceBudget,
	completeServiceRequest: serviceMocks.completeServiceRequest,
	openServiceDispute: serviceMocks.openServiceDispute,
	sendServiceBudget: serviceMocks.sendServiceBudget,
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
		completedAt: null,
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
		walletState.connected = true;
		walletState.address = "0xcliente";
		profileState.perfilAtivo = "cliente";
		serviceMocks.loadServiceRequests.mockResolvedValue(initialRequests);
		serviceMocks.carregarEstadoAvaliacaoNoContrato.mockResolvedValue(null);
		serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato.mockResolvedValue(null);
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
		expect(serviceMocks.loadServiceRequests).toHaveBeenCalledWith({
			technicianAddress: "0xcliente",
		});
		expect(getLatest()?.clientRequests).toHaveLength(2);
		expect(getLatest()?.visibleRequests).toHaveLength(2);
		expect(getLatest()?.walletAddress).toBe("0xcliente");
	});

	it("paga o orcamento passando pelo contrato primeiro", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(2, "pay");
			await flush();
		});

		expect(getLatest()?.requestModalOpened).toBe(true);
		expect(getLatest()?.requestModalAction).toBe("pay");
		expect(getLatest()?.requestModalRequest?.id).toBe(2);

		await act(async () => {
			await getLatest()?.onPayBudget();
			await flush();
		});

		expect(serviceMocks.autorizarPagamentoNoContrato).toHaveBeenCalledWith({}, 240);
		expect(serviceMocks.aceitarOrcamentoNoContrato).toHaveBeenCalledWith({}, 2);
		expect(serviceMocks.acceptServiceBudget).toHaveBeenCalledWith({
			id: 2,
			clientAddress: "0xcliente",
		});
		expect(getLatest()?.requestModalOpened).toBe(false);
		expect(getLatest()?.busyRequestId).toBeNull();
	});

	it("envia o orcamento passando pelo contrato primeiro", async () => {
		walletState.address = "0xtec";
		profileState.perfilAtivo = "tecnico";
		serviceMocks.loadServiceRequests.mockResolvedValue([
			{
				...initialRequests[0],
				technicianAddress: "0xtec",
				status: "aberta",
			},
		]);
		serviceMocks.sendServiceBudget.mockResolvedValue({
			...initialRequests[0],
			technicianAddress: "0xtec",
			status: "orcada",
			budgetAmount: 350,
			acceptedAt: "2026-04-17T11:00:00.000Z",
			budgetSentAt: "2026-04-17T12:00:00.000Z",
			updatedAt: "2026-04-17T12:00:00.000Z",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(1, "budget");
			getLatest()?.onRequestModalBudgetChange(350);
			await flush();
		});

		expect(getLatest()?.requestModalAction).toBe("budget");

		await act(async () => {
			await getLatest()?.onSubmitBudget();
			await flush();
		});

		expect(serviceMocks.enviarOrcamentoNoContrato).toHaveBeenCalledWith({}, 1, 350);
		expect(serviceMocks.sendServiceBudget).toHaveBeenCalledWith({
			id: 1,
			technicianAddress: "0xtec",
			budgetAmount: 350,
		});
		expect(getLatest()?.requestModalOpened).toBe(false);
	});

	it("conclui a ordem pelo tecnico passando pelo contrato primeiro", async () => {
		walletState.address = "0xtec";
		profileState.perfilAtivo = "tecnico";
		serviceMocks.loadServiceRequests.mockResolvedValue([
			{
				...initialRequests[1],
				technicianAddress: "0xtec",
				status: "aceito_cliente",
				clientAcceptedAt: "2026-04-17T13:00:00.000Z",
			},
		]);
		serviceMocks.completeServiceRequest.mockResolvedValue({
			...initialRequests[1],
			technicianAddress: "0xtec",
			status: "concluida",
			clientAcceptedAt: "2026-04-17T13:00:00.000Z",
			completedAt: "2026-04-17T14:00:00.000Z",
			updatedAt: "2026-04-17T14:00:00.000Z",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(2, "complete");
			await flush();
		});

		expect(getLatest()?.requestModalAction).toBe("complete");

		await act(async () => {
			await getLatest()?.onCompleteOrder();
			await flush();
		});

		expect(serviceMocks.concluirOrdemNoContrato).toHaveBeenCalledWith({}, 2);
		expect(serviceMocks.completeServiceRequest).toHaveBeenCalledWith({
			id: 2,
			technicianAddress: "0xtec",
		});
		expect(getLatest()?.requestModalOpened).toBe(false);
		expect(getLatest()?.busyRequestId).toBeNull();
	});

	it("confirma a entrega pelo cliente passando pelo contrato primeiro", async () => {
		walletState.address = "0xcliente";
		profileState.perfilAtivo = "cliente";
		serviceMocks.loadServiceRequests.mockResolvedValue([
			{
				...initialRequests[1],
				status: "concluida",
				completedAt: "2026-04-17T14:00:00.000Z",
				updatedAt: "2026-04-17T14:00:00.000Z",
			},
		]);
		serviceMocks.confirmarEntregaNoContrato.mockResolvedValue({ hash: "0x5" });
		serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato.mockResolvedValueOnce(null);
		serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato.mockResolvedValueOnce({
			deliveryConfirmedAt: "2026-04-17T15:00:00.000Z",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
			await flush();
		});

		expect(getLatest()?.clientRequests[0]?.status).toBe("concluida");

		await act(async () => {
			getLatest()?.onOpenRequestModal(2, "confirm");
			await flush();
		});

		expect(getLatest()?.requestModalAction).toBe("confirm");
		expect(getLatest()?.requestModalRequest?.status).toBe("concluida");

		await act(async () => {
			await getLatest()?.onConfirmDelivery();
			await flush();
		});

		expect(serviceMocks.confirmarEntregaNoContrato).toHaveBeenCalledWith({}, 2);
		expect(serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato).toHaveBeenCalledWith({}, 2);
		expect(getLatest()?.requestModalOpened).toBe(false);
		expect(getLatest()?.busyRequestId).toBeNull();
		expect(getLatest()?.clientRequests[0]?.deliveryConfirmedAt).toBe("2026-04-17T15:00:00.000Z");
	});

	it("avalia a ordem concluida passando pelo contrato primeiro", async () => {
		walletState.address = "0xcliente";
		profileState.perfilAtivo = "cliente";
		serviceMocks.loadServiceRequests.mockResolvedValue([
			{
				...initialRequests[1],
				status: "concluida",
				completedAt: "2026-04-17T14:00:00.000Z",
				updatedAt: "2026-04-17T14:00:00.000Z",
			},
		]);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(2, "rate");
			getLatest()?.onRequestModalRatingChange(4);
			await flush();
		});

		await act(async () => {
			await getLatest()?.onRateService();
			await flush();
		});

		expect(serviceMocks.avaliarServicoNoContrato).toHaveBeenCalledWith({}, 2, 4);
		expect(serviceMocks.carregarEstadoAvaliacaoNoContrato).toHaveBeenCalledWith({}, 2);
		expect(getLatest()?.requestModalOpened).toBe(false);
	});

	it("abre disputa passando pelo contrato primeiro", async () => {
		walletState.address = "0xcliente";
		profileState.perfilAtivo = "cliente";
		const disputeRequest: ServiceRequestSummary = {
			id: 3,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Instalacao de tomada",
			status: "concluida",
			budgetAmount: 180,
			acceptedAt: "2026-04-17T11:00:00.000Z",
			budgetSentAt: "2026-04-17T12:00:00.000Z",
			clientAcceptedAt: "2026-04-17T13:00:00.000Z",
			completedAt: "2026-04-17T14:00:00.000Z",
			createdAt: "2026-04-17T09:00:00.000Z",
			updatedAt: "2026-04-17T14:00:00.000Z",
		};
		serviceMocks.loadServiceRequests.mockResolvedValue([
			disputeRequest,
		]);
		serviceMocks.abrirDisputaNoContrato.mockResolvedValue({ hash: "0x4" });
		serviceMocks.openServiceDispute.mockResolvedValue({
			...disputeRequest,
			status: "disputada",
			disputedAt: "2026-04-17T15:00:00.000Z",
			disputeReason: "Servico nao foi concluido corretamente",
			updatedAt: "2026-04-17T15:00:00.000Z",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(3, "dispute");
			getLatest()?.onRequestModalDisputeReasonChange("Servico nao foi concluido corretamente");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onOpenDispute();
			await flush();
		});

		expect(serviceMocks.abrirDisputaNoContrato).toHaveBeenCalledWith({}, 3, "Servico nao foi concluido corretamente");
		expect(serviceMocks.openServiceDispute).toHaveBeenCalledWith({
			id: 3,
			actorAddress: "0xcliente",
			disputeReason: "Servico nao foi concluido corretamente",
		});
		expect(getLatest()?.requestModalOpened).toBe(false);
	});

	it("mescla o estado de avaliacao vindo do contrato", async () => {
		serviceMocks.loadServiceRequests.mockResolvedValue([
			{
				...initialRequests[1],
				status: "concluida",
				completedAt: "2026-04-17T14:00:00.000Z",
				updatedAt: "2026-04-17T14:00:00.000Z",
			},
		]);
		serviceMocks.carregarEstadoAvaliacaoNoContrato.mockResolvedValue({
			clientRated: true,
			technicianRated: false,
		});
		serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato.mockResolvedValue({
			deliveryConfirmedAt: null,
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.clientRequests[0]?.clientRated).toBe(true);
		expect(serviceMocks.carregarEstadoAvaliacaoNoContrato).toHaveBeenCalledWith({}, 2);
		expect(serviceMocks.carregarEstadoConfirmacaoEntregaNoContrato).toHaveBeenCalledWith({}, 2);
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

	it("mostra o motivo de disputa e bloqueia submissao vazia", async () => {
		const disputeRequest: ServiceRequestSummary = {
			id: 3,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Instalacao de tomada",
			status: "concluida",
			budgetAmount: 180,
			acceptedAt: "2026-04-17T11:00:00.000Z",
			budgetSentAt: "2026-04-17T12:00:00.000Z",
			clientAcceptedAt: "2026-04-17T13:00:00.000Z",
			completedAt: "2026-04-17T14:00:00.000Z",
			createdAt: "2026-04-17T09:00:00.000Z",
			updatedAt: "2026-04-17T14:00:00.000Z",
		};
		serviceMocks.loadServiceRequests.mockResolvedValue([
			disputeRequest,
		]);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(3, "dispute");
			await flush();
		});

		expect(getLatest()?.requestModalAction).toBe("dispute");

		await act(async () => {
			await getLatest()?.onOpenDispute();
			await flush();
		});

		expect(getLatest()?.error).toBe("Informe o motivo da disputa.");
	});

	it("bloqueia a aceitacao quando nao ha carteira ou ordem selecionada", async () => {
		walletState.connected = false;
		walletState.address = null;

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.onPayBudget();
			await flush();
		});

		expect(getLatest()?.error).toBe("Conecte a carteira para pagar o orcamento.");
	});

	it("mantem walletAddress nulo quando a carteira esta conectada mas sem endereco", async () => {
		walletState.connected = true;
		walletState.address = null;

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.walletAddress).toBeNull();
		expect(serviceMocks.loadServiceRequests).not.toHaveBeenCalled();
	});

	it("bloqueia a aceitacao quando a ordem nao tem orcamento", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(1, "pay");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onPayBudget();
			await flush();
		});

		expect(getLatest()?.error).toBe("A ordem precisa ter um orcamento enviado antes do pagamento.");
	});

	it("bloqueia a aceitacao quando nenhuma ordem esta selecionada", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onCloseRequestModal();
			await flush();
		});

		await act(async () => {
			await getLatest()?.onPayBudget();
			await flush();
		});

		expect(getLatest()?.error).toBe("Selecione uma ordem de servico para pagar o orcamento.");
	});

	it("limpa os filtros locais", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onQueryChange("lampada");
			getLatest()?.onStatusFilterChange("orcada");
			getLatest()?.onClearFilters();
			await flush();
		});

		expect(getLatest()?.query).toBe("");
		expect(getLatest()?.statusFilter).toBe("all");
	});

	it("usa a mensagem padrao quando a carga inicial falha com valor nao tipado", async () => {
		serviceMocks.loadServiceRequests.mockRejectedValueOnce("falha bruta");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao foi possivel carregar as ordens de servico.");
	});

	it("usa a mensagem do erro quando a carga inicial falha com Error", async () => {
		serviceMocks.loadServiceRequests.mockRejectedValueOnce(new Error("falha de rede"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.error).toBe("falha de rede");
	});

	it("aceita filtro nulo como all e retorna modal vazio para ordem inexistente", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onStatusFilterChange(null);
			getLatest()?.onOpenRequestModal(999, "details");
			await flush();
		});

		expect(getLatest()?.statusFilter).toBe("all");
		expect(getLatest()?.requestModalRequest).toBeNull();
	});

	it("usa a mensagem do erro quando o pagamento falha com Error", async () => {
		serviceMocks.acceptServiceBudget.mockRejectedValueOnce(new Error("falha de pagamento"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(2, "pay");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onPayBudget();
			await flush();
		});

		expect(getLatest()?.error).toBe("falha de pagamento");
	});

	it("usa a mensagem padrao quando o pagamento falha com valor nao tipado", async () => {
		serviceMocks.aceitarOrcamentoNoContrato.mockRejectedValue("falha bruta");
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onOpenRequestModal(2, "pay");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onPayBudget();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao foi possivel pagar o orcamento em RPT.");
	});

	it("atualiza as ordens no intervalo", async () => {
		vi.useFakeTimers();
		serviceMocks.loadServiceRequests
			.mockResolvedValueOnce(initialRequests)
			.mockResolvedValueOnce(initialRequests)
			.mockResolvedValueOnce([
				...initialRequests,
				{
					id: 3,
					clientAddress: "0xcliente",
					clientName: "Cliente",
					technicianAddress: "0xtec2",
					technicianName: "Tecnico 2",
					description: "Nova ordem",
					status: "aberta",
					budgetAmount: null,
					acceptedAt: null,
					budgetSentAt: null,
					clientAcceptedAt: null,
					createdAt: "2026-04-17T14:00:00.000Z",
					updatedAt: "2026-04-17T14:00:00.000Z",
				},
			])
			.mockResolvedValueOnce([
				...initialRequests,
				{
					id: 3,
					clientAddress: "0xcliente",
					clientName: "Cliente",
					technicianAddress: "0xtec2",
					technicianName: "Tecnico 2",
					description: "Nova ordem",
					status: "aberta",
					budgetAmount: null,
					acceptedAt: null,
					budgetSentAt: null,
					clientAcceptedAt: null,
					createdAt: "2026-04-17T14:00:00.000Z",
					updatedAt: "2026-04-17T14:00:00.000Z",
				},
			]);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.loadServiceRequests).toHaveBeenCalledTimes(2);

		await act(async () => {
			vi.advanceTimersByTime(15000);
			await flush();
		});

		expect(serviceMocks.loadServiceRequests).toHaveBeenCalledTimes(4);
		expect(getLatest()?.clientRequests).toHaveLength(3);
	});
});

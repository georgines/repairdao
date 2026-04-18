// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { useDisputesPanel } from "@/hooks/useDisputesPanel";

const serviceMocks = vi.hoisted(() => ({
	loadServiceRequests: vi.fn(),
	carregarMetricasElegibilidade: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
	carregarDisputaNoContrato: vi.fn(),
	carregarEvidenciasDaDisputaNoContrato: vi.fn(),
	enviarEvidenciaNaDisputaNoContrato: vi.fn(),
	votarNaDisputaNoContrato: vi.fn(),
	resolverDisputaNoContrato: vi.fn(),
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

vi.mock("@/services/eligibility/eligibilityMetrics", () => ({
	carregarMetricasElegibilidade: serviceMocks.carregarMetricasElegibilidade,
}));

vi.mock("@/services/serviceRequests/serviceRequestClient", () => ({
	loadServiceRequests: serviceMocks.loadServiceRequests,
}));

vi.mock("@/services/disputes/disputeBlockchain", () => ({
	carregarDisputaNoContrato: serviceMocks.carregarDisputaNoContrato,
	carregarEvidenciasDaDisputaNoContrato: serviceMocks.carregarEvidenciasDaDisputaNoContrato,
	enviarEvidenciaNaDisputaNoContrato: serviceMocks.enviarEvidenciaNaDisputaNoContrato,
	votarNaDisputaNoContrato: serviceMocks.votarNaDisputaNoContrato,
	resolverDisputaNoContrato: serviceMocks.resolverDisputaNoContrato,
}));

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useDisputesPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useDisputesPanel>) => void>();

	function Probe() {
		capture(useDisputesPanel());
		return null;
	}

	function getLatest() {
		return capture.mock.calls.at(-1)?.[0];
	}

	const disputeRequest: ServiceRequestSummary = {
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
	};

	const disputeContract = {
		id: "21",
		estado: "janela_votacao",
		ordemId: "21",
		motivo: "Servico fora do combinado",
		openedBy: "0xcliente",
		opposingParty: "0xtec",
		votesForOpener: 3,
		votesForOpposing: 1,
		deadline: "2026-04-18T12:00:00.000Z",
		resolved: false,
	};

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();

		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				address: "0xcliente",
			},
		});
		serviceMocks.obterEthereumProvider.mockReturnValue({});
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5000000000000000000n,
			rptBalance: "5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
		serviceMocks.loadServiceRequests.mockResolvedValue([disputeRequest]);
		serviceMocks.carregarDisputaNoContrato.mockResolvedValue(disputeContract);
		serviceMocks.carregarEvidenciasDaDisputaNoContrato.mockResolvedValue([
			{
				submittedBy: "0xcliente",
				content: "Fotos",
				timestamp: "2026-04-17T15:00:00.000Z",
			},
		]);
		serviceMocks.enviarEvidenciaNaDisputaNoContrato.mockResolvedValue("ok");
		serviceMocks.votarNaDisputaNoContrato.mockResolvedValue("ok");
		serviceMocks.resolverDisputaNoContrato.mockResolvedValue("ok");
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("carrega uma disputa aberta e permite enviar evidencia", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
			await flush();
		});

		expect(getLatest()?.visibleDisputes).toHaveLength(1);

		await act(async () => {
			getLatest()?.onSelectDispute(21);
			await flush();
		});

		expect(getLatest()?.selectedDisputeId).toBe(21);

		await act(async () => {
			getLatest()?.onEvidenceDraftChange("nova evidencia");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onSubmitEvidence();
			await flush();
		});

		expect(serviceMocks.enviarEvidenciaNaDisputaNoContrato).toHaveBeenCalledWith(
			{},
			{
				papel: "cliente",
				depositoAtivo: true,
				tokens: 1,
				envolvidoEmDisputa: true,
			},
			21,
			"0xcliente",
			"nova evidencia",
		);
		expect(serviceMocks.carregarEvidenciasDaDisputaNoContrato).toHaveBeenCalledWith({}, 21);
		expect(getLatest()?.evidenceSubmittedDisputeIds).toContain(21);
	});

	it("permite votar quando nao faz parte da disputa", async () => {
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				address: "0xvotante",
			},
		});
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5000000000000000000n,
			rptBalance: "5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: null,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
			await flush();
		});

		await act(async () => {
			getLatest()?.onSelectDispute(21);
			await flush();
		});

		await act(async () => {
			getLatest()?.onVoteSupportChange(false);
			await flush();
		});

		await act(async () => {
			await getLatest()?.onSubmitVote();
			await flush();
		});

		expect(serviceMocks.votarNaDisputaNoContrato).toHaveBeenCalledWith(
			{},
			{
				papel: "outsider",
				depositoAtivo: true,
				tokens: 1,
				envolvidoEmDisputa: false,
			},
			21,
			"0xvotante",
			false,
		);
		expect(getLatest()?.votedDisputeIds).toContain(21);
	});

	it("permite resolver a disputa quando o prazo termina", async () => {
		serviceMocks.carregarDisputaNoContrato.mockResolvedValue({
			...disputeContract,
			estado: "encerrada",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
			await flush();
		});

		await act(async () => {
			getLatest()?.onSelectDispute(21);
			await flush();
		});

		await act(async () => {
			await getLatest()?.onResolveDispute();
			await flush();
		});

		expect(serviceMocks.resolverDisputaNoContrato).toHaveBeenCalledWith({}, 21);
	});
});

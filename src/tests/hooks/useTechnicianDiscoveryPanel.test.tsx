// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserSummary } from "@/services/users";
import { useTechnicianDiscoveryPanel } from "@/hooks/useTechnicianDiscoveryPanel";

const accountProfile = vi.hoisted(() => ({
	perfilAtivo: "cliente" as "cliente" | "tecnico" | null,
}));

const walletMocks = vi.hoisted(() => ({
	state: {
		connected: true,
		address: "0xcliente",
	},
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: () => ({
		state: walletMocks.state,
	}),
}));

vi.mock("@/hooks/useAccountProfile", () => ({
	useAccountProfile: () => ({
		perfilAtivo: accountProfile.perfilAtivo,
	}),
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: () => ({}) ,
}));

const serviceMocks = vi.hoisted(() => ({
	criarOrdemServicoNoContrato: vi.fn().mockResolvedValue("0xtx"),
	createServiceRequest: vi.fn().mockResolvedValue({
		id: 1,
		clientAddress: "0xcliente",
		clientName: "0xcliente",
		technicianAddress: "0xaaa",
		technicianName: "Ana Costa",
		description: "Servico",
		status: "aberta",
		budgetAmount: null,
		acceptedAt: null,
		budgetSentAt: null,
		clientAcceptedAt: null,
		completedAt: null,
		createdAt: "2026-04-17T10:00:00.000Z",
		updatedAt: "2026-04-17T10:00:00.000Z",
	}),
	loadServiceRequests: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/serviceRequests/serviceRequestBlockchain", () => ({
	criarOrdemServicoNoContrato: serviceMocks.criarOrdemServicoNoContrato,
}));

vi.mock("@/services/serviceRequests/serviceRequestClient", () => ({
	createServiceRequest: serviceMocks.createServiceRequest,
	loadServiceRequests: serviceMocks.loadServiceRequests,
}));

const initialTechnicians: UserSummary[] = [
	{
		address: "0xbbb",
		name: "Bruno Silva",
		expertiseArea: "Redes",
		role: "tecnico",
		badgeLevel: "bronze",
		reputation: 12,
		depositLevel: 1,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T10:00:00.000Z",
	},
	{
		address: "0xaaa",
		name: "Ana Costa",
		expertiseArea: "Eletrica",
		role: "tecnico",
		badgeLevel: "silver",
		reputation: 18,
		depositLevel: 2,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T11:00:00.000Z",
	},
];

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useTechnicianDiscoveryPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useTechnicianDiscoveryPanel>) => void>();

	function Probe() {
		capture(useTechnicianDiscoveryPanel({ initialTechnicians }));
		return null;
	}

	function EmptyProbe() {
		capture(useTechnicianDiscoveryPanel({ initialTechnicians: [] }));
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
		walletMocks.state = {
			connected: true,
			address: "0xcliente",
		};
		accountProfile.perfilAtivo = "cliente";
		serviceMocks.loadServiceRequests.mockResolvedValue([]);
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("exibe os tecnicos iniciais e seleciona o primeiro", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.totalTechnicians).toBe(2);
		expect(getLatest()?.filteredTechnicians).toHaveLength(2);
		expect(getLatest()?.selectedTechnician?.name).toBe("Bruno Silva");
		expect(getLatest()?.technicianModalOpened).toBe(false);
		expect(getLatest()?.canHire).toBe(true);
	});

	it("filtra por texto e reputacao", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onQueryChange("ana");
			getLatest()?.onMinReputationChange(15);
			await flush();
		});

		expect(getLatest()?.filteredTechnicians).toHaveLength(1);
		expect(getLatest()?.filteredTechnicians[0].name).toBe("Ana Costa");
	});

	it("abre o modal de detalhes ao selecionar um tecnico", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onSelectTechnician("0xaaa");
			await flush();
		});

		expect(getLatest()?.selectedTechnician?.address).toBe("0xaaa");
		expect(getLatest()?.technicianModalMode).toBe("details");
		expect(getLatest()?.technicianModalOpened).toBe(true);
	});

	it("abre o modal de contratacao e cria a ordem de servico", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onHireTechnician("0xaaa");
			getLatest()?.onServiceDescriptionChange("Troca de fiação");
			await flush();
		});

		expect(getLatest()?.technicianModalMode).toBe("hire");
		expect(getLatest()?.technicianModalOpened).toBe(true);

		await act(async () => {
			await getLatest()?.onConfirmTechnicianHire();
			await flush();
		});

		expect(getLatest()?.contractedTechnician?.address).toBe("0xaaa");
		expect(getLatest()?.hasOpenOrder).toBe(true);
		expect(getLatest()?.canHire).toBe(false);
		expect(getLatest()?.technicianModalMode).toBeNull();
		expect(getLatest()?.technicianModalOpened).toBe(false);
		expect(getLatest()?.serviceDescription).toBe("");
	});

	it("fecha o modal sem confirmar e limpa filtros", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onQueryChange("ana");
			getLatest()?.onMinReputationChange("abc");
			getLatest()?.onHireTechnician("0xaaa");
			await flush();
		});

		await act(async () => {
			getLatest()?.onCloseTechnicianModal();
			getLatest()?.onClearFilters();
			await flush();
		});

		expect(getLatest()?.query).toBe("");
		expect(getLatest()?.minReputation).toBe(0);
		expect(getLatest()?.technicianModalMode).toBeNull();
		expect(getLatest()?.technicianModalOpened).toBe(false);
	});

	it("mantem estado vazio quando nao ha tecnicos iniciais", async () => {
		await act(async () => {
			root.render(<EmptyProbe />);
			await flush();
		});

		expect(getLatest()?.totalTechnicians).toBe(0);
		expect(getLatest()?.selectedTechnician).toBeNull();
		expect(getLatest()?.minReputation).toBe(0);
		expect(getLatest()?.hasResults).toBe(false);
	});

	it("impede contratar quando o cliente ja possui uma ordem aberta", async () => {
		serviceMocks.loadServiceRequests.mockResolvedValueOnce([
			{
				id: 99,
				clientAddress: "0xcliente",
				clientName: "Cliente",
				technicianAddress: "0xbbb",
				technicianName: "Bruno Silva",
				description: "Ordem aberta",
				status: "aberta",
				budgetAmount: null,
				acceptedAt: null,
				budgetSentAt: null,
				clientAcceptedAt: null,
				completedAt: null,
				createdAt: "2026-04-17T08:00:00.000Z",
				updatedAt: "2026-04-17T08:00:00.000Z",
			},
		]);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.hasOpenOrder).toBe(true);
		expect(getLatest()?.canHire).toBe(false);
	});

	it("bloqueia a contratacao quando a carteira nao esta conectada", async () => {
		walletMocks.state = {
			connected: false,
			address: null,
		};

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onHireTechnician("0xaaa");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onConfirmTechnicianHire();
			await flush();
		});

		expect(getLatest()?.requestError).toBe("Conecte a carteira para contratar o servico.");
	});

	it("usa mensagem padrao quando a criacao da ordem falha com valor nao tipado", async () => {
		serviceMocks.createServiceRequest.mockRejectedValueOnce("falha bruta");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onHireTechnician("0xaaa");
			getLatest()?.onServiceDescriptionChange("Troca de cabo");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onConfirmTechnicianHire();
			await flush();
		});

		expect(getLatest()?.requestError).toBe("Nao foi possivel criar a ordem de servico.");
	});

	it("usa a mensagem do erro quando a criacao da ordem falha com Error", async () => {
		serviceMocks.createServiceRequest.mockRejectedValueOnce(new Error("falha de contrato"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onHireTechnician("0xaaa");
			getLatest()?.onServiceDescriptionChange("Troca de cabo");
			await flush();
		});

		await act(async () => {
			await getLatest()?.onConfirmTechnicianHire();
			await flush();
		});

		expect(getLatest()?.requestError).toBe("falha de contrato");
	});

	it("retorna cedo quando nao ha tecnico selecionado", async () => {
		await act(async () => {
			root.render(<EmptyProbe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.onConfirmTechnicianHire();
			await flush();
		});

		expect(serviceMocks.criarOrdemServicoNoContrato).not.toHaveBeenCalled();
		expect(serviceMocks.createServiceRequest).not.toHaveBeenCalled();
	});
});

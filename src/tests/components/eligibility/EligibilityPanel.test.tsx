// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasElegibilidade: vi.fn(),
	depositarTokens: vi.fn(),
	sacarDeposito: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/eligibility/eligibilityMetrics", () => ({
	carregarMetricasElegibilidade: serviceMocks.carregarMetricasElegibilidade,
}));

vi.mock("@/services/eligibility/tokenDeposit", () => ({
	depositarTokens: serviceMocks.depositarTokens,
	sacarDeposito: serviceMocks.sacarDeposito,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

import { EligibilityPanel } from "@/components/eligibility/EligibilityPanel/EligibilityPanel";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("EligibilityPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		(globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: "",
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		});
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();

		serviceMocks.obterEthereumProvider.mockReturnValue({ request: vi.fn() });
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				loading: false,
				address: "0x1234567890abcdef1234567890abcdef12345678",
				chainLabel: "Local",
				ethBalance: "0.5",
				usdBalance: "1000",
				ethUsdPrice: "2000",
			},
		});
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("renderiza os controles principais da elegibilidade", async () => {
		await act(async () => {
			root.render(
				<MantineProvider>
					<EligibilityPanel />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("Nivel do cliente");
		expect(container.textContent).toContain("Conta ativa");
		expect(container.textContent).toContain("Quanto RPT deseja depositar");
		expect(container.textContent).toContain("Valor minimo: 100 RPT.");
	});

	it("mostra zero quando a carteira esta desconectada", async () => {
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "9.9",
				usdBalance: "999",
				ethUsdPrice: "0",
			},
		});

		await act(async () => {
			root.render(
				<MantineProvider>
					<EligibilityPanel />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("ETH 0,0000");
		expect(container.textContent).toContain("Carteira desconectada");
		expect(container.textContent).toContain("RPT 0,00");
		expect(serviceMocks.depositarTokens).not.toHaveBeenCalled();
	});
});

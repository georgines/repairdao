// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const pageMocks = vi.hoisted(() => ({
	useDepositConfigurationAccess: vi.fn(),
	DepositConfigurationPanel: vi.fn(() => <div>painel</div>),
}));

vi.mock("@/hooks/useDepositConfigurationAccess", () => ({
	useDepositConfigurationAccess: pageMocks.useDepositConfigurationAccess,
}));

vi.mock("@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanel", () => ({
	DepositConfigurationPanel: pageMocks.DepositConfigurationPanel,
}));

import DepositConfigurationPage from "@/app/eligibility/configuration/page";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("app/eligibility/configuration/page", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
		pageMocks.useDepositConfigurationAccess.mockReturnValue({
			loading: false,
			error: null,
			configuracao: {
				network: "local",
				contractAddress: "0xdeposit",
				ownerAddress: "0xowner",
				minDepositRaw: "100000000000000000000",
				minDeposit: "100",
				syncedAt: "2026-04-19T12:00:00.000Z",
			},
			donoAtual: "0xowner",
			donoAtualCurto: "0xowne...wner",
			isOwner: true,
			connected: true,
			walletAddress: "0xowner",
			refresh: vi.fn(),
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("renderiza o painel quando a carteira e do dono", async () => {
		await act(async () => {
			root.render(
				<MantineProvider>
					<DepositConfigurationPage />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("painel");
	});

	it("mostra carregamento enquanto busca acesso", async () => {
		pageMocks.useDepositConfigurationAccess.mockReturnValueOnce({
			loading: true,
			error: null,
			configuracao: null,
			donoAtual: null,
			donoAtualCurto: "Carteira desconectada",
			isOwner: false,
			connected: true,
			walletAddress: "0xowner",
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
				<MantineProvider>
					<DepositConfigurationPage />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("Carregando pagina administrativa");
	});

	it("mostra aviso quando a carteira esta desconectada", async () => {
		pageMocks.useDepositConfigurationAccess.mockReturnValueOnce({
			loading: false,
			error: null,
			configuracao: null,
			donoAtual: null,
			donoAtualCurto: "Carteira desconectada",
			isOwner: false,
			connected: false,
			walletAddress: null,
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
				<MantineProvider>
					<DepositConfigurationPage />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("Carteira desconectada");
	});

	it("mostra erro quando a leitura da configuracao falha", async () => {
		pageMocks.useDepositConfigurationAccess.mockReturnValueOnce({
			loading: false,
			error: "Falha ao ler",
			configuracao: null,
			donoAtual: "0xowner",
			donoAtualCurto: "0xowne...wner",
			isOwner: false,
			connected: true,
			walletAddress: "0xowner",
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
				<MantineProvider>
					<DepositConfigurationPage />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("Falha ao carregar a configuracao");
		expect(container.textContent).toContain("Falha ao ler");
	});

	it("nao renderiza nada quando a carteira conectada nao e do dono", async () => {
		pageMocks.useDepositConfigurationAccess.mockReturnValueOnce({
			loading: false,
			error: null,
			configuracao: null,
			donoAtual: "0xowner",
			donoAtualCurto: "0xowne...wner",
			isOwner: false,
			connected: true,
			walletAddress: "0xnot-owner",
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
				<MantineProvider>
					<DepositConfigurationPage />
				</MantineProvider>,
			);
			await flush();
		});

		expect(pageMocks.DepositConfigurationPanel).not.toHaveBeenCalled();
	});
});

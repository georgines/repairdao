// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const pageMocks = vi.hoisted(() => ({
	useSystemConfigurationAccess: vi.fn(),
	SystemConfigurationPanel: vi.fn(() => <div>painel</div>),
}));

vi.mock("@/hooks/useSystemConfigurationAccess", () => ({
	useSystemConfigurationAccess: pageMocks.useSystemConfigurationAccess,
}));

vi.mock("@/components/system/SystemConfigurationPanel/SystemConfigurationPanel", () => ({
	SystemConfigurationPanel: pageMocks.SystemConfigurationPanel,
}));

import SystemConfigurationPage from "@/app/configuration/page";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("app/configuration/page", () => {
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
		pageMocks.useSystemConfigurationAccess.mockReturnValue({
			loading: false,
			error: null,
			configuracao: {
				network: "local",
				depositContractAddress: "0xdeposit",
				depositOwnerAddress: "0xowner",
				minDepositRaw: "100000000000000000000",
				minDeposit: "100",
				tokenContractAddress: "0xtoken",
				tokenOwnerAddress: "0xowner",
				tokensPerEthRaw: "1000",
				tokensPerEth: "1000",
				syncedAt: "2026-04-19T12:00:00.000Z",
			},
			donoDepositoAtual: "0xowner",
			donoDepositoAtualCurto: "0xowne...wner",
			donoTokenAtual: "0xowner",
			donoTokenAtualCurto: "0xowne...wner",
			isDepositOwner: true,
			isTokenOwner: true,
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
					<SystemConfigurationPage />
					</MantineProvider>,
				);
				await flush();
			});

		expect(container.textContent).toContain("painel");
	});

	it("mostra carregamento enquanto busca acesso", async () => {
		pageMocks.useSystemConfigurationAccess.mockReturnValueOnce({
			loading: true,
			error: null,
			configuracao: null,
			donoDepositoAtual: null,
			donoDepositoAtualCurto: "Carteira desconectada",
			donoTokenAtual: null,
			donoTokenAtualCurto: "Carteira desconectada",
			isDepositOwner: false,
			isTokenOwner: false,
			isOwner: false,
			connected: true,
			walletAddress: "0xowner",
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
					<MantineProvider>
					<SystemConfigurationPage />
					</MantineProvider>,
				);
				await flush();
			});

		expect(container.textContent).toContain("Carregando configuracoes do sistema");
	});

	it("mostra aviso quando a carteira esta desconectada", async () => {
		pageMocks.useSystemConfigurationAccess.mockReturnValueOnce({
			loading: false,
			error: null,
			configuracao: null,
			donoDepositoAtual: null,
			donoDepositoAtualCurto: "Carteira desconectada",
			donoTokenAtual: null,
			donoTokenAtualCurto: "Carteira desconectada",
			isDepositOwner: false,
			isTokenOwner: false,
			isOwner: false,
			connected: false,
			walletAddress: null,
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
					<MantineProvider>
					<SystemConfigurationPage />
					</MantineProvider>,
				);
				await flush();
			});

		expect(container.textContent).toContain("Carteira desconectada");
	});

	it("mostra erro quando a leitura da configuracao falha", async () => {
		pageMocks.useSystemConfigurationAccess.mockReturnValueOnce({
			loading: false,
			error: "Falha ao ler",
			configuracao: null,
			donoDepositoAtual: "0xowner",
			donoDepositoAtualCurto: "0xowne...wner",
			donoTokenAtual: "0xowner",
			donoTokenAtualCurto: "0xowne...wner",
			isDepositOwner: false,
			isTokenOwner: false,
			isOwner: false,
			connected: true,
			walletAddress: "0xowner",
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
					<MantineProvider>
					<SystemConfigurationPage />
					</MantineProvider>,
				);
				await flush();
			});

		expect(container.textContent).toContain("Falha ao carregar a configuracao");
		expect(container.textContent).toContain("Falha ao ler");
	});

	it("nao renderiza nada quando a carteira conectada nao e do dono", async () => {
		pageMocks.useSystemConfigurationAccess.mockReturnValueOnce({
			loading: false,
			error: null,
			configuracao: null,
			donoDepositoAtual: "0xowner",
			donoDepositoAtualCurto: "0xowne...wner",
			donoTokenAtual: "0xowner",
			donoTokenAtualCurto: "0xowne...wner",
			isDepositOwner: false,
			isTokenOwner: false,
			isOwner: false,
			connected: true,
			walletAddress: "0xnot-owner",
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(
					<MantineProvider>
					<SystemConfigurationPage />
					</MantineProvider>,
				);
				await flush();
			});

		expect(pageMocks.SystemConfigurationPanel).not.toHaveBeenCalled();
	});
});
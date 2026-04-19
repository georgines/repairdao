// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	atualizarMinDepositNoContrato: vi.fn(),
	atualizarTokensPerEthNoContrato: vi.fn(),
	useSystemConfigurationAccess: vi.fn(),
	obterEthereumProvider: vi.fn(),
}));

vi.mock("@/services/system/systemConfigurationClient", () => ({
	atualizarMinDepositNoContrato: serviceMocks.atualizarMinDepositNoContrato,
	atualizarTokensPerEthNoContrato: serviceMocks.atualizarTokensPerEthNoContrato,
}));

vi.mock("@/hooks/useSystemConfigurationAccess", () => ({
	useSystemConfigurationAccess: serviceMocks.useSystemConfigurationAccess,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

import { useSystemConfiguration } from "@/hooks/useSystemConfiguration";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useSystemConfiguration", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useSystemConfiguration>) => void>();

	function Probe() {
		capture(useSystemConfiguration());
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
		serviceMocks.obterEthereumProvider.mockReturnValue({ ethereum: true });
		serviceMocks.useSystemConfigurationAccess.mockReturnValue({
			loading: false,
			error: null,
			configuracao: {
				network: "local",
				depositContractAddress: "0xdeposit",
				depositOwnerAddress: "0xdeposit-owner",
				minDepositRaw: "100000000000000000000",
				minDeposit: "100",
				tokenContractAddress: "0xtoken",
				tokenOwnerAddress: "0xtoken-owner",
				tokensPerEthRaw: "1000",
				tokensPerEth: "1000",
				syncedAt: "2026-04-19T12:00:00.000Z",
			},
			donoDepositoAtual: "0xdeposit-owner",
			donoDepositoAtualCurto: "0xdepo...wner",
			isDepositOwner: true,
			donoTokenAtual: "0xtoken-owner",
			donoTokenAtualCurto: "0xtoke...wner",
			isTokenOwner: true,
			isOwner: true,
			connected: true,
			walletAddress: "0xowner",
			refresh: vi.fn().mockResolvedValue({
				network: "local",
				depositContractAddress: "0xdeposit",
				depositOwnerAddress: "0xdeposit-owner",
				minDepositRaw: "150000000000000000000",
				minDeposit: "150",
				tokenContractAddress: "0xtoken",
				tokenOwnerAddress: "0xtoken-owner",
				tokensPerEthRaw: "1500",
				tokensPerEth: "1500",
				syncedAt: "2026-04-19T12:01:00.000Z",
			}),
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("preenche os valores iniciais com a configuracao atual", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.minDeposit).toBe("100");
		expect(getLatest()?.editingMinDeposit).toBe("100");
		expect(getLatest()?.tokensPerEth).toBe("1000");
		expect(getLatest()?.editingTokensPerEth).toBe("1000");
	});

	it("envia a alteracao do deposito minimo para o contrato e recarrega", async () => {
		const refresh = vi.fn().mockResolvedValue({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: "150000000000000000000",
			minDeposit: "150",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: "1500",
			tokensPerEth: "1500",
			syncedAt: "2026-04-19T12:01:00.000Z",
		});

		serviceMocks.useSystemConfigurationAccess.mockReturnValue({
			loading: false,
			error: null,
			configuracao: {
				network: "local",
				depositContractAddress: "0xdeposit",
				depositOwnerAddress: "0xdeposit-owner",
				minDepositRaw: "100000000000000000000",
				minDeposit: "100",
				tokenContractAddress: "0xtoken",
				tokenOwnerAddress: "0xtoken-owner",
				tokensPerEthRaw: "1000",
				tokensPerEth: "1000",
				syncedAt: "2026-04-19T12:00:00.000Z",
			},
			donoDepositoAtual: "0xdeposit-owner",
			donoDepositoAtualCurto: "0xdepo...wner",
			isDepositOwner: true,
			donoTokenAtual: "0xtoken-owner",
			donoTokenAtualCurto: "0xtoke...wner",
			isTokenOwner: true,
			isOwner: true,
			connected: true,
			walletAddress: "0xowner",
			refresh,
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.setEditingMinDeposit("150");
			await flush();
		});

		await act(async () => {
			await getLatest()?.submitMinDeposit();
			await flush();
		});

		expect(serviceMocks.atualizarMinDepositNoContrato).toHaveBeenCalledWith({ ethereum: true }, "150");
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(getLatest()?.editingMinDeposit).toBe("150");
	});

	it("envia a alteracao da taxa de cambio para o contrato e recarrega", async () => {
		const refresh = vi.fn().mockResolvedValue({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: "150000000000000000000",
			minDeposit: "150",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: "1500",
			tokensPerEth: "1500",
			syncedAt: "2026-04-19T12:01:00.000Z",
		});

		serviceMocks.useSystemConfigurationAccess.mockReturnValue({
			loading: false,
			error: null,
			configuracao: {
				network: "local",
				depositContractAddress: "0xdeposit",
				depositOwnerAddress: "0xdeposit-owner",
				minDepositRaw: "100000000000000000000",
				minDeposit: "100",
				tokenContractAddress: "0xtoken",
				tokenOwnerAddress: "0xtoken-owner",
				tokensPerEthRaw: "1000",
				tokensPerEth: "1000",
				syncedAt: "2026-04-19T12:00:00.000Z",
			},
			donoDepositoAtual: "0xdeposit-owner",
			donoDepositoAtualCurto: "0xdepo...wner",
			isDepositOwner: true,
			donoTokenAtual: "0xtoken-owner",
			donoTokenAtualCurto: "0xtoke...wner",
			isTokenOwner: true,
			isOwner: true,
			connected: true,
			walletAddress: "0xowner",
			refresh,
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.setEditingTokensPerEth("1500");
			await flush();
		});

		await act(async () => {
			await getLatest()?.submitTokensPerEth();
			await flush();
		});

		expect(serviceMocks.atualizarTokensPerEthNoContrato).toHaveBeenCalledWith({ ethereum: true }, "1500");
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(getLatest()?.editingTokensPerEth).toBe("1500");
	});

	it("bloqueia o envio quando a carteira nao esta conectada", async () => {
		serviceMocks.useSystemConfigurationAccess.mockReturnValue({
			loading: false,
			error: null,
			configuracao: null,
			donoDepositoAtual: null,
			donoDepositoAtualCurto: "Carteira desconectada",
			isDepositOwner: false,
			donoTokenAtual: null,
			donoTokenAtualCurto: "Carteira desconectada",
			isTokenOwner: false,
			isOwner: false,
			connected: false,
			walletAddress: null,
			refresh: vi.fn(),
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.submitMinDeposit();
			await flush();
		});

		await act(async () => {
			await getLatest()?.submitTokensPerEth();
			await flush();
		});

		expect(getLatest()?.minDepositError).toBe("Conecte a carteira para alterar o deposito minimo.");
		expect(getLatest()?.tokensPerEthError).toBe("Conecte a carteira para alterar a taxa de cambio.");
		expect(serviceMocks.atualizarMinDepositNoContrato).not.toHaveBeenCalled();
		expect(serviceMocks.atualizarTokensPerEthNoContrato).not.toHaveBeenCalled();
	});
});

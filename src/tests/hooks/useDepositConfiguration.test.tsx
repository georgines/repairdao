// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	atualizarMinDepositNoContrato: vi.fn(),
	useDepositConfigurationAccess: vi.fn(),
	obterEthereumProvider: vi.fn(),
}));

vi.mock("@/services/deposit/depositConfigurationClient", () => ({
	atualizarMinDepositNoContrato: serviceMocks.atualizarMinDepositNoContrato,
}));

vi.mock("@/hooks/useDepositConfigurationAccess", () => ({
	useDepositConfigurationAccess: serviceMocks.useDepositConfigurationAccess,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

import { useDepositConfiguration } from "@/hooks/useDepositConfiguration";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useDepositConfiguration", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useDepositConfiguration>) => void>();

	function Probe() {
		capture(useDepositConfiguration());
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
		serviceMocks.useDepositConfigurationAccess.mockReturnValue({
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
			refresh: vi.fn().mockResolvedValue({
				network: "local",
				contractAddress: "0xdeposit",
				ownerAddress: "0xowner",
				minDepositRaw: "150000000000000000000",
				minDeposit: "150",
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

	it("preenche o valor inicial com a configuracao atual", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.minDeposit).toBe("100");
		expect(getLatest()?.editingMinDeposit).toBe("100");
	});

	it("envia a alteracao para o contrato e recarrega o valor", async () => {
		const refresh = vi.fn().mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: "150000000000000000000",
			minDeposit: "150",
			syncedAt: "2026-04-19T12:01:00.000Z",
		});

		serviceMocks.useDepositConfigurationAccess.mockReturnValue({
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
			await getLatest()?.submit();
			await flush();
		});

		expect(serviceMocks.atualizarMinDepositNoContrato).toHaveBeenCalledWith({ ethereum: true }, "150");
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(getLatest()?.editingMinDeposit).toBe("150");
	});

	it("bloqueia o envio quando a carteira nao esta conectada", async () => {
		serviceMocks.useDepositConfigurationAccess.mockReturnValue({
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
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.submit();
			await flush();
		});

		expect(getLatest()?.formError).toBe("Conecte a carteira para alterar o deposito minimo.");
		expect(serviceMocks.atualizarMinDepositNoContrato).not.toHaveBeenCalled();
	});
});


// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarConfiguracaoDeposito: vi.fn(),
	assinarMudancaDeRedeNoCliente: vi.fn(),
	useWalletStatus: vi.fn(),
	obterEthereumProvider: vi.fn(),
}));

let networkListener: (() => void) | undefined;

vi.mock("@/services/deposit/depositConfigurationClient", () => ({
	carregarConfiguracaoDeposito: serviceMocks.carregarConfiguracaoDeposito,
}));

vi.mock("@/services/blockchain/rpcConfig", () => ({
	assinarMudancaDeRedeNoCliente: serviceMocks.assinarMudancaDeRedeNoCliente,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

import { useDepositConfigurationAccess } from "@/hooks/useDepositConfigurationAccess";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useDepositConfigurationAccess", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useDepositConfigurationAccess>) => void>();

	function Probe() {
		capture(useDepositConfigurationAccess());
		return null;
	}

	function getLatest() {
		return capture.mock.calls.at(-1)?.[0];
	}

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		networkListener = undefined;
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				address: "0xowner",
				loading: false,
				chainLabel: "Local",
				ethBalance: "0",
				usdBalance: "0",
				ethUsdPrice: "0",
			},
		});
		serviceMocks.obterEthereumProvider.mockReturnValue({ ethereum: true });
		serviceMocks.carregarConfiguracaoDeposito.mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
		serviceMocks.assinarMudancaDeRedeNoCliente.mockImplementation((listener: () => void) => {
			networkListener = listener;
			return () => {};
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("carrega a configuracao e identifica o dono", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.carregarConfiguracaoDeposito).toHaveBeenCalledTimes(1);
		expect(getLatest()?.isOwner).toBe(true);
		expect(getLatest()?.donoAtualCurto).toContain("0xow");
		expect(getLatest()?.configuracao?.minDeposit).toBe("100");
	});

	it("sinaliza acesso negado quando a carteira nao e dona", async () => {
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				address: "0xnot-owner",
				loading: false,
				chainLabel: "Local",
				ethBalance: "0",
				usdBalance: "0",
				ethUsdPrice: "0",
			},
		});
		serviceMocks.obterEthereumProvider.mockReturnValue({ ethereum: true });

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.isOwner).toBe(false);
	});

	it("desliga a carga quando nao existe provider", async () => {
		serviceMocks.obterEthereumProvider.mockReturnValue(undefined);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.loading).toBe(false);
		expect(serviceMocks.carregarConfiguracaoDeposito).not.toHaveBeenCalled();
	});

	it("expõe erro quando a leitura da configuracao falha", async () => {
		serviceMocks.carregarConfiguracaoDeposito.mockRejectedValueOnce(new Error("falha no carregamento"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.error).toBe("falha no carregamento");
		expect(getLatest()?.configuracao).toBeNull();
	});

	it("recarrega quando a rede muda", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		serviceMocks.carregarConfiguracaoDeposito.mockResolvedValueOnce({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: "150000000000000000000",
			minDeposit: "150",
			syncedAt: "2026-04-19T12:01:00.000Z",
		});

		await act(async () => {
			networkListener?.();
			await flush();
		});

		expect(serviceMocks.carregarConfiguracaoDeposito).toHaveBeenCalledTimes(2);
		expect(getLatest()?.configuracao?.minDeposit).toBe("150");
	});
});

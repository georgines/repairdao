// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	comprarToken: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/wallet/tokenPurchase", () => ({
	comprarToken: serviceMocks.comprarToken,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

import { useStorePanel } from "@/hooks/useStorePanel";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useStorePanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useStorePanel>) => void>();

	function Probe() {
		capture(useStorePanel(vi.fn()));
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

		serviceMocks.obterEthereumProvider.mockReturnValue({ request: vi.fn() });
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				loading: false,
				address: "0x1234567890abcdef1234567890abcdef12345678",
				chainLabel: "Local",
				ethBalance: "0.5",
				usdBalance: "1000",
			},
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("expõe os dados da carteira e o fluxo de compra", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.connected).toBe(true);
		expect(getLatest()?.ethBalance).toBe("0.5");
		expect(getLatest()?.usdBalance).toBe("1000");

		serviceMocks.comprarToken.mockResolvedValue("ok");

		await act(async () => {
			await getLatest()?.handleBuy();
			await flush();
		});

		expect(serviceMocks.comprarToken).toHaveBeenCalledWith(expect.any(Object), "0,10");
	});

	it("registra erro quando a compra falha", async () => {
		serviceMocks.comprarToken.mockRejectedValue(new Error("falha de compra"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleBuy();
			await flush();
		});

		expect(getLatest()?.error).toBe("falha de compra");
	});

	it("usa mensagem padrao quando a compra falha com valor nao tipado", async () => {
		serviceMocks.comprarToken.mockRejectedValue("falha bruta");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleBuy();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao foi possivel concluir a compra de tokens.");
	});

	it("bloqueia a compra quando a carteira nao esta disponivel", async () => {
		serviceMocks.obterEthereumProvider.mockReturnValue(undefined);
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "0",
				usdBalance: "0",
			},
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleBuy();
			await flush();
		});

		expect(serviceMocks.comprarToken).not.toHaveBeenCalled();
		expect(getLatest()?.error).toBe("Conecte a carteira para trocar ETH por RPT.");
	});

	it("zera os saldos visiveis quando a carteira esta desconectada", async () => {
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "9.9",
				usdBalance: "999",
			},
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.connected).toBe(false);
		expect(getLatest()?.ethBalance).toBe("0");
		expect(getLatest()?.usdBalance).toBe("0");
		expect(getLatest()?.walletNotice).toBe("Carteira desconectada");
	});
});

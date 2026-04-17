// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasDaLoja: vi.fn(),
	comprarToken: vi.fn(),
	depositarTokens: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/store/storeMetrics", () => ({
	carregarMetricasDaLoja: serviceMocks.carregarMetricasDaLoja,
}));

vi.mock("@/services/wallet/tokenPurchase", () => ({
	comprarToken: serviceMocks.comprarToken,
}));

vi.mock("@/services/store/tokenDeposit", () => ({
	depositarTokens: serviceMocks.depositarTokens,
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
		serviceMocks.carregarMetricasDaLoja.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
		vi.useRealTimers();
	});

	it("expõe os dados da carteira e o fluxo de compra", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.connected).toBe(true);
		expect(getLatest()?.ethBalance).toBe("0.5");
		expect(getLatest()?.rptBalance).toBe("5.5");
		expect(getLatest()?.tokensPerEth).toBe("250");
		expect(getLatest()?.rptPreview).toBe("25");

		await act(async () => {
			getLatest()?.handleQuantityEthChange("0,25");
			await flush();
		});

		expect(getLatest()?.rptPreview).toBe("62.5");

		serviceMocks.comprarToken.mockResolvedValue("ok");

		await act(async () => {
			await getLatest()?.handleBuy();
			await flush();
		});

	expect(serviceMocks.comprarToken).toHaveBeenCalledWith(expect.any(Object), "0,25");
	expect(serviceMocks.carregarMetricasDaLoja).toHaveBeenCalledWith("0x1234567890abcdef1234567890abcdef12345678");
	});

	it("zera o simulador quando a quantidade eh invalida", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleQuantityEthChange("abc");
			await flush();
		});

		expect(getLatest()?.rptPreview).toBe("0");
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
		expect(serviceMocks.carregarMetricasDaLoja).toHaveBeenCalledWith(null);
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
		expect(getLatest()?.rptBalance).toBe("0");
		expect(getLatest()?.tokensPerEth).toBe("250");
		expect(getLatest()?.rptPreview).toBe("25");
		expect(getLatest()?.walletNotice).toBe("Carteira desconectada");

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Conecte a carteira para depositar os RPT.");
		expect(serviceMocks.depositarTokens).not.toHaveBeenCalled();
	});

	it("zera as metricas quando o carregamento da loja falha", async () => {
		serviceMocks.carregarMetricasDaLoja.mockRejectedValue(new Error("falha"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.rptBalance).toBe("0");
		expect(getLatest()?.tokensPerEth).toBe("0");
	});

	it("atualiza as metricas no intervalo", async () => {
		vi.useFakeTimers();
		serviceMocks.carregarMetricasDaLoja
			.mockResolvedValueOnce({
				rptBalanceRaw: 5500000000000000000n,
				rptBalance: "5.5",
				tokensPerEthRaw: 250n,
				tokensPerEth: "250",
			})
			.mockResolvedValueOnce({
				rptBalanceRaw: 7000000000000000000n,
				rptBalance: "7",
				tokensPerEthRaw: 300n,
				tokensPerEth: "300",
			});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaLoja).toHaveBeenCalledTimes(1);

		await act(async () => {
			vi.advanceTimersByTime(15000);
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaLoja).toHaveBeenCalledTimes(2);
		expect(getLatest()?.rptBalance).toBe("7");
		expect(getLatest()?.tokensPerEth).toBe("300");
	});

	it("nao atualiza as metricas apos desmontar durante a sincronizacao", async () => {
		let resolver!: (value: {
			rptBalanceRaw: bigint;
			rptBalance: string;
			tokensPerEthRaw: bigint;
			tokensPerEth: string;
		}) => void;

		serviceMocks.carregarMetricasDaLoja.mockReturnValue(
			new Promise((resolve) => {
				resolver = resolve;
			}),
		);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			root.unmount();
			await flush();
		});

		await act(async () => {
			resolver({
				rptBalanceRaw: 9000000000000000000n,
				rptBalance: "9",
				tokensPerEthRaw: 400n,
				tokensPerEth: "400",
			});
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaLoja).toHaveBeenCalledTimes(1);
	});

	it("nao atualiza as metricas apos desmontar quando a sincronizacao falha", async () => {
		let rejecter!: (reason?: unknown) => void;

		serviceMocks.carregarMetricasDaLoja.mockReturnValue(
			new Promise((_, reject) => {
				rejecter = reject;
			}),
		);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			root.unmount();
			await flush();
		});

		await act(async () => {
			rejecter(new Error("falha"));
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaLoja).toHaveBeenCalledTimes(1);
	});

	it("oferece deposito com o saldo de RPT disponivel", async () => {
		serviceMocks.depositarTokens.mockResolvedValue("ok");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(serviceMocks.depositarTokens).toHaveBeenCalledWith(expect.any(Object), 5500000000000000000n);
	});

	it("bloqueia o deposito quando nao ha RPT disponivel", async () => {
		serviceMocks.carregarMetricasDaLoja.mockResolvedValue({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(serviceMocks.depositarTokens).not.toHaveBeenCalled();
		expect(getLatest()?.error).toBe("Nao ha RPT disponivel para depositar.");
	});

	it("usa mensagem padrao quando o deposito falha", async () => {
		serviceMocks.depositarTokens.mockRejectedValue("falha bruta");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao foi possivel concluir o deposito dos RPT.");
	});

	it("usa a mensagem do erro quando o deposito falha com Error", async () => {
		serviceMocks.depositarTokens.mockRejectedValue(new Error("falha de deposito"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("falha de deposito");
	});
});

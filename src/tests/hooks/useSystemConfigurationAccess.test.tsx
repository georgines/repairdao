// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarConfiguracaoSistema: vi.fn(),
	assinarMudancaDeRedeNoCliente: vi.fn(),
	useWalletStatus: vi.fn(),
	obterEthereumProvider: vi.fn(),
}));

let networkListener: (() => void) | undefined;

vi.mock("@/services/system/systemConfigurationClient", () => ({
	carregarConfiguracaoSistema: serviceMocks.carregarConfiguracaoSistema,
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

import { useSystemConfigurationAccess } from "@/hooks/useSystemConfigurationAccess";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useSystemConfigurationAccess", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useSystemConfigurationAccess>) => void>();

	function Probe() {
		capture(useSystemConfigurationAccess());
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
		serviceMocks.carregarConfiguracaoSistema.mockResolvedValue({
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

	it("carrega a configuracao e identifica os donos", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.carregarConfiguracaoSistema).toHaveBeenCalledTimes(1);
		expect(getLatest()?.isDepositOwner).toBe(true);
		expect(getLatest()?.isTokenOwner).toBe(true);
		expect(getLatest()?.isOwner).toBe(true);
		expect(getLatest()?.donoDepositoAtualCurto).toContain("0xow");
		expect(getLatest()?.donoTokenAtualCurto).toContain("0xow");
		expect(getLatest()?.configuracao?.minDeposit).toBe("100");
	});

	it("sinaliza acesso negado quando a carteira nao e dona de nenhum contrato", async () => {
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
		expect(serviceMocks.carregarConfiguracaoSistema).not.toHaveBeenCalled();
	});

	it("expõe erro quando a leitura da configuracao falha", async () => {
		serviceMocks.carregarConfiguracaoSistema.mockRejectedValueOnce(new Error("falha no carregamento"));

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

		serviceMocks.carregarConfiguracaoSistema.mockResolvedValueOnce({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xowner",
			minDepositRaw: "150000000000000000000",
			minDeposit: "150",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xowner",
			tokensPerEthRaw: "1500",
			tokensPerEth: "1500",
			syncedAt: "2026-04-19T12:01:00.000Z",
		});

		await act(async () => {
			networkListener?.();
			await flush();
		});

		expect(serviceMocks.carregarConfiguracaoSistema).toHaveBeenCalledTimes(2);
		expect(getLatest()?.configuracao?.minDeposit).toBe("150");
	});
});

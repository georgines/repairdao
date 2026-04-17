// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarCarteira: vi.fn(),
	definirReconexaoAutomatica: vi.fn(),
	obterEthereumProvider: vi.fn(),
	obterRedeAtual: vi.fn(),
	reconexaoAutomaticaHabilitada: vi.fn(),
}));

vi.mock("@/services/wallet/walletReader", () => ({
	carregarCarteira: serviceMocks.carregarCarteira,
	obterRedeAtual: serviceMocks.obterRedeAtual,
}));

vi.mock("@/services/wallet/preferences", () => ({
	definirReconexaoAutomatica: serviceMocks.definirReconexaoAutomatica,
	reconexaoAutomaticaHabilitada: serviceMocks.reconexaoAutomaticaHabilitada,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

vi.mock("@/services/wallet/walletSnapshot", () => ({
	ESTADO_INICIAL_CARTEIRA: {
		connected: false,
		address: null,
		chainLabel: "Sem conexao",
		ethBalance: "0",
		usdBalance: "$0.00",
	},
}));

import { useWalletStatus } from "@/hooks/useWalletStatus";
import { redefinirEstadoCarteira } from "@/services/wallet/walletStatusStore";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useWalletStatus", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useWalletStatus>) => void>();

	function Probe() {
		capture(useWalletStatus());
		return null;
	}

	function getLatest() {
		return capture.mock.calls.at(-1)?.[0];
	}

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		redefinirEstadoCarteira();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("mantém o estado inicial quando não existe provider", async () => {
		serviceMocks.obterEthereumProvider.mockReturnValue(undefined);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.state.connected).toBe(false);
		expect(getLatest()?.actionLabel).toBe("Conectar carteira");
		expect(serviceMocks.carregarCarteira).not.toHaveBeenCalled();

		await act(async () => {
			await getLatest()?.actionHandler();
			await flush();
		});

		expect(getLatest()?.state.loading).toBe(false);
	});

	it("sincroniza como desconectado quando autoconexão está desabilitada", async () => {
		const listeners = new Map<string, (...args: unknown[]) => void>();
		const ethereum = {
			on: vi.fn((event: string, handler: (...args: unknown[]) => void) => listeners.set(event, handler)),
			removeListener: vi.fn((event: string) => listeners.delete(event)),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(false);
		serviceMocks.obterRedeAtual.mockResolvedValue("Local");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.state.chainLabel).toBe("Local");
		expect(getLatest()?.state.connected).toBe(false);
		expect(serviceMocks.carregarCarteira).not.toHaveBeenCalled();
		expect(ethereum.on).toHaveBeenCalledTimes(2);

		await act(async () => {
			root.unmount();
			await flush();
		});

		expect(ethereum.removeListener).toHaveBeenCalledTimes(2);
	});

	it("usa fallback quando obterRedeAtual falha", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(false);
		serviceMocks.obterRedeAtual.mockRejectedValue(new Error("falha"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.state.chainLabel).toBe("Sem conexao");
	});

	it("sincroniza carteira conectada e reage a eventos", async () => {
		const listeners = new Map<string, (...args: unknown[]) => void>();
		const ethereum = {
			on: vi.fn((event: string, handler: (...args: unknown[]) => void) => listeners.set(event, handler)),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(true);
		serviceMocks.carregarCarteira
			.mockResolvedValueOnce({
				connected: true,
				address: "0xabc",
				chainLabel: "Base",
				ethBalance: "2",
				usdBalance: "3",
			})
			.mockResolvedValueOnce({
				connected: true,
				address: "0xdef",
				chainLabel: "Base",
				ethBalance: "5",
				usdBalance: "6",
			});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.state.connected).toBe(true);
		expect(getLatest()?.actionLabel).toBe("Desconectar carteira");

		await act(async () => {
			listeners.get("accountsChanged")?.();
			await flush();
		});

		expect(serviceMocks.carregarCarteira).toHaveBeenNthCalledWith(1, ethereum, false);
		expect(serviceMocks.carregarCarteira).toHaveBeenNthCalledWith(2, ethereum, false);
		expect(getLatest()?.state.address).toBe("0xdef");

		serviceMocks.carregarCarteira.mockResolvedValueOnce({
			connected: true,
			address: "0x999",
			chainLabel: "Base",
			ethBalance: "8",
			usdBalance: "9",
		});

		await act(async () => {
			listeners.get("chainChanged")?.();
			await flush();
		});

		expect(serviceMocks.carregarCarteira).toHaveBeenNthCalledWith(3, ethereum, false);
		expect(getLatest()?.state.address).toBe("0x999");
	});

	it("recupera de erro na sincronização inicial", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(true);
		serviceMocks.carregarCarteira.mockRejectedValue(new Error("falha"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.state.connected).toBe(false);
		expect(getLatest()?.state.loading).toBe(false);
	});

	it("conecta manualmente e persiste a autoconexão", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(false);
		serviceMocks.obterRedeAtual.mockResolvedValue("Local");
		serviceMocks.carregarCarteira.mockResolvedValue({
			connected: true,
			address: "0x123",
			chainLabel: "Local",
			ethBalance: "8",
			usdBalance: "9",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.actionHandler();
			await flush();
		});

		expect(serviceMocks.carregarCarteira).toHaveBeenCalledWith(ethereum, true);
		expect(serviceMocks.definirReconexaoAutomatica).toHaveBeenCalledWith(true);
		expect(getLatest()?.state.connected).toBe(true);
		expect(getLatest()?.actionLabel).toBe("Desconectar carteira");
	});

	it("mantém loading falso quando conectar falha", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(false);
		serviceMocks.obterRedeAtual.mockResolvedValue("Local");
		serviceMocks.carregarCarteira.mockRejectedValue(new Error("falha"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.actionHandler();
			await flush();
		});

		expect(getLatest()?.state.loading).toBe(false);
		expect(getLatest()?.state.connected).toBe(false);
	});

	it("desconecta e limpa o estado quando já está conectado", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(true);
		serviceMocks.carregarCarteira.mockResolvedValue({
			connected: true,
			address: "0x123",
			chainLabel: "Local",
			ethBalance: "8",
			usdBalance: "9",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.actionHandler();
			await flush();
		});

		expect(serviceMocks.definirReconexaoAutomatica).toHaveBeenCalledWith(false);
		expect(getLatest()?.state.connected).toBe(false);
		expect(getLatest()?.state.address).toBeNull();
	});

	it("não atualiza estado após desmontar durante sincronização", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};
		let resolver!: (value: {
			connected: boolean;
			address: string | null;
			chainLabel: string;
			ethBalance: string;
			usdBalance: string;
		}) => void;

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(true);
		serviceMocks.carregarCarteira.mockReturnValue(
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
				connected: true,
				address: "0xlate",
				chainLabel: "Late",
				ethBalance: "1",
				usdBalance: "1",
			});
			await flush();
		});

		expect(getLatest()?.state.connected).toBe(false);
	});

	it("não atualiza estado após desmontar durante falha de sincronização", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};
		let rejecter!: (reason?: unknown) => void;

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(true);
		serviceMocks.carregarCarteira.mockReturnValue(
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
			rejecter(new Error("falha tardia"));
			await flush();
		});

		expect(getLatest()?.state.connected).toBe(false);
	});

	it("não atualiza estado após desmontar com autoconexão desabilitada", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};
		let resolver!: (value: string) => void;

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(false);
		serviceMocks.obterRedeAtual.mockReturnValue(
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
			resolver("Late");
			await flush();
		});

		expect(getLatest()?.state.connected).toBe(false);
	});
	it("sincroniza o estado entre consumidores diferentes sem recarregar", async () => {
		const ethereum = {
			on: vi.fn(),
			removeListener: vi.fn(),
		};

		serviceMocks.obterEthereumProvider.mockReturnValue(ethereum);
		serviceMocks.reconexaoAutomaticaHabilitada.mockReturnValue(true);
		serviceMocks.carregarCarteira.mockResolvedValue({
			connected: true,
			address: "0xabc",
			chainLabel: "Local",
			ethBalance: "5",
			usdBalance: "10",
		});

		await act(async () => {
			root.render(
				<>
					<Probe />
					<Probe />
				</>,
			);
			await flush();
		});

		expect(capture.mock.calls.at(-1)?.[0]?.state.connected).toBe(true);

		const handlerDesconectar = getLatest()?.actionHandler;

		await act(async () => {
			handlerDesconectar?.();
			await flush();
		});

		expect(capture.mock.calls.at(-1)?.[0]?.state.connected).toBe(false);
		expect(capture.mock.calls.at(-1)?.[0]?.state.ethBalance).toBe("0");

		serviceMocks.carregarCarteira.mockResolvedValueOnce({
			connected: true,
			address: "0xdef",
			chainLabel: "Local",
			ethBalance: "7",
			usdBalance: "14",
		});

		const handlerConectar = getLatest()?.actionHandler;

		await act(async () => {
			handlerConectar?.();
			await flush();
		});

		expect(capture.mock.calls.at(-1)?.[0]?.state.connected).toBe(true);
		expect(capture.mock.calls.at(-1)?.[0]?.state.ethBalance).toBe("7");
	});
});

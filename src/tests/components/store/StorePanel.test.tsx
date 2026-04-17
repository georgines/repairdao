// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

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

import { StorePanel } from "@/components/store/StorePanel/StorePanel";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("StorePanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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

	it("recarrega o painel apos uma compra concluida", async () => {
		serviceMocks.comprarToken.mockResolvedValue("ok");

		await act(async () => {
			root.render(
				<MantineProvider>
					<StorePanel />
				</MantineProvider>,
			);
			await flush();
		});

		const buttons = Array.from(container.querySelectorAll("button"));
		const buyButton = buttons.find((button) => button.textContent?.includes("Trocar ETH por RPT"));
		if (!buyButton) {
			throw new Error("Botao de compra nao encontrado.");
		}

		await act(async () => {
			buyButton.click();
			await flush();
		});

		expect(serviceMocks.comprarToken).toHaveBeenCalledWith(expect.any(Object), "0,10");
		expect(container.textContent).toContain("ETH 0,5000");
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
			},
		});

		await act(async () => {
			root.render(
				<MantineProvider>
					<StorePanel />
				</MantineProvider>,
			);
			await flush();
		});

		expect(container.textContent).toContain("ETH 0,0000");
		expect(container.textContent).toContain("Carteira desconectada");
		expect(serviceMocks.comprarToken).not.toHaveBeenCalled();
	});
});

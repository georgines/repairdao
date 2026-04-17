// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { StorePanelView } from "@/components/store/StorePanel/StorePanelView";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("StorePanelView", () => {
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
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await Promise.resolve();
		});
		container.remove();
	});

	it("renderiza a compra com saldos em ETH e USD", () => {
		const markup = renderWithMantine(
			<StorePanelView
				ethBalance="0.5"
				usdBalance="1000"
				ethUsdPrice="2000"
				rptBalance="10"
				tokensPerEth="250"
				rptPreview="62.5"
				walletNotice={null}
				quantityEth="0,25"
				buying={false}
				error={null}
				onQuantityEthChange={() => {}}
				onBuy={() => {}}
				connected={true}
			/>,
		);

		expect(markup).toContain("Trocar ETH por RPT");
		expect(markup).toContain("1 ETH = 250,00 RPT");
		expect(markup).toContain("RPT 10,00");
		expect(markup).toContain("ETH comprado 0,0400");
		expect(markup).toContain("USD comprado US$");
		expect(markup).toContain("80,00");
		expect(markup).toContain("Na carteira");
		expect(markup).toContain("ETH 0,5000");
		expect(markup).toContain("Quanto ETH quer gastar");
		expect(markup).toContain("62,50 RPT");
	});

	it("mostra zero e aviso quando a carteira esta desconectada", () => {
		const markup = renderWithMantine(
			<StorePanelView
				ethBalance="0"
				usdBalance="0"
				ethUsdPrice="0"
				rptBalance="0"
				tokensPerEth="0"
				rptPreview="0"
				walletNotice="Carteira desconectada"
				quantityEth="0,10"
				buying={false}
				error={null}
				onQuantityEthChange={() => {}}
				onBuy={() => {}}
				connected={false}
			/>,
		);

		expect(markup).toContain("ETH 0,0000");
		expect(markup).toContain("RPT 0,00");
		expect(markup).toContain("USD comprado US$");
		expect(markup).toContain("0,00");
		expect(markup).toContain("Na carteira");
		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("1 ETH = 0,00 RPT");
	});

	it("exibe valores grandes de RPT sem abreviar", () => {
		const markup = renderWithMantine(
			<StorePanelView
				ethBalance="0"
				usdBalance="0"
				ethUsdPrice="2000"
				rptBalance="1000000"
				tokensPerEth="1000000"
				rptPreview="1000000"
				walletNotice={null}
				quantityEth="1"
				buying={false}
				error={null}
				onQuantityEthChange={() => {}}
				onBuy={() => {}}
				connected={true}
			/>,
		);

		expect(markup).toContain("RPT 1.000.000,00");
		expect(markup).toContain("1 ETH = 1.000.000,00 RPT");
		expect(markup).toContain("Você receberá cerca de 1.000.000,00 RPT");
	});

	it("propaga mudanÃ§as e aÃ§Ãµes da interface", async () => {
		const onBuy = vi.fn();
		const onQuantityEthChange = vi.fn();

		await act(async () => {
			root.render(
				<MantineProvider>
					<StorePanelView
						ethBalance="0"
						usdBalance="0"
						ethUsdPrice="0"
						rptBalance="0"
						tokensPerEth="0"
						rptPreview="0"
						walletNotice="Carteira desconectada"
						quantityEth="0,10"
						buying={false}
						error="falha de compra"
						onQuantityEthChange={onQuantityEthChange}
						onBuy={onBuy}
						connected={true}
					/>
				</MantineProvider>,
			);
			await Promise.resolve();
		});

		const input = container.querySelector("input");
		if (!input) {
			throw new Error("Campo de quantidade nao encontrado.");
		}

		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

			if (!valueSetter) {
				throw new Error("Setter nativo do input nao encontrado.");
			}

			valueSetter.call(input, "0,25");
			input.dispatchEvent(new Event("input", { bubbles: true }));

			const buttons = Array.from(container.querySelectorAll("button"));
			buttons[0]?.click();
		});

		expect(onQuantityEthChange).toHaveBeenCalledWith("0,25");
		expect(onBuy).toHaveBeenCalledTimes(1);
		expect(container.textContent).toContain("falha de compra");
	});
});

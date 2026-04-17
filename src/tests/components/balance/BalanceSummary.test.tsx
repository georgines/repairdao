import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { BalanceSummary } from "@/components/balance/BalanceSummary";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("BalanceSummary", () => {
	it("calcula o resumo com sistema e carteira", () => {
		const markup = renderWithMantine(
			<BalanceSummary
				rptBalance="1000000"
				tokensPerEth="250"
				ethUsdPrice="2000"
				ethBalance="10"
				usdBalance="20000"
				note="Carteira desconectada"
			/>,
		);

		expect(markup).toContain("RPT 1.000.000,00");
		expect(markup).toContain("ETH comprado 4.000,0000");
		expect(markup).toContain("USD comprado US$");
		expect(markup).toContain("8.000.000,00");
		expect(markup).toContain("Na carteira");
		expect(markup).toContain("ETH 10,0000");
		expect(markup).toContain("USD US$");
		expect(markup).toContain("Carteira desconectada");
	});
});

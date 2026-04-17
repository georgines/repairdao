import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { BalanceSummaryView } from "@/components/balance/BalanceSummaryView";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("BalanceSummaryView", () => {
	it("renderiza o resumo com secoes genericas", () => {
		const markup = renderWithMantine(
			<BalanceSummaryView
				title="Saldo atual"
				primaryText="RPT 1.000.000,00"
				sections={[
					{
						separatorText: "No sistema",
						lines: ["ETH comprado 4000,0000", "USD comprado US$ 20.000,00"],
					},
					{
						separatorText: "Na carteira",
						lines: ["ETH 10,0000", "USD US$ 20.000,00"],
					},
				]}
				note="Carteira desconectada"
			/>,
		);

		expect(markup).toContain("Saldo atual");
		expect(markup).toContain("RPT 1.000.000,00");
		expect(markup).toContain("No sistema");
		expect(markup).toContain("ETH comprado 4000,0000");
		expect(markup).toContain("USD comprado US$");
		expect(markup).toContain("Na carteira");
		expect(markup).toContain("ETH 10,0000");
		expect(markup).toContain("USD US$");
		expect(markup).toContain("Carteira desconectada");
	});

	it("aceita secao sem separador e sem nota", () => {
		const markup = renderWithMantine(
			<BalanceSummaryView
				title="Resumo"
				primaryText="RPT 0,00"
				sections={[
					{
						lines: ["ETH 0,0000"],
					},
				]}
				note={null}
			/>,
		);

		expect(markup).toContain("Resumo");
		expect(markup).toContain("RPT 0,00");
		expect(markup).toContain("ETH 0,0000");
		expect(markup).not.toContain("Carteira desconectada");
	});
});

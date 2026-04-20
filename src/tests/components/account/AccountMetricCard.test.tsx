import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { AccountMetricCard } from "@/components/account/AccountPanel/AccountMetricCard/AccountMetricCard";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("AccountMetricCard", () => {
	it("renderiza titulo, valor e descricao", () => {
		const markup = renderWithMantine(
			<AccountMetricCard label="Deposito" value="RPT 150,00" description="Valor travado no contrato." />,
		);

		expect(markup).toContain("Deposito");
		expect(markup).toContain("RPT 150,00");
		expect(markup).toContain("Valor travado no contrato.");
	});
});

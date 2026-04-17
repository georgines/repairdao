import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import Home from "@/app/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/page", () => {
	it("renderiza a home com atalho para a loja", () => {
		const markup = renderWithMantine(<Home />);

		expect(markup).toContain("Economia inicial do RepairDAO");
		expect(markup).toContain("Ir para a loja");
		expect(markup).toContain('href="/store"');
	});
});

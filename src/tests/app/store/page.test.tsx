import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import StorePage from "@/app/store/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/store/page", () => {
	it("renderiza a loja com o card de compra de tokens", () => {
		const markup = renderWithMantine(<StorePage />);

		expect(markup).toContain("Comprar tokens");
		expect(markup).toContain("100 tokens");
	});
});

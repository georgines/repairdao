import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import Home from "@/app/page";

vi.mock("@/components/account/AccountPanel/AccountPanel", () => ({
	AccountPanel: () => <div>Account panel</div>,
}));

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/page", () => {
	it("renderiza a conta na rota inicial", () => {
		const markup = renderWithMantine(<Home />);

		expect(markup).toContain("Account panel");
	});
});

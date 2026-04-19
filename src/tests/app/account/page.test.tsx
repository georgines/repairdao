import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

vi.mock("@/components/account/AccountPanel/AccountPanel", () => ({
	AccountPanel: () => <div>Minha conta</div>,
}));

import AccountPage from "@/app/(pages)/account/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/account/page", () => {
	it("renderiza a pagina da conta", () => {
		const markup = renderWithMantine(<AccountPage />);

		expect(markup).toContain("Minha conta");
	});
});

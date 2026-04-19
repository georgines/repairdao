import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const disputesMocks = vi.hoisted(() => ({
	DisputesPanel: vi.fn(),
}));

vi.mock("@/components/disputes/DisputesPanel/DisputesPanel", () => ({
	DisputesPanel: () => {
		disputesMocks.DisputesPanel();
		return <div>disputas</div>;
	},
}));

import DisputesPage from "@/app/(pages)/disputes/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/disputes/page", () => {
	it("monta a pagina de disputas", () => {
		const markup = renderWithMantine(<DisputesPage />);

		expect(disputesMocks.DisputesPanel).toHaveBeenCalledTimes(1);
		expect(markup).toContain("disputas");
	});
});

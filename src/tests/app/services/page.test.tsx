import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const serviceMocks = vi.hoisted(() => ({
	ServiceRequestsPanel: vi.fn(),
}));

vi.mock("@/components/services/ServiceRequestsPanel/ServiceRequestsPanel", () => ({
	ServiceRequestsPanel: () => {
		serviceMocks.ServiceRequestsPanel();
		return <div>servicos</div>;
	},
}));

import ServicesPage from "@/app/(pages)/services/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/services/page", () => {
	it("monta a pagina de servicos", () => {
		const markup = renderWithMantine(<ServicesPage />);

		expect(serviceMocks.ServiceRequestsPanel).toHaveBeenCalledTimes(1);
		expect(markup).toContain("servicos");
	});
});

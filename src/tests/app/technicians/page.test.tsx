import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const serviceMocks = vi.hoisted(() => ({
	loadTechniciansForDiscovery: vi.fn(),
}));

vi.mock("@/services/users", () => ({
	loadTechniciansForDiscovery: serviceMocks.loadTechniciansForDiscovery,
}));

vi.mock("@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanel", () => ({
	TechnicianDiscoveryPanel: ({ initialTechnicians }: { initialTechnicians: Array<{ name: string }> }) => (
		<div>{initialTechnicians.map((tecnico) => tecnico.name).join(", ")}</div>
	),
}));

import TechniciansPage from "@/app/technicians/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/technicians/page", () => {
	it("carrega os tecnicos e monta a pagina", async () => {
		serviceMocks.loadTechniciansForDiscovery.mockResolvedValue([
			{
				address: "0xabc",
				name: "Ana Costa",
				role: "tecnico",
				badgeLevel: "bronze",
				reputation: 10,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: "2026-04-17T10:00:00.000Z",
			},
		]);

		const page = await TechniciansPage();
		const markup = renderWithMantine(page);

		expect(serviceMocks.loadTechniciansForDiscovery).toHaveBeenCalledTimes(1);
		expect(markup).toContain("Ana Costa");
	});
});

import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const panelMocks = vi.hoisted(() => ({
	useTechnicianDiscoveryPanel: vi.fn(),
}));

vi.mock("@/hooks/useTechnicianDiscoveryPanel", () => ({
	useTechnicianDiscoveryPanel: panelMocks.useTechnicianDiscoveryPanel,
}));

import { TechnicianDiscoveryPanel } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanel";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("components/technicians/TechnicianDiscoveryPanel", () => {
	it("conecta o hook ao view model", () => {
		panelMocks.useTechnicianDiscoveryPanel.mockReturnValue({
			query: "",
			minReputation: 0,
			totalTechnicians: 1,
			filteredTechnicians: [
				{
					address: "0xabc",
					name: "Ana Costa",
					expertiseArea: "Eletrica",
					role: "tecnico",
					badgeLevel: "bronze",
					reputation: 10,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
					updatedAt: "2026-04-17T10:00:00.000Z",
				},
			],
			selectedTechnician: {
				address: "0xabc",
				name: "Ana Costa",
				expertiseArea: "Eletrica",
				role: "tecnico",
				badgeLevel: "bronze",
				reputation: 10,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: "2026-04-17T10:00:00.000Z",
			},
			contractedTechnician: null,
			technicianModalMode: null,
			technicianModalOpened: false,
			hasResults: true,
			onQueryChange: vi.fn(),
			onMinReputationChange: vi.fn(),
			onSelectTechnician: vi.fn(),
			onHireTechnician: vi.fn(),
			onCloseTechnicianModal: vi.fn(),
			onConfirmTechnicianHire: vi.fn(),
			onClearFilters: vi.fn(),
		});

		const markup = renderWithMantine(
			<TechnicianDiscoveryPanel
				initialTechnicians={[
					{
						address: "0xabc",
						name: "Ana Costa",
						expertiseArea: "Eletrica",
						role: "tecnico",
						badgeLevel: "bronze",
						reputation: 10,
						depositLevel: 1,
						isActive: true,
						isEligible: true,
						updatedAt: "2026-04-17T10:00:00.000Z",
					},
				]}
			/>,
		);

		expect(markup).toContain("Ana Costa");
		expect(panelMocks.useTechnicianDiscoveryPanel).toHaveBeenCalledTimes(1);
	});
});

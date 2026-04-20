import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TechnicianDiscoveryPanelHeaderView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelHeader/TechnicianDiscoveryPanelHeaderView";

describe("TechnicianDiscoveryPanelHeaderView", () => {
	it("mostra o resumo da descoberta", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<TechnicianDiscoveryPanelHeaderView
					totalTechnicians={3}
					filteredTechniciansCount={2}
					selectedTechnician={{ name: "Ana", address: "0x1" } as never}
					contractedTechnician={{ name: "Bruno", address: "0x2" } as never}
					hasOpenOrder={true}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Encontre tecnicos elegiveis");
		expect(markup).toContain("3 cadastrados");
		expect(markup).toContain("2 visiveis");
		expect(markup).toContain("selecionado: Ana");
		expect(markup).toContain("ordem aberta: Bruno");
	});
});


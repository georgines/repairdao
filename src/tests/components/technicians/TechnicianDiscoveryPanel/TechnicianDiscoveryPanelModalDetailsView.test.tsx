import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TechnicianDiscoveryPanelModalDetailsView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModalDetails/TechnicianDiscoveryPanelModalDetailsView";

describe("TechnicianDiscoveryPanelModalDetailsView", () => {
	it("mostra os detalhes do tecnico", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<TechnicianDiscoveryPanelModalDetailsView
					selectedTechnician={{
						address: "0xbbb",
						name: "Bruno Silva",
						expertiseArea: "Redes",
						role: "tecnico",
						badgeLevel: "bronze",
						reputation: 12,
						depositLevel: 1,
						isActive: true,
						isEligible: true,
						updatedAt: "2026-04-17T10:00:00.000Z",
					} as never}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Bruno Silva");
		expect(markup).toContain("0xbbb");
		expect(markup).toContain("Area: Redes");
		expect(markup).toContain("Ativo: sim");
		expect(markup).toContain("Elegivel: sim");
	});
});


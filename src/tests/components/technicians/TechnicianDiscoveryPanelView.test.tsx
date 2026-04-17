// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { MantineProvider } from "@mantine/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TechnicianDiscoveryPanelView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelView";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("components/technicians/TechnicianDiscoveryPanelView", () => {
	beforeEach(() => {
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("exibe a lista e os detalhes do tecnico selecionado", () => {
		const markup = renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={2}
				filteredTechnicians={[
					{
						address: "0xbbb",
						name: "Bruno Silva",
						role: "tecnico",
						badgeLevel: "bronze",
						reputation: 12,
						depositLevel: 1,
						isActive: true,
						isEligible: true,
						updatedAt: "2026-04-17T10:00:00.000Z",
					},
				]}
				selectedTechnician={{
					address: "0xbbb",
					name: "Bruno Silva",
					role: "tecnico",
					badgeLevel: "bronze",
					reputation: 12,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
					updatedAt: "2026-04-17T10:00:00.000Z",
				}}
				hasResults
				onQueryChange={() => {}}
				onMinReputationChange={() => {}}
				onSelectTechnician={() => {}}
				onClearFilters={() => {}}
			/>,
		);

		expect(markup).toContain("Encontre tecnicos elegiveis");
		expect(markup).toContain("Bruno Silva");
		expect(markup).toContain("bronze");
		expect(markup).toContain("reputacao 12");
	});

	it("mostra a lista vazia e o estado inativo quando nao ha resultado", () => {
		const markup = renderWithMantine(
			<TechnicianDiscoveryPanelView
				query="xyz"
				minReputation={20}
				totalTechnicians={1}
				filteredTechnicians={[
					{
						address: "0xccc",
						name: "Carla Lima",
						role: "cliente",
						badgeLevel: "bronze",
						reputation: 4,
						depositLevel: 0,
						isActive: false,
						isEligible: false,
						updatedAt: "2026-04-17T12:00:00.000Z",
					},
				]}
				selectedTechnician={null}
				hasResults={false}
				onQueryChange={() => {}}
				onMinReputationChange={() => {}}
				onSelectTechnician={() => {}}
				onClearFilters={() => {}}
			/>,
		);

		expect(markup).toContain("Nenhum tecnico encontrou este criterio.");
		expect(markup).toContain("inativo");
		expect(markup).toContain("Selecione um tecnico na tabela para ver os dados completos.");
	});

	it("mostra tecnico fora da busca quando esta ativo mas nao elegivel", () => {
		const markup = renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={1}
				filteredTechnicians={[
					{
						address: "0xddd",
						name: "Diego Lima",
						role: "tecnico",
						badgeLevel: "bronze",
						reputation: 8,
						depositLevel: 1,
						isActive: true,
						isEligible: false,
						updatedAt: "2026-04-17T13:00:00.000Z",
					},
				]}
				selectedTechnician={{
					address: "0xddd",
					name: "Diego Lima",
					role: "tecnico",
					badgeLevel: "bronze",
					reputation: 8,
					depositLevel: 1,
					isActive: true,
					isEligible: false,
					updatedAt: "2026-04-17T13:00:00.000Z",
				}}
				hasResults
				onQueryChange={() => {}}
				onMinReputationChange={() => {}}
				onSelectTechnician={() => {}}
				onClearFilters={() => {}}
			/>,
		);

		expect(markup).toContain("fora da busca");
		expect(markup).toContain("Elegivel: nao");
		expect(markup).toContain("Ativo: sim");
	});

	it("mostra tecnico inativo nos detalhes", () => {
		const markup = renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={1}
				filteredTechnicians={[]}
				selectedTechnician={{
					address: "0xeee",
					name: "Eva Souza",
					role: "cliente",
					badgeLevel: "bronze",
					reputation: 4,
					depositLevel: 0,
					isActive: false,
					isEligible: false,
					updatedAt: "2026-04-17T14:00:00.000Z",
				}}
				hasResults={false}
				onQueryChange={() => {}}
				onMinReputationChange={() => {}}
				onSelectTechnician={() => {}}
				onClearFilters={() => {}}
			/>,
		);

		expect(markup).toContain("Ativo: nao");
		expect(markup).toContain("Elegivel: nao");
	});

	it("propaga as interacoes de busca e detalhes", async () => {
		const onQueryChange = vi.fn();
		const onSelectTechnician = vi.fn();
		const { getByLabelText, getByRole } = render(
			<MantineProvider>
				<TechnicianDiscoveryPanelView
					query=""
					minReputation={0}
					totalTechnicians={1}
						filteredTechnicians={[
							{
								address: "0xbbb",
								name: "Bruno Silva",
								role: "tecnico",
								badgeLevel: "bronze",
								reputation: 12,
								depositLevel: 1,
								isActive: true,
								isEligible: true,
								updatedAt: "2026-04-17T10:00:00.000Z",
							},
					]}
					selectedTechnician={null}
					hasResults
					onQueryChange={onQueryChange}
					onMinReputationChange={() => {}}
					onSelectTechnician={onSelectTechnician}
					onClearFilters={() => {}}
				/>
			</MantineProvider>,
		);

		fireEvent.change(getByLabelText("Buscar tecnico"), { target: { value: "ana" } });
		fireEvent.click(getByRole("button", { name: "Ver detalhes" }));

		expect(onQueryChange).toHaveBeenCalled();
		expect(onSelectTechnician).toHaveBeenCalledWith("0xbbb");
		cleanup();
	});
});

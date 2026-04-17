// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import type { UserSummary } from "@/services/users";
import { TechnicianDiscoveryPanelView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelView";

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

const technician: UserSummary = {
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
};

const inactiveTechnician: UserSummary = {
	address: "0xccc",
	name: "Carla Lima",
	expertiseArea: null,
	role: "cliente",
	badgeLevel: "bronze",
	reputation: 4,
	depositLevel: 0,
	isActive: false,
	isEligible: false,
	updatedAt: "2026-04-17T12:00:00.000Z",
};

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
		cleanup();
		vi.restoreAllMocks();
	});

	it("exibe a tabela de tecnicos e os botoes de acao", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={1}
				filteredTechnicians={[technician]}
				selectedTechnician={technician}
				contractedTechnician={null}
				technicianModalMode={null}
				technicianModalOpened={false}
				hasResults
				serviceDescription=""
				submittingRequest={false}
				requestError={null}
				onQueryChange={vi.fn()}
				onMinReputationChange={vi.fn()}
				onSelectTechnician={vi.fn()}
				onHireTechnician={vi.fn()}
				onCloseTechnicianModal={vi.fn()}
				onServiceDescriptionChange={vi.fn()}
				onConfirmTechnicianHire={vi.fn().mockResolvedValue(undefined)}
				onClearFilters={vi.fn()}
			/>,
		);

		expect(screen.getByText("Encontre tecnicos elegiveis")).toBeDefined();
		expect(screen.getByText("Bruno Silva")).toBeDefined();
		expect(screen.getByLabelText("Reputacao 5 de 5")).toBeDefined();
		expect(screen.getByRole("button", { name: "Detalhes" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Contratar" })).toBeDefined();
		expect(screen.getByRole("link", { name: "Servicos" })).toBeDefined();
	});

	it("abre o modal com os detalhes do tecnico selecionado", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={1}
				filteredTechnicians={[technician]}
				selectedTechnician={technician}
				contractedTechnician={null}
				technicianModalMode="details"
				technicianModalOpened
				hasResults
				serviceDescription=""
				submittingRequest={false}
				requestError={null}
				onQueryChange={vi.fn()}
				onMinReputationChange={vi.fn()}
				onSelectTechnician={vi.fn()}
				onHireTechnician={vi.fn()}
				onCloseTechnicianModal={vi.fn()}
				onServiceDescriptionChange={vi.fn()}
				onConfirmTechnicianHire={vi.fn().mockResolvedValue(undefined)}
				onClearFilters={vi.fn()}
			/>,
		);

		expect(screen.getByText("Detalhes do tecnico")).toBeDefined();
		expect(screen.getByText("Area: Redes")).toBeDefined();
		expect(screen.getByText("Ativo: sim")).toBeDefined();
		expect(screen.getByText("Elegivel: sim")).toBeDefined();
		expect(screen.getAllByLabelText("Reputacao 5 de 5")).toHaveLength(2);
	});

	it("mostra a confirmacao de contratacao no modal", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={1}
				filteredTechnicians={[technician]}
				selectedTechnician={technician}
				contractedTechnician={null}
				technicianModalMode="hire"
				technicianModalOpened
				hasResults
				serviceDescription="Troca de cabo"
				submittingRequest={false}
				requestError={null}
				onQueryChange={vi.fn()}
				onMinReputationChange={vi.fn()}
				onSelectTechnician={vi.fn()}
				onHireTechnician={vi.fn()}
				onCloseTechnicianModal={vi.fn()}
				onServiceDescriptionChange={vi.fn()}
				onConfirmTechnicianHire={vi.fn().mockResolvedValue(undefined)}
				onClearFilters={vi.fn()}
			/>,
		);

		expect(screen.getByText("Confirmar contratacao")).toBeDefined();
		expect(screen.getByText("Descricao do servico")).toBeDefined();
		expect(screen.getByRole("button", { name: "Contratar tecnico" })).toBeDefined();
		expect(screen.getAllByLabelText("Reputacao 5 de 5")).toHaveLength(2);
	});

	it("propaga as interacoes da tabela e do modal", () => {
		const onQueryChange = vi.fn();
		const onMinReputationChange = vi.fn();
		const onSelectTechnician = vi.fn();
		const onHireTechnician = vi.fn();
		const onCloseTechnicianModal = vi.fn();

		renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={2}
				filteredTechnicians={[technician, inactiveTechnician]}
				selectedTechnician={null}
				contractedTechnician={null}
				technicianModalMode={null}
				technicianModalOpened={false}
				hasResults
				serviceDescription=""
				submittingRequest={false}
				requestError={null}
				onQueryChange={onQueryChange}
				onMinReputationChange={onMinReputationChange}
				onSelectTechnician={onSelectTechnician}
				onHireTechnician={onHireTechnician}
				onCloseTechnicianModal={onCloseTechnicianModal}
				onServiceDescriptionChange={vi.fn()}
				onConfirmTechnicianHire={vi.fn().mockResolvedValue(undefined)}
				onClearFilters={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByRole("textbox", { name: "Buscar tecnico" }), {
			target: { value: "ana" },
		});
		fireEvent.change(screen.getByRole("textbox", { name: "Reputacao minima" }), {
			target: { value: "15" },
		});
		fireEvent.click(screen.getAllByRole("button", { name: "Detalhes" })[0]);
		fireEvent.click(screen.getAllByRole("button", { name: "Contratar" })[0]);

		expect(onQueryChange).toHaveBeenCalledWith("ana");
		expect(onMinReputationChange).toHaveBeenCalled();
		expect(onSelectTechnician).toHaveBeenCalledWith("0xbbb");
		expect(onHireTechnician).toHaveBeenCalledWith("0xbbb");
		expect(onCloseTechnicianModal).not.toHaveBeenCalled();
	});

	it("mostra o estado sem resultados", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				query="xyz"
				minReputation={20}
				totalTechnicians={1}
				filteredTechnicians={[inactiveTechnician]}
				selectedTechnician={null}
				contractedTechnician={null}
				technicianModalMode={null}
				technicianModalOpened={false}
				hasResults={false}
				serviceDescription=""
				submittingRequest={false}
				requestError={null}
				onQueryChange={vi.fn()}
				onMinReputationChange={vi.fn()}
				onSelectTechnician={vi.fn()}
				onHireTechnician={vi.fn()}
				onCloseTechnicianModal={vi.fn()}
				onServiceDescriptionChange={vi.fn()}
				onConfirmTechnicianHire={vi.fn().mockResolvedValue(undefined)}
				onClearFilters={vi.fn()}
			/>,
		);

		expect(screen.getByText("Nenhum tecnico encontrou este criterio.")).toBeDefined();
		expect(screen.getByText("inativo")).toBeDefined();
	});
});

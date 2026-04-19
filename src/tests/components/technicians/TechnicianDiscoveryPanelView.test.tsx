// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import type { UserSummary } from "@/services/users";
import { TechnicianDiscoveryPanelView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelView";

vi.mock("@/components/ratings/RatingSummary", () => ({
	RatingSummary: ({ address }: { address: string }) => (
		<span data-testid={`technician-rating-${address}`}>avaliacao</span>
	),
}));

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
				hasOpenOrder={false}
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
		expect(screen.getByRole("button", { name: "Detalhes" })).toBeDefined();
		expect(screen.queryByRole("button", { name: "Servicos" })).toBeNull();
	});

	it("esconde o botao de contratar quando existe ordem aberta", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				query=""
				minReputation={0}
				totalTechnicians={1}
				filteredTechnicians={[technician]}
				selectedTechnician={technician}
				contractedTechnician={technician}
				hasOpenOrder
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

		expect(screen.getByText("ordem aberta: Bruno Silva")).toBeDefined();
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
				hasOpenOrder={false}
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
				hasOpenOrder={false}
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
				totalTechnicians={1}
				filteredTechnicians={[technician]}
				selectedTechnician={null}
				contractedTechnician={null}
				hasOpenOrder={false}
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
		fireEvent.click(screen.getByRole("button", { name: "Detalhes" }));

		expect(onQueryChange).toHaveBeenCalledWith("ana");
		expect(onMinReputationChange).toHaveBeenCalled();
		expect(onSelectTechnician).toHaveBeenCalledWith("0xbbb");
		expect(onCloseTechnicianModal).not.toHaveBeenCalled();
		expect(onHireTechnician).not.toHaveBeenCalled();
	});

	it("propaga a descricao e a confirmacao da contratacao", () => {
		const onServiceDescriptionChange = vi.fn();
		const onConfirmTechnicianHire = vi.fn().mockResolvedValue(undefined);

		function Harness() {
			const [serviceDescription, setServiceDescription] = useState("");

			return (
				<TechnicianDiscoveryPanelView
					query=""
					minReputation={0}
					totalTechnicians={1}
					filteredTechnicians={[technician]}
					selectedTechnician={technician}
					contractedTechnician={null}
					hasOpenOrder={false}
					technicianModalMode="hire"
					technicianModalOpened
					hasResults
					serviceDescription={serviceDescription}
					submittingRequest={false}
					requestError={null}
					onQueryChange={vi.fn()}
					onMinReputationChange={vi.fn()}
					onSelectTechnician={vi.fn()}
					onHireTechnician={vi.fn()}
					onCloseTechnicianModal={vi.fn()}
					onServiceDescriptionChange={(value) => {
						onServiceDescriptionChange(value);
						setServiceDescription(value);
					}}
					onConfirmTechnicianHire={onConfirmTechnicianHire}
					onClearFilters={vi.fn()}
				/>
			);
		}

		renderWithMantine(<Harness />);

		const textarea = screen.getByRole("textbox", { name: "Descricao do servico" });

		fireEvent.input(textarea, {
			target: { value: "Troca de cabo" },
		});
		fireEvent.change(textarea, {
			target: { value: "Troca de cabo" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Contratar tecnico" }));

		expect(onServiceDescriptionChange).toHaveBeenCalledWith("Troca de cabo");
		expect(onConfirmTechnicianHire).toHaveBeenCalledTimes(1);
	});
});

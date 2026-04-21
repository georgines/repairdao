// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

const baseProps = {
	header: {
		totalTechnicians: 1,
		filteredTechnicians: [technician],
		selectedTechnician: technician,
		contractedTechnician: null,
		hasOpenOrder: false,
	},
	filters: {
		query: "",
		minReputation: 0,
		hasResults: true,
		onQueryChange: vi.fn(),
		onMinReputationChange: vi.fn(),
		onClearFilters: vi.fn(),
	},
	table: {
		filteredTechnicians: [technician],
		selectedTechnician: technician,
		canHire: true,
		onSelectTechnician: vi.fn(),
		onHireTechnician: vi.fn(),
	},
	modal: {
		technicianModalMode: null as "details" | "hire" | null,
		technicianModalOpened: false,
		selectedTechnician: technician,
		serviceDescription: "",
		submittingRequest: false,
		requestError: null as string | null,
		onCloseTechnicianModal: vi.fn(),
		onServiceDescriptionChange: vi.fn(),
		onConfirmTechnicianHire: vi.fn().mockResolvedValue(undefined),
	},
};

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends (...args: unknown[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function mergeProps(overrides: DeepPartial<typeof baseProps> = {}) {
	return {
		...baseProps,
		...overrides,
		header: {
			...baseProps.header,
			...(overrides.header ?? {}),
		},
		filters: {
			...baseProps.filters,
			...(overrides.filters ?? {}),
		},
		table: {
			...baseProps.table,
			...(overrides.table ?? {}),
		},
		modal: {
			...baseProps.modal,
			...(overrides.modal ?? {}),
		},
	};
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
		cleanup();
		vi.restoreAllMocks();
	});

	it("exibe a tabela de tecnicos e os botoes de acao", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView {...mergeProps()} />,
		);

		expect(screen.getByText("Encontre tecnicos elegiveis")).toBeDefined();
		expect(screen.getByText("Bruno Silva")).toBeDefined();
		expect(screen.getByRole("button", { name: "Detalhes" })).toBeDefined();
		expect(screen.getAllByRole("button", { name: "Contratar tecnico" })).toHaveLength(1);
		expect(screen.queryByRole("button", { name: "Servicos" })).toBeNull();
	});

	it("esconde o botao de contratar quando existe ordem aberta", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				{...mergeProps({
					header: {
						contractedTechnician: technician,
						hasOpenOrder: true,
					},
					table: {
						canHire: false,
					},
				})}
			/>,
		);

		expect(screen.getByText("ordem aberta: Bruno Silva")).toBeDefined();
		expect((screen.getByRole("button", { name: "Contratar tecnico" }) as HTMLButtonElement).disabled).toBe(true);
	});

	it("abre o modal com os detalhes do tecnico selecionado", () => {
		renderWithMantine(
			<TechnicianDiscoveryPanelView
				{...mergeProps({
					modal: {
						technicianModalMode: "details",
						technicianModalOpened: true,
					},
				})}
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
				{...mergeProps({
					modal: {
						technicianModalMode: "hire",
						technicianModalOpened: true,
						serviceDescription: "Troca de cabo",
					},
				})}
			/>,
		);

		expect(screen.getByText("Confirmar contratacao")).toBeDefined();
		expect(screen.getByText("Descricao do servico")).toBeDefined();
		expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Contratar tecnico" })).toBeDefined();
	});

	it("propaga as interacoes da tabela e do modal", () => {
		const onQueryChange = vi.fn();
		const onMinReputationChange = vi.fn();
		const onSelectTechnician = vi.fn();
		const onHireTechnician = vi.fn();
		const onCloseTechnicianModal = vi.fn();

		renderWithMantine(
			<TechnicianDiscoveryPanelView
				{...mergeProps({
					header: {
						selectedTechnician: null,
					},
					table: {
						selectedTechnician: null,
						onSelectTechnician,
						onHireTechnician,
					},
					filters: {
						onQueryChange,
						onMinReputationChange,
					},
					modal: {
						onCloseTechnicianModal,
					},
				})}
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
				{...mergeProps({
					modal: {
						technicianModalMode: "hire",
						technicianModalOpened: true,
						serviceDescription,
						onServiceDescriptionChange: (value) => {
							onServiceDescriptionChange(value);
							setServiceDescription(value);
						},
						onConfirmTechnicianHire,
					},
				})}
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
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Contratar tecnico" }));

		expect(onServiceDescriptionChange).toHaveBeenCalledWith("Troca de cabo");
		expect(onConfirmTechnicianHire).toHaveBeenCalledTimes(1);
	});
});

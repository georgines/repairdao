// @vitest-environment jsdom

import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider, Table } from "@mantine/core";
import { TechnicianDiscoveryPanelTableRowView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelTableRow/TechnicianDiscoveryPanelTableRowView";

vi.mock("@/components/ratings/RatingSummary", () => ({
	RatingSummary: ({ address }: { address: string }) => <span data-testid={`rating-${address}`}>avaliacao</span>,
}));

function renderWithMantine(node: ReactNode) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

describe("TechnicianDiscoveryPanelTableRowView", () => {
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
	});

	it("mostra a linha e propaga as acoes", () => {
		const onSelectTechnician = vi.fn();
		const onHireTechnician = vi.fn();

		renderWithMantine(
			<Table>
				<Table.Tbody>
					<TechnicianDiscoveryPanelTableRowView
						technician={{
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
						selected={true}
						canHire={true}
						onSelectTechnician={onSelectTechnician}
						onHireTechnician={onHireTechnician}
					/>
				</Table.Tbody>
			</Table>,
		);

		expect(screen.getByText("Bruno Silva")).toBeTruthy();
		expect(screen.getByTestId("rating-0xbbb")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Detalhes" }));
		fireEvent.click(screen.getByRole("button", { name: "Contratar tecnico" }));

		expect(onSelectTechnician).toHaveBeenCalledWith("0xbbb");
		expect(onHireTechnician).toHaveBeenCalledWith("0xbbb");
	});
});

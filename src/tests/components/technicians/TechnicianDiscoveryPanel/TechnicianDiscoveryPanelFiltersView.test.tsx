// @vitest-environment jsdom

import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { TechnicianDiscoveryPanelFiltersView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelFilters/TechnicianDiscoveryPanelFiltersView";

function renderWithMantine(node: ReactNode) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

describe("TechnicianDiscoveryPanelFiltersView", () => {
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

	it("mostra os filtros e dispara o reset", () => {
		const onClearFilters = vi.fn();
		const onQueryChange = vi.fn();
		const onMinReputationChange = vi.fn();

		renderWithMantine(
			<TechnicianDiscoveryPanelFiltersView
				query="ana"
				minReputation={5}
				resultsNotice="Use a lista para comparar tecnicos."
				onQueryChange={onQueryChange}
				onMinReputationChange={onMinReputationChange}
				onClearFilters={onClearFilters}
			/>,
		);

		expect(screen.getByText("Use a lista para comparar tecnicos.")).toBeTruthy();

		fireEvent.change(screen.getByLabelText("Buscar tecnico"), { target: { value: "bruno" } });
		fireEvent.change(screen.getByRole("textbox", { name: "Reputacao minima" }), { target: { value: "10" } });
		fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

		expect(onQueryChange).toHaveBeenCalledWith("bruno");
		expect(onMinReputationChange).toHaveBeenCalled();
		expect(onClearFilters).toHaveBeenCalledTimes(1);
	});
});

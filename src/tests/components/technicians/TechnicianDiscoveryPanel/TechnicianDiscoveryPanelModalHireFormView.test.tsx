// @vitest-environment jsdom

import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { TechnicianDiscoveryPanelModalHireFormView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModalHireForm/TechnicianDiscoveryPanelModalHireFormView";

function renderWithMantine(node: ReactNode) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

describe("TechnicianDiscoveryPanelModalHireFormView", () => {
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

	it("mostra o formulario de contratacao", () => {
		const onCloseTechnicianModal = vi.fn();
		const onServiceDescriptionChange = vi.fn();
		const onConfirmTechnicianHire = vi.fn().mockResolvedValue(undefined);

		renderWithMantine(
			<TechnicianDiscoveryPanelModalHireFormView
				serviceDescription="Troca de cabo"
				submittingRequest={false}
				requestError="Falha ao contratar"
				onCloseTechnicianModal={onCloseTechnicianModal}
				onServiceDescriptionChange={onServiceDescriptionChange}
				onConfirmTechnicianHire={onConfirmTechnicianHire}
			/>,
		);

		expect(screen.getByText("Descreva o servico para abrir uma ordem de servico para este tecnico.")).toBeTruthy();
		expect(screen.getByText("Falha ao contratar")).toBeTruthy();

		fireEvent.change(screen.getByLabelText("Descricao do servico"), { target: { value: "Novo texto" } });
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		fireEvent.click(screen.getByRole("button", { name: "Contratar tecnico" }));

		expect(onServiceDescriptionChange).toHaveBeenCalledWith("Novo texto");
		expect(onCloseTechnicianModal).toHaveBeenCalledTimes(1);
		expect(onConfirmTechnicianHire).toHaveBeenCalledTimes(1);
	});
});

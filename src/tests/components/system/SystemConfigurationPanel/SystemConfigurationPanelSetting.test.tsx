// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MantineProvider } from "@mantine/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SystemConfigurationPanelSetting } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelSetting/SystemConfigurationPanelSetting";

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

describe("SystemConfigurationPanelSetting", () => {
	beforeEach(() => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: "",
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("mostra o formulario da configuracao", () => {
		renderWithMantine(
			<SystemConfigurationPanelSetting
				title="Deposito minimo"
				description="Valor exigido para ativacao da conta."
				errorTitle="Nao foi possivel salvar"
				errorMessage={null}
				value="100"
				disabled={false}
				saving={false}
				unitLabel="RPT"
				submitLabel="Salvar deposito minimo"
				onChange={() => {}}
				onSubmit={async () => {}}
			/>,
		);

		expect(screen.getByText("Deposito minimo")).toBeTruthy();
		expect(screen.getByText("Valor exigido para ativacao da conta.")).toBeTruthy();
		expect(screen.getByDisplayValue("100")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Salvar deposito minimo" })).toBeTruthy();
	});

	it("chama os handlers de mudança e submissao", () => {
		const onChange = vi.fn();
		const onSubmit = vi.fn().mockResolvedValue(undefined);

		renderWithMantine(
			<SystemConfigurationPanelSetting
				title="Deposito minimo"
				description="Valor exigido para ativacao da conta."
				errorTitle="Nao foi possivel salvar"
				errorMessage={null}
				value="100"
				disabled={false}
				saving={false}
				unitLabel="RPT"
				submitLabel="Salvar deposito minimo"
				onChange={onChange}
				onSubmit={onSubmit}
			/>,
		);

		fireEvent.change(screen.getByDisplayValue("100"), { target: { value: "150" } });
		fireEvent.click(screen.getByRole("button", { name: "Salvar deposito minimo" }));

		expect(onChange).toHaveBeenCalledWith("150");
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("desabilita o campo e o botao quando o painel nao pode editar", () => {
		renderWithMantine(
			<SystemConfigurationPanelSetting
				title="Deposito minimo"
				description="Valor exigido para ativacao da conta."
				errorTitle="Nao foi possivel salvar"
				errorMessage="Falha ao salvar"
				value="100"
				disabled={true}
				saving={false}
				unitLabel="RPT"
				submitLabel="Salvar deposito minimo"
				onChange={() => {}}
				onSubmit={async () => {}}
			/>,
		);

		expect(screen.getByDisplayValue("100").hasAttribute("disabled")).toBe(true);
		expect(screen.getByRole("button", { name: "Salvar deposito minimo" }).hasAttribute("disabled")).toBe(true);
		expect(screen.getByText("Falha ao salvar")).toBeTruthy();
	});
});

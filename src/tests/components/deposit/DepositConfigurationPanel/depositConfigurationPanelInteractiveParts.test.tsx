// @vitest-environment jsdom

import { render, fireEvent, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { DepositConfigurationPanelAccessNoticeView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAccessNotice/DepositConfigurationPanelAccessNoticeView";
import { DepositConfigurationPanelFormFieldView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormField/DepositConfigurationPanelFormFieldView";
import { DepositConfigurationPanelFormFooterView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormFooter/DepositConfigurationPanelFormFooterView";

describe("DepositConfigurationPanel interactive parts", () => {
	beforeAll(() => {
		if (!window.matchMedia) {
			window.matchMedia = vi.fn().mockImplementation(() => ({
				matches: false,
				media: "",
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			}));
		}
	});

	it("retorna vazio quando a carteira esta conectada e e dona", () => {
		render(
			<MantineProvider>
				<DepositConfigurationPanelAccessNoticeView connected={true} isOwner={true} />
			</MantineProvider>,
		);

		expect(screen.queryByText("Carteira desconectada")).toBeNull();
		expect(screen.queryByText("Acesso restrito")).toBeNull();
	});

	it("dispara a mudanca do campo de deposito", () => {
		const onEditingMinDepositChange = vi.fn();

		render(
			<MantineProvider>
				<DepositConfigurationPanelFormFieldView
					connected={true}
					isOwner={true}
					editingMinDeposit="100"
					saving={false}
					onEditingMinDepositChange={onEditingMinDepositChange}
				/>
			</MantineProvider>,
		);

		fireEvent.change(screen.getByLabelText("Deposito minimo (RPT)"), {
			target: { value: "150" },
		});

		expect(onEditingMinDepositChange).toHaveBeenCalledWith("150");
	});

	it("dispara o submit do rodape", () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);

		render(
			<MantineProvider>
				<DepositConfigurationPanelFormFooterView connected={true} isOwner={true} saving={false} onSubmit={onSubmit} />
			</MantineProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Salvar no contrato" }));

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { DepositConfigurationPanelView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelView";

const baseProps = {
	status: {
		loading: false,
		connected: true,
		isOwner: true,
		walletAddress: "0xowner",
		donoAtualCurto: "0xowne...wner",
		minDeposit: "100",
	},
	alerts: {
		error: null as string | null,
		formError: null as string | null,
	},
	form: {
		editingMinDeposit: "",
		saving: false,
		onEditingMinDepositChange: () => {},
		onSubmit: async () => {},
	},
};

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends (...args: unknown[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function mergeProps(overrides: DeepPartial<typeof baseProps> = {}) {
	return {
		...baseProps,
		...overrides,
		status: {
			...baseProps.status,
			...(overrides.status ?? {}),
		},
		alerts: {
			...baseProps.alerts,
			...(overrides.alerts ?? {}),
		},
		form: {
			...baseProps.form,
			...(overrides.form ?? {}),
		},
	};
}

describe("DepositConfigurationPanelView", () => {
	it("mostra loading quando a configuracao ainda nao carregou", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelView
					{...mergeProps({
						status: {
							loading: true,
							connected: false,
							isOwner: false,
							walletAddress: null,
							donoAtualCurto: "Carteira desconectada",
						},
					})}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Carregando configuracao do deposito");
	});

	it("mostra os alertas de erro", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelView
					{...mergeProps({
						alerts: {
							error: "Falha ao carregar",
							formError: "Falha ao salvar",
						},
						form: {
							editingMinDeposit: "150",
						},
					})}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Falha ao carregar");
		expect(markup).toContain("Falha ao salvar");
		expect(markup).toContain("Salvar no contrato");
	});
});

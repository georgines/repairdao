import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { SystemConfigurationPanelView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelView";

const baseProps = {
	status: {
		loading: false,
		connected: true,
		isDepositOwner: true,
		isTokenOwner: true,
		canCreateProposal: true,
		walletAddress: "0xowner",
	},
	overview: {
		donoDepositoAtualCurto: "0xowne...wner",
		donoTokenAtualCurto: "0xowne...wner",
		minDeposit: "100",
		tokensPerEth: "1000",
	},
	alerts: {
		error: null as string | null,
		minDepositError: null as string | null,
		tokensPerEthError: null as string | null,
	},
	settings: {
		editingMinDeposit: "",
		editingTokensPerEth: "",
		savingMinDeposit: false,
		savingTokensPerEth: false,
		onEditingMinDepositChange: () => {},
		onEditingTokensPerEthChange: () => {},
		onSubmitMinDeposit: async () => {},
		onSubmitTokensPerEth: async () => {},
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
		overview: {
			...baseProps.overview,
			...(overrides.overview ?? {}),
		},
		alerts: {
			...baseProps.alerts,
			...(overrides.alerts ?? {}),
		},
		settings: {
			...baseProps.settings,
			...(overrides.settings ?? {}),
		},
	};
}

describe("SystemConfigurationPanelView", () => {
	it("mostra loading quando a configuracao ainda nao carregou", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelView
					{...mergeProps({
						status: {
							loading: true,
							connected: false,
							isDepositOwner: false,
							isTokenOwner: false,
							canCreateProposal: false,
							walletAddress: null,
						},
						overview: {
							donoDepositoAtualCurto: "Carteira desconectada",
							donoTokenAtualCurto: "Carteira desconectada",
						},
					})}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Carregando configuracoes do sistema");
	});

	it("mostra os alertas de erro", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelView
					{...mergeProps({
						alerts: {
							error: "Falha ao carregar",
							minDepositError: "Falha ao salvar deposito",
							tokensPerEthError: "Falha ao salvar taxa",
						},
						settings: {
							editingMinDeposit: "150",
							editingTokensPerEth: "1500",
						},
					})}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Falha ao carregar");
		expect(markup).toContain("Falha ao salvar deposito");
		expect(markup).toContain("Falha ao salvar taxa");
		expect(markup).toContain("Criar proposta do deposito");
		expect(markup).toContain("Criar proposta da taxa");
	});
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { DepositConfigurationPanelView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelView";

describe("DepositConfigurationPanelView", () => {
	it("mostra loading quando a configuracao ainda nao carregou", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelView
					loading={true}
					error={null}
					formError={null}
					connected={false}
					isOwner={false}
					walletAddress={null}
					donoAtualCurto="Carteira desconectada"
					minDeposit="100"
					editingMinDeposit=""
					saving={false}
					onEditingMinDepositChange={() => {}}
					onSubmit={async () => {}}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Carregando configuracao do deposito");
	});

	it("mostra os alertas de erro", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelView
					loading={false}
					error="Falha ao carregar"
					formError="Falha ao salvar"
					connected={true}
					isOwner={true}
					walletAddress="0xowner"
					donoAtualCurto="0xowne...wner"
					minDeposit="100"
					editingMinDeposit="150"
					saving={false}
					onEditingMinDepositChange={() => {}}
					onSubmit={async () => {}}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Falha ao carregar");
		expect(markup).toContain("Falha ao salvar");
		expect(markup).toContain("Salvar no contrato");
	});
});


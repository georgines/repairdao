import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { SystemConfigurationPanelView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelView";

describe("SystemConfigurationPanelView", () => {
	it("mostra loading quando a configuracao ainda nao carregou", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelView
					loading={true}
					error={null}
					minDepositError={null}
					tokensPerEthError={null}
					connected={false}
					isDepositOwner={false}
					isTokenOwner={false}
					walletAddress={null}
					donoDepositoAtualCurto="Carteira desconectada"
					donoTokenAtualCurto="Carteira desconectada"
					minDeposit="100"
					editingMinDeposit=""
					savingMinDeposit={false}
					tokensPerEth="1000"
					editingTokensPerEth=""
					savingTokensPerEth={false}
					onEditingMinDepositChange={() => {}}
					onEditingTokensPerEthChange={() => {}}
					onSubmitMinDeposit={async () => {}}
					onSubmitTokensPerEth={async () => {}}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Carregando configuracoes do sistema");
	});

	it("mostra os alertas de erro", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelView
					loading={false}
					error="Falha ao carregar"
					minDepositError="Falha ao salvar deposito"
					tokensPerEthError="Falha ao salvar taxa"
					connected={true}
					isDepositOwner={true}
					isTokenOwner={true}
					walletAddress="0xowner"
					donoDepositoAtualCurto="0xowne...wner"
					donoTokenAtualCurto="0xowne...wner"
					minDeposit="100"
					editingMinDeposit="150"
					savingMinDeposit={false}
					tokensPerEth="1000"
					editingTokensPerEth="1500"
					savingTokensPerEth={false}
					onEditingMinDepositChange={() => {}}
					onEditingTokensPerEthChange={() => {}}
					onSubmitMinDeposit={async () => {}}
					onSubmitTokensPerEth={async () => {}}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Falha ao carregar");
		expect(markup).toContain("Falha ao salvar deposito");
		expect(markup).toContain("Falha ao salvar taxa");
		expect(markup).toContain("Salvar deposito minimo");
		expect(markup).toContain("Salvar taxa de cambio");
	});
});

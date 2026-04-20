import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SystemConfigurationPanelOverview } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelOverview/SystemConfigurationPanelOverview";

describe("SystemConfigurationPanelOverview", () => {
	it("mostra os valores atuais do sistema", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelOverview
					minDeposit="100"
					tokensPerEth="1000"
					donoDepositoAtualCurto="0xowne...wner"
					donoTokenAtualCurto="0xowne...wner"
					walletNotice="0xowner"
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("RPT 100,00");
		expect(markup).toContain("1 ETH = 1000 RPT");
		expect(markup).toContain("Dono do deposito: 0xowne...wner");
		expect(markup).toContain("Dono da taxa de cambio: 0xowne...wner");
		expect(markup).toContain("Carteira conectada: 0xowner");
	});
});

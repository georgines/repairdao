import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SystemConfigurationPanelHeader } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelHeader/SystemConfigurationPanelHeader";

describe("SystemConfigurationPanelHeader", () => {
	it("mostra o titulo e o status do painel", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelHeader statusLabel="Dono autenticado" statusColor="teal" />
			</MantineProvider>,
		);

		expect(markup).toContain("Configuracoes do sistema");
		expect(markup).toContain("A blockchain e a fonte de verdade");
		expect(markup).toContain("Dono autenticado");
	});
});


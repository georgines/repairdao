import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SystemConfigurationPanelLoading } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelLoading/SystemConfigurationPanelLoading";

describe("SystemConfigurationPanelLoading", () => {
	it("mostra o estado de carregamento", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelLoading />
			</MantineProvider>,
		);

		expect(markup).toContain("Carregando configuracoes do sistema");
	});
});


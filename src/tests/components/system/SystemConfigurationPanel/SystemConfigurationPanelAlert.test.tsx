import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SystemConfigurationPanelAlert } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAlert/SystemConfigurationPanelAlert";

describe("SystemConfigurationPanelAlert", () => {
	it("nao renderiza nada quando nao ha mensagem", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelAlert title="Falha ao carregar" message={null} />
			</MantineProvider>,
		);

		expect(markup).not.toContain("Falha ao carregar");
	});

	it("renderiza o alerta quando ha mensagem", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelAlert title="Falha ao carregar" message="Erro inesperado" />
			</MantineProvider>,
		);

		expect(markup).toContain("Falha ao carregar");
		expect(markup).toContain("Erro inesperado");
	});
});

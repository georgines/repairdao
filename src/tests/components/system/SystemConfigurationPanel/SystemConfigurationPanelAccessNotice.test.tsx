import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SystemConfigurationPanelAccessNotice } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAccessNotice/SystemConfigurationPanelAccessNotice";

describe("SystemConfigurationPanelAccessNotice", () => {
	it("mostra o aviso de carteira desconectada", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelAccessNotice
					heading="Configuracoes do sistema"
					title="Carteira desconectada"
					message="Conecte a carteira autorizada para visualizar esta tela."
					color="yellow"
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("Conecte a carteira autorizada para visualizar esta tela.");
		expect(markup).toContain("Configuracoes do sistema");
	});

	it("mostra o aviso de acesso restrito", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanelAccessNotice
					heading={null}
					title="Acesso restrito"
					message="A carteira conectada nao e dona de nenhuma configuracao do sistema."
					color="gray"
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Acesso restrito");
		expect(markup).toContain("A carteira conectada nao e dona de nenhuma configuracao do sistema.");
	});
});

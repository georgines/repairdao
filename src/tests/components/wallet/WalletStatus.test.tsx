import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { WalletStatus } from "@/components/wallet/WalletStatus";

describe("WalletStatus", () => {
	it("renderiza estado desconectado com CTA de conexao", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<WalletStatus
					connected={false}
					loading={false}
					address={null}
					chainLabel="Sem conexao"
					ethBalance="0"
					usdBalance="0"
					actionLabel="Conectar carteira"
					onAction={() => {}}
				/>
			</MantineProvider>
		);

		expect(markup).toContain("Conectar carteira");
		expect(markup).toContain("Sem conexao");
		expect(markup).toContain("ETH");
		expect(markup).toContain("USD");
	});

	it("renderiza estado conectado e expõe o estilo do card", () => {
		const props = {
			connected: true,
			loading: true,
			address: "0x1234567890abcdef1234567890abcdef12345678",
			chainLabel: "Local",
			ethBalance: "0.5",
			usdBalance: "1000",
			actionLabel: "Desconectar carteira",
			onAction: () => {},
		} as const;

		const markup = renderToStaticMarkup(
			<MantineProvider>
				<WalletStatus {...props} />
			</MantineProvider>
		);

		expect(markup).toContain("Desconectar carteira");
		expect(markup).toContain("Local");
		expect(markup).toContain("0x1234...5678");

		const element = WalletStatus(props);
		const styles = element.props.sx({ spacing: { xs: "0.25rem" } });

		expect(styles.width).toBe("100%");
		expect(styles.overflow).toBe("hidden");
		expect(styles.paddingInline).toBe("0.25rem");
	});
});

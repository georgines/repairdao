import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { WalletStatus } from "@/components/wallet/WalletStatus";

describe("WalletStatus", () => {
	beforeEach(() => {
		vi.stubEnv("NEXT_PUBLIC_NETWORK", "local");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("renderiza estado desconectado com CTA de conexao", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<WalletStatus
					connected={false}
					loading={false}
					address={null}
					chainLabel="Sepolia"
					ethBalance="0"
					usdBalance="0"
					actionLabel="Conectar carteira"
					onAction={() => {}}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Conectar carteira");
		expect(markup).toContain("LOCAL");
		expect(markup).toContain("Carteira Sepolia");
		expect(markup).toContain("ETH");
		expect(markup).toContain("USD");
	});

	it("renderiza estado conectado e expõe o seletor de rede", () => {
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
			</MantineProvider>,
		);

		expect(markup).toContain("Desconectar carteira");
		expect(markup).toContain("LOCAL");
		expect(markup).toContain("Carteira Local");
		expect(markup).toContain("0x1234...5678");
	});
});

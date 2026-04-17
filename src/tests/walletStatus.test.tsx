import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { WalletStatus } from "@/components/wallet/WalletStatus";
import {
	definirReconexaoAutomatica,
	formatarBlockchain,
	formatarEnderecoCurto,
	formatarNumero,
	formatarUSD,
	normalizarPrecoEthUsd,
	reconexaoAutomaticaHabilitada,
} from "@/services/walletService";

describe("walletService", () => {
	it("formata endereco, rede e valores", () => {
		expect(formatarEnderecoCurto("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
		expect(formatarEnderecoCurto(undefined)).toBe("Carteira desconectada");
		expect(formatarBlockchain(11155111)).toBe("Sepolia");
		expect(formatarBlockchain(31337)).toBe("Local");
		expect(formatarNumero("12.3456")).toBe("12,35");
		expect(formatarUSD("12.34")).toBe("US$" + String.fromCharCode(160) + "12,34");
		expect(normalizarPrecoEthUsd(200000000000n)).toBe(2000);
		expect(normalizarPrecoEthUsd(1999.5)).toBe(1999.5);
	});

	it("persiste a preferencia de reconexao automatica", () => {
		const storage = new Map<string, string>();

		Object.defineProperty(globalThis, "window", {
			value: {
				localStorage: {
					getItem: (key: string) => storage.get(key) ?? null,
					setItem: (key: string, value: string) => {
						storage.set(key, value);
					},
				},
			},
			configurable: true,
		});

		expect(reconexaoAutomaticaHabilitada()).toBe(true);
		definirReconexaoAutomatica(false);
		expect(reconexaoAutomaticaHabilitada()).toBe(false);
		definirReconexaoAutomatica(true);
		expect(reconexaoAutomaticaHabilitada()).toBe(true);
	});
});

describe("WalletStatus", () => {
	it("renderiza estado desconectado com CTA de conexao", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<WalletStatus
					connected={false}
					loading={false}
					address={null}
					chainLabel="Sem conexao"
					tokenBalance="0"
					ethBalance="0"
					usdBalance="0"
					actionLabel="Conectar carteira"
					onAction={() => {}}
					formatarEnderecoCurto={formatarEnderecoCurto}
					formatarNumero={formatarNumero}
					formatarUSD={formatarUSD}
				/>
			</MantineProvider>
		);

		expect(markup).toContain("Conectar carteira");
		expect(markup).toContain("Sem conexao");
		expect(markup).toContain("RPT");
		expect(markup).toContain("ETH");
		expect(markup).toContain("USD");
	});

	it("renderiza estado conectado e expõe o estilo do card", () => {
		const props = {
			connected: true,
			loading: true,
			address: "0x1234567890abcdef1234567890abcdef12345678",
			chainLabel: "Local",
			tokenBalance: "1200",
			ethBalance: "0.5",
			usdBalance: "1000",
			actionLabel: "Desconectar carteira",
			onAction: () => {},
			formatarEnderecoCurto,
			formatarNumero,
			formatarUSD,
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

		expect(styles.maxWidth).toBe("min(500px, 100%)");
		expect(styles.paddingRight).toBe("0.25rem");
	});
});

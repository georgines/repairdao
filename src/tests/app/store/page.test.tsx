import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const storeMocks = vi.hoisted(() => ({
	carregarMetricasDaLoja: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/store/storeMetrics", () => ({
	carregarMetricasDaLoja: storeMocks.carregarMetricasDaLoja,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: storeMocks.obterEthereumProvider,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: storeMocks.useWalletStatus,
}));

import StorePage from "@/app/store/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/store/page", () => {
	it("renderiza a loja com o saldo destacado e a ação de troca", () => {
		storeMocks.obterEthereumProvider.mockReturnValue(undefined);
		storeMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "0",
				usdBalance: "0",
			},
		});
		storeMocks.carregarMetricasDaLoja.mockResolvedValue({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 0n,
			tokensPerEth: "0",
		});

		const markup = renderWithMantine(<StorePage />);

		expect(markup).toContain("Trocar ETH por RPT");
		expect(markup).toContain("Quanto ETH quer gastar");
		expect(markup).not.toContain("Conectar carteira");
		expect(markup).toContain("ETH 0,0000");
		expect(markup).toContain("RPT 0,00");
		expect(markup).toContain("Carteira desconectada");
		expect(markup).not.toContain("Depositar RPT e ativar conta");
	});
});

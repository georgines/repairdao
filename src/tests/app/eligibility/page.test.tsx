import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const eligibilityMocks = vi.hoisted(() => ({
	carregarMetricasElegibilidade: vi.fn(),
	obterEthereumProvider: vi.fn(),
	depositarTokens: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/eligibility/eligibilityMetrics", () => ({
	carregarMetricasElegibilidade: eligibilityMocks.carregarMetricasElegibilidade,
}));

vi.mock("@/services/eligibility/tokenDeposit", () => ({
	depositarTokens: eligibilityMocks.depositarTokens,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: eligibilityMocks.obterEthereumProvider,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: eligibilityMocks.useWalletStatus,
}));

import EligibilityPage from "@/app/eligibility/page";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("app/eligibility/page", () => {
	it("renderiza a pagina de elegibilidade", () => {
		eligibilityMocks.obterEthereumProvider.mockReturnValue(undefined);
		eligibilityMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "0",
				usdBalance: "0",
			},
		});
		eligibilityMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			badgeLevel: "Sem carteira",
			isActive: false,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		const markup = renderWithMantine(<EligibilityPage />);

		expect(markup).toContain("Depositar RPT e ativar conta");
		expect(markup).toContain("Definir papel");
		expect(markup).toContain("Nivel do cliente");
		expect(markup).toContain("Quanto RPT deseja depositar");
		expect(markup).toContain("Ativar como cliente");
		expect(markup).toContain("Valor minimo: 100 RPT.");
		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("Aguardando deposito");
	});
});

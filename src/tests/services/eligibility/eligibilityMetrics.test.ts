// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { carregarMetricasElegibilidade } from "@/services/eligibility/eligibilityMetrics";

describe("carregarMetricasElegibilidade", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("lê as métricas da rota de elegibilidade e converte os valores recebidos", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				rptBalanceRaw: "1500000000000000000",
				rptBalance: "1.5",
				tokensPerEthRaw: "250",
				tokensPerEth: "250",
				badgeLevel: "bronze",
				isActive: true,
				minDepositRaw: "100000000000000000000",
				minDeposit: "100",
			}),
		});

		vi.stubGlobal("fetch", fetchMock);

		await expect(carregarMetricasElegibilidade("0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		expect(fetchMock).toHaveBeenCalledWith("/api/eligibility/metrics?address=0xabc", { cache: "no-store" });
	});

	it("lança erro quando a rota responde com falha", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			json: vi.fn(),
		});

		vi.stubGlobal("fetch", fetchMock);

		await expect(carregarMetricasElegibilidade(null)).rejects.toThrow("Nao foi possivel carregar as metricas de elegibilidade.");
		expect(fetchMock).toHaveBeenCalledWith("/api/eligibility/metrics", { cache: "no-store" });
	});
});

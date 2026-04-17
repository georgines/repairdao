// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { carregarMetricasDaLoja } from "@/services/store/storeMetrics";

describe("carregarMetricasDaLoja", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("lê as métricas da rota da loja e converte os valores recebidos", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				rptBalanceRaw: "1500000000000000000",
				rptBalance: "1.5",
				tokensPerEthRaw: "250",
				tokensPerEth: "250",
			}),
		});

		vi.stubGlobal("fetch", fetchMock);

		await expect(carregarMetricasDaLoja("0xabc")).resolves.toEqual({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
		});

		expect(fetchMock).toHaveBeenCalledWith("/api/store/metrics?address=0xabc", { cache: "no-store" });
	});

	it("lança erro quando a rota responde com falha", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			json: vi.fn(),
		});

		vi.stubGlobal("fetch", fetchMock);

		await expect(carregarMetricasDaLoja(null)).rejects.toThrow("Nao foi possivel carregar as metricas da loja.");
		expect(fetchMock).toHaveBeenCalledWith("/api/store/metrics", { cache: "no-store" });
	});
});

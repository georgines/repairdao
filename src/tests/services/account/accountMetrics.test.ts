import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { carregarMetricasDaConta } from "@/services/account/accountMetrics";

describe("accountMetrics", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("carrega metricas com address e converte os campos numericos", async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				depositRaw: "10",
				deposit: "10",
				rewardsRaw: "20",
				rewards: "20",
				isActive: true,
				perfilAtivo: "cliente",
				badgeLevel: "Ouro",
				reputationLevelName: "Platinum",
				totalPointsRaw: "30",
				totalPoints: "30",
				positiveRatingsRaw: "4",
				positiveRatings: "4",
				negativeRatingsRaw: "1",
				negativeRatings: "1",
				totalRatingsRaw: "5",
				totalRatings: "5",
				ratingSumRaw: "19",
				ratingSum: "19",
				averageRating: "4.8",
			}),
		} as never);

		const metricas = await carregarMetricasDaConta("0xabc");

		expect(fetchMock).toHaveBeenCalledWith("/api/account/metrics?address=0xabc", { cache: "no-store" });
		expect(metricas.depositRaw).toBe(10n);
		expect(metricas.rewardsRaw).toBe(20n);
		expect(metricas.totalPointsRaw).toBe(30n);
		expect(metricas.positiveRatingsRaw).toBe(4n);
		expect(metricas.negativeRatingsRaw).toBe(1n);
		expect(metricas.totalRatingsRaw).toBe(5n);
		expect(metricas.ratingSumRaw).toBe(19n);
		expect(metricas.averageRating).toBe("4.8");
	});

	it("carrega metricas sem address e falha quando a resposta nao e ok", async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce({
			ok: false,
			json: async () => ({}),
		} as never);

		await expect(carregarMetricasDaConta()).rejects.toThrow("Nao foi possivel carregar as metricas da conta.");
		expect(fetchMock).toHaveBeenCalledWith("/api/account/metrics", { cache: "no-store" });
	});
});

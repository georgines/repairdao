import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/account/metrics/route";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasDaContaNoServidor: vi.fn(),
}));

vi.mock("@/services/account/accountMetricsServer", () => ({
	carregarMetricasDaContaNoServidor: serviceMocks.carregarMetricasDaContaNoServidor,
}));

describe("app/api/account/metrics/route", () => {
	it("serializa as metricas da conta em JSON", async () => {
		serviceMocks.carregarMetricasDaContaNoServidor.mockResolvedValue({
			depositRaw: 150000000000000000000n,
			deposit: "150",
			rewardsRaw: 5000000000000000000n,
			rewards: "5",
			isActive: true,
			perfilAtivo: "cliente",
			badgeLevel: "Bronze",
			reputationLevel: 1,
			totalPointsRaw: 12n,
			totalPoints: "12",
			positiveRatingsRaw: 3n,
			positiveRatings: "3",
			negativeRatingsRaw: 1n,
			negativeRatings: "1",
			totalRatingsRaw: 4n,
			totalRatings: "4",
			ratingSumRaw: 16n,
			ratingSum: "16",
			averageRating: "4,0",
		});

		const resposta = await GET(new Request("http://localhost/api/account/metrics?address=0xabc"));
		const dados = (await resposta.json()) as Record<string, unknown>;

		expect(serviceMocks.carregarMetricasDaContaNoServidor).toHaveBeenCalledWith("0xabc");
		expect(dados).toMatchObject({
			depositRaw: "150000000000000000000",
			deposit: "150",
			rewardsRaw: "5000000000000000000",
			rewards: "5",
			isActive: true,
			perfilAtivo: "cliente",
			badgeLevel: "Bronze",
			reputationLevel: 1,
			totalPointsRaw: "12",
			totalPoints: "12",
			positiveRatingsRaw: "3",
			positiveRatings: "3",
			negativeRatingsRaw: "1",
			negativeRatings: "1",
			totalRatingsRaw: "4",
			totalRatings: "4",
			ratingSumRaw: "16",
			ratingSum: "16",
			averageRating: "4,0",
		});
	});
});

// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasElegibilidadeNoServidor: vi.fn(),
}));

vi.mock("@/services/eligibility/eligibilityMetricsServer", () => ({
	carregarMetricasElegibilidadeNoServidor: serviceMocks.carregarMetricasElegibilidadeNoServidor,
}));

import { GET } from "@/app/api/eligibility/metrics/route";

describe("/api/eligibility/metrics", () => {
	it("retorna as metricas serializadas", async () => {
		serviceMocks.carregarMetricasElegibilidadeNoServidor.mockResolvedValue({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			badgeLevel: "bronze",
			isActive: true,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		const resposta = await GET(new Request("http://localhost/api/eligibility/metrics?address=0xabc"));
		const body = await resposta.json();

		expect(serviceMocks.carregarMetricasElegibilidadeNoServidor).toHaveBeenCalledWith("0xabc");
		expect(body).toEqual({
			rptBalanceRaw: "1500000000000000000",
			rptBalance: "1.5",
			badgeLevel: "bronze",
			isActive: true,
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
		});
	});
});

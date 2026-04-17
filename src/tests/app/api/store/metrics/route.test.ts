// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasDaLojaNoServidor: vi.fn(),
}));

vi.mock("@/services/store/storeMetricsServer", () => ({
	carregarMetricasDaLojaNoServidor: serviceMocks.carregarMetricasDaLojaNoServidor,
}));

import { GET } from "@/app/api/store/metrics/route";

describe("/api/store/metrics", () => {
	it("retorna as metricas serializadas", async () => {
		serviceMocks.carregarMetricasDaLojaNoServidor.mockResolvedValue({
			rptBalanceRaw: 1500000000000000000n,
			rptBalance: "1.5",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
		});

		const resposta = await GET(new Request("http://localhost/api/store/metrics?address=0xabc"));
		const body = await resposta.json();

		expect(serviceMocks.carregarMetricasDaLojaNoServidor).toHaveBeenCalledWith("0xabc");
		expect(body).toEqual({
			rptBalanceRaw: "1500000000000000000",
			rptBalance: "1.5",
			tokensPerEthRaw: "1000",
			tokensPerEth: "1000",
		});
	});
});

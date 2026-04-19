import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	sincronizarConfiguracaoDepositoNoServidor: vi.fn(),
	carregarConfiguracaoDepositoDaBlockchainNoServidor: vi.fn(),
}));

vi.mock("@/services/deposit/depositConfigurationBlockchain", () => ({
	sincronizarConfiguracaoDepositoNoServidor: serviceMocks.sincronizarConfiguracaoDepositoNoServidor,
	carregarConfiguracaoDepositoDaBlockchainNoServidor: serviceMocks.carregarConfiguracaoDepositoDaBlockchainNoServidor,
}));

import { GET } from "@/app/api/deposit-configuration/route";

describe("app/api/deposit-configuration/route", () => {
	it("serializa a configuracao sincronizada", async () => {
		serviceMocks.sincronizarConfiguracaoDepositoNoServidor.mockResolvedValue({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});

		const response = await GET(new Request("http://localhost/api/deposit-configuration"));
		const body = (await response.json()) as {
			network: string;
			contractAddress: string;
			ownerAddress: string;
			minDepositRaw: string;
			minDeposit: string;
			syncedAt: string;
		};

		expect(body).toEqual({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});
});


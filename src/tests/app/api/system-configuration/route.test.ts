import { describe, expect, it, vi } from "vitest";

const blockchainMocks = vi.hoisted(() => ({
	carregarConfiguracaoSistemaDaBlockchainNoServidor: vi.fn(),
	sincronizarConfiguracaoSistemaNoServidor: vi.fn(),
}));

vi.mock("@/services/system/systemConfigurationBlockchain", () => ({
	carregarConfiguracaoSistemaDaBlockchainNoServidor: blockchainMocks.carregarConfiguracaoSistemaDaBlockchainNoServidor,
	sincronizarConfiguracaoSistemaNoServidor: blockchainMocks.sincronizarConfiguracaoSistemaNoServidor,
}));

import { GET } from "@/app/api/system-configuration/route";

describe("app/api/system-configuration/route", () => {
	it("retorna a configuracao do sistema em JSON", async () => {
		blockchainMocks.sincronizarConfiguracaoSistemaNoServidor.mockResolvedValue({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: 1000n,
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});

		const response = await GET(new Request("http://localhost/api/system-configuration"));
		const payload = await response.json();

		expect(payload).toEqual({
			network: "local",
			depositContractAddress: "0xdeposit",
			depositOwnerAddress: "0xdeposit-owner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			tokenContractAddress: "0xtoken",
			tokenOwnerAddress: "0xtoken-owner",
			tokensPerEthRaw: "1000",
			tokensPerEth: "1000",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});
});

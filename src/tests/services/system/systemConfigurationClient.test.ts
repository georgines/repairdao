// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const clientMocks = vi.hoisted(() => ({
	BrowserProvider: class {
		constructor(public ethereum: unknown) {}
	},
	criarRepairDAOBrowserContractClient: vi.fn(),
	criarGatewaysRepairDAO: vi.fn(),
	obterRedeSelecionadaNoCliente: vi.fn(),
	aguardarTransacao: vi.fn(),
	writeDepositContract: vi.fn(),
	writeTokenContract: vi.fn(),
	writeGovernanceContract: vi.fn(),
}));

vi.mock("ethers", () => ({
	BrowserProvider: clientMocks.BrowserProvider,
	parseUnits: (value: string, decimals: number) => {
		const [inteiro, fracao = ""] = value.split(".");
		return BigInt(`${inteiro}${fracao.padEnd(decimals, "0")}`);
	},
}));

vi.mock("@/services/blockchain/browserContractClient", () => ({
	criarRepairDAOBrowserContractClient: clientMocks.criarRepairDAOBrowserContractClient,
}));

vi.mock("@/services/blockchain/gateway", () => ({
	criarGatewaysRepairDAO: clientMocks.criarGatewaysRepairDAO,
}));

vi.mock("@/services/blockchain/rpcConfig", () => ({
	obterRedeSelecionadaNoCliente: clientMocks.obterRedeSelecionadaNoCliente,
}));

vi.mock("@/services/wallet/transaction", () => ({
	aguardarTransacao: clientMocks.aguardarTransacao,
}));

import {
	atualizarMinDepositNoContrato,
	atualizarTokensPerEthNoContrato,
	carregarConfiguracaoSistema,
} from "@/services/system/systemConfigurationClient";

describe("systemConfigurationClient", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clientMocks.obterRedeSelecionadaNoCliente.mockReturnValue("local");
		clientMocks.criarRepairDAOBrowserContractClient.mockReturnValue({ client: true });
		clientMocks.criarGatewaysRepairDAO.mockReturnValue({
			governance: {
				writeContract: clientMocks.writeGovernanceContract,
			},
			deposit: {
				writeContract: clientMocks.writeDepositContract,
			},
			token: {
				writeContract: clientMocks.writeTokenContract,
			},
		});
		clientMocks.aguardarTransacao.mockImplementation(async (tx: unknown) => tx);
	});

	it("carrega a configuracao do sistema pelo endpoint", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
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
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);

		await expect(carregarConfiguracaoSistema()).resolves.toEqual({
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

	it("envia a nova configuracao do deposito para o contrato", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					network: "local",
					depositContractAddress: "0xdeposit",
					depositOwnerAddress: "0xdeposit-owner",
					minDepositRaw: "150000000000000000000",
					minDeposit: "150",
					tokenContractAddress: "0xtoken",
					tokenOwnerAddress: "0xtoken-owner",
					tokensPerEthRaw: "1000",
					tokensPerEth: "1000",
					syncedAt: "2026-04-19T12:00:00.000Z",
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);
		clientMocks.writeGovernanceContract.mockResolvedValue("tx-hash");

		await expect(atualizarMinDepositNoContrato({ ethereum: true }, "150")).resolves.toBeUndefined();

		expect(clientMocks.writeGovernanceContract).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: "createMinDepositProposal",
				args: ["Propor novo deposito minimo de 150 RPT", 150000000000000000000n],
			}),
		);
		expect(clientMocks.aguardarTransacao).toHaveBeenCalledWith("tx-hash");
		expect(fetchMock).toHaveBeenCalledWith("/api/system-configuration", { cache: "no-store" });
	});

	it("envia a nova taxa de cambio para o contrato", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					network: "local",
					depositContractAddress: "0xdeposit",
					depositOwnerAddress: "0xdeposit-owner",
					minDepositRaw: "150000000000000000000",
					minDeposit: "150",
					tokenContractAddress: "0xtoken",
					tokenOwnerAddress: "0xtoken-owner",
					tokensPerEthRaw: "1500",
					tokensPerEth: "1500",
					syncedAt: "2026-04-19T12:00:00.000Z",
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);
		clientMocks.writeGovernanceContract.mockResolvedValue("tx-token");

		await expect(atualizarTokensPerEthNoContrato({ ethereum: true }, "1500")).resolves.toBeUndefined();

		expect(clientMocks.writeGovernanceContract).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: "createTokensPerEthProposal",
				args: ["Propor nova taxa de cambio de 1500 RPT por ETH", 1500n],
			}),
		);
		expect(clientMocks.aguardarTransacao).toHaveBeenCalledWith("tx-token");
		expect(fetchMock).toHaveBeenCalledWith("/api/system-configuration", { cache: "no-store" });
	});

	it("usa a mensagem da API quando o carregamento falha", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ message: "Falha ao carregar." }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(carregarConfiguracaoSistema()).rejects.toThrow("Falha ao carregar.");
	});

	it("usa a mensagem padrao quando o carregamento falha sem json", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("erro bruto", { status: 500 }));

		await expect(carregarConfiguracaoSistema()).rejects.toThrow("Nao foi possivel carregar a configuracao do sistema.");
	});
});

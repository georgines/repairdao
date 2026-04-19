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
	writeContract: vi.fn(),
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

import { atualizarMinDepositNoContrato, carregarConfiguracaoDeposito } from "@/services/deposit/depositConfigurationClient";

describe("depositConfigurationClient", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clientMocks.obterRedeSelecionadaNoCliente.mockReturnValue("local");
		clientMocks.criarRepairDAOBrowserContractClient.mockReturnValue({ client: true });
		clientMocks.criarGatewaysRepairDAO.mockReturnValue({
			deposit: {
				writeContract: clientMocks.writeContract,
			},
		});
		clientMocks.aguardarTransacao.mockImplementation(async (tx: unknown) => tx);
	});

	it("carrega a configuracao pelo endpoint", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					network: "local",
					contractAddress: "0xdeposit",
					ownerAddress: "0xowner",
					minDepositRaw: "100000000000000000000",
					minDeposit: "100",
					syncedAt: "2026-04-19T12:00:00.000Z",
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);

		await expect(carregarConfiguracaoDeposito()).resolves.toEqual({
			network: "local",
			contractAddress: "0xdeposit",
			ownerAddress: "0xowner",
			minDepositRaw: "100000000000000000000",
			minDeposit: "100",
			syncedAt: "2026-04-19T12:00:00.000Z",
		});
	});

	it("envia a nova configuracao para o contrato e recarrega o estado", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					network: "local",
					contractAddress: "0xdeposit",
					ownerAddress: "0xowner",
					minDepositRaw: "150000000000000000000",
					minDeposit: "150",
					syncedAt: "2026-04-19T12:00:00.000Z",
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);
		clientMocks.writeContract.mockResolvedValue("tx-hash");

		await expect(atualizarMinDepositNoContrato({ ethereum: true }, "150")).resolves.toBeUndefined();

		expect(clientMocks.writeContract).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: "setMinDeposit",
				args: [150000000000000000000n],
			}),
		);
		expect(clientMocks.aguardarTransacao).toHaveBeenCalledWith("tx-hash");
		expect(fetchMock).toHaveBeenCalledWith("/api/deposit-configuration", { cache: "no-store" });
	});

	it("usa a mensagem da API quando o carregamento falha", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ message: "Falha ao carregar." }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(carregarConfiguracaoDeposito()).rejects.toThrow("Falha ao carregar.");
	});

	it("usa a mensagem padrao quando o carregamento falha sem json", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("erro bruto", { status: 500 }));

		await expect(carregarConfiguracaoDeposito()).rejects.toThrow("Nao foi possivel carregar a configuracao do deposito.");
	});

	it("valida o valor informado para atualizacao", async () => {
		await expect(atualizarMinDepositNoContrato({ ethereum: true }, "  ")).rejects.toThrow("Informe um valor para o deposito minimo.");
	});
});

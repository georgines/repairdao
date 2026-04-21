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
	carregarGovernanceSnapshot,
	criarPropostaGovernanca,
	executarPropostaGovernanca,
	votarNaPropostaGovernanca,
} from "@/services/governance/governanceClient";

describe("governanceClient", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clientMocks.obterRedeSelecionadaNoCliente.mockReturnValue("local");
		clientMocks.criarRepairDAOBrowserContractClient.mockReturnValue({ client: true });
		clientMocks.criarGatewaysRepairDAO.mockReturnValue({
			governance: {
				writeContract: clientMocks.writeGovernanceContract,
			},
		});
		clientMocks.aguardarTransacao.mockImplementation(async (tx: unknown) => tx);
	});

	it("carrega o snapshot da governanca pelo endpoint", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					quorumRaw: "1000000000000000000000",
					quorum: "1000000000000000000000",
					totalProposals: 1,
					syncedAt: "2026-04-21T12:00:00.000Z",
					proposals: [
						{
							id: "1",
							proposer: "0xabc",
							description: "Nova regra",
							votesFor: "10",
							votesAgainst: "2",
							deadline: "2026-04-21T12:10:00.000Z",
							executed: false,
							approved: false,
							action: "min_deposit",
							actionValue: "150000000000000000000",
							hasVoted: false,
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);

		await expect(carregarGovernanceSnapshot("0xabc")).resolves.toEqual({
			quorum: 1000000000000000000000n,
			totalProposals: 1,
			syncedAt: "2026-04-21T12:00:00.000Z",
			proposals: [
				{
					id: "1",
					proposer: "0xabc",
					description: "Nova regra",
					votesFor: 10n,
					votesAgainst: 2n,
					deadline: "2026-04-21T12:10:00.000Z",
					executed: false,
					approved: false,
					action: "min_deposit",
					actionValue: 150000000000000000000n,
					hasVoted: false,
				},
			],
		});
	});

	it("cria propostas, vota e executa usando a governance", async () => {
		clientMocks.writeGovernanceContract.mockResolvedValue("tx-hash");

		await expect(
			criarPropostaGovernanca({ ethereum: true }, { action: "min_deposit", description: "Nova regra", value: "150" }),
		).resolves.toBeUndefined();
		await expect(votarNaPropostaGovernanca({ ethereum: true }, 1, true)).resolves.toBeUndefined();
		await expect(executarPropostaGovernanca({ ethereum: true }, 1)).resolves.toBeUndefined();

		expect(clientMocks.writeGovernanceContract).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: "createMinDepositProposal",
				args: ["Nova regra", 150000000000000000000n],
			}),
		);
		expect(clientMocks.writeGovernanceContract).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: "vote",
				args: [1, true],
			}),
		);
		expect(clientMocks.writeGovernanceContract).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: "executeProposal",
				args: [1],
			}),
		);
	});
});

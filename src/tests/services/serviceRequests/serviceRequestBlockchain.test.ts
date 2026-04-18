import { beforeEach, describe, expect, it, vi } from "vitest";

const blockchainMocks = vi.hoisted(() => ({
	contractClient: {},
	writeContract: vi.fn(),
	aguardarTransacao: vi.fn(),
	criarRepairEscrowGateway: vi.fn(),
	criarRepairTokenGateway: vi.fn(),
}));

vi.mock("ethers", () => ({
	BrowserProvider: vi.fn(function BrowserProvider() {
		return blockchainMocks.contractClient;
	}),
	parseUnits: vi.fn((value: string) => `parsed:${value}`),
}));

vi.mock("@/services/blockchain/browserContractClient", () => ({
	criarRepairDAOBrowserContractClient: vi.fn(() => blockchainMocks.contractClient),
}));

vi.mock("@/services/blockchain/gateways/escrowGateway", () => ({
	criarRepairEscrowGateway: blockchainMocks.criarRepairEscrowGateway,
}));

vi.mock("@/services/blockchain/gateways/tokenGateway", () => ({
	criarRepairTokenGateway: blockchainMocks.criarRepairTokenGateway,
}));

vi.mock("@/services/blockchain/gateways/contracts", () => ({
	REPAIRDAO_CONTRACTOS: {
		escrow: { address: "0xescrow" },
		token: { address: "0xtoken" },
	},
}));

vi.mock("@/services/wallet/transaction", () => ({
	aguardarTransacao: blockchainMocks.aguardarTransacao,
}));

import { abrirDisputaNoContrato, autorizarPagamentoNoContrato, criarOrdemServicoNoContrato } from "@/services/serviceRequests/serviceRequestBlockchain";

describe("serviceRequestBlockchain", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("abre disputa no contrato antes de aguardar a transacao", async () => {
		const writeContract = vi.fn().mockResolvedValue({ hash: "0xabc" });
		const gateway = { writeContract };

		blockchainMocks.criarRepairEscrowGateway.mockReturnValue(gateway);
		blockchainMocks.aguardarTransacao.mockResolvedValue({ mined: true });

		await expect(abrirDisputaNoContrato({} as never, 77, "falha no servico")).resolves.toEqual({ mined: true });

		expect(writeContract).toHaveBeenCalledWith({
			functionName: "openDispute",
			args: [77, "falha no servico"],
		});
		expect(blockchainMocks.aguardarTransacao).toHaveBeenCalledWith({ hash: "0xabc" });
	});

	it("continua encaminhando criacao de ordem e autorizacao de pagamento", async () => {
		const writeContract = vi.fn().mockResolvedValue({ hash: "0xdef" });
		const gateway = { writeContract };

		blockchainMocks.criarRepairEscrowGateway.mockReturnValue(gateway);
		blockchainMocks.criarRepairTokenGateway.mockReturnValue(gateway);
		blockchainMocks.aguardarTransacao.mockResolvedValue({ mined: true });

		await expect(criarOrdemServicoNoContrato({} as never, "troca de lampada")).resolves.toEqual({ mined: true });
		await expect(autorizarPagamentoNoContrato({} as never, 240)).resolves.toEqual({ mined: true });

		expect(writeContract).toHaveBeenCalledWith({
			functionName: "createOrder",
			args: ["troca de lampada"],
		});
		expect(writeContract).toHaveBeenCalledWith({
			functionName: "approve",
			args: ["0xescrow", "parsed:240"],
		});
	});
});

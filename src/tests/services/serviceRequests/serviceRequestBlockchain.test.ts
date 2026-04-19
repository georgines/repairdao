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
	obterRepairDAOContractos: vi.fn(() => ({
		escrow: { address: "0xescrow", abi: [] },
		token: { address: "0xtoken", abi: [] },
	})),
}));

vi.mock("@/services/blockchain/rpcConfig", () => ({
	obterRedeSelecionadaNoCliente: vi.fn(() => "local"),
}));

vi.mock("@/services/wallet/transaction", () => ({
	aguardarTransacao: blockchainMocks.aguardarTransacao,
}));

import {
	abrirDisputaNoContrato,
	aceitarOrcamentoNoContrato,
	avaliarServicoNoContrato,
	autorizarPagamentoNoContrato,
	carregarEstadoAvaliacaoNoContrato,
	carregarEstadoConfirmacaoEntregaNoContrato,
	concluirOrdemNoContrato,
	confirmarEntregaNoContrato,
	criarOrdemServicoNoContrato,
	enviarOrcamentoNoContrato,
} from "@/services/serviceRequests/serviceRequestBlockchain";

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

	it("confirma a entrega no contrato antes de aguardar a transacao", async () => {
		const writeContract = vi.fn().mockResolvedValue({ hash: "0xghi" });
		const gateway = { writeContract };

		blockchainMocks.criarRepairEscrowGateway.mockReturnValue(gateway);
		blockchainMocks.aguardarTransacao.mockResolvedValue({ mined: true });

		await expect(confirmarEntregaNoContrato({} as never, 88)).resolves.toEqual({ mined: true });

		expect(writeContract).toHaveBeenCalledWith({
			functionName: "confirmCompletion",
			args: [88],
		});
		expect(blockchainMocks.aguardarTransacao).toHaveBeenCalledWith({ hash: "0xghi" });
	});

	it("encaminha as demais operacoes ao contrato correto", async () => {
		const writeContract = vi.fn().mockResolvedValue({ hash: "0xaaa" });
		const buscarOrdem = vi.fn().mockResolvedValue({
			id: 5,
			estado: 2,
			descricao: "teste",
			cliente: "0xcliente",
			tecnico: "0xtec",
			clientRated: 1,
			technicianRated: 0,
		});
		const verificarConfirmacaoDaEntrega = vi.fn().mockResolvedValue({ deliveryConfirmedAt: "2026-04-17T15:00:00.000Z" });
		const escrowGateway = { writeContract, buscarOrdem, verificarConfirmacaoDaEntrega };
		const tokenGateway = { writeContract };

		blockchainMocks.criarRepairEscrowGateway.mockReturnValue(escrowGateway);
		blockchainMocks.criarRepairTokenGateway.mockReturnValue(tokenGateway);
		blockchainMocks.aguardarTransacao.mockResolvedValue({ mined: true });

		await expect(enviarOrcamentoNoContrato({} as never, 1, 250)).resolves.toEqual({ mined: true });
		await expect(avaliarServicoNoContrato({} as never, 2, 5)).resolves.toEqual({ mined: true });
		await expect(aceitarOrcamentoNoContrato({} as never, 3)).resolves.toEqual({ mined: true });
		await expect(concluirOrdemNoContrato({} as never, 4)).resolves.toEqual({ mined: true });
		await expect(carregarEstadoAvaliacaoNoContrato({} as never, 5)).resolves.toEqual({
			clientRated: true,
			technicianRated: false,
		});
		await expect(carregarEstadoConfirmacaoEntregaNoContrato({} as never, 6)).resolves.toEqual({
			deliveryConfirmedAt: "2026-04-17T15:00:00.000Z",
		});
	});

	it("retorna null quando a ordem nao existe para carregar estado de avaliacao", async () => {
		const buscarOrdem = vi.fn().mockResolvedValue(null);
		const escrowGateway = {
			writeContract: vi.fn(),
			buscarOrdem,
			verificarConfirmacaoDaEntrega: vi.fn().mockResolvedValue(null),
		};

		blockchainMocks.criarRepairEscrowGateway.mockReturnValue(escrowGateway);

		await expect(carregarEstadoAvaliacaoNoContrato({} as never, 99)).resolves.toBeNull();
	});
});

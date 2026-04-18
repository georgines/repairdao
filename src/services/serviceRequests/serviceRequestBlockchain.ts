import { BrowserProvider } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarRepairEscrowGateway } from "@/services/blockchain/gateways/escrowGateway";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

function obterContrato(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	return criarRepairEscrowGateway(criarRepairDAOBrowserContractClient(provider));
}

export async function criarOrdemServicoNoContrato(ethereum: EthereumProvider, descricao: string): Promise<unknown> {
	const contrato = obterContrato(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "createOrder", args: [descricao] }));
}

export async function enviarOrcamentoNoContrato(
	ethereum: EthereumProvider,
	ordemId: bigint | number | string,
	valor: number,
): Promise<unknown> {
	const contrato = obterContrato(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "submitBudget", args: [ordemId, valor] }));
}

export async function avaliarServicoNoContrato(
	ethereum: EthereumProvider,
	ordemId: bigint | number | string,
	nota: number,
): Promise<unknown> {
	const contrato = obterContrato(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "rateUser", args: [ordemId, nota] }));
}

export async function aceitarOrcamentoNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string): Promise<unknown> {
	const contrato = obterContrato(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "acceptBudget", args: [ordemId] }));
}

export async function concluirOrdemNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string): Promise<unknown> {
	const contrato = obterContrato(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "completeOrder", args: [ordemId] }));
}

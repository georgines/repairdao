import { BrowserProvider, Contract } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

async function obterContrato(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	const signer = await provider.getSigner();
	return new Contract(REPAIRDAO_CONTRACTOS.escrow.address, REPAIRDAO_CONTRACTOS.escrow.abi, signer);
}

export async function criarOrdemServicoNoContrato(ethereum: EthereumProvider, descricao: string): Promise<unknown> {
	const contrato = await obterContrato(ethereum);
	return aguardarTransacao(await contrato.createOrder(descricao));
}

export async function enviarOrcamentoNoContrato(
	ethereum: EthereumProvider,
	ordemId: bigint | number | string,
	valor: number,
): Promise<unknown> {
	const contrato = await obterContrato(ethereum);
	return aguardarTransacao(await contrato.submitBudget(ordemId, valor));
}

export async function aceitarOrcamentoNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string): Promise<unknown> {
	const contrato = await obterContrato(ethereum);
	return aguardarTransacao(await contrato.acceptBudget(ordemId));
}

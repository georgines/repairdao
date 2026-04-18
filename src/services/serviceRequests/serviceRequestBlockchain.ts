import { BrowserProvider, parseUnits } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { mapearOrdemDoContrato } from "@/services/blockchain/adapters";
import { criarRepairTokenGateway } from "@/services/blockchain/gateways/tokenGateway";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import { criarRepairEscrowGateway } from "@/services/blockchain/gateways/escrowGateway";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

function obterContrato(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	return criarRepairEscrowGateway(criarRepairDAOBrowserContractClient(provider));
}

function obterContratoToken(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	return criarRepairTokenGateway(criarRepairDAOBrowserContractClient(provider));
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
	return aguardarTransacao(
		await contrato.writeContract({ functionName: "submitBudget", args: [ordemId, parseUnits(String(valor), 18)] }),
	);
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

export async function autorizarPagamentoNoContrato(ethereum: EthereumProvider, valor: number): Promise<unknown> {
	const contrato = obterContratoToken(ethereum);
	return aguardarTransacao(
		await contrato.writeContract({
			functionName: "approve",
			args: [REPAIRDAO_CONTRACTOS.escrow.address, parseUnits(String(valor), 18)],
		}),
	);
}

export async function concluirOrdemNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string): Promise<unknown> {
	const contrato = obterContrato(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "completeOrder", args: [ordemId] }));
}

export async function carregarEstadoAvaliacaoNoContrato(
	ethereum: EthereumProvider,
	ordemId: bigint | number | string,
): Promise<{ clientRated: boolean; technicianRated: boolean } | null> {
	const contrato = obterContrato(ethereum);
	const ordem = await contrato.buscarOrdem(ordemId);

	if (!ordem) {
		return null;
	}

	const ordemDominio = mapearOrdemDoContrato(ordem);

	return {
		clientRated: Boolean(ordemDominio.clientRated),
		technicianRated: Boolean(ordemDominio.technicianRated),
	};
}

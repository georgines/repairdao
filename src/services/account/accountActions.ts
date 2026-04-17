import { BrowserProvider } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarRepairDepositGateway } from "@/services/blockchain/gateways/depositGateway";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

function obterContratoDeDeposito(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	return criarRepairDepositGateway(criarRepairDAOBrowserContractClient(provider));
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const contrato = obterContratoDeDeposito(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "withdrawDeposit" }));
}

export async function sacarRendimento(ethereum: EthereumProvider): Promise<unknown> {
	const contrato = obterContratoDeDeposito(ethereum);
	return aguardarTransacao(await contrato.writeContract({ functionName: "withdrawRewards" }));
}

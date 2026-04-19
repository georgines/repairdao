import { BrowserProvider } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { obterRepairDAOContractos } from "@/services/blockchain/gateways/contracts";
import { obterRedeSelecionadaNoCliente } from "@/services/blockchain/rpcConfig";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

export async function depositarTokens(
	ethereum: EthereumProvider,
	quantidade: bigint,
	isTechnician = false,
): Promise<unknown> {
	if (quantidade <= 0n) {
		throw new RepairDAODominioError("deposito_invalido", "Nao ha RPT disponivel para depositar.");
	}

	const provider = new BrowserProvider(ethereum as never);
	const rede = obterRedeSelecionadaNoCliente();
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), rede);

	await aguardarTransacao(await gateways.token.writeContract({
		functionName: "approve",
		args: [obterRepairDAOContractos(rede).deposit.address, quantidade],
	}));

	return aguardarTransacao(await gateways.deposit.writeContract({
		functionName: "deposit",
		args: [quantidade, isTechnician],
	}));
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const provider = new BrowserProvider(ethereum as never);
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), obterRedeSelecionadaNoCliente());
	return aguardarTransacao(await gateways.deposit.writeContract({
		functionName: "withdrawDeposit",
	}));
}

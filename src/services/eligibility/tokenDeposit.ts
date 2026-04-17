import { BrowserProvider } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
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
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider));

	await aguardarTransacao(await gateways.token.writeContract({
		functionName: "approve",
		args: [REPAIRDAO_CONTRACTOS.deposit.address, quantidade],
	}));

	return aguardarTransacao(await gateways.deposit.writeContract({
		functionName: "deposit",
		args: [quantidade, isTechnician],
	}));
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const provider = new BrowserProvider(ethereum as never);
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider));
	return aguardarTransacao(await gateways.deposit.writeContract({
		functionName: "withdrawDeposit",
	}));
}

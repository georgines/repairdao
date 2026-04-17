import { BrowserProvider, Contract } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
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
	const signer = await provider.getSigner();
	const token = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIRDAO_CONTRACTOS.token.abi, signer);
	const deposito = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIRDAO_CONTRACTOS.deposit.abi, signer);

	await aguardarTransacao(await token.approve(REPAIRDAO_CONTRACTOS.deposit.address, quantidade));

	return aguardarTransacao(await deposito.deposit(quantidade, isTechnician));
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const provider = new BrowserProvider(ethereum as never);
	const signer = await provider.getSigner();
	const contrato = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIRDAO_CONTRACTOS.deposit.abi, signer);
	return aguardarTransacao(await contrato.withdrawDeposit());
}

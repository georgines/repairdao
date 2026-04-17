import { BrowserProvider, Contract } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

async function obterContratoDeDeposito(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	const signer = await provider.getSigner();
	return new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIRDAO_CONTRACTOS.deposit.abi, signer);
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const contrato = await obterContratoDeDeposito(ethereum);
	return aguardarTransacao(await contrato.withdrawDeposit());
}

export async function sacarRendimento(ethereum: EthereumProvider): Promise<unknown> {
	const contrato = await obterContratoDeDeposito(ethereum);
	return aguardarTransacao(await contrato.withdrawRewards());
}

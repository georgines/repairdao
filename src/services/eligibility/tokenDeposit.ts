import { BrowserProvider, Contract } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import type { EthereumProvider } from "@/services/wallet/provider";

const REPAIR_DEPOSIT_ABI = [
	{
		type: "function",
		name: "deposit",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "amount", type: "uint256" },
			{ name: "isTechnician", type: "bool" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "withdrawDeposit",
		stateMutability: "nonpayable",
		inputs: [],
		outputs: [],
	},
] as const;

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
	const contrato = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIR_DEPOSIT_ABI, signer);
	const transacao = await contrato.deposit(quantidade, isTechnician);

	if (typeof transacao?.wait === "function") {
		return transacao.wait();
	}

	return transacao;
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const provider = new BrowserProvider(ethereum as never);
	const signer = await provider.getSigner();
	const contrato = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIR_DEPOSIT_ABI, signer);
	const transacao = await contrato.withdrawDeposit();

	if (typeof transacao?.wait === "function") {
		return transacao.wait();
	}

	return transacao;
}

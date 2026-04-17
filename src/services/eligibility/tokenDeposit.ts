import { BrowserProvider, Contract } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import type { EthereumProvider } from "@/services/wallet/provider";

const REPAIR_TOKEN_ABI = [
	{
		type: "function",
		name: "approve",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ name: "success", type: "bool" }],
	},
] as const;

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

async function aguardarTransacao(transacao: unknown): Promise<unknown> {
	if (typeof (transacao as { wait?: unknown } | null)?.wait === "function") {
		return (transacao as { wait: () => Promise<unknown> }).wait();
	}

	return transacao;
}

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
	const token = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIR_TOKEN_ABI, signer);
	const deposito = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIR_DEPOSIT_ABI, signer);

	await aguardarTransacao(await token.approve(REPAIRDAO_CONTRACTOS.deposit.address, quantidade));

	return aguardarTransacao(await deposito.deposit(quantidade, isTechnician));
}

export async function sacarDeposito(ethereum: EthereumProvider): Promise<unknown> {
	const provider = new BrowserProvider(ethereum as never);
	const signer = await provider.getSigner();
	const contrato = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIR_DEPOSIT_ABI, signer);
	return aguardarTransacao(await contrato.withdrawDeposit());
}

import { BrowserProvider, Contract, formatUnits } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import type { EthereumProvider } from "@/services/wallet/provider";

const REPAIR_TOKEN_READ_ABI = [
	{
		type: "function",
		name: "balanceOf",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "balance", type: "uint256" }],
	},
	{
		type: "function",
		name: "tokensPerEth",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "rate", type: "uint256" }],
	},
] as const;

export type StoreMetrics = {
	rptBalanceRaw: bigint;
	rptBalance: string;
	tokensPerEthRaw: bigint;
	tokensPerEth: string;
};

export async function carregarMetricasDaLoja(ethereum: EthereumProvider, address: string): Promise<StoreMetrics> {
	const provider = new BrowserProvider(ethereum as never);
	const tokenContract = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIR_TOKEN_READ_ABI, provider);

	const [rptBalanceRaw, tokensPerEthRaw] = await Promise.all([
		tokenContract.balanceOf(address),
		tokenContract.tokensPerEth().catch(() => 0n),
	]);

	return {
		rptBalanceRaw,
		rptBalance: formatUnits(rptBalanceRaw, 18),
		tokensPerEthRaw,
		tokensPerEth: String(tokensPerEthRaw),
	};
}

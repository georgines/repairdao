import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

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

function obterRpcUrl() {
	return process.env.RPC_URL?.trim() || process.env.NEXT_PUBLIC_RPC_URL?.trim() || "http://127.0.0.1:8545";
}

export async function carregarMetricasDaLojaNoServidor(address?: string | null): Promise<StoreMetrics> {
	const provider = new JsonRpcProvider(obterRpcUrl());
	const tokenContract = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIR_TOKEN_READ_ABI, provider);

	const tokensPerEthRaw = await tokenContract.tokensPerEth().catch(() => 0n);
	const rptBalanceRaw = address ? await tokenContract.balanceOf(address).catch(() => 0n) : 0n;

	return {
		rptBalanceRaw,
		rptBalance: formatUnits(rptBalanceRaw, 18),
		tokensPerEthRaw,
		tokensPerEth: String(tokensPerEthRaw),
	};
}

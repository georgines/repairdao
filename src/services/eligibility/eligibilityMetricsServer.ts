import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

const MIN_DEPOSIT_STORAGE_SLOT = 5n;

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

const REPAIR_DEPOSIT_READ_ABI = [
	{
		type: "function",
		name: "isActive",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [{ name: "active", type: "bool" }],
	},
] as const;

const REPAIR_BADGE_READ_ABI = [
	{
		type: "function",
		name: "getLevelName",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [{ name: "levelName", type: "string" }],
	},
] as const;

export type EligibilityMetrics = {
	rptBalanceRaw: bigint;
	rptBalance: string;
	tokensPerEthRaw: bigint;
	tokensPerEth: string;
	badgeLevel: string;
	isActive: boolean;
	minDepositRaw: bigint;
	minDeposit: string;
};

function obterRpcUrl() {
	return process.env.RPC_URL?.trim() || process.env.NEXT_PUBLIC_RPC_URL?.trim() || "http://127.0.0.1:8545";
}

export async function carregarMetricasElegibilidadeNoServidor(address?: string | null): Promise<EligibilityMetrics> {
	const provider = new JsonRpcProvider(obterRpcUrl());
	const tokenContract = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIR_TOKEN_READ_ABI, provider);
	const depositContract = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIR_DEPOSIT_READ_ABI, provider);
	const badgeContract = new Contract(REPAIRDAO_CONTRACTOS.badge.address, REPAIR_BADGE_READ_ABI, provider);

	const rptBalanceRaw = address ? await tokenContract.balanceOf(address).catch(() => 0n) : 0n;
	const tokensPerEthRaw = await tokenContract.tokensPerEth().catch(() => 0n);
	const isActive = address ? await depositContract.isActive(address).catch(() => false) : false;
	const badgeLevel = address ? await badgeContract.getLevelName(address).catch(() => "Sem badge") : "Sem carteira";
	const minDepositRawHex = await provider.getStorage(REPAIRDAO_CONTRACTOS.deposit.address, MIN_DEPOSIT_STORAGE_SLOT).catch(() => "0x0");
	const minDepositRaw = BigInt(minDepositRawHex);

	return {
		rptBalanceRaw,
		rptBalance: formatUnits(rptBalanceRaw, 18),
		tokensPerEthRaw,
		tokensPerEth: String(tokensPerEthRaw),
		badgeLevel,
		isActive,
		minDepositRaw,
		minDeposit: formatUnits(minDepositRaw, 18),
	};
}

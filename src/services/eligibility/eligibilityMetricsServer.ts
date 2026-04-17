import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

const MIN_DEPOSIT_STORAGE_SLOT = 5n;

export type EligibilityMetrics = {
	rptBalanceRaw: bigint;
	rptBalance: string;
	tokensPerEthRaw: bigint;
	tokensPerEth: string;
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
	minDepositRaw: bigint;
	minDeposit: string;
};

function obterRpcUrl() {
	return process.env.RPC_URL?.trim() || process.env.NEXT_PUBLIC_RPC_URL?.trim() || "http://127.0.0.1:8545";
}

export async function carregarMetricasElegibilidadeNoServidor(address?: string | null): Promise<EligibilityMetrics> {
	const provider = new JsonRpcProvider(obterRpcUrl());
	const tokenContract = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIRDAO_CONTRACTOS.token.abi, provider);
	const depositContract = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, REPAIRDAO_CONTRACTOS.deposit.abi, provider);
	const badgeContract = new Contract(REPAIRDAO_CONTRACTOS.badge.address, REPAIRDAO_CONTRACTOS.badge.abi, provider);

	const rptBalanceRaw = address ? await tokenContract.balanceOf(address).catch(() => 0n) : 0n;
	const tokensPerEthRaw = await tokenContract.tokensPerEth().catch(() => 0n);
	const isActive = address ? await depositContract.isActive(address).catch(() => false) : false;
	const deposito = address ? await depositContract.getDeposit(address).catch(() => null) : null;
	const badgeLevel = address ? await badgeContract.getLevelName(address).catch(() => "Sem badge") : "Sem carteira";
	const minDepositRawHex = await provider.getStorage(REPAIRDAO_CONTRACTOS.deposit.address, MIN_DEPOSIT_STORAGE_SLOT).catch(() => "0x0");
	const minDepositRaw = BigInt(minDepositRawHex);
	const perfilAtivo = isActive && deposito
		? ((deposito as { isTechnician?: boolean; [index: number]: unknown }).isTechnician
			?? (deposito as { [index: number]: unknown })[5])
			? "tecnico"
			: "cliente"
		: null;

	return {
		rptBalanceRaw,
		rptBalance: formatUnits(rptBalanceRaw, 18),
		tokensPerEthRaw,
		tokensPerEth: String(tokensPerEthRaw),
		badgeLevel,
		isActive,
		perfilAtivo,
		minDepositRaw,
		minDeposit: formatUnits(minDepositRaw, 18),
	};
}

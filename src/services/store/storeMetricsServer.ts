import { formatUnits } from "ethers";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";

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
	const contractClient = criarRepairDAOContractClient({ rpcUrl: obterRpcUrl() });
	const tokenContract = criarGatewaysRepairDAO(contractClient).token;

	const tokensPerEthRaw = await tokenContract.readContract<bigint>({ functionName: "tokensPerEth" }).catch(() => 0n);
	const rptBalanceRaw = address ? await tokenContract.readContract<bigint>({ functionName: "balanceOf", args: [address] }).catch(() => 0n) : 0n;

	return {
		rptBalanceRaw,
		rptBalance: formatUnits(rptBalanceRaw, 18),
		tokensPerEthRaw,
		tokensPerEth: String(tokensPerEthRaw),
	};
}

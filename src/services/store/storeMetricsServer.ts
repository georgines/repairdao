import { formatUnits } from "ethers";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { obterConfiguracaoRpcNoServidor } from "@/services/blockchain/rpcConfig.server";

export type StoreMetrics = {
	rptBalanceRaw: bigint;
	rptBalance: string;
	tokensPerEthRaw: bigint;
	tokensPerEth: string;
};

export async function carregarMetricasDaLojaNoServidor(address?: string | null): Promise<StoreMetrics> {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	const contractClient = criarRepairDAOContractClient({ rpcUrl: configuracaoRpc.rpcUrl, rede: configuracaoRpc.rede });
	const tokenContract = criarGatewaysRepairDAO(contractClient, configuracaoRpc.rede).token;

	const tokensPerEthRaw = await tokenContract.readContract<bigint>({ functionName: "tokensPerEth" }).catch(() => 0n);
	const rptBalanceRaw = address ? await tokenContract.readContract<bigint>({ functionName: "balanceOf", args: [address] }).catch(() => 0n) : 0n;

	return {
		rptBalanceRaw,
		rptBalance: formatUnits(rptBalanceRaw, 18),
		tokensPerEthRaw,
		tokensPerEth: String(tokensPerEthRaw),
	};
}

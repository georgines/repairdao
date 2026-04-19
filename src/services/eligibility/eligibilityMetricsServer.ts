import { formatUnits } from "ethers";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { obterConfiguracaoRpcNoServidor } from "@/services/blockchain/rpcConfig.server";
import { sincronizarConfiguracaoDepositoNoServidor } from "@/services/deposit/depositConfigurationBlockchain";

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

export async function carregarMetricasElegibilidadeNoServidor(address?: string | null): Promise<EligibilityMetrics> {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	const contractClient = criarRepairDAOContractClient({ rpcUrl: configuracaoRpc.rpcUrl });
	const gateways = criarGatewaysRepairDAO(contractClient, configuracaoRpc.rede);

	const rptBalanceRaw = address ? await gateways.token.readContract<bigint>({ functionName: "balanceOf", args: [address] }).catch(() => 0n) : 0n;
	const tokensPerEthRaw = await gateways.token.readContract<bigint>({ functionName: "tokensPerEth" }).catch(() => 0n);
	const isActive = address ? await gateways.deposit.readContract<boolean>({ functionName: "isActive", args: [address] }).catch(() => false) : false;
	const deposito = address ? await gateways.deposit.readContract<unknown>({ functionName: "getDeposit", args: [address] }).catch(() => null) : null;
	const badgeLevel = address ? await gateways.badge.readContract<string>({ functionName: "getLevelName", args: [address] }).catch(() => "Sem badge") : "Sem carteira";
	const configuracaoDeposito = await sincronizarConfiguracaoDepositoNoServidor().catch(() => null);
	const minDepositRaw = configuracaoDeposito?.minDepositRaw ?? await gateways.deposit.readContract<bigint>({ functionName: "minDeposit" }).catch(() => 0n);
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

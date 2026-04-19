import { formatUnits } from "ethers";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { obterConfiguracaoRpcNoServidor } from "@/services/blockchain/rpcConfig.server";
import { formatarNumeroCompleto } from "@/services/wallet/formatters";
import { nomeNivelReputacao } from "@/services/reputacao";

const DEFAULT_ACCOUNT_LEVEL = "Sem carteira";

export type AccountMetrics = {
	depositRaw: bigint;
	deposit: string;
	rewardsRaw: bigint;
	rewards: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
	badgeLevel: string;
	reputationLevelName: string;
	totalPointsRaw: bigint;
	totalPoints: string;
	positiveRatingsRaw: bigint;
	positiveRatings: string;
	negativeRatingsRaw: bigint;
	negativeRatings: string;
	totalRatingsRaw: bigint;
	totalRatings: string;
	ratingSumRaw: bigint;
	ratingSum: string;
	averageRating: string;
};

function lerValorNumerico(valor: unknown, chave: string, indice: number): bigint {
	const item = valor && typeof valor === "object" ? (valor as Record<string, unknown>) : {};
	const candidato = item[chave] ?? item[String(indice)];

	return typeof candidato === "bigint" ? candidato : 0n;
}

function lerValorBooleano(valor: unknown, chave: string, indice: number): boolean {
	const item = valor && typeof valor === "object" ? (valor as Record<string, unknown>) : {};
	const candidato = item[chave] ?? item[String(indice)];

	return typeof candidato === "boolean" ? candidato : false;
}

function calcularMediaAvaliacao(ratingSumRaw: bigint, totalRatingsRaw: bigint) {
	if (totalRatingsRaw <= 0n) {
		return "0,0";
	}

	const media = Number(ratingSumRaw) / Number(totalRatingsRaw);

	return formatarNumeroCompleto(media.toFixed(1), 1);
}

export async function carregarMetricasDaContaNoServidor(address?: string | null): Promise<AccountMetrics> {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	const contractClient = criarRepairDAOContractClient({ rpcUrl: configuracaoRpc.rpcUrl });
	const gateways = criarGatewaysRepairDAO(contractClient, configuracaoRpc.rede);

	const deposito = address ? await gateways.deposit.readContract<unknown>({ functionName: "getDeposit", args: [address] }).catch(() => null) : null;
	const rewardsRaw = address ? await gateways.deposit.readContract<bigint>({ functionName: "getRewards", args: [address] }).catch(() => 0n) : 0n;
	const isActive = address ? await gateways.deposit.readContract<boolean>({ functionName: "isActive", args: [address] }).catch(() => false) : false;
	const badgeLevel = address ? await gateways.badge.readContract<string>({ functionName: "getLevelName", args: [address] }).catch(() => DEFAULT_ACCOUNT_LEVEL) : DEFAULT_ACCOUNT_LEVEL;
	const reputation = address ? await gateways.reputation.readContract<unknown>({ functionName: "getReputation", args: [address] }).catch(() => null) : null;

	const depositRaw = deposito ? lerValorNumerico(deposito, "amount", 0) : 0n;
	const perfilAtivo = isActive && deposito
		? lerValorBooleano(deposito, "isTechnician", 5)
			? "tecnico"
			: "cliente"
		: null;

	const reputationLevelRaw = lerValorNumerico(reputation, "level", 0);
	const totalPointsRaw = lerValorNumerico(reputation, "totalPoints", 1);
	const positiveRatingsRaw = lerValorNumerico(reputation, "positiveRatings", 2);
	const negativeRatingsRaw = lerValorNumerico(reputation, "negativeRatings", 3);
	const totalRatingsRaw = lerValorNumerico(reputation, "totalRatings", 4);
	const ratingSumRaw = lerValorNumerico(reputation, "ratingSum", 5);

	return {
		depositRaw,
		deposit: formatUnits(depositRaw, 18),
		rewardsRaw,
		rewards: formatUnits(rewardsRaw, 18),
		isActive,
		perfilAtivo,
		badgeLevel,
		reputationLevelName: nomeNivelReputacao(Number(reputationLevelRaw)),
		totalPointsRaw,
		totalPoints: formatarNumeroCompleto(String(totalPointsRaw), 0),
		positiveRatingsRaw,
		positiveRatings: formatarNumeroCompleto(String(positiveRatingsRaw), 0),
		negativeRatingsRaw,
		negativeRatings: formatarNumeroCompleto(String(negativeRatingsRaw), 0),
		totalRatingsRaw,
		totalRatings: formatarNumeroCompleto(String(totalRatingsRaw), 0),
		ratingSumRaw,
		ratingSum: formatarNumeroCompleto(String(ratingSumRaw), 0),
		averageRating: calcularMediaAvaliacao(ratingSumRaw, totalRatingsRaw),
	};
}

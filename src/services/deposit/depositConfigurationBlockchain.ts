import { formatUnits } from "ethers";
import { obterRepairDAOContractos } from "@/services/blockchain/gateways/contracts";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { obterConfiguracaoRpcNoServidor } from "@/services/blockchain/rpcConfig.server";
import type { DepositConfigurationSnapshot } from "@/services/deposit/depositConfigurationTypes";
import { loadDepositConfiguration, upsertDepositConfiguration } from "@/services/deposit/depositConfigurationRepository";

export async function carregarConfiguracaoDepositoDaBlockchainNoServidor(): Promise<DepositConfigurationSnapshot> {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	const contractClient = criarRepairDAOContractClient({ rpcUrl: configuracaoRpc.rpcUrl });
	const gateways = criarGatewaysRepairDAO(contractClient, configuracaoRpc.rede);
	const contrato = obterRepairDAOContractos(configuracaoRpc.rede).deposit;

	try {
		const [ownerAddress, minDepositRaw] = await Promise.all([
			gateways.deposit.readContract<string>({ functionName: "owner" }),
			gateways.deposit.readContract<bigint>({ functionName: "minDeposit" }),
		]);

		return {
			network: configuracaoRpc.rede,
			contractAddress: contrato.address,
			ownerAddress,
			minDepositRaw,
			minDeposit: formatUnits(minDepositRaw, 18),
			syncedAt: new Date().toISOString(),
		};
	} catch {
		const armazenado = await loadDepositConfiguration(configuracaoRpc.rede);

		if (armazenado) {
			return armazenado;
		}

		throw new Error("Nao foi possivel carregar a configuracao do deposito.");
	}
}

export async function sincronizarConfiguracaoDepositoNoServidor(): Promise<DepositConfigurationSnapshot> {
	const configuracao = await carregarConfiguracaoDepositoDaBlockchainNoServidor();

	await upsertDepositConfiguration(configuracao);

	return configuracao;
}

export async function carregarConfiguracaoDepositoPersistidaNoServidor() {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	return loadDepositConfiguration(configuracaoRpc.rede);
}

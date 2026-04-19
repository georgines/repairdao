import { formatUnits } from "ethers";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { obterRepairDAOContractos } from "@/services/blockchain/gateways/contracts";
import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { obterConfiguracaoRpcNoServidor } from "@/services/blockchain/rpcConfig.server";
import type { SystemConfigurationSnapshot } from "@/services/system/systemConfigurationTypes";
import { loadSystemConfiguration, upsertSystemConfiguration } from "@/services/system/systemConfigurationRepository";

export async function carregarConfiguracaoSistemaDaBlockchainNoServidor(): Promise<SystemConfigurationSnapshot> {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	const contractClient = criarRepairDAOContractClient({ rpcUrl: configuracaoRpc.rpcUrl, rede: configuracaoRpc.rede });
	const gateways = criarGatewaysRepairDAO(contractClient, configuracaoRpc.rede);
	const contratos = obterRepairDAOContractos(configuracaoRpc.rede);

	try {
		const [depositOwnerAddress, minDepositRaw, tokenOwnerAddress, tokensPerEthRaw] = await Promise.all([
			gateways.deposit.readContract<string>({ functionName: "owner" }),
			gateways.deposit.readContract<bigint>({ functionName: "minDeposit" }),
			gateways.token.readContract<string>({ functionName: "owner" }),
			gateways.token.readContract<bigint>({ functionName: "tokensPerEth" }),
		]);

		return {
			network: configuracaoRpc.rede,
			depositContractAddress: contratos.deposit.address,
			depositOwnerAddress,
			minDepositRaw,
			minDeposit: formatUnits(minDepositRaw, 18),
			tokenContractAddress: contratos.token.address,
			tokenOwnerAddress,
			tokensPerEthRaw,
			tokensPerEth: tokensPerEthRaw.toString(),
			syncedAt: new Date().toISOString(),
		};
	} catch {
		const armazenado = await loadSystemConfiguration(configuracaoRpc.rede);

		if (armazenado) {
			return armazenado;
		}

		throw new Error("Nao foi possivel carregar a configuracao do sistema.");
	}
}

export async function sincronizarConfiguracaoSistemaNoServidor(): Promise<SystemConfigurationSnapshot> {
	const configuracao = await carregarConfiguracaoSistemaDaBlockchainNoServidor();

	await upsertSystemConfiguration(configuracao);

	return configuracao;
}

export async function carregarConfiguracaoSistemaPersistidaNoServidor() {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	return loadSystemConfiguration(configuracaoRpc.rede);
}

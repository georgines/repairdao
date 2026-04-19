"use client";

import { BrowserProvider, parseUnits } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { obterRepairDAOContractos } from "@/services/blockchain/gateways/contracts";
import { obterRedeSelecionadaNoCliente } from "@/services/blockchain/rpcConfig";
import { aguardarTransacao } from "@/services/wallet/transaction";
import type { EthereumProvider } from "@/services/wallet/provider";
import type { SystemConfigurationSerialized } from "@/services/system/systemConfigurationTypes";

type SystemConfigurationApiResponse = {
	network: string;
	depositContractAddress: string;
	depositOwnerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	tokenContractAddress: string;
	tokenOwnerAddress: string;
	tokensPerEthRaw: string;
	tokensPerEth: string;
	syncedAt: string;
};

async function lerMensagemDeErro(response: Response, fallback: string) {
	try {
		const payload = (await response.json()) as { message?: string };
		return payload.message ?? fallback;
	} catch {
		return fallback;
	}
}

function normalizarValorInteiroPositivo(valor: string | number, mensagemErro: string) {
	const texto = String(valor).trim().replace(",", ".");

	if (!texto || !/^\d+$/.test(texto)) {
		throw new Error(mensagemErro);
	}

	const numero = BigInt(texto);

	if (numero <= 0n) {
		throw new Error(mensagemErro);
	}

	return numero;
}

export async function carregarConfiguracaoSistema(): Promise<SystemConfigurationSerialized> {
	const response = await fetch("/api/system-configuration", {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await lerMensagemDeErro(response, "Nao foi possivel carregar a configuracao do sistema."));
	}

	const payload = (await response.json()) as SystemConfigurationApiResponse;

	return {
		network: payload.network as SystemConfigurationSerialized["network"],
		depositContractAddress: payload.depositContractAddress,
		depositOwnerAddress: payload.depositOwnerAddress,
		minDepositRaw: payload.minDepositRaw,
		minDeposit: payload.minDeposit,
		tokenContractAddress: payload.tokenContractAddress,
		tokenOwnerAddress: payload.tokenOwnerAddress,
		tokensPerEthRaw: payload.tokensPerEthRaw,
		tokensPerEth: payload.tokensPerEth,
		syncedAt: payload.syncedAt,
	};
}

export async function atualizarMinDepositNoContrato(ethereum: EthereumProvider, valorEmRPT: string): Promise<void> {
	const valorNormalizado = valorEmRPT.trim().replace(",", ".");

	if (!valorNormalizado) {
		throw new Error("Informe um valor para o deposito minimo.");
	}

	const provider = new BrowserProvider(ethereum as never);
	const rede = obterRedeSelecionadaNoCliente();
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), rede);
	const quantidade = parseUnits(valorNormalizado, 18);

	await aguardarTransacao(
		await gateways.deposit.writeContract({
			functionName: "setMinDeposit",
			args: [quantidade],
		}),
	);

	await carregarConfiguracaoSistema();
}

export async function atualizarTokensPerEthNoContrato(ethereum: EthereumProvider, valorEmRPT: string | number): Promise<void> {
	const valorNormalizado = normalizarValorInteiroPositivo(
		valorEmRPT,
		"Informe uma quantidade valida de RPT por ETH.",
	);

	const provider = new BrowserProvider(ethereum as never);
	const rede = obterRedeSelecionadaNoCliente();
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), rede);

	await aguardarTransacao(
		await gateways.token.writeContract({
			functionName: "setTokensPerEth",
			args: [valorNormalizado],
		}),
	);

	await carregarConfiguracaoSistema();
}

export async function carregarConfiguracaoSistemaEContrato(): Promise<{
	configuracao: SystemConfigurationSerialized;
	deposito: string;
	token: string;
}> {
	const configuracao = await carregarConfiguracaoSistema();
	const contratos = obterRepairDAOContractos(configuracao.network);

	return {
		configuracao,
		deposito: contratos.deposit.address,
		token: contratos.token.address,
	};
}

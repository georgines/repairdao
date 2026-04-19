"use client";

import { BrowserProvider, parseUnits } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { obterRepairDAOContractos } from "@/services/blockchain/gateways/contracts";
import { obterRedeSelecionadaNoCliente } from "@/services/blockchain/rpcConfig";
import { aguardarTransacao } from "@/services/wallet/transaction";
import type { EthereumProvider } from "@/services/wallet/provider";
import type { DepositConfigurationSerialized } from "@/services/deposit/depositConfigurationTypes";

type DepositConfigurationApiResponse = {
	network: string;
	contractAddress: string;
	ownerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
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

export async function carregarConfiguracaoDeposito(): Promise<DepositConfigurationSerialized> {
	const response = await fetch("/api/deposit-configuration", {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await lerMensagemDeErro(response, "Nao foi possivel carregar a configuracao do deposito."));
	}

	const payload = (await response.json()) as DepositConfigurationApiResponse;

	return {
		network: payload.network as DepositConfigurationSerialized["network"],
		contractAddress: payload.contractAddress,
		ownerAddress: payload.ownerAddress,
		minDepositRaw: payload.minDepositRaw,
		minDeposit: payload.minDeposit,
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

	await carregarConfiguracaoDeposito();
}

export async function carregarConfiguracaoDepositoEContrato(): Promise<{
	configuracao: DepositConfigurationSerialized;
	contrato: string;
}> {
	const configuracao = await carregarConfiguracaoDeposito();
	return {
		configuracao,
		contrato: obterRepairDAOContractos(configuracao.network).deposit.address,
	};
}


import { BrowserProvider } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarRepairEscrowGateway } from "@/services/blockchain/gateways/escrowGateway";
import { mapearDisputaDoContrato, mapearEvidenciaDoContrato } from "@/services/blockchain/adapters";
import { garantirPodeEnviarEvidencia, garantirPodeVotarEmDisputa } from "@/services/papeis";
import type { ContextoPapelRepairDAO } from "@/types";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

function obterGateway(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	return criarRepairEscrowGateway(criarRepairDAOBrowserContractClient(provider));
}

export async function carregarDisputaNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string) {
	const disputa = await obterGateway(ethereum).buscarDisputa(ordemId);
	return disputa ? mapearDisputaDoContrato(disputa) : null;
}

export async function carregarEvidenciasDaDisputaNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string) {
	const evidencias = await obterGateway(ethereum).buscarEvidencias(ordemId);
	return evidencias.map((evidencia) => mapearEvidenciaDoContrato(evidencia));
}

export async function enviarEvidenciaNaDisputaNoContrato(
	ethereum: EthereumProvider,
	contexto: ContextoPapelRepairDAO,
	ordemId: bigint | number | string,
	autor: string,
	conteudo: string,
) {
	garantirPodeEnviarEvidencia(contexto);

	return aguardarTransacao(await obterGateway(ethereum).enviarEvidencia({
		ordemId,
		autor,
		conteudo,
	}));
}

export async function votarNaDisputaNoContrato(
	ethereum: EthereumProvider,
	contexto: ContextoPapelRepairDAO,
	ordemId: bigint | number | string,
	votante: string,
	apoiandoAbertura: boolean,
) {
	garantirPodeVotarEmDisputa(contexto);

	return aguardarTransacao(await obterGateway(ethereum).votarDisputa({
		ordemId,
		votante,
		apoiandoAbertura,
	}));
}

export async function resolverDisputaNoContrato(ethereum: EthereumProvider, ordemId: bigint | number | string) {
	return aguardarTransacao(await obterGateway(ethereum).resolverDisputa({ ordemId }));
}

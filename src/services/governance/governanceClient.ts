"use client";

import { BrowserProvider, parseUnits } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { obterRedeSelecionadaNoCliente } from "@/services/blockchain/rpcConfig";
import { aguardarTransacao } from "@/services/wallet/transaction";
import type { EthereumProvider } from "@/services/wallet/provider";
import type { GovernanceProposal, GovernanceProposalAction, GovernanceSnapshot } from "@/services/governance/governanceTypes";

type GovernanceSnapshotApiResponse = {
	quorumRaw: string;
	quorum: string;
	totalProposals: number;
	syncedAt: string;
	proposals: Array<{
		id: string;
		proposer: string;
		description: string;
		votesFor: string;
		votesAgainst: string;
		deadline: string;
		executed: boolean;
		approved: boolean;
		action: GovernanceProposalAction;
		actionValue: string;
		hasVoted: boolean;
	}>;
};

function lerMensagemDeErro(response: Response, fallback: string) {
	return response.json()
		.then((payload) => (payload as { message?: string }).message ?? fallback)
		.catch(() => fallback);
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

function normalizarSnapshot(payload: GovernanceSnapshotApiResponse): GovernanceSnapshot {
	return {
		quorum: BigInt(payload.quorumRaw),
		totalProposals: payload.totalProposals,
		syncedAt: payload.syncedAt,
		proposals: payload.proposals.map((proposal) => ({
			id: proposal.id,
			proposer: proposal.proposer,
			description: proposal.description,
			votesFor: BigInt(proposal.votesFor),
			votesAgainst: BigInt(proposal.votesAgainst),
			deadline: proposal.deadline,
			executed: proposal.executed,
			approved: proposal.approved,
			action: proposal.action,
			actionValue: BigInt(proposal.actionValue),
			hasVoted: proposal.hasVoted,
		})),
	};
}

export async function carregarGovernanceSnapshot(address?: string | null): Promise<GovernanceSnapshot> {
	const params = new URLSearchParams();

	if (address) {
		params.set("address", address);
	}

	const response = await fetch(`/api/governance/proposals${params.size > 0 ? `?${params.toString()}` : ""}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await lerMensagemDeErro(response, "Nao foi possivel carregar a governanca."));
	}

	const payload = (await response.json()) as GovernanceSnapshotApiResponse;
	return normalizarSnapshot(payload);
}

export async function criarPropostaGovernanca(
	ethereum: EthereumProvider,
	input: {
		action: GovernanceProposalAction;
		description: string;
		value: string | number;
	},
): Promise<void> {
	const descricao = input.description.trim();

	if (!descricao) {
		throw new Error("Informe a descricao da proposta.");
	}

	const provider = new BrowserProvider(ethereum as never);
	const rede = obterRedeSelecionadaNoCliente();
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), rede);
	const valor = input.action === "min_deposit"
		? parseUnits(String(input.value).trim().replace(",", "."), 18)
		: normalizarValorInteiroPositivo(input.value, "Informe um valor valido para a proposta.");

	const functionName = input.action === "min_deposit" ? "createMinDepositProposal" : "createTokensPerEthProposal";

	await aguardarTransacao(
		await gateways.governance.writeContract({
			functionName,
			args: [descricao, valor],
		}),
	);
}

export async function votarNaPropostaGovernanca(
	ethereum: EthereumProvider,
	proposalId: bigint | number | string,
	support: boolean,
): Promise<void> {
	const provider = new BrowserProvider(ethereum as never);
	const rede = obterRedeSelecionadaNoCliente();
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), rede);

	await aguardarTransacao(
		await gateways.governance.writeContract({
			functionName: "vote",
			args: [proposalId, support],
		}),
	);
}

export async function executarPropostaGovernanca(
	ethereum: EthereumProvider,
	proposalId: bigint | number | string,
): Promise<void> {
	const provider = new BrowserProvider(ethereum as never);
	const rede = obterRedeSelecionadaNoCliente();
	const gateways = criarGatewaysRepairDAO(criarRepairDAOBrowserContractClient(provider), rede);

	await aguardarTransacao(
		await gateways.governance.writeContract({
			functionName: "executeProposal",
			args: [proposalId],
		}),
	);
}

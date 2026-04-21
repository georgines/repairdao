import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { mapearPropostaDoContrato } from "@/services/blockchain/adapters";
import { obterConfiguracaoRpcNoServidor } from "@/services/blockchain/rpcConfig.server";
import type { GovernanceSnapshot, GovernanceProposal } from "@/services/governance/governanceTypes";

function normalizarPropostas(count: number) {
	return Array.from({ length: count }, (_, index) => index + 1);
}

export async function carregarGovernanceSnapshotNoServidor(address?: string | null): Promise<GovernanceSnapshot> {
	const configuracaoRpc = await obterConfiguracaoRpcNoServidor();
	const contractClient = criarRepairDAOContractClient({ rpcUrl: configuracaoRpc.rpcUrl, rede: configuracaoRpc.rede });
	const gateways = criarGatewaysRepairDAO(contractClient, configuracaoRpc.rede);

	const [quorumRaw, totalProposalsRaw] = await Promise.all([
		gateways.governance.readContract<bigint>({ functionName: "quorum" }),
		gateways.governance.readContract<bigint>({ functionName: "totalProposals" }),
	]);

	const totalProposals = Number(totalProposalsRaw);
	const proposalIds = normalizarPropostas(totalProposals);

	const proposals: GovernanceProposal[] = [];

	for (const proposalId of proposalIds) {
		const proposalRaw = await gateways.governance.readContract<Record<string, unknown>>({
			functionName: "getProposal",
			args: [proposalId],
		});
		const proposal = mapearPropostaDoContrato({
			id: proposalRaw.id ?? proposalId,
			proposer: proposalRaw.proposer ?? null,
			descricao: String(proposalRaw.description ?? ""),
			votesFor: proposalRaw.votesFor ?? null,
			votesAgainst: proposalRaw.votesAgainst ?? null,
			deadline: proposalRaw.deadline ?? null,
			executed: proposalRaw.executed ?? null,
			approved: proposalRaw.approved ?? null,
			action: proposalRaw.action ?? null,
			actionValue: proposalRaw.actionValue ?? null,
		});

		const hasVoted = address
			? await gateways.governance.readContract<boolean>({
				functionName: "hasVoted",
				args: [proposalId, address],
			}).catch(() => false)
			: false;

		proposals.push({
			id: proposal.id,
			proposer: proposal.proposer ?? "",
			description: proposal.descricao,
			votesFor: proposal.votesFor ?? 0n,
			votesAgainst: proposal.votesAgainst ?? 0n,
			deadline: proposal.deadline ?? new Date(0).toISOString(),
			executed: proposal.executed ?? false,
			approved: proposal.approved ?? false,
			action: proposal.action ?? "min_deposit",
			actionValue: proposal.actionValue ?? 0n,
			hasVoted,
		});
	}

	return {
		quorum: quorumRaw,
		totalProposals,
		syncedAt: new Date().toISOString(),
		proposals,
	};
}

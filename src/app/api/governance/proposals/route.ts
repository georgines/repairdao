import { NextResponse } from "next/server";
import { carregarGovernanceSnapshotNoServidor } from "@/services/governance/governanceBlockchain";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const address = url.searchParams.get("address");
	const snapshot = await carregarGovernanceSnapshotNoServidor(address);

	return NextResponse.json({
		quorumRaw: snapshot.quorum.toString(),
		quorum: snapshot.quorum.toString(),
		totalProposals: snapshot.totalProposals,
		syncedAt: snapshot.syncedAt,
		proposals: snapshot.proposals.map((proposal) => ({
			id: proposal.id,
			proposer: proposal.proposer,
			description: proposal.description,
			votesFor: proposal.votesFor.toString(),
			votesAgainst: proposal.votesAgainst.toString(),
			deadline: proposal.deadline,
			executed: proposal.executed,
			approved: proposal.approved,
			action: proposal.action,
			actionValue: proposal.actionValue.toString(),
			hasVoted: proposal.hasVoted,
		})),
	});
}

export type GovernanceProposalAction = "tokens_per_eth" | "min_deposit";

export type GovernanceProposal = {
	id: string;
	proposer: string;
	description: string;
	votesFor: bigint;
	votesAgainst: bigint;
	deadline: string;
	executed: boolean;
	approved: boolean;
	action: GovernanceProposalAction;
	actionValue: bigint;
	hasVoted: boolean;
};

export type GovernanceSnapshot = {
	quorum: bigint;
	totalProposals: number;
	syncedAt: string;
	proposals: GovernanceProposal[];
};

export type GovernanceProposalFormAction = GovernanceProposalAction;

import { describe, expect, it } from "vitest";
import {
	formatGovernanceProposalActionValue,
	getGovernanceProposalActionDescription,
	getGovernanceProposalActionLabel,
	getGovernanceProposalResultLabel,
	getGovernanceProposalStatusColor,
	getGovernanceProposalShortStatusLabel,
	getGovernanceProposalStatusLabel,
} from "@/services/governance/governancePresentation";

describe("governancePresentation", () => {
	it("deriva labels e resultados das propostas", () => {
		const proposal = {
			id: "1",
			proposer: "0xabc",
			description: "Ajuste da taxa",
			votesFor: 1000n,
			votesAgainst: 100n,
			deadline: "2026-04-21T12:10:00.000Z",
			executed: false,
			approved: false,
			action: "tokens_per_eth" as const,
			actionValue: 1500n,
			hasVoted: false,
		};

		expect(getGovernanceProposalActionLabel("tokens_per_eth")).toBe("Taxa de cambio");
		expect(getGovernanceProposalActionLabel("min_deposit")).toBe("Deposito minimo");
		expect(getGovernanceProposalActionDescription("tokens_per_eth")).toContain("taxa de cambio");
		expect(formatGovernanceProposalActionValue("tokens_per_eth", 1500n)).toBe("1500 RPT por ETH");
		expect(getGovernanceProposalStatusLabel(proposal, 1000n, new Date("2026-04-21T12:00:00.000Z"))).toBe("Em votacao");
		expect(getGovernanceProposalStatusColor(proposal, 1000n, new Date("2026-04-21T12:00:00.000Z"))).toBe("yellow");
		expect(getGovernanceProposalShortStatusLabel(proposal, 1000n, new Date("2026-04-21T12:00:00.000Z"))).toBe("Aberta");
		expect(getGovernanceProposalResultLabel(proposal, 1000n, new Date("2026-04-21T12:11:00.000Z"))).toBe("Aprovada");
	});
});

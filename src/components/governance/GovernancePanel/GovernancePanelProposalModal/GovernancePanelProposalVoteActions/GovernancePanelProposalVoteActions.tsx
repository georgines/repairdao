import type { GovernancePanelProposalVoteActionsViewProps } from "./GovernancePanelProposalVoteActionsView";
import { GovernancePanelProposalVoteActionsView } from "./GovernancePanelProposalVoteActionsView";

export type GovernancePanelProposalVoteActionsProps = GovernancePanelProposalVoteActionsViewProps;

export function GovernancePanelProposalVoteActions(props: GovernancePanelProposalVoteActionsProps) {
	return <GovernancePanelProposalVoteActionsView {...props} />;
}

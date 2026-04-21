import type { GovernancePanelProposalModalViewProps } from "./GovernancePanelProposalModalView";
import { GovernancePanelProposalModalView } from "./GovernancePanelProposalModalView";

export type GovernancePanelProposalModalProps = GovernancePanelProposalModalViewProps;

export function GovernancePanelProposalModal(props: GovernancePanelProposalModalProps) {
	return <GovernancePanelProposalModalView {...props} />;
}

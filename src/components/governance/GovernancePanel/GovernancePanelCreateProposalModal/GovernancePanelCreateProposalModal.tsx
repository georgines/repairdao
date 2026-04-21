import type { GovernancePanelCreateProposalModalViewProps } from "./GovernancePanelCreateProposalModalView";
import { GovernancePanelCreateProposalModalView } from "./GovernancePanelCreateProposalModalView";

export type GovernancePanelCreateProposalModalProps = GovernancePanelCreateProposalModalViewProps;

export function GovernancePanelCreateProposalModal(props: GovernancePanelCreateProposalModalProps) {
	return <GovernancePanelCreateProposalModalView {...props} />;
}

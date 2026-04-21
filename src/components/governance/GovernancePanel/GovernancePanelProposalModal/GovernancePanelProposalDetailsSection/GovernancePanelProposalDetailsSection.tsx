import type { GovernancePanelProposalDetailsSectionViewProps } from "./GovernancePanelProposalDetailsSectionView";
import { GovernancePanelProposalDetailsSectionView } from "./GovernancePanelProposalDetailsSectionView";

export type GovernancePanelProposalDetailsSectionProps = GovernancePanelProposalDetailsSectionViewProps;

export function GovernancePanelProposalDetailsSection(props: GovernancePanelProposalDetailsSectionProps) {
	return <GovernancePanelProposalDetailsSectionView {...props} />;
}

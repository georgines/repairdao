import { GovernancePanelProposalListSectionView } from "./GovernancePanelProposalListSectionView";

export type GovernancePanelProposalListSectionProps = Parameters<typeof GovernancePanelProposalListSectionView>[0];

export function GovernancePanelProposalListSection(props: GovernancePanelProposalListSectionProps) {
	return <GovernancePanelProposalListSectionView {...props} />;
}

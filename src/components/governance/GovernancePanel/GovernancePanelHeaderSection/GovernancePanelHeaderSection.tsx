import type { GovernancePanelHeaderSectionViewProps } from "./GovernancePanelHeaderSectionView";
import { GovernancePanelHeaderSectionView } from "./GovernancePanelHeaderSectionView";

export type GovernancePanelHeaderSectionProps = GovernancePanelHeaderSectionViewProps;

export function GovernancePanelHeaderSection(props: GovernancePanelHeaderSectionProps) {
	return <GovernancePanelHeaderSectionView {...props} />;
}

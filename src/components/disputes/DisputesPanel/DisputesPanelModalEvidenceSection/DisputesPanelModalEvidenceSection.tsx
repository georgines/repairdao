"use client";

import type { EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelModalEvidenceSectionView } from "@/components/disputes/DisputesPanel/DisputesPanelModalEvidenceSection/DisputesPanelModalEvidenceSectionView";

type DisputesPanelModalEvidenceSectionProps = {
	dispute: DisputeItem;
	selectedEvidence: EvidenciaContratoDominio[];
};

export function DisputesPanelModalEvidenceSection(props: DisputesPanelModalEvidenceSectionProps) {
	return <DisputesPanelModalEvidenceSectionView {...props} />;
}

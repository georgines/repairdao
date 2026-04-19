"use client";

import { EligibilityPanelStatusSectionView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelStatusSection/EligibilityPanelStatusSectionView";

type EligibilityPanelStatusSectionProps = {
	badgeLevel: string;
	isActive: boolean;
	perfilExibido: "cliente" | "tecnico";
};

export function EligibilityPanelStatusSection(props: EligibilityPanelStatusSectionProps) {
	return <EligibilityPanelStatusSectionView {...props} />;
}

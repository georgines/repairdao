"use client";

import { EligibilityPanelIdentitySectionView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelIdentitySection/EligibilityPanelIdentitySectionView";

type EligibilityPanelIdentitySectionProps = {
	nome: string;
	areaAtuacao: string;
	identificadorCarteira: string;
	depositing: boolean;
	exibirAreaAtuacao: boolean;
	onNomeChange: (value: string) => void;
	onAreaAtuacaoChange: (value: string) => void;
};

export function EligibilityPanelIdentitySection(props: EligibilityPanelIdentitySectionProps) {
	return <EligibilityPanelIdentitySectionView {...props} />;
}

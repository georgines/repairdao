"use client";

import { EligibilityPanelDepositSectionView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelDepositSection/EligibilityPanelDepositSectionView";

type EligibilityPanelDepositSectionProps = {
	quantidadeRpt: string | number | null;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	error: string | null;
	onQuantidadeChange: (value: string | number) => void;
	onDeposit: () => void;
	podeDepositar: boolean;
	mostrarBotaoAcao: boolean;
	depositing: boolean;
};

export function EligibilityPanelDepositSection(props: EligibilityPanelDepositSectionProps) {
	return <EligibilityPanelDepositSectionView {...props} />;
}

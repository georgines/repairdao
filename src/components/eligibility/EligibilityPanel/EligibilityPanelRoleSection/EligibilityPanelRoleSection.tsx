"use client";

import { EligibilityPanelRoleSectionView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelRoleSection/EligibilityPanelRoleSectionView";

type EligibilityPanelRoleSectionProps = {
	mostrarSeletoresPapel: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	onPerfilChange: (value: "cliente" | "tecnico") => void;
};

export function EligibilityPanelRoleSection(props: EligibilityPanelRoleSectionProps) {
	return <EligibilityPanelRoleSectionView {...props} />;
}

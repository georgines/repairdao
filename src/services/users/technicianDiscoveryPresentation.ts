import type { UserRole, UserSummary } from "@/services/users";

export function getTechnicianDiscoveryPanelSelectedLabel(selectedTechnician: UserSummary | null) {
	if (!selectedTechnician) {
		return "nenhum selecionado";
	}

	return `selecionado: ${selectedTechnician.name}`;
}

export function getTechnicianDiscoveryPanelContractedLabel(
	contractedTechnician: UserSummary | null,
	hasOpenOrder: boolean,
) {
	if (!contractedTechnician) {
		return null;
	}

	if (hasOpenOrder) {
		return `ordem aberta: ${contractedTechnician.name}`;
	}

	return `contratado: ${contractedTechnician.name}`;
}

export function getTechnicianDiscoveryPanelResultsNotice(hasResults: boolean) {
	if (hasResults) {
		return "Use a lista para comparar tecnicos.";
	}

	return "Nenhum tecnico encontrou este criterio.";
}

export function getTechnicianDiscoveryPanelModalTitle(mode: "details" | "hire" | null) {
	if (mode === "hire") {
		return "Confirmar contratacao";
	}

	return "Detalhes do tecnico";
}

export function getTechnicianSituationLabel(technician: UserSummary) {
	if (!technician.isActive) {
		return "inativo";
	}

	if (!technician.isEligible) {
		return "fora da busca";
	}

	return "elegivel";
}

export function getTechnicianRoleLabel(role: UserRole) {
	if (role === "tecnico") {
		return "Tecnico";
	}

	return "Cliente";
}

export function formatTechnicianDetail(value: string | number | boolean | null) {
	if (typeof value === "boolean") {
		if (value) {
			return "sim";
		}

		return "nao";
	}

	return value ?? "-";
}

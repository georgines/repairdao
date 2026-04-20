import { describe, expect, it } from "vitest";
import { getTechnicianDiscoveryPanelContractedLabel, getTechnicianDiscoveryPanelModalTitle, getTechnicianDiscoveryPanelResultsNotice, getTechnicianDiscoveryPanelSelectedLabel, getTechnicianRoleLabel, getTechnicianSituationLabel, formatTechnicianDetail } from "@/services/users/technicianDiscoveryPresentation";

describe("technicianDiscoveryPresentation", () => {
	it("deriva os textos do resumo da descoberta", () => {
		expect(getTechnicianDiscoveryPanelSelectedLabel(null)).toBe("nenhum selecionado");
		expect(getTechnicianDiscoveryPanelSelectedLabel({ name: "Ana", address: "0x1" } as never)).toBe("selecionado: Ana");
		expect(getTechnicianDiscoveryPanelContractedLabel(null, false)).toBeNull();
		expect(getTechnicianDiscoveryPanelContractedLabel({ name: "Ana", address: "0x1" } as never, true)).toBe("ordem aberta: Ana");
		expect(getTechnicianDiscoveryPanelContractedLabel({ name: "Ana", address: "0x1" } as never, false)).toBe("contratado: Ana");
		expect(getTechnicianDiscoveryPanelResultsNotice(true)).toBe("Use a lista para comparar tecnicos.");
		expect(getTechnicianDiscoveryPanelResultsNotice(false)).toBe("Nenhum tecnico encontrou este criterio.");
		expect(getTechnicianDiscoveryPanelModalTitle("hire")).toBe("Confirmar contratacao");
		expect(getTechnicianDiscoveryPanelModalTitle("details")).toBe("Detalhes do tecnico");
	});

	it("deriva os textos do tecnico", () => {
		expect(getTechnicianRoleLabel("tecnico")).toBe("Tecnico");
		expect(getTechnicianRoleLabel("cliente")).toBe("Cliente");
		expect(getTechnicianSituationLabel({ isActive: false, isEligible: true } as never)).toBe("inativo");
		expect(getTechnicianSituationLabel({ isActive: true, isEligible: false } as never)).toBe("fora da busca");
		expect(getTechnicianSituationLabel({ isActive: true, isEligible: true } as never)).toBe("elegivel");
		expect(formatTechnicianDetail(true)).toBe("sim");
		expect(formatTechnicianDetail(false)).toBe("nao");
		expect(formatTechnicianDetail(null)).toBe("-");
		expect(formatTechnicianDetail("Rede")).toBe("Rede");
	});
});


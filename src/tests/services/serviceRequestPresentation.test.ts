import { describe, expect, it } from "vitest";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import {
	formatServiceRequestBudget,
	formatServiceRequestStatus,
	getServiceRequestDisputeAction,
	getServiceRequestModalActionNotice,
	getServiceRequestModalHelperText,
	getServiceRequestModalSubmitLabel,
	getServiceRequestModalTitle,
	getServiceRequestPrincipalAction,
	getServiceRequestStatusColor,
	getServiceRequestsPanelEmptyStateMessage,
	shortServiceRequestAddress,
} from "@/services/serviceRequests/serviceRequestPresentation";

const concludedRequest: ServiceRequestSummary = {
	id: 3,
	clientAddress: "0xcliente",
	clientName: "Cliente 1",
	technicianAddress: "0xtec",
	technicianName: "Tecnico 1",
	description: "Instalacao de luminaria",
	status: "concluida",
	budgetAmount: 240,
	acceptedAt: "2026-04-17T10:00:00.000Z",
	budgetSentAt: "2026-04-17T11:00:00.000Z",
	clientAcceptedAt: "2026-04-17T12:00:00.000Z",
	completedAt: "2026-04-17T13:00:00.000Z",
	createdAt: "2026-04-17T09:00:00.000Z",
	updatedAt: "2026-04-17T13:00:00.000Z",
};

describe("serviceRequestPresentation", () => {
	it("deriva status, cores e valores", () => {
		expect(formatServiceRequestStatus("orcada")).toBe("Aguardando pagamento");
		expect(getServiceRequestStatusColor("disputada")).toBe("red");
		expect(formatServiceRequestBudget(null)).toBe("-");
		expect(formatServiceRequestBudget(240)).toBeDefined();
		expect(shortServiceRequestAddress("0x1234567890abcdef")).toBe("0x1234...cdef");
	});

	it("deriva os textos e acoes do modal", () => {
		expect(getServiceRequestModalTitle("budget")).toBe("Definir valor do servico");
		expect(getServiceRequestModalHelperText("dispute")).toBe("Explique o motivo e abra a disputa contra a outra parte.");
		expect(getServiceRequestModalActionNotice("confirm", "concluida", "2026-04-17T14:00:00.000Z")).toBe("A entrega ja foi confirmada.");
		expect(getServiceRequestModalSubmitLabel("rate")).toBe("Avaliar");
	});

	it("deriva as acoes principais e de disputa", () => {
		expect(getServiceRequestPrincipalAction(concludedRequest, "cliente", "0xcliente")).toEqual({ label: "Confirmar entrega", action: "confirm" });
		expect(getServiceRequestDisputeAction(concludedRequest, "cliente", "0xcliente")).toEqual({ label: "Disputar", action: "dispute" });
		expect(getServiceRequestsPanelEmptyStateMessage(false, false)).toBe("Conecte a carteira para ver suas ordens de servico.");
		expect(getServiceRequestsPanelEmptyStateMessage(true, false)).toBe("Nenhuma ordem foi encontrada para esta carteira.");
	});
});

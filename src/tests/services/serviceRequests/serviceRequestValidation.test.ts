import { describe, expect, it } from "vitest";
import { RepairDAODominioError } from "@/erros/errors";
import {
	validateServiceRequestAddress,
	validateServiceRequestDisputeReason,
	validateServiceRequestBudget,
	validateServiceRequestDescription,
	validateServiceRequestIdentifier,
	validateServiceRequestName,
} from "@/services/serviceRequests/serviceRequestValidation";

describe("serviceRequestValidation", () => {
	it("normaliza os campos textuais", () => {
		expect(validateServiceRequestAddress(" 0xABC ", "cliente")).toBe("0xabc");
		expect(validateServiceRequestName(" Ana ", "cliente")).toBe("Ana");
		expect(validateServiceRequestDescription(" Servico urgente ")).toBe("Servico urgente");
		expect(validateServiceRequestDisputeReason(" Motivo valido ")).toBe("Motivo valido");
	});

	it("normaliza o orcamento e o identificador", () => {
		expect(validateServiceRequestBudget(249.9)).toBe(249);
		expect(validateServiceRequestIdentifier(12.4)).toBe(12);
	});

	it("rejeita orcamento e identificador invalidos", () => {
		expect(() => validateServiceRequestBudget(0)).toThrow(RepairDAODominioError);
		expect(() => validateServiceRequestBudget(Number.NaN)).toThrow(RepairDAODominioError);
		expect(() => validateServiceRequestIdentifier(0)).toThrow(RepairDAODominioError);
		expect(() => validateServiceRequestIdentifier(Number.NaN)).toThrow(RepairDAODominioError);
	});
});

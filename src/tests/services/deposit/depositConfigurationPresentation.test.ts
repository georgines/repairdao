import { describe, expect, it } from "vitest";
import { getDepositConfigurationFooterNotice, getDepositConfigurationStatusColor, getDepositConfigurationStatusLabel, getDepositConfigurationWalletNotice } from "@/services/deposit/depositConfigurationPresentation";

describe("depositConfigurationPresentation", () => {
	it("deriva os textos base", () => {
		expect(getDepositConfigurationStatusLabel(true, false)).toBe("Dono autenticado");
		expect(getDepositConfigurationStatusLabel(false, true)).toBe("Acesso a propostas");
		expect(getDepositConfigurationStatusLabel(false, false)).toBe("Apenas leitura");
		expect(getDepositConfigurationStatusColor(true, false)).toBe("teal");
		expect(getDepositConfigurationStatusColor(false, true)).toBe("teal");
		expect(getDepositConfigurationStatusColor(false, false)).toBe("gray");
		expect(getDepositConfigurationWalletNotice("0xowner")).toBe("0xowner");
		expect(getDepositConfigurationWalletNotice(null)).toBe("Carteira desconectada");
		expect(getDepositConfigurationFooterNotice(true)).toBe("A mudanca sera enviada como proposta de governanca.");
		expect(getDepositConfigurationFooterNotice(false)).toBe("Conecte a carteira para criar propostas.");
	});
});

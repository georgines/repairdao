import { describe, expect, it } from "vitest";
import { getDepositConfigurationFooterNotice, getDepositConfigurationStatusColor, getDepositConfigurationStatusLabel, getDepositConfigurationWalletNotice } from "@/services/deposit/depositConfigurationPresentation";

describe("depositConfigurationPresentation", () => {
	it("deriva os textos base", () => {
		expect(getDepositConfigurationStatusLabel(true)).toBe("Dono autenticado");
		expect(getDepositConfigurationStatusLabel(false)).toBe("Apenas leitura");
		expect(getDepositConfigurationStatusColor(true)).toBe("teal");
		expect(getDepositConfigurationStatusColor(false)).toBe("gray");
		expect(getDepositConfigurationWalletNotice("0xowner")).toBe("0xowner");
		expect(getDepositConfigurationWalletNotice(null)).toBe("Carteira desconectada");
		expect(getDepositConfigurationFooterNotice(true)).toBe("Alteracao sera enviada ao contrato e espelhada no banco.");
		expect(getDepositConfigurationFooterNotice(false)).toBe("Conecte a carteira para alterar.");
	});
});
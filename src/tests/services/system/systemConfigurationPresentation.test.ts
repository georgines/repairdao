import { describe, expect, it } from "vitest";
import {
	getSystemConfigurationDisconnectedNotice,
	getSystemConfigurationRestrictedNotice,
	getSystemConfigurationStatusColor,
	getSystemConfigurationStatusLabel,
	getSystemConfigurationWalletNotice,
} from "@/services/system/systemConfigurationPresentation";

describe("systemConfigurationPresentation", () => {
	it("resolve o status completo quando a carteira possui os dois acessos", () => {
		expect(getSystemConfigurationStatusLabel(true, true)).toBe("Dono autenticado");
		expect(getSystemConfigurationStatusColor(true, true)).toBe("teal");
	});

	it("resolve o status parcial quando a carteira possui apenas um acesso", () => {
		expect(getSystemConfigurationStatusLabel(true, false)).toBe("Acesso parcial");
		expect(getSystemConfigurationStatusLabel(false, true)).toBe("Acesso parcial");
		expect(getSystemConfigurationStatusColor(true, false)).toBe("teal");
	});

	it("resolve o status de leitura quando a carteira nao e dona de nenhum contrato", () => {
		expect(getSystemConfigurationStatusLabel(false, false)).toBe("Apenas leitura");
		expect(getSystemConfigurationStatusColor(false, false)).toBe("gray");
	});

	it("retorna o notice da carteira conectada", () => {
		expect(getSystemConfigurationWalletNotice("0xabc")).toBe("0xabc");
		expect(getSystemConfigurationWalletNotice(null)).toBe("Carteira desconectada");
	});

	it("expõe os textos dos notices de acesso", () => {
		expect(getSystemConfigurationDisconnectedNotice()).toEqual({
			heading: "Configuracoes do sistema",
			title: "Carteira desconectada",
			message: "Conecte a carteira autorizada para visualizar esta tela.",
			color: "yellow",
		});

		expect(getSystemConfigurationRestrictedNotice()).toEqual({
			heading: null,
			title: "Acesso restrito",
			message: "A carteira conectada nao e dona de nenhuma configuracao do sistema.",
			color: "gray",
		});
	});
});

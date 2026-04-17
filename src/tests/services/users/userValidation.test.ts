import { describe, expect, it } from "vitest";
import { RepairDAODominioError } from "@/erros/errors";
import {
	validateUserActivationForm,
	validateUserProfileInput,
	validateUserWithdrawalInput,
} from "@/services/users/userValidation";

describe("userValidation", () => {
	it("normaliza o perfil de tecnico", () => {
		expect(
			validateUserProfileInput({
				address: " 0xABC ",
				name: " Ana ",
				expertiseArea: " Eletrica ",
				role: "tecnico",
				badgeLevel: " bronze ",
				reputation: 12.9,
				depositLevel: 2.4,
				isActive: true,
				isEligible: true,
			}),
		).toEqual({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 12,
			depositLevel: 2,
			isActive: true,
			isEligible: true,
		});
	});

	it("normaliza o perfil de cliente sem area de atuacao", () => {
		expect(
			validateUserProfileInput({
				address: " 0xABC ",
				name: " Ana ",
				role: "cliente",
				badgeLevel: " bronze ",
				reputation: 9.8,
				depositLevel: 1.7,
				isActive: false,
				isEligible: false,
			}),
		).toEqual({
			address: "0xabc",
			name: "Ana",
			expertiseArea: null,
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 9,
			depositLevel: 1,
			isActive: false,
			isEligible: false,
		});
	});

	it("rejeita tecnico sem area de atuacao", () => {
		expect(() =>
			validateUserProfileInput({
				address: "0xabc",
				name: "Ana",
				role: "tecnico",
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 0,
				isActive: false,
				isEligible: false,
			}),
		).toThrow("O campo area de atuacao nao pode ser vazio.");
	});

	it("rejeita papel invalido", () => {
		expect(() =>
			validateUserProfileInput({
				address: "0xabc",
				name: "Ana",
				role: "cliente" as "cliente" | "tecnico",
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 0,
				isActive: false,
				isEligible: false,
			}),
		).not.toThrow();

		expect(() =>
			validateUserProfileInput({
				address: "0xabc",
				name: "Ana",
				role: "admin" as never,
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 0,
				isActive: false,
				isEligible: false,
			}),
		).toThrow(RepairDAODominioError);
	});

	it("normaliza o formulario de ativacao para tecnico e cliente", () => {
		expect(validateUserActivationForm(" Ana ", " Eletrica ", "tecnico")).toEqual({
			name: "Ana",
			expertiseArea: "Eletrica",
		});
		expect(validateUserActivationForm(" Ana ", " Eletrica ", "cliente")).toEqual({
			name: "Ana",
			expertiseArea: null,
		});
	});

	it("normaliza o endereco de retirada", () => {
		expect(validateUserWithdrawalInput(" 0xABC ")).toBe("0xabc");
	});
});

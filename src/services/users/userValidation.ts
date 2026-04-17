import { RepairDAODominioError } from "@/erros/errors";
import { garantirTextoNaoVazio } from "@/services/validacoes";
import type { UserActivationPayload, UserRole } from "@/services/users/userTypes";

function normalizeAddress(address: string) {
	return address.trim().toLowerCase();
}

function normalizeText(value: string) {
	return value.trim();
}

export function validateUserProfileInput(input: UserActivationPayload) {
	const address = garantirTextoNaoVazio(input.address, "identificador da conta");
	const name = garantirTextoNaoVazio(input.name, "nome");
	const expertiseArea =
		input.role === "tecnico"
			? garantirTextoNaoVazio(input.expertiseArea ?? "", "area de atuacao")
			: null;

	if (!["cliente", "tecnico"].includes(input.role)) {
		throw new RepairDAODominioError("papel_invalido", "O papel do usuario e invalido.", {
			role: input.role,
		});
	}

	return {
		address: normalizeAddress(address),
		name: normalizeText(name),
		expertiseArea: expertiseArea ? normalizeText(expertiseArea) : null,
		role: input.role as UserRole,
		badgeLevel: normalizeText(input.badgeLevel),
		reputation: Math.trunc(input.reputation),
		depositLevel: Math.trunc(input.depositLevel),
		isActive: input.isActive,
		isEligible: input.isEligible,
	};
}

export function validateUserActivationForm(name: string, expertiseArea: string, role: UserRole) {
	const normalizedName = garantirTextoNaoVazio(name, "nome");
	const normalizedExpertiseArea =
		role === "tecnico"
			? garantirTextoNaoVazio(expertiseArea, "area de atuacao")
			: null;

	return {
		name: normalizedName,
		expertiseArea: normalizedExpertiseArea,
	};
}

export function validateUserWithdrawalInput(address: string) {
	return normalizeAddress(garantirTextoNaoVazio(address, "identificador da conta"));
}

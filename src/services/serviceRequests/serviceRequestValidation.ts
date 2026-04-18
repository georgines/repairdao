import { RepairDAODominioError } from "@/erros/errors";
import { garantirTextoNaoVazio } from "@/services/validacoes";

export function validateServiceRequestAddress(value: string, fieldLabel: string) {
	return garantirTextoNaoVazio(value, fieldLabel).trim().toLowerCase();
}

export function validateServiceRequestName(value: string, fieldLabel: string) {
	return garantirTextoNaoVazio(value, fieldLabel).trim();
}

export function validateServiceRequestDescription(value: string) {
	return garantirTextoNaoVazio(value, "descricao do servico").trim();
}

export function validateServiceRequestDisputeReason(value: string) {
	return garantirTextoNaoVazio(value, "motivo da disputa").trim();
}

export function validateServiceRequestBudget(value: number) {
	const amount = Math.trunc(value);

	if (!Number.isFinite(amount) || amount <= 0) {
		throw new RepairDAODominioError("orcamento_invalido", "O valor do orcamento precisa ser maior que zero.");
	}

	return amount;
}

export function validateServiceRequestIdentifier(value: number) {
	const identifier = Math.trunc(value);

	if (!Number.isFinite(identifier) || identifier <= 0) {
		throw new RepairDAODominioError("identificador_invalido", "O identificador da ordem de servico e invalido.");
	}

	return identifier;
}

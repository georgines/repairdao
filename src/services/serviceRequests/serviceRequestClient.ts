import type {
	ServiceRequestClientAcceptanceInput,
	ServiceRequestAcceptInput,
	ServiceRequestCompletionInput,
	ServiceRequestBudgetInput,
	ServiceRequestCreateInput,
	ServiceRequestFilters,
	ServiceRequestSummary,
} from "@/services/serviceRequests/serviceRequestTypes";

type ApiErrorPayload = {
	message?: string;
};

async function readErrorMessage(response: Response, fallback: string) {
	try {
		const payload = (await response.json()) as ApiErrorPayload;
		return payload.message ?? fallback;
	} catch {
		return fallback;
	}
}

function buildQuery(filters: ServiceRequestFilters) {
	const params = new URLSearchParams();

	if (filters.clientAddress) {
		params.set("clientAddress", filters.clientAddress);
	}

	if (filters.technicianAddress) {
		params.set("technicianAddress", filters.technicianAddress);
	}

	return params.toString();
}

export async function loadServiceRequests(filters: ServiceRequestFilters = {}): Promise<ServiceRequestSummary[]> {
	const query = buildQuery(filters);
	const response = await fetch(`/api/service-requests${query ? `?${query}` : ""}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel carregar as ordens de servico."));
	}

	return (await response.json()) as ServiceRequestSummary[];
}

export async function createServiceRequest(payload: ServiceRequestCreateInput): Promise<ServiceRequestSummary> {
	const response = await fetch("/api/service-requests", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel criar a ordem de servico."));
	}

	return (await response.json()) as ServiceRequestSummary;
}

export async function acceptServiceRequest(payload: ServiceRequestAcceptInput): Promise<ServiceRequestSummary> {
	const response = await fetch("/api/service-requests", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ action: "accept", ...payload }),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel aceitar a ordem de servico."));
	}

	return (await response.json()) as ServiceRequestSummary;
}

export async function sendServiceBudget(payload: ServiceRequestBudgetInput): Promise<ServiceRequestSummary> {
	const response = await fetch("/api/service-requests", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ action: "budget", ...payload }),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel enviar o orcamento."));
	}

	return (await response.json()) as ServiceRequestSummary;
}

export async function acceptServiceBudget(payload: ServiceRequestClientAcceptanceInput): Promise<ServiceRequestSummary> {
	const response = await fetch("/api/service-requests", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ action: "accept_budget", ...payload }),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel aceitar o orcamento."));
	}

	return (await response.json()) as ServiceRequestSummary;
}

export async function completeServiceRequest(payload: ServiceRequestCompletionInput): Promise<ServiceRequestSummary> {
	const response = await fetch("/api/service-requests", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ action: "complete", ...payload }),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel concluir a ordem de servico."));
	}

	return (await response.json()) as ServiceRequestSummary;
}

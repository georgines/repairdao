export type ServiceRequestStatus = "aberta" | "aceita" | "orcada" | "aceito_cliente" | "concluida";

export type ServiceRequestSummary = {
	id: number;
	clientAddress: string;
	clientName: string;
	technicianAddress: string;
	technicianName: string;
	description: string;
	status: ServiceRequestStatus;
	budgetAmount: number | null;
	acceptedAt: string | null;
	budgetSentAt: string | null;
	clientAcceptedAt: string | null;
	completedAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ServiceRequestCreateInput = {
	clientAddress: string;
	clientName: string;
	technicianAddress: string;
	technicianName: string;
	description: string;
};

export type ServiceRequestAcceptInput = {
	id: number;
	technicianAddress: string;
};

export type ServiceRequestBudgetInput = {
	id: number;
	technicianAddress: string;
	budgetAmount: number;
};

export type ServiceRequestClientAcceptanceInput = {
	id: number;
	clientAddress: string;
};

export type ServiceRequestCompletionInput = {
	id: number;
	technicianAddress: string;
};

export type ServiceRequestFilters = {
	clientAddress?: string;
	technicianAddress?: string;
};

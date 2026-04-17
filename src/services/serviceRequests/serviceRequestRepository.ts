import { prisma } from "@/lib/prisma";
import { RepairDAODominioError } from "@/erros/errors";
import type {
	ServiceRequestClientAcceptanceInput,
	ServiceRequestAcceptInput,
	ServiceRequestBudgetInput,
	ServiceRequestCreateInput,
	ServiceRequestFilters,
	ServiceRequestSummary,
	ServiceRequestStatus,
} from "@/services/serviceRequests/serviceRequestTypes";
import {
	validateServiceRequestAddress,
	validateServiceRequestBudget,
	validateServiceRequestDescription,
	validateServiceRequestIdentifier,
	validateServiceRequestName,
} from "@/services/serviceRequests/serviceRequestValidation";

type PrismaStatus = "ABERTA" | "ACEITA" | "ORCADA" | "ACEITO_CLIENTE";

function toPrismaStatus(status: ServiceRequestStatus): PrismaStatus {
	return status === "aceita"
		? "ACEITA"
		: status === "orcada"
			? "ORCADA"
			: status === "aceito_cliente"
				? "ACEITO_CLIENTE"
				: "ABERTA";
}

function toDomainStatus(status: PrismaStatus): ServiceRequestStatus {
	return status === "ACEITA"
		? "aceita"
		: status === "ORCADA"
			? "orcada"
			: status === "ACEITO_CLIENTE"
				? "aceito_cliente"
				: "aberta";
}

function toSummary(record: {
	id: number;
	clientAddress: string;
	clientName: string;
	technicianAddress: string;
	technicianName: string;
	description: string;
	status: PrismaStatus;
	budgetAmount: number | null;
	acceptedAt: Date | null;
	budgetSentAt: Date | null;
	clientAcceptedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}): ServiceRequestSummary {
	return {
		id: record.id,
		clientAddress: record.clientAddress,
		clientName: record.clientName,
		technicianAddress: record.technicianAddress,
		technicianName: record.technicianName,
		description: record.description,
		status: toDomainStatus(record.status),
		budgetAmount: record.budgetAmount,
		acceptedAt: record.acceptedAt ? record.acceptedAt.toISOString() : null,
		budgetSentAt: record.budgetSentAt ? record.budgetSentAt.toISOString() : null,
		clientAcceptedAt: record.clientAcceptedAt ? record.clientAcceptedAt.toISOString() : null,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

async function findServiceRequest(id: number) {
	return prisma.serviceRequest.findUnique({ where: { id: validateServiceRequestIdentifier(id) } });
}

export async function createServiceRequest(input: ServiceRequestCreateInput): Promise<ServiceRequestSummary> {
	const clientAddress = validateServiceRequestAddress(input.clientAddress, "identificador do cliente");
	const clientName = validateServiceRequestName(input.clientName, "nome do cliente");
	const technicianAddress = validateServiceRequestAddress(input.technicianAddress, "identificador do tecnico");
	const technicianName = validateServiceRequestName(input.technicianName, "nome do tecnico");
	const description = validateServiceRequestDescription(input.description);

	const record = await prisma.serviceRequest.create({
		data: {
			clientAddress,
			clientName,
			technicianAddress,
			technicianName,
			description,
		},
	});

	return toSummary({
		...record,
		status: record.status as PrismaStatus,
	});
}

export async function listServiceRequests(filters: ServiceRequestFilters = {}): Promise<ServiceRequestSummary[]> {
	const records = await prisma.serviceRequest.findMany({
		where: {
			clientAddress: filters.clientAddress ? validateServiceRequestAddress(filters.clientAddress, "identificador do cliente") : undefined,
			technicianAddress: filters.technicianAddress ? validateServiceRequestAddress(filters.technicianAddress, "identificador do tecnico") : undefined,
		},
		orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
	});

	return records.map((record) =>
		toSummary({
			...record,
			status: record.status as PrismaStatus,
		}),
	);
}

export async function acceptServiceRequest(input: ServiceRequestAcceptInput): Promise<ServiceRequestSummary> {
	const id = validateServiceRequestIdentifier(input.id);
	const technicianAddress = validateServiceRequestAddress(input.technicianAddress, "identificador do tecnico");
	const record = await findServiceRequest(id);

	if (!record) {
		throw new RepairDAODominioError("ordem_nao_encontrada", "A ordem de servico nao foi encontrada.");
	}

	if (record.technicianAddress !== technicianAddress) {
		throw new RepairDAODominioError("tecnico_invalido", "A ordem de servico nao pertence a este tecnico.");
	}

	const updated = await prisma.serviceRequest.update({
		where: { id },
		data: {
			status: toPrismaStatus("aceita"),
			acceptedAt: new Date(),
		},
	});

	return toSummary({
		...updated,
		status: updated.status as PrismaStatus,
	});
}

export async function sendServiceBudget(input: ServiceRequestBudgetInput): Promise<ServiceRequestSummary> {
	const id = validateServiceRequestIdentifier(input.id);
	const technicianAddress = validateServiceRequestAddress(input.technicianAddress, "identificador do tecnico");
	const budgetAmount = validateServiceRequestBudget(input.budgetAmount);
	const record = await findServiceRequest(id);

	if (!record) {
		throw new RepairDAODominioError("ordem_nao_encontrada", "A ordem de servico nao foi encontrada.");
	}

	if (record.technicianAddress !== technicianAddress) {
		throw new RepairDAODominioError("tecnico_invalido", "A ordem de servico nao pertence a este tecnico.");
	}

	const updated = await prisma.serviceRequest.update({
		where: { id },
		data: {
			status: toPrismaStatus("orcada"),
			budgetAmount,
			budgetSentAt: new Date(),
		},
	});

	return toSummary({
		...updated,
		status: updated.status as PrismaStatus,
	});
}

export async function acceptServiceBudget(input: ServiceRequestClientAcceptanceInput): Promise<ServiceRequestSummary> {
	const id = validateServiceRequestIdentifier(input.id);
	const clientAddress = validateServiceRequestAddress(input.clientAddress, "identificador do cliente");
	const record = await findServiceRequest(id);

	if (!record) {
		throw new RepairDAODominioError("ordem_nao_encontrada", "A ordem de servico nao foi encontrada.");
	}

	if (record.clientAddress !== clientAddress) {
		throw new RepairDAODominioError("cliente_invalido", "A ordem de servico nao pertence a este cliente.");
	}

	if (record.status !== "ORCADA") {
		throw new RepairDAODominioError("orcamento_indisponivel", "A ordem precisa ter um orcamento enviado antes da aceitacao.");
	}

	const updated = await prisma.serviceRequest.update({
		where: { id },
		data: {
			status: "ACEITO_CLIENTE",
			clientAcceptedAt: new Date(),
		},
	});

	return toSummary({
		...updated,
		status: updated.status as PrismaStatus,
	});
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { RepairDAODominioError } from "@/erros/errors";

const prismaMocks = vi.hoisted(() => ({
	serviceRequest: {
		create: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMocks,
}));

import {
	acceptServiceRequest,
	acceptServiceBudget,
	createServiceRequest,
	listServiceRequests,
	sendServiceBudget,
} from "@/services/serviceRequests/serviceRequestRepository";

describe("serviceRequestRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("cria uma ordem de servico normalizada", async () => {
		prismaMocks.serviceRequest.create.mockResolvedValue({
			id: 1,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ABERTA",
			budgetAmount: null,
			acceptedAt: null,
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
		});

		await expect(
			createServiceRequest({
				clientAddress: " 0xCLIENTE ",
				clientName: " Cliente ",
				technicianAddress: " 0xTEC ",
				technicianName: " Tecnico ",
				description: " Servico ",
			}),
		).resolves.toEqual({
			id: 1,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "aberta",
			budgetAmount: null,
			acceptedAt: null,
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: "2026-04-17T10:00:00.000Z",
			updatedAt: "2026-04-17T10:00:00.000Z",
		});
	});

	it("lista ordens filtradas", async () => {
		prismaMocks.serviceRequest.findMany.mockResolvedValue([
			{
				id: 1,
				clientAddress: "0xcliente",
				clientName: "Cliente",
				technicianAddress: "0xtec",
				technicianName: "Tecnico",
				description: "Servico",
				status: "ABERTA",
				budgetAmount: null,
				acceptedAt: null,
				budgetSentAt: null,
				clientAcceptedAt: null,
				createdAt: new Date("2026-04-17T10:00:00.000Z"),
				updatedAt: new Date("2026-04-17T10:00:00.000Z"),
			},
		]);

		await expect(listServiceRequests({ clientAddress: "0xCLIENTE" })).resolves.toEqual([
			{
				id: 1,
				clientAddress: "0xcliente",
				clientName: "Cliente",
				technicianAddress: "0xtec",
				technicianName: "Tecnico",
				description: "Servico",
				status: "aberta",
				budgetAmount: null,
				acceptedAt: null,
				budgetSentAt: null,
				clientAcceptedAt: null,
				createdAt: "2026-04-17T10:00:00.000Z",
				updatedAt: "2026-04-17T10:00:00.000Z",
			},
		]);
		expect(prismaMocks.serviceRequest.findMany).toHaveBeenCalledWith({
			where: {
				clientAddress: "0xcliente",
				technicianAddress: undefined,
			},
			orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
		});
	});

	it("aceita uma ordem do tecnico", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ABERTA",
			budgetAmount: null,
			acceptedAt: null,
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
		});
		prismaMocks.serviceRequest.update.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ACEITA",
			budgetAmount: null,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T11:00:00.000Z"),
		});

		await expect(acceptServiceRequest({ id: 2, technicianAddress: "0xTEC" })).resolves.toMatchObject({
			id: 2,
			status: "aceita",
		});
	});

	it("envia orcamento para uma ordem aceita", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ACEITA",
			budgetAmount: null,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T11:00:00.000Z"),
		});
		prismaMocks.serviceRequest.update.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ORCADA",
			budgetAmount: 240,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: new Date("2026-04-17T12:00:00.000Z"),
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T12:00:00.000Z"),
		});

		await expect(sendServiceBudget({ id: 2, technicianAddress: "0xTEC", budgetAmount: 240 })).resolves.toMatchObject({
			id: 2,
			status: "orcada",
			budgetAmount: 240,
		});
	});

	it("rejeita tecnico diferente da ordem", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xoutro",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ABERTA",
			budgetAmount: null,
			acceptedAt: null,
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T10:00:00.000Z"),
		});

		await expect(acceptServiceRequest({ id: 2, technicianAddress: "0xTEC" })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});

	it("aceita o orcamento quando pertence ao cliente e a ordem esta orcada", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 3,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ORCADA",
			budgetAmount: 240,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: new Date("2026-04-17T12:00:00.000Z"),
			clientAcceptedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T12:00:00.000Z"),
		});
		prismaMocks.serviceRequest.update.mockResolvedValue({
			id: 3,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ACEITO_CLIENTE",
			budgetAmount: 240,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: new Date("2026-04-17T12:00:00.000Z"),
			clientAcceptedAt: new Date("2026-04-17T13:00:00.000Z"),
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T13:00:00.000Z"),
		});

		await expect(acceptServiceBudget({ id: 3, clientAddress: "0xCLIENTE" })).resolves.toMatchObject({
			id: 3,
			status: "aceito_cliente",
		});
	});
});

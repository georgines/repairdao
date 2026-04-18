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
	completeServiceRequest,
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

	it("lista ordens sem filtros quando nenhum endereco e informado", async () => {
		prismaMocks.serviceRequest.findMany.mockResolvedValue([]);

		await expect(listServiceRequests()).resolves.toEqual([]);

		expect(prismaMocks.serviceRequest.findMany).toHaveBeenCalledWith({
			where: {
				clientAddress: undefined,
				technicianAddress: undefined,
			},
			orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
		});
	});

	it("lista ordens filtradas por cliente e tecnico", async () => {
		prismaMocks.serviceRequest.findMany.mockResolvedValue([]);

		await expect(
			listServiceRequests({
				clientAddress: "0xCLIENTE",
				technicianAddress: "0xTEC",
			}),
		).resolves.toEqual([]);

		expect(prismaMocks.serviceRequest.findMany).toHaveBeenCalledWith({
			where: {
				clientAddress: "0xcliente",
				technicianAddress: "0xtec",
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

	it("rejeita o envio de orcamento quando a ordem ja foi orcada", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 7,
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

		await expect(sendServiceBudget({ id: 7, technicianAddress: "0xTEC", budgetAmount: 280 })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
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

	it("rejeita quando a ordem nao existe ao aceitar", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue(null);

		await expect(acceptServiceRequest({ id: 999, technicianAddress: "0xTEC" })).rejects.toBeInstanceOf(RepairDAODominioError);
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

	it("rejeita quando o cliente nao corresponde ao orcamento", async () => {
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

		await expect(acceptServiceBudget({ id: 3, clientAddress: "0xoutro" })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});

	it("rejeita quando o orcamento nao foi enviado", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 3,
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
			updatedAt: new Date("2026-04-17T12:00:00.000Z"),
		});

		await expect(acceptServiceBudget({ id: 3, clientAddress: "0xcliente" })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});

	it("rejeita quando a ordem nao existe ao enviar orcamento", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue(null);

		await expect(sendServiceBudget({ id: 999, technicianAddress: "0xTEC", budgetAmount: 240 })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});

	it("rejeita quando o tecnico nao corresponde ao orcamento", async () => {
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

		await expect(sendServiceBudget({ id: 2, technicianAddress: "0xTEC", budgetAmount: 240 })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});

	it("rejeita quando a ordem nao existe ao aceitar o orcamento", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue(null);

		await expect(acceptServiceBudget({ id: 3, clientAddress: "0xcliente" })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});

	it("conclui uma ordem quando o tecnico e o responsavel e o cliente ja aceitou", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 4,
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
			completedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T13:00:00.000Z"),
		});
		prismaMocks.serviceRequest.update.mockResolvedValue({
			id: 4,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "CONCLUIDA",
			budgetAmount: 240,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: new Date("2026-04-17T12:00:00.000Z"),
			clientAcceptedAt: new Date("2026-04-17T13:00:00.000Z"),
			completedAt: new Date("2026-04-17T14:00:00.000Z"),
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T14:00:00.000Z"),
		});

		await expect(completeServiceRequest({ id: 4, technicianAddress: "0xTEC" })).resolves.toMatchObject({
			id: 4,
			status: "concluida",
			completedAt: "2026-04-17T14:00:00.000Z",
		});
	});

	it("rejeita a conclusao quando a ordem nao esta pronta ou o tecnico nao corresponde", async () => {
		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 5,
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
			completedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T12:00:00.000Z"),
		});

		await expect(completeServiceRequest({ id: 5, technicianAddress: "0xTEC" })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();

		prismaMocks.serviceRequest.findUnique.mockResolvedValue({
			id: 6,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xoutro",
			technicianName: "Tecnico",
			description: "Servico",
			status: "ACEITO_CLIENTE",
			budgetAmount: 240,
			acceptedAt: new Date("2026-04-17T11:00:00.000Z"),
			budgetSentAt: new Date("2026-04-17T12:00:00.000Z"),
			clientAcceptedAt: new Date("2026-04-17T13:00:00.000Z"),
			completedAt: null,
			createdAt: new Date("2026-04-17T10:00:00.000Z"),
			updatedAt: new Date("2026-04-17T13:00:00.000Z"),
		});

		await expect(completeServiceRequest({ id: 6, technicianAddress: "0xTEC" })).rejects.toBeInstanceOf(RepairDAODominioError);
		expect(prismaMocks.serviceRequest.update).not.toHaveBeenCalled();
	});
});

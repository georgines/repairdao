// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { RepairDAODominioError } from "@/erros/errors";

const serviceMocks = vi.hoisted(() => ({
	createServiceRequest: vi.fn(),
	listServiceRequests: vi.fn(),
	acceptServiceRequest: vi.fn(),
	sendServiceBudget: vi.fn(),
	acceptServiceBudget: vi.fn(),
	completeServiceRequest: vi.fn(),
	openServiceDispute: vi.fn(),
}));

vi.mock("@/services/serviceRequests/serviceRequestRepository", () => ({
	createServiceRequest: serviceMocks.createServiceRequest,
	listServiceRequests: serviceMocks.listServiceRequests,
	acceptServiceRequest: serviceMocks.acceptServiceRequest,
	sendServiceBudget: serviceMocks.sendServiceBudget,
	acceptServiceBudget: serviceMocks.acceptServiceBudget,
	completeServiceRequest: serviceMocks.completeServiceRequest,
	openServiceDispute: serviceMocks.openServiceDispute,
}));

import { GET, PATCH, POST } from "@/app/api/service-requests/route";

describe("/api/service-requests", () => {
	it("lista as ordens filtrando por carteira", async () => {
		serviceMocks.listServiceRequests.mockResolvedValue([
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

		const response = await GET(new Request("http://localhost/api/service-requests?clientAddress=0xcliente"));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(serviceMocks.listServiceRequests).toHaveBeenCalledWith({
			clientAddress: "0xcliente",
			technicianAddress: undefined,
		});
		expect(body).toHaveLength(1);
	});

	it("lista as ordens filtrando por tecnico", async () => {
		serviceMocks.listServiceRequests.mockResolvedValue([
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

		const response = await GET(new Request("http://localhost/api/service-requests?technicianAddress=0xtec"));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(serviceMocks.listServiceRequests).toHaveBeenCalledWith({
			clientAddress: undefined,
			technicianAddress: "0xtec",
		});
		expect(body).toHaveLength(1);
	});

	it("cria uma ordem de servico", async () => {
		serviceMocks.createServiceRequest.mockResolvedValue({
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

		const response = await POST(
			new Request("http://localhost/api/service-requests", {
				method: "POST",
				body: JSON.stringify({
					clientAddress: "0xcliente",
					clientName: "Cliente",
					technicianAddress: "0xtec",
					technicianName: "Tecnico",
					description: "Servico",
				}),
			}),
		);

		expect(response.status).toBe(201);
		expect(serviceMocks.createServiceRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				clientAddress: "0xcliente",
				description: "Servico",
			}),
		);
	});

	it("aceita uma ordem e envia orçamento", async () => {
		serviceMocks.acceptServiceRequest.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "aceita",
			budgetAmount: null,
			acceptedAt: "2026-04-17T10:00:00.000Z",
			budgetSentAt: null,
			clientAcceptedAt: null,
			createdAt: "2026-04-17T10:00:00.000Z",
			updatedAt: "2026-04-17T10:00:00.000Z",
		});
		serviceMocks.sendServiceBudget.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "orcada",
			budgetAmount: 240,
			acceptedAt: "2026-04-17T10:00:00.000Z",
			budgetSentAt: "2026-04-17T11:00:00.000Z",
			clientAcceptedAt: null,
			createdAt: "2026-04-17T10:00:00.000Z",
			updatedAt: "2026-04-17T11:00:00.000Z",
		});

		const acceptResponse = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "accept",
					id: 2,
					technicianAddress: "0xtec",
				}),
			}),
		);
		const budgetResponse = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "budget",
					id: 2,
					technicianAddress: "0xtec",
					budgetAmount: 240,
				}),
			}),
		);

		expect(acceptResponse.status).toBe(200);
		expect(budgetResponse.status).toBe(200);
		expect(serviceMocks.acceptServiceRequest).toHaveBeenCalledWith({
			action: "accept",
			id: 2,
			technicianAddress: "0xtec",
		});
		expect(serviceMocks.sendServiceBudget).toHaveBeenCalledWith({
			action: "budget",
			id: 2,
			technicianAddress: "0xtec",
			budgetAmount: 240,
		});
	});

	it("aceita o orcamento pelo cliente", async () => {
		serviceMocks.acceptServiceBudget.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "aceito_cliente",
			budgetAmount: 240,
			acceptedAt: "2026-04-17T10:00:00.000Z",
			budgetSentAt: "2026-04-17T11:00:00.000Z",
			clientAcceptedAt: "2026-04-17T12:00:00.000Z",
			createdAt: "2026-04-17T10:00:00.000Z",
			updatedAt: "2026-04-17T12:00:00.000Z",
		});

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "accept_budget",
					id: 2,
					clientAddress: "0xcliente",
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(serviceMocks.acceptServiceBudget).toHaveBeenCalledWith({
			action: "accept_budget",
			id: 2,
			clientAddress: "0xcliente",
		});
	});

	it("conclui a ordem pelo tecnico", async () => {
		serviceMocks.completeServiceRequest.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "concluida",
			budgetAmount: 240,
			acceptedAt: "2026-04-17T10:00:00.000Z",
			budgetSentAt: "2026-04-17T11:00:00.000Z",
			clientAcceptedAt: "2026-04-17T12:00:00.000Z",
			completedAt: "2026-04-17T13:00:00.000Z",
			createdAt: "2026-04-17T10:00:00.000Z",
			updatedAt: "2026-04-17T13:00:00.000Z",
		});

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "complete",
					id: 2,
					technicianAddress: "0xtec",
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(serviceMocks.completeServiceRequest).toHaveBeenCalledWith({
			action: "complete",
			id: 2,
			technicianAddress: "0xtec",
		});
	});

	it("abre disputa pela parte autorizada", async () => {
		serviceMocks.openServiceDispute.mockResolvedValue({
			id: 2,
			clientAddress: "0xcliente",
			clientName: "Cliente",
			technicianAddress: "0xtec",
			technicianName: "Tecnico",
			description: "Servico",
			status: "disputada",
			budgetAmount: 240,
			acceptedAt: "2026-04-17T10:00:00.000Z",
			budgetSentAt: "2026-04-17T11:00:00.000Z",
			clientAcceptedAt: "2026-04-17T12:00:00.000Z",
			disputedAt: "2026-04-17T13:00:00.000Z",
			disputeReason: "Servico nao entregue",
			createdAt: "2026-04-17T10:00:00.000Z",
			updatedAt: "2026-04-17T13:00:00.000Z",
		});

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "dispute",
					id: 2,
					actorAddress: "0xcliente",
					disputeReason: "Servico nao entregue",
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(serviceMocks.openServiceDispute).toHaveBeenCalledWith({
			action: "dispute",
			id: 2,
			actorAddress: "0xcliente",
			disputeReason: "Servico nao entregue",
		});
	});

	it("retorna 400 quando a consulta falha com erro de dominio", async () => {
		serviceMocks.listServiceRequests.mockRejectedValue(
			new RepairDAODominioError("ordem_nao_encontrada", "A ordem de servico nao foi encontrada."),
		);

		const response = await GET(new Request("http://localhost/api/service-requests?clientAddress=0xcliente"));
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toMatchObject({
			code: "ordem_nao_encontrada",
			message: "A ordem de servico nao foi encontrada.",
		});
	});

	it("retorna 500 quando a criacao falha com erro generico", async () => {
		serviceMocks.createServiceRequest.mockRejectedValue(new Error("falha inesperada"));

		const response = await POST(
			new Request("http://localhost/api/service-requests", {
				method: "POST",
				body: JSON.stringify({
					clientAddress: "0xcliente",
					clientName: "Cliente",
					technicianAddress: "0xtec",
					technicianName: "Tecnico",
					description: "Servico",
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "falha inesperada" });
	});

	it("retorna mensagem padrao quando a criacao falha com valor nao tipado", async () => {
		serviceMocks.createServiceRequest.mockRejectedValue("falha bruta");

		const response = await POST(
			new Request("http://localhost/api/service-requests", {
				method: "POST",
				body: JSON.stringify({
					clientAddress: "0xcliente",
					clientName: "Cliente",
					technicianAddress: "0xtec",
					technicianName: "Tecnico",
					description: "Servico",
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "Falha ao processar a ordem de servico." });
	});

	it("retorna 400 quando a atualizacao falha com erro de dominio", async () => {
		serviceMocks.sendServiceBudget.mockRejectedValue(
			new RepairDAODominioError("orcamento_invalido", "O valor do orcamento precisa ser maior que zero."),
		);

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "budget",
					id: 2,
					technicianAddress: "0xtec",
					budgetAmount: 240,
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toMatchObject({
			code: "orcamento_invalido",
			message: "O valor do orcamento precisa ser maior que zero.",
		});
	});

	it("retorna 500 quando a aceitacao do orcamento falha com erro generico", async () => {
		serviceMocks.acceptServiceBudget.mockRejectedValue(new Error("falha inesperada"));

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "accept_budget",
					id: 2,
					clientAddress: "0xcliente",
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "falha inesperada" });
	});

	it("retorna 500 quando a conclusao falha com valor nao tipado", async () => {
		serviceMocks.completeServiceRequest.mockRejectedValue("falha bruta");

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "complete",
					id: 2,
					technicianAddress: "0xtec",
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "Falha ao processar a ordem de servico." });
	});

	it("retorna 400 quando a disputa falha com erro de dominio", async () => {
		serviceMocks.openServiceDispute.mockRejectedValue(
			new RepairDAODominioError("ordem_nao_apta", "A ordem precisa estar em andamento ou concluida para abrir disputa."),
		);

		const response = await PATCH(
			new Request("http://localhost/api/service-requests", {
				method: "PATCH",
				body: JSON.stringify({
					action: "dispute",
					id: 2,
					actorAddress: "0xcliente",
					disputeReason: "Servico nao entregue",
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toMatchObject({
			code: "ordem_nao_apta",
			message: "A ordem precisa estar em andamento ou concluida para abrir disputa.",
		});
	});
});

// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	createServiceRequest: vi.fn(),
	listServiceRequests: vi.fn(),
	acceptServiceRequest: vi.fn(),
	sendServiceBudget: vi.fn(),
	acceptServiceBudget: vi.fn(),
}));

vi.mock("@/services/serviceRequests/serviceRequestRepository", () => ({
	createServiceRequest: serviceMocks.createServiceRequest,
	listServiceRequests: serviceMocks.listServiceRequests,
	acceptServiceRequest: serviceMocks.acceptServiceRequest,
	sendServiceBudget: serviceMocks.sendServiceBudget,
	acceptServiceBudget: serviceMocks.acceptServiceBudget,
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
});

// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { RepairDAODominioError } from "@/erros/errors";

const serviceMocks = vi.hoisted(() => ({
	loadUserDetails: vi.fn(),
	loadUsersForDiscovery: vi.fn(),
	registerUser: vi.fn(),
	updateUserProfile: vi.fn(),
	withdrawUser: vi.fn(),
}));

vi.mock("@/services/users/userDiscoveryServer", () => ({
	loadUserDetails: serviceMocks.loadUserDetails,
	loadUsersForDiscovery: serviceMocks.loadUsersForDiscovery,
}));

vi.mock("@/services/users/userRepository", () => ({
	registerUser: serviceMocks.registerUser,
	updateUserProfile: serviceMocks.updateUserProfile,
	withdrawUser: serviceMocks.withdrawUser,
}));

import { DELETE, GET, POST, PUT } from "@/app/api/users/route";

describe("/api/users", () => {
	it("registra o usuario apos a confirmacao", async () => {
		serviceMocks.registerUser.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		const response = await POST(
			new Request("http://localhost/api/users", {
				method: "POST",
				body: JSON.stringify({
					address: "0xabc",
					name: "Ana",
					expertiseArea: "Eletrica",
					role: "cliente",
					badgeLevel: "bronze",
					reputation: 0,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
				}),
			}),
		);

		expect(response.status).toBe(201);
		expect(serviceMocks.registerUser).toHaveBeenCalledWith(
			expect.objectContaining({
				address: "0xabc",
				name: "Ana",
				expertiseArea: "Eletrica",
			}),
		);
	});

	it("retorna um usuario quando o endereco e informado", async () => {
		serviceMocks.loadUserDetails.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		const response = await GET(new Request("http://localhost/api/users?address=0xabc"));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(serviceMocks.loadUserDetails).toHaveBeenCalledWith("0xabc");
		expect(body).toMatchObject({
			address: "0xabc",
			name: "Ana",
		});
	});

	it("retorna a lista de usuarios quando nao ha endereco", async () => {
		serviceMocks.loadUsersForDiscovery.mockResolvedValue([
			{
				address: "0xabc",
				name: "Ana",
				expertiseArea: "Eletrica",
				role: "cliente",
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 1,
				isActive: true,
				isEligible: true,
				updatedAt: "2026-04-17T10:00:00.000Z",
			},
		]);

		const response = await GET(new Request("http://localhost/api/users"));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(serviceMocks.loadUsersForDiscovery).toHaveBeenCalledTimes(1);
		expect(body).toHaveLength(1);
	});

	it("retorna 500 quando a consulta falha com erro generico", async () => {
		serviceMocks.loadUsersForDiscovery.mockRejectedValue(new Error("falha inesperada"));

		const response = await GET(new Request("http://localhost/api/users"));
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "falha inesperada" });
	});

	it("atualiza o usuario cadastrado", async () => {
		serviceMocks.updateUserProfile.mockResolvedValue({
			address: "0xabc",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 1,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		const response = await PUT(
			new Request("http://localhost/api/users", {
				method: "PUT",
				body: JSON.stringify({
					address: "0xabc",
					name: "Ana",
					expertiseArea: "Eletrica",
					role: "tecnico",
					badgeLevel: "bronze",
					reputation: 0,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(serviceMocks.updateUserProfile).toHaveBeenCalledWith(
			expect.objectContaining({
				address: "0xabc",
				role: "tecnico",
			}),
		);
	});

	it("remove o usuario quando a conta e desativada", async () => {
		serviceMocks.withdrawUser.mockResolvedValue(true);

		const response = await DELETE(
			new Request("http://localhost/api/users", {
				method: "DELETE",
				body: JSON.stringify({ address: "0xabc" }),
			}),
		);

		expect(response.status).toBe(200);
		expect(serviceMocks.withdrawUser).toHaveBeenCalledWith("0xabc");
	});

	it("retorna erro quando o identificador nao e enviado", async () => {
		const response = await DELETE(
			new Request("http://localhost/api/users", {
				method: "DELETE",
				body: JSON.stringify({}),
			}),
		);

		expect(response.status).toBe(400);
	});

	it("retorna 404 quando o usuario nao existe na busca", async () => {
		serviceMocks.loadUserDetails.mockResolvedValue(null);

		const response = await GET(new Request("http://localhost/api/users?address=0xabc"));
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body).toMatchObject({ message: "Usuario nao encontrado." });
	});

	it("retorna 400 quando o cadastro falha com erro de dominio", async () => {
		serviceMocks.registerUser.mockRejectedValue(
			new RepairDAODominioError("papel_invalido", "O papel do usuario e invalido."),
		);

		const response = await POST(
			new Request("http://localhost/api/users", {
				method: "POST",
				body: JSON.stringify({
					address: "0xabc",
					name: "Ana",
					expertiseArea: "Eletrica",
					role: "cliente",
					badgeLevel: "bronze",
					reputation: 0,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toMatchObject({
			code: "papel_invalido",
			message: "O papel do usuario e invalido.",
		});
	});

	it("retorna 500 quando a remocao falha com erro generico", async () => {
		serviceMocks.withdrawUser.mockRejectedValue(new Error("falha inesperada"));

		const response = await DELETE(
			new Request("http://localhost/api/users", {
				method: "DELETE",
				body: JSON.stringify({ address: "0xabc" }),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "falha inesperada" });
	});

	it("retorna 500 quando o cadastro falha com erro generico", async () => {
		serviceMocks.registerUser.mockRejectedValue(new Error("falha inesperada"));

		const response = await POST(
			new Request("http://localhost/api/users", {
				method: "POST",
				body: JSON.stringify({
					address: "0xabc",
					name: "Ana",
					expertiseArea: "Eletrica",
					role: "cliente",
					badgeLevel: "bronze",
					reputation: 0,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "falha inesperada" });
	});

	it("retorna 500 quando a atualizacao falha com erro generico", async () => {
		serviceMocks.updateUserProfile.mockRejectedValue(new Error("falha inesperada"));

		const response = await PUT(
			new Request("http://localhost/api/users", {
				method: "PUT",
				body: JSON.stringify({
					address: "0xabc",
					name: "Ana",
					expertiseArea: "Eletrica",
					role: "tecnico",
					badgeLevel: "bronze",
					reputation: 0,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "falha inesperada" });
	});

	it("retorna 404 quando a retirada nao encontra o usuario", async () => {
		serviceMocks.withdrawUser.mockResolvedValue(false);

		const response = await DELETE(
			new Request("http://localhost/api/users", {
				method: "DELETE",
				body: JSON.stringify({ address: "0xabc" }),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body).toMatchObject({ message: "Usuario nao encontrado." });
	});

	it("retorna mensagem padrao quando o cadastro falha com valor nao tipado", async () => {
		serviceMocks.registerUser.mockRejectedValue("falha bruta");

		const response = await POST(
			new Request("http://localhost/api/users", {
				method: "POST",
				body: JSON.stringify({
					address: "0xabc",
					name: "Ana",
					expertiseArea: "Eletrica",
					role: "cliente",
					badgeLevel: "bronze",
					reputation: 0,
					depositLevel: 1,
					isActive: true,
					isEligible: true,
				}),
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toMatchObject({ message: "Falha ao processar o usuario." });
	});

	it("retorna mensagem padrao quando o corpo do cadastro e invalido", async () => {
		const response = await POST(
			new Request("http://localhost/api/users", {
				method: "POST",
				body: "{",
			}),
		);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body.message).toMatch(/JSON/);
	});
});

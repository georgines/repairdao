// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	getUserDetails: vi.fn(),
	listUsers: vi.fn(),
	registerUser: vi.fn(),
	updateUserProfile: vi.fn(),
	withdrawUser: vi.fn(),
}));

vi.mock("@/services/users/userRepository", () => ({
	getUserDetails: serviceMocks.getUserDetails,
	listUsers: serviceMocks.listUsers,
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
		serviceMocks.getUserDetails.mockResolvedValue({
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
		expect(serviceMocks.getUserDetails).toHaveBeenCalledWith("0xabc");
		expect(body).toMatchObject({
			address: "0xabc",
			name: "Ana",
		});
	});

	it("retorna a lista de usuarios quando nao ha endereco", async () => {
		serviceMocks.listUsers.mockResolvedValue([
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
		expect(serviceMocks.listUsers).toHaveBeenCalledTimes(1);
		expect(body).toHaveLength(1);
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
});

// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteUserProfile, persistUserProfile } from "@/services/users/userClient";

describe("userClient", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("persists the activation payload", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
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
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } },
			),
		);

		await expect(
			persistUserProfile({
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
		).resolves.toMatchObject({
			address: "0xabc",
			name: "Ana",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/users",
			expect.objectContaining({
				method: "POST",
			}),
		);
	});

	it("removes the profile on deletion", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

		await expect(deleteUserProfile("0xabc")).resolves.toBeUndefined();

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/users",
			expect.objectContaining({
				method: "DELETE",
			}),
		);
	});

	it("usa a mensagem da API quando o salvamento falha", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ message: "Falha ao salvar." }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(
			persistUserProfile({
				address: "0xabc",
				name: "Ana",
				expertiseArea: null,
				role: "cliente",
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 0,
				isActive: false,
				isEligible: false,
			}),
		).rejects.toThrow("Falha ao salvar.");
	});

	it("usa a mensagem padrao quando a API responde sem mensagem", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({}), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(
			persistUserProfile({
				address: "0xabc",
				name: "Ana",
				expertiseArea: null,
				role: "cliente",
				badgeLevel: "bronze",
				reputation: 0,
				depositLevel: 0,
				isActive: false,
				isEligible: false,
			}),
		).rejects.toThrow("Nao foi possivel salvar o usuario.");
	});

	it("usa a mensagem padrao quando a API nao retorna json", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("erro bruto", { status: 500 }));

		await expect(deleteUserProfile("0xabc")).rejects.toThrow("Nao foi possivel remover o usuario.");
	});
});

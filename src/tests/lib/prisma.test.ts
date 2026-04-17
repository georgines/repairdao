import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
	constructors: [] as Array<unknown>,
}));

vi.mock("@prisma/client", () => ({
	PrismaClient: class {
		constructor(options: unknown) {
			prismaMocks.constructors.push(options);
		}
	},
}));

describe("src/lib/prisma", () => {
	beforeEach(() => {
		vi.resetModules();
		prismaMocks.constructors.length = 0;
		delete (globalThis as typeof globalThis & { prisma?: unknown }).prisma;
	});

	it("cria uma unica instancia do PrismaClient em ambiente nao produtivo", async () => {
		const { prisma } = await import("@/lib/prisma");

		expect(prisma).toBeDefined();
		expect(prismaMocks.constructors).toHaveLength(1);
		expect((globalThis as typeof globalThis & { prisma?: unknown }).prisma).toBe(prisma);
	});

	it("reutiliza a instancia global quando ela ja existe", async () => {
		const instancia = { id: "existente" };
		(globalThis as typeof globalThis & { prisma?: unknown }).prisma = instancia;

		const { prisma } = await import("@/lib/prisma");

		expect(prisma).toBe(instancia);
		expect(prismaMocks.constructors).toHaveLength(0);
	});

	it("nao grava no global quando o ambiente e de producao", async () => {
		const previousEnv = process.env.NODE_ENV;
		vi.resetModules();
		delete (globalThis as typeof globalThis & { prisma?: unknown }).prisma;
		process.env.NODE_ENV = "production";

		const { prisma } = await import("@/lib/prisma");

		expect(prisma).toBeDefined();
		expect((globalThis as typeof globalThis & { prisma?: unknown }).prisma).toBeUndefined();

		process.env.NODE_ENV = previousEnv;
	});
});

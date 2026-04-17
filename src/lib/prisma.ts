import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
	prisma?: PrismaClient;
};

function criarPrismaClient() {
	return new PrismaClient({
		log: ["error", "warn"],
	});
}

const globalForPrisma = globalThis as GlobalPrisma;

export const prisma = globalForPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

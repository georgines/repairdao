import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.hoisted(() => ({
	cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: cookiesMock.cookies,
}));

import {
	obterConfiguracaoRpcNoServidor,
	obterRedeSelecionadaNoServidor,
	obterRpcUrlNoServidor,
} from "@/services/blockchain/rpcConfig.server";

describe("rpcConfig.server", () => {
	beforeEach(() => {
		vi.stubEnv("NEXT_PUBLIC_NETWORK", "local");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it("lê a rede do cookie quando disponivel", async () => {
		cookiesMock.cookies.mockImplementation(() =>
			Promise.resolve({
				get: () => ({ value: "sepolia" }),
			}),
		);

		await expect(obterRedeSelecionadaNoServidor()).resolves.toBe("sepolia");
		await expect(obterConfiguracaoRpcNoServidor()).resolves.toMatchObject({
			rede: "sepolia",
			nome: "Sepolia",
			chainId: 11155111,
		});
		await expect(obterRpcUrlNoServidor()).resolves.toBeTruthy();
	});

	it("usa a rede padrao quando o cookie nao existe", async () => {
		cookiesMock.cookies.mockResolvedValueOnce({
			get: () => undefined,
		});

		await expect(obterRedeSelecionadaNoServidor()).resolves.toBe("local");
	});

	it("usa fallback quando cookies falha", async () => {
		cookiesMock.cookies.mockRejectedValueOnce(new Error("falha"));

		await expect(obterRedeSelecionadaNoServidor()).resolves.toBe("local");
	});
});

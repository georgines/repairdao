// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	CHAVE_REDE_RPC,
	EVENTO_REDE_RPC_ALTERADA,
	assinarMudancaDeRedeNoCliente,
	definirRedeSelecionadaNoCliente,
	ehRedeBlockchain,
	normalizarRedeBlockchain,
	obterConfiguracaoRpc,
	obterContratosDaRede,
	obterRedePadrao,
	obterRedeSelecionadaNoCliente,
	obterRpcUrlDaRede,
	type RedeBlockchain,
} from "@/services/blockchain/rpcConfig";

describe("rpcConfig", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.cookie = `${CHAVE_REDE_RPC}=; path=/; max-age=0`;
		vi.stubEnv("NEXT_PUBLIC_NETWORK", "local");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it("normaliza e identifica redes validas", () => {
		expect(normalizarRedeBlockchain("SEPOLIA")).toBe("sepolia");
		expect(normalizarRedeBlockchain("qualquer coisa")).toBe("local");
		expect(ehRedeBlockchain("local")).toBe(true);
		expect(ehRedeBlockchain("mainnet")).toBe(false);
		expect(obterRedePadrao()).toBe("local");
	});

	it("prioriza localStorage e cookie ao ler a rede selecionada", () => {
		window.localStorage.setItem(CHAVE_REDE_RPC, "sepolia");
		document.cookie = `${CHAVE_REDE_RPC}=local; path=/`;

		expect(obterRedeSelecionadaNoCliente()).toBe("sepolia");

		window.localStorage.removeItem(CHAVE_REDE_RPC);
		expect(obterRedeSelecionadaNoCliente()).toBe("local");
	});

	it("persiste a rede e dispara evento de mudanca", () => {
		const listener = vi.fn();
		window.addEventListener(EVENTO_REDE_RPC_ALTERADA, listener as EventListener);

		definirRedeSelecionadaNoCliente("sepolia");

		expect(window.localStorage.getItem(CHAVE_REDE_RPC)).toBe("sepolia");
		expect(document.cookie).toContain(`${CHAVE_REDE_RPC}=sepolia`);
		expect(listener).toHaveBeenCalledTimes(1);
		expect((listener.mock.calls[0]?.[0] as CustomEvent<{ rede: RedeBlockchain }>).detail.rede).toBe("sepolia");

		window.removeEventListener(EVENTO_REDE_RPC_ALTERADA, listener as EventListener);
	});

	it("retorna sem registrar listeners quando window nao existe", () => {
		vi.stubGlobal("window", undefined);
		vi.stubGlobal("document", undefined);

		expect(obterRedeSelecionadaNoCliente()).toBe("local");
		expect(definirRedeSelecionadaNoCliente("local")).toBeUndefined();
		expect(assinarMudancaDeRedeNoCliente(() => {})).toEqual(expect.any(Function));
	});

	it("lê o cookie quando localStorage nao tem valor", () => {
		window.localStorage.removeItem(CHAVE_REDE_RPC);
		vi.stubGlobal("document", {
			cookie: `${CHAVE_REDE_RPC}=sepolia`,
		});

		expect(obterRedeSelecionadaNoCliente()).toBe("sepolia");
	});

	it("assina e desassina mudancas de rede com normalizacao do payload", () => {
		const listener = vi.fn();
		const limpar = assinarMudancaDeRedeNoCliente(listener);

		window.dispatchEvent(new CustomEvent(EVENTO_REDE_RPC_ALTERADA, { detail: { rede: "sepolia" } }));
		window.dispatchEvent(new CustomEvent(EVENTO_REDE_RPC_ALTERADA, { detail: {} }));

		expect(listener).toHaveBeenNthCalledWith(1, "sepolia");
		expect(listener).toHaveBeenNthCalledWith(2, "local");

		limpar();
	});

	it("resolve url RPC por rede e faz fallback para o padrao", () => {
		expect(
			obterRpcUrlDaRede("local", {
				HARDHAT_RPC_URL: "http://local-rpc",
			} as NodeJS.ProcessEnv),
		).toBe("http://local-rpc");

		expect(
			obterRpcUrlDaRede("sepolia", {
				RPC_URL: "http://fallback-rpc",
			} as NodeJS.ProcessEnv),
		).toBe("http://fallback-rpc");

		expect(obterRpcUrlDaRede("sepolia", {} as NodeJS.ProcessEnv)).toBe("http://127.0.0.1:8545");
	});

	it("expõe a configuracao e os contratos da rede", () => {
		const configuracao = obterConfiguracaoRpc("sepolia", {
			SEPOLIA_RPC_URL: "http://sepolia-rpc",
		} as NodeJS.ProcessEnv);

		expect(configuracao.rede).toBe("sepolia");
		expect(configuracao.nome).toBe("Sepolia");
		expect(configuracao.chainId).toBe(11155111);
		expect(configuracao.rpcUrl).toBe("http://sepolia-rpc");
		expect(Object.keys(obterContratosDaRede("local")).length).toBeGreaterThan(0);
	});
});

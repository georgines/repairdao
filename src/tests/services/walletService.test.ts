// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const ethersMocks = vi.hoisted(() => ({
	browserProviderInstances: [] as Array<{
		send: ReturnType<typeof vi.fn>;
		getNetwork: ReturnType<typeof vi.fn>;
		getBalance: ReturnType<typeof vi.fn>;
	}>,
	nextBrowserProviders: [] as Array<{
		send: ReturnType<typeof vi.fn>;
		getNetwork: ReturnType<typeof vi.fn>;
		getBalance: ReturnType<typeof vi.fn>;
	}>,
	nextContracts: [] as unknown[],
	contractCalls: [] as unknown[],
	formatEtherMock: vi.fn(),
	formatUnitsMock: vi.fn(),
}));

vi.mock("ethers", () => ({
	BrowserProvider: class {
		send: ReturnType<typeof vi.fn>;
		getNetwork: ReturnType<typeof vi.fn>;
		getBalance: ReturnType<typeof vi.fn>;

		constructor() {
			const instance = ethersMocks.nextBrowserProviders.shift() ?? {
				send: vi.fn(),
				getNetwork: vi.fn(),
				getBalance: vi.fn(),
			};

			this.send = instance.send;
			this.getNetwork = instance.getNetwork;
			this.getBalance = instance.getBalance;
			ethersMocks.browserProviderInstances.push(instance);
		}
	},
	Contract: class {
		constructor(...args: unknown[]) {
			ethersMocks.contractCalls.push(args);
			return ethersMocks.nextContracts.shift();
		}
	},
	formatEther: ethersMocks.formatEtherMock,
	formatUnits: ethersMocks.formatUnitsMock,
}));

import {
	ESTADO_INICIAL_CARTEIRA,
	carregarCarteira,
	definirReconexaoAutomatica,
	formatarBlockchain,
	formatarNumero,
	formatarNumeroCompleto,
	formatarRPT,
	formatarUSD,
	normalizarPrecoEthUsd,
	obterEthereumProvider,
	obterRedeAtual,
	reconexaoAutomaticaHabilitada,
} from "@/services/wallet";

describe("walletService coverage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ethersMocks.browserProviderInstances.length = 0;
		ethersMocks.nextBrowserProviders.length = 0;
		ethersMocks.nextContracts.length = 0;
		ethersMocks.contractCalls.length = 0;
		window.localStorage.clear();
	});

	it("lê o provider global e cobre formatadores restantes", () => {
		const ethereum = { request: vi.fn() };
		Object.defineProperty(window, "ethereum", {
			value: ethereum,
			configurable: true,
		});

		expect(obterEthereumProvider()).toBe(ethereum);
		expect(formatarBlockchain(null)).toBe("Sem rede");
		expect(formatarBlockchain(999)).toBe("Chain 999");
		expect(formatarNumero("abc")).toBe("0,00");
		expect(formatarNumero("1000000")).toContain("mi");
		expect(formatarNumeroCompleto("1000000")).toBe("1.000.000,00");
		expect(formatarRPT("1000000")).toBe("RPT 1.000.000,00");
		expect(formatarUSD("abc")).toBe("$0.00");
		expect(normalizarPrecoEthUsd("abc")).toBe(0);
		expect(ESTADO_INICIAL_CARTEIRA.connected).toBe(false);
	});

	it("retorna verdadeiro por padrão sem preferência gravada", () => {
		expect(reconexaoAutomaticaHabilitada()).toBe(true);
		definirReconexaoAutomatica(false);
		expect(reconexaoAutomaticaHabilitada()).toBe(false);
		definirReconexaoAutomatica(true);
		expect(reconexaoAutomaticaHabilitada()).toBe(true);
	});

	it("cobre o comportamento sem window", () => {
		const originalWindow = window;

		Object.defineProperty(globalThis, "window", {
			value: undefined,
			configurable: true,
		});

		expect(reconexaoAutomaticaHabilitada()).toBe(true);
		expect(definirReconexaoAutomatica(true)).toBeUndefined();

		Object.defineProperty(globalThis, "window", {
			value: originalWindow,
			configurable: true,
		});
	});

	it("resolve a rede atual a partir do BrowserProvider", async () => {
		const ethereum = { request: vi.fn() };
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn(),
			getNetwork: vi.fn().mockResolvedValue({ chainId: 31337n }),
			getBalance: vi.fn(),
		});

		await expect(obterRedeAtual(ethereum)).resolves.toBe("Local");
	});

	it("retorna estado desconectado quando não há conta", async () => {
		const ethereum = { request: vi.fn() };
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn().mockResolvedValue([]),
			getNetwork: vi.fn().mockResolvedValue({ chainId: 11155111n }),
			getBalance: vi.fn(),
		});

		await expect(carregarCarteira(ethereum, false)).resolves.toEqual({
			...ESTADO_INICIAL_CARTEIRA,
			chainLabel: "Sepolia",
		});
	});

	it("carrega saldo em ETH e usa fallback para preço", async () => {
		const ethereum = { request: vi.fn() };
		const depositContract = {
			getEthUsdPrice: vi.fn().mockRejectedValue(new Error("sem preço")),
		};

		ethersMocks.nextContracts.push(depositContract);
		ethersMocks.formatEtherMock.mockReturnValue("1.5");
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn().mockResolvedValue(["0x1234567890abcdef1234567890abcdef12345678"]),
			getNetwork: vi.fn().mockResolvedValue({ chainId: 31337n }),
			getBalance: vi.fn().mockResolvedValue(1500000000000000000n),
		});

		await expect(carregarCarteira(ethereum, true)).resolves.toEqual({
			connected: true,
			address: "0x1234567890abcdef1234567890abcdef12345678",
			chainLabel: "Local",
			ethBalance: "1.5",
			usdBalance: "0.00",
			ethUsdPrice: "0.00",
		});

		expect(ethersMocks.browserProviderInstances.at(-1)?.send).toHaveBeenCalledWith("eth_requestAccounts", []);
		expect(ethersMocks.formatEtherMock).toHaveBeenCalledWith(1500000000000000000n);
	});

	it("calcula USD com preço normalizado", async () => {
		const ethereum = { request: vi.fn() };
		const depositContract = {
			getEthUsdPrice: vi.fn().mockResolvedValue(200000000000n),
		};

		ethersMocks.nextContracts.push(depositContract);
		ethersMocks.formatEtherMock.mockReturnValue("2");
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn().mockResolvedValue(["0xabc"]),
			getNetwork: vi.fn().mockResolvedValue({ chainId: 8453n }),
			getBalance: vi.fn().mockResolvedValue(2n),
		});

		await expect(carregarCarteira(ethereum, false)).resolves.toMatchObject({
			chainLabel: "Base",
			ethBalance: "2",
			usdBalance: "4000.00",
			ethUsdPrice: "2000.00",
		});
		expect(ethersMocks.browserProviderInstances.at(-1)?.send).toHaveBeenCalledWith("eth_accounts", []);
		expect(ethersMocks.formatEtherMock).toHaveBeenCalledWith(2n);
	});

	it("cobre o ramo defensivo de USD não finito", async () => {
		const ethereum = { request: vi.fn() };
		const depositContract = {
			getEthUsdPrice: vi.fn().mockResolvedValue("invalido"),
		};
		const originalIsFinite = Number.isFinite;

		ethersMocks.nextContracts.push(depositContract);
		ethersMocks.formatEtherMock.mockReturnValue("2");
		ethersMocks.nextBrowserProviders.push({
			send: vi.fn().mockResolvedValue(["0xabc"]),
			getNetwork: vi.fn().mockResolvedValue({ chainId: 8453n }),
			getBalance: vi.fn().mockResolvedValue(2n),
		});

		Number.isFinite = ((value: unknown) => {
			if (value === 2000) {
				return false;
			}

			return originalIsFinite(value);
		}) as typeof Number.isFinite;

		await expect(carregarCarteira(ethereum, false)).resolves.toMatchObject({
			ethBalance: "2",
			usdBalance: "0.00",
			ethUsdPrice: "0.00",
		});

		Number.isFinite = originalIsFinite;
	});
});

// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";

const ethersMocks = vi.hoisted(() => {
	const waitMock = vi.fn().mockResolvedValue("confirmado");
	const buyMock = vi.fn().mockResolvedValue({ wait: waitMock });
	const getSignerMock = vi.fn().mockResolvedValue({ id: "signer" });
	const contractCtor = vi.fn();
	const providerCtor = vi.fn();

	class BrowserProviderMock {
		getSigner = getSignerMock;

		constructor(ethereum: unknown) {
			providerCtor(ethereum);
		}
	}

	class ContractMock {
		buy = buyMock;

		constructor(...args: unknown[]) {
			contractCtor(...args);
		}
	}

	return {
		waitMock,
		buyMock,
		getSignerMock,
		contractCtor,
		providerCtor,
		BrowserProviderMock,
		ContractMock,
		parseEtherMock: vi.fn((valor: string) => `parsed:${valor}`),
	};
});

vi.mock("ethers", () => ({
	BrowserProvider: ethersMocks.BrowserProviderMock,
	Contract: ethersMocks.ContractMock,
	parseEther: ethersMocks.parseEtherMock,
}));

import { RepairDAODominioError } from "@/erros/errors";
import { comprarToken } from "@/services/wallet/tokenPurchase";

describe("comprarToken", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("compra tokens com valor normalizado e aguarda confirmacao", async () => {
		const ethereum = { request: vi.fn() };

		await expect(comprarToken(ethereum, "0,25")).resolves.toBe("confirmado");

		expect(ethersMocks.providerCtor).toHaveBeenCalledWith(ethereum);
		expect(ethersMocks.getSignerMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.contractCtor).toHaveBeenCalledWith(
			contratos.RepairToken,
			expect.any(Array),
			expect.any(Object),
		);
		expect(ethersMocks.parseEtherMock).toHaveBeenCalledWith("0.25");
		expect(ethersMocks.buyMock).toHaveBeenCalledWith({ value: "parsed:0.25" });
		expect(ethersMocks.waitMock).toHaveBeenCalledTimes(1);
	});

	it("rejeita quantidade invalida", async () => {
		const ethereum = { request: vi.fn() };

		await expect(comprarToken(ethereum, "0")).rejects.toBeInstanceOf(RepairDAODominioError);
		await expect(comprarToken(ethereum, "")).rejects.toBeInstanceOf(RepairDAODominioError);
	});

	it("retorna a transacao diretamente quando nao ha wait", async () => {
		ethersMocks.buyMock.mockResolvedValueOnce("tx-enviada");

		const ethereum = { request: vi.fn() };

		await expect(comprarToken(ethereum, 1)).resolves.toBe("tx-enviada");
		expect(ethersMocks.parseEtherMock).toHaveBeenCalledWith("1");
	});
});

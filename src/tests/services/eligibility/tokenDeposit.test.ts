// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";

const ethersMocks = vi.hoisted(() => {
	const waitMock = vi.fn().mockResolvedValue("confirmado");
	const depositMock = vi.fn().mockResolvedValue({ wait: waitMock });
	const withdrawWaitMock = vi.fn().mockResolvedValue("saque-confirmado");
	const withdrawDepositMock = vi.fn().mockResolvedValue({ wait: withdrawWaitMock });
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
		deposit = depositMock;
		withdrawDeposit = withdrawDepositMock;

		constructor(...args: unknown[]) {
			contractCtor(...args);
		}
	}

	return {
		waitMock,
		withdrawWaitMock,
		withdrawDepositMock,
		depositMock,
		getSignerMock,
		contractCtor,
		providerCtor,
		BrowserProviderMock,
		ContractMock,
	};
});

vi.mock("ethers", () => ({
	BrowserProvider: ethersMocks.BrowserProviderMock,
	Contract: ethersMocks.ContractMock,
}));

import { RepairDAODominioError } from "@/erros/errors";
import { depositarTokens, sacarDeposito } from "@/services/eligibility/tokenDeposit";

describe("depositarTokens", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("deposita os RPT do saldo atual e aguarda confirmacao", async () => {
		const ethereum = { request: vi.fn() };

		await expect(depositarTokens(ethereum, 1500000000000000000n)).resolves.toBe("confirmado");

		expect(ethersMocks.providerCtor).toHaveBeenCalledWith(ethereum);
		expect(ethersMocks.getSignerMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.contractCtor).toHaveBeenCalledWith(
			contratos.RepairDeposit,
			expect.any(Array),
			expect.any(Object),
		);
		expect(ethersMocks.depositMock).toHaveBeenCalledWith(1500000000000000000n, false);
		expect(ethersMocks.waitMock).toHaveBeenCalledTimes(1);
	});

	it("retorna a transacao diretamente quando nao ha wait", async () => {
		ethersMocks.depositMock.mockResolvedValueOnce("tx-enviada");

		const ethereum = { request: vi.fn() };

		await expect(depositarTokens(ethereum, 1n, true)).resolves.toBe("tx-enviada");
		expect(ethersMocks.depositMock).toHaveBeenCalledWith(1n, true);
	});

	it("rejeita saldo zero ou negativo", async () => {
		const ethereum = { request: vi.fn() };

		await expect(depositarTokens(ethereum, 0n)).rejects.toBeInstanceOf(RepairDAODominioError);
		await expect(depositarTokens(ethereum, -1n)).rejects.toBeInstanceOf(RepairDAODominioError);
	});

	it("saca o deposito atual e aguarda confirmacao", async () => {
		const ethereum = { request: vi.fn() };

		await expect(sacarDeposito(ethereum)).resolves.toBe("saque-confirmado");

		expect(ethersMocks.providerCtor).toHaveBeenCalledWith(ethereum);
		expect(ethersMocks.getSignerMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.contractCtor).toHaveBeenCalledWith(
			contratos.RepairDeposit,
			expect.any(Array),
			expect.any(Object),
		);
		expect(ethersMocks.withdrawDepositMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.withdrawWaitMock).toHaveBeenCalledTimes(1);
	});

	it("retorna a transacao de saque diretamente quando nao ha wait", async () => {
		ethersMocks.withdrawDepositMock.mockResolvedValueOnce("saque-direto");

		const ethereum = { request: vi.fn() };

		await expect(sacarDeposito(ethereum)).resolves.toBe("saque-direto");
		expect(ethersMocks.withdrawDepositMock).toHaveBeenCalledTimes(1);
	});
});

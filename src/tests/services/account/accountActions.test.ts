// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";

const ethersMocks = vi.hoisted(() => {
	const withdrawDepositWaitMock = vi.fn().mockResolvedValue("deposito-confirmado");
	const withdrawRewardsWaitMock = vi.fn().mockResolvedValue("rendimentos-confirmados");
	const withdrawDepositMock = vi.fn().mockResolvedValue({ wait: withdrawDepositWaitMock });
	const withdrawRewardsMock = vi.fn().mockResolvedValue({ wait: withdrawRewardsWaitMock });
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
		withdrawDeposit = withdrawDepositMock;
		withdrawRewards = withdrawRewardsMock;

		constructor(...args: unknown[]) {
			contractCtor(...args);
		}
	}

	return {
		withdrawDepositWaitMock,
		withdrawRewardsWaitMock,
		withdrawDepositMock,
		withdrawRewardsMock,
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

import { sacarDeposito, sacarRendimento } from "@/services/account/accountActions";

describe("accountActions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("saca o deposito e aguarda confirmacao", async () => {
		const ethereum = { request: vi.fn() };

		await expect(sacarDeposito(ethereum)).resolves.toBe("deposito-confirmado");

		expect(ethersMocks.providerCtor).toHaveBeenCalledWith(ethereum);
		expect(ethersMocks.getSignerMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.contractCtor).toHaveBeenCalledWith(
			contratos.RepairDeposit,
			expect.any(Array),
			expect.any(Object),
		);
		expect(ethersMocks.withdrawDepositMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.withdrawDepositWaitMock).toHaveBeenCalledTimes(1);
	});

	it("retorna a transacao do deposito quando nao ha wait", async () => {
		ethersMocks.withdrawDepositMock.mockResolvedValueOnce("tx-deposito");

		const ethereum = { request: vi.fn() };

		await expect(sacarDeposito(ethereum)).resolves.toBe("tx-deposito");
		expect(ethersMocks.withdrawDepositMock).toHaveBeenCalledTimes(1);
	});

	it("saca os rendimentos e aguarda confirmacao", async () => {
		const ethereum = { request: vi.fn() };

		await expect(sacarRendimento(ethereum)).resolves.toBe("rendimentos-confirmados");

		expect(ethersMocks.providerCtor).toHaveBeenCalledWith(ethereum);
		expect(ethersMocks.getSignerMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.contractCtor).toHaveBeenCalledWith(
			contratos.RepairDeposit,
			expect.any(Array),
			expect.any(Object),
		);
		expect(ethersMocks.withdrawRewardsMock).toHaveBeenCalledTimes(1);
		expect(ethersMocks.withdrawRewardsWaitMock).toHaveBeenCalledTimes(1);
	});

	it("retorna a transacao de rendimentos quando nao ha wait", async () => {
		ethersMocks.withdrawRewardsMock.mockResolvedValueOnce("tx-rendimentos");

		const ethereum = { request: vi.fn() };

		await expect(sacarRendimento(ethereum)).resolves.toBe("tx-rendimentos");
		expect(ethersMocks.withdrawRewardsMock).toHaveBeenCalledTimes(1);
	});
});

// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contratos, obterContratos } from "@/contracts";
import { criarGatewaysRepairDAO } from "@/services/blockchain/gateway";
import { CHAVE_REDE_RPC, definirRedeSelecionadaNoCliente } from "@/services/blockchain/rpcConfig";

describe("gateways repairdao", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.cookie = `${CHAVE_REDE_RPC}=; path=/; max-age=0`;
		vi.stubEnv("NEXT_PUBLIC_NETWORK", "local");
		definirRedeSelecionadaNoCliente("local");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("expõe um gateway para cada contrato", async () => {
		const contractClient = {
			readContract: vi.fn().mockResolvedValue("ok"),
			writeContract: vi.fn().mockResolvedValue("tx"),
		};

		const gateways = criarGatewaysRepairDAO(contractClient);
		const contratosAtuais = obterContratos();

		await expect(gateways.token.writeContract({ functionName: "buy" })).resolves.toBe("tx");
		await expect(gateways.badge.writeContract({ functionName: "mintBadge" })).resolves.toBe("tx");
		await expect(gateways.deposit.readContract({ functionName: "getEthUsdPrice" })).resolves.toBe("ok");
		await expect(gateways.reputation.writeContract({ functionName: "registerUser" })).resolves.toBe("tx");
		await expect(gateways.escrow.writeContract({ functionName: "createOrder" })).resolves.toBe("tx");
		await expect(gateways.governance.writeContract({ functionName: "createMinDepositProposal" })).resolves.toBe("tx");

		expect(contractClient.writeContract).toHaveBeenCalledWith(
			expect.objectContaining({ address: contratosAtuais.RepairToken, functionName: "buy" }),
		);
		expect(contractClient.writeContract).toHaveBeenCalledWith(
			expect.objectContaining({ address: contratosAtuais.RepairBadge, functionName: "mintBadge" }),
		);
		expect(contractClient.readContract).toHaveBeenCalledWith(
			expect.objectContaining({ address: contratosAtuais.RepairDeposit, functionName: "getEthUsdPrice" }),
		);
		expect(contractClient.writeContract).toHaveBeenCalledWith(
			expect.objectContaining({ address: contratosAtuais.RepairReputation, functionName: "registerUser" }),
		);
		expect(contractClient.writeContract).toHaveBeenCalledWith(
			expect.objectContaining({ address: contratosAtuais.RepairEscrow, functionName: "createOrder" }),
		);
		expect(contractClient.writeContract).toHaveBeenCalledWith(
			expect.objectContaining({ address: contratosAtuais.RepairGovernance, functionName: "createMinDepositProposal" }),
		);
	});

	it("muda os enderecos quando a rede selecionada muda", () => {
		const contratoInicial = contratos.RepairToken;

		definirRedeSelecionadaNoCliente("sepolia");

		expect(contratos.RepairToken).not.toBe(contratoInicial);
		expect(contratos.RepairToken).toBe(obterContratos().RepairToken);
	});
});

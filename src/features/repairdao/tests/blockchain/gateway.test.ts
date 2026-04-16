import { describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";
import { criarGatewaysRepairDAO } from "@/features/repairdao/services/blockchain/gateway";

describe("gateways repairdao", () => {
  it("expõe um gateway para cada contrato", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue("ok"),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };

    const gateways = criarGatewaysRepairDAO(contractClient);

    await expect(gateways.token.writeContract({ functionName: "buy" })).resolves.toBe("tx");
    await expect(gateways.badge.writeContract({ functionName: "mintBadge" })).resolves.toBe("tx");
    await expect(gateways.deposit.readContract({ functionName: "getEthUsdPrice" })).resolves.toBe("ok");
    await expect(gateways.reputation.writeContract({ functionName: "registerUser" })).resolves.toBe("tx");
    await expect(gateways.escrow.writeContract({ functionName: "createOrder" })).resolves.toBe("tx");
    await expect(gateways.governance.writeContract({ functionName: "createProposal" })).resolves.toBe("tx");

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairToken, functionName: "buy" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairBadge, functionName: "mintBadge" }),
    );
    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairDeposit, functionName: "getEthUsdPrice" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairReputation, functionName: "registerUser" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairEscrow, functionName: "createOrder" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairGovernance, functionName: "createProposal" }),
    );
  });
});
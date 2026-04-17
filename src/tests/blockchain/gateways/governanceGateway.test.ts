import { describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";
import { criarRepairGovernanceGateway } from "@/services/blockchain/gateways/governanceGateway";

describe("governanceGateway", () => {
  it("usa endereco e ABI corretos para proposta e leitura", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue({ id: 1 }),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };

    const gateway = criarRepairGovernanceGateway(contractClient);

    await expect(gateway.writeContract({ functionName: "createProposal" })).resolves.toBe("tx");
    await expect(gateway.readContract({ functionName: "getProposal" })).resolves.toEqual({ id: 1 });

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairGovernance, functionName: "createProposal" }),
    );
    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairGovernance, functionName: "getProposal" }),
    );
  });
});
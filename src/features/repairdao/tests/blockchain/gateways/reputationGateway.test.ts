import { describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";
import { criarRepairReputationGateway } from "@/features/repairdao/services/blockchain/gateways/reputationGateway";

describe("reputationGateway", () => {
  it("usa endereco e ABI corretos para leitura e escrita", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue(2),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };

    const gateway = criarRepairReputationGateway(contractClient);

    await expect(gateway.writeContract({ functionName: "registerUser" })).resolves.toBe("tx");
    await expect(gateway.readContract({ functionName: "getLevel" })).resolves.toBe(2);

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairReputation, functionName: "registerUser" }),
    );
    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairReputation, functionName: "getLevel" }),
    );
  });
});
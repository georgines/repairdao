import { describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";
import { criarRepairBadgeGateway } from "@/features/repairdao/services/blockchain/gateways/badgeGateway";

describe("badgeGateway", () => {
  it("usa endereco e ABI corretos para leitura e escrita", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue("bronze"),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };

    const gateway = criarRepairBadgeGateway(contractClient);

    await expect(gateway.writeContract({ functionName: "mintBadge" })).resolves.toBe("tx");
    await expect(gateway.readContract({ functionName: "getLevelName" })).resolves.toBe("bronze");

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairBadge, functionName: "mintBadge" }),
    );
    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairBadge, functionName: "getLevelName" }),
    );
  });
});
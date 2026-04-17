import { describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";
import { criarRepairTokenGateway } from "@/services/blockchain/gateways/tokenGateway";

describe("tokenGateway", () => {
  it("usa endereco e ABI corretos para escrita", async () => {
    const contractClient = {
      readContract: vi.fn(),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };

    const gateway = criarRepairTokenGateway(contractClient);

    await expect(gateway.writeContract({ functionName: "buy" })).resolves.toBe("tx");
    await expect(gateway.writeContract({ functionName: "mint" })).resolves.toBe("tx");
    await expect(gateway.writeContract({ functionName: "burn" })).resolves.toBe("tx");

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairToken, functionName: "buy" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairToken, functionName: "mint" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairToken, functionName: "burn" }),
    );
  });
});
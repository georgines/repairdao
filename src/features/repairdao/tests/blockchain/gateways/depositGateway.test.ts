import { describe, expect, it, vi } from "vitest";
import { contratos } from "@/contracts";
import { criarRepairDepositGateway } from "@/features/repairdao/services/blockchain/gateways/depositGateway";

describe("depositGateway", () => {
  it("usa endereco e ABI corretos para deposito e leitura", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue(123),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };

    const gateway = criarRepairDepositGateway(contractClient);

    await expect(gateway.readContract({ functionName: "getEthUsdPrice" })).resolves.toBe(123);
    await expect(gateway.writeContract({ functionName: "deposit" })).resolves.toBe("tx");

    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairDeposit, functionName: "getEthUsdPrice" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: contratos.RepairDeposit, functionName: "deposit" }),
    );
  });
});
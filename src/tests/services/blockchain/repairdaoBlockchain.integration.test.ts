import { describe, expect, it, vi } from "vitest";
import { criarRepairDAOBlockchain } from "@/services/blockchain/repairdaoBlockchain";
import { criarEthersRepairDAOGateway } from "@/services/blockchain/gateway";

describe("repairdaoBlockchain + ethersRepairDAOGateway", () => {
  it("encadeia validacao de dominio e gateway ethers", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue({
        id: 4,
        client: "0xcliente",
        technician: null,
        amount: 220,
        description: " revisao do motor ",
        state: 1,
        createdAt: 100,
        completedAt: 0,
        clientRated: false,
        technicianRated: false,
      }),
      writeContract: vi.fn().mockResolvedValue("0xhash"),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);
    const blockchain = criarRepairDAOBlockchain(gateway);

    await expect(
      blockchain.criarOrdem({
        contexto: { papel: "cliente", depositoAtivo: true },
        descricao: "  revisao do motor  ",
        cliente: "0xcliente",
      }),
    ).resolves.toBe("0xhash");

    await expect(blockchain.buscarOrdem(4)).resolves.toEqual({
      id: "4",
      estado: "em_andamento",
      descricao: "revisao do motor",
      cliente: "0xcliente",
      tecnico: undefined,
      valorOrcamento: 220,
      clientRated: false,
      technicianRated: false,
    });

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "createOrder",
        args: ["revisao do motor"],
      }),
    );

    await expect(
      blockchain.concluirOrdem({
        contexto: { papel: "tecnico", depositoAtivo: true },
        ordemId: 4,
        tecnico: "0xtec",
      }),
    ).resolves.toBe("0xhash");

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "completeOrder",
        args: [4],
      }),
    );
  });
});

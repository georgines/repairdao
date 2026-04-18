import { describe, expect, it, vi } from "vitest";
import { criarEthersRepairDAOGateway, criarRepairEscrowGateway } from "@/services/blockchain/gateways/escrowGateway";

describe("escrowGateway", () => {
  it("encadeia escrita e leitura do contrato de escrow", async () => {
    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          id: 1,
          client: "0xcliente",
          technician: "0xtec",
          amount: 120,
          description: "troca de pneu",
          state: 1,
          createdAt: 100,
          completedAt: 0,
          clientRated: false,
          technicianRated: false,
        })
        .mockResolvedValueOnce({
          orderId: 2,
          openedBy: "0xcliente",
          opposingParty: "0xtec",
          votesForOpener: 10,
          votesForOpposing: 5,
          deadline: Math.floor(Date.now() / 1000) + 3600,
          resolved: false,
          reason: "falha",
        })
        .mockResolvedValueOnce([
          {
            submittedBy: "0xcliente",
            content: "fotos anexadas",
            timestamp: Math.floor(Date.now() / 1000),
          },
        ])
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true),
      writeContract: vi.fn().mockResolvedValue("0xdef"),
    };

    const gateway = criarRepairEscrowGateway(contractClient);

    await expect(gateway.criarOrdem({ descricao: "troca de pneu", cliente: "0xcliente" })).resolves.toBe("0xdef");
    await expect(gateway.enviarOrcamento({ ordemId: 1, tecnico: "0xtec", valor: 120 })).resolves.toBe("0xdef");
    await expect(gateway.concluirOrdem({ ordemId: 1, tecnico: "0xtec" })).resolves.toBe("0xdef");
    await expect(gateway.avaliarServico({ ordemId: 1, nota: 5 })).resolves.toBe("0xdef");
    await expect(gateway.abrirDisputa({ ordemId: 1, autor: "0xcliente", motivo: "falha" })).resolves.toBe("0xdef");
    await expect(gateway.enviarEvidencia({ ordemId: 1, autor: "0xcliente", conteudo: "fotos anexadas" })).resolves.toBe("0xdef");
    await expect(gateway.votarDisputa({ ordemId: 1, apoiandoAbertura: true, votante: "0xvotante" })).resolves.toBe("0xdef");
    await expect(gateway.resolverDisputa({ ordemId: 1 })).resolves.toBe("0xdef");
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "voteOnDispute",
        args: [1, true],
      }),
    );
    await expect(gateway.buscarOrdem(1)).resolves.toEqual({
      id: 1,
      estado: 1,
      descricao: "troca de pneu",
      cliente: "0xcliente",
      tecnico: "0xtec",
      valorOrcamento: 120,
      clientRated: false,
      technicianRated: false,
    });
    await expect(gateway.buscarDisputa(2)).resolves.toEqual({
      id: 2,
      estado: "janela_votacao",
      ordemId: 2,
      motivo: "falha",
      openedBy: "0xcliente",
      opposingParty: "0xtec",
      votesForOpener: 10,
      votesForOpposing: 5,
      deadline: expect.any(Number),
      resolved: false,
    });
    await expect(gateway.buscarEvidencias(1)).resolves.toEqual([
      {
        submittedBy: "0xcliente",
        content: "fotos anexadas",
        timestamp: expect.any(Number),
      },
    ]);
    await expect(gateway.verificarVotoDaDisputa(2, "0xvotante")).resolves.toEqual({
      hasVoted: true,
      supportOpener: true,
    });

    expect(contractClient.writeContract).toHaveBeenCalledTimes(8);
    expect(contractClient.readContract).toHaveBeenCalledTimes(5);
  });

  it("normaliza registros vazios, resolvidos e expirados", async () => {
    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          description: "sem ordem",
          client: "0xcliente",
          technician: "0xtec",
          amount: 0,
        })
        .mockResolvedValueOnce({
          reason: "sem disputa",
        })
        .mockResolvedValueOnce({
          orderId: 3,
          resolved: true,
          reason: "finalizada",
        })
        .mockResolvedValueOnce({
          orderId: 4,
          deadline: Math.floor(Date.now() / 1000) - 10,
          reason: "prazo",
        }),
      writeContract: vi.fn(),
    };

    const gateway = criarRepairEscrowGateway(contractClient);

    await expect(gateway.buscarOrdem(1)).resolves.toBeNull();
    await expect(gateway.buscarDisputa(2)).resolves.toBeNull();
    await expect(gateway.buscarDisputa(3)).resolves.toEqual({
      id: 3,
      estado: "resolvida",
      ordemId: 3,
      motivo: "finalizada",
      resolved: true,
    });
    await expect(gateway.buscarDisputa(4)).resolves.toEqual({
      id: 4,
      estado: "encerrada",
      ordemId: 4,
      motivo: "prazo",
      deadline: expect.any(Number),
    });
  });

  it("aceita aliases diferentes dos campos do contrato", async () => {
    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          orderId: 7,
          description: "alias orderId",
          client: "0xcliente",
          technician: "0xtec",
          amount: undefined,
        })
        .mockResolvedValueOnce({
          order_id: 8,
          descricao: "alias order_id",
          cliente: "0xcliente",
          tecnico: "0xtec",
          amount: 0,
        })
        .mockResolvedValueOnce({
          ordemId: 9,
          motivo: "alias ordemId",
        })
        .mockResolvedValueOnce({
          order_id: 10,
          reason: undefined,
          motivo: "alias motivo",
        }),
      writeContract: vi.fn(),
    };

    const gateway = criarRepairEscrowGateway(contractClient);

    await expect(gateway.buscarOrdem(7)).resolves.toEqual({
      id: 7,
      estado: 0,
      descricao: "alias orderId",
      cliente: "0xcliente",
      tecnico: "0xtec",
      valorOrcamento: null,
      clientRated: undefined,
      technicianRated: undefined,
    });
    await expect(gateway.buscarOrdem(8)).resolves.toEqual({
      id: 8,
      estado: 0,
      descricao: "alias order_id",
      cliente: "0xcliente",
      tecnico: "0xtec",
      valorOrcamento: null,
      clientRated: undefined,
      technicianRated: undefined,
    });
    await expect(gateway.buscarDisputa(9)).resolves.toEqual({
      id: 9,
      estado: "janela_votacao",
      ordemId: 9,
      motivo: "alias ordemId",
    });
    await expect(gateway.buscarDisputa(10)).resolves.toEqual({
      id: 10,
      estado: "janela_votacao",
      ordemId: 10,
      motivo: "alias motivo",
    });
  });

  it("retorna nulo quando o contrato nao encontra ordem ou disputa", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(undefined),
      writeContract: vi.fn(),
    };

    const gateway = criarRepairEscrowGateway(contractClient);

    await expect(gateway.buscarOrdem(99)).resolves.toBeNull();
    await expect(gateway.buscarDisputa(100)).resolves.toBeNull();
  });

  it("retorna o status de voto on-chain", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValueOnce(false),
      writeContract: vi.fn(),
    };

    const gateway = criarRepairEscrowGateway(contractClient);

    await expect(gateway.verificarVotoDaDisputa(10, "0xvotante")).resolves.toEqual({
      hasVoted: false,
      supportOpener: null,
    });
    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "hasVoted",
        args: [10, "0xvotante"],
      }),
    );
  });

  it("mantem o alias legado para compatibilidade", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue(null),
      writeContract: vi.fn().mockResolvedValue("0xhash"),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.criarOrdem({ descricao: "servico", cliente: "0xcliente" })).resolves.toBe("0xhash");
  });
});

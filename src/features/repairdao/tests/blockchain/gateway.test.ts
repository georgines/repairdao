import { describe, expect, it, vi } from "vitest";
import { criarEthersRepairDAOGateway } from "@/features/repairdao/services/blockchain/gateway";

describe("gateway", () => {
  it("usa endereco, abi e funcao corretos para criar ordem", async () => {
    const contractClient = {
      readContract: vi.fn(),
      writeContract: vi.fn().mockResolvedValue("0xabc"),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.criarOrdem({ descricao: "troca de pneu", cliente: "0xcliente" })).resolves.toBe("0xabc");

    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "createOrder",
        args: ["troca de pneu"],
      }),
    );
  });

  it("usa endereco, abi e funcao corretos para orcamento, disputa e leituras", async () => {
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
        }),
      writeContract: vi.fn().mockResolvedValue("0xdef"),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(
      gateway.enviarOrcamento({ ordemId: 1, tecnico: "0xtec", valor: 120 }),
    ).resolves.toBe("0xdef");

    await expect(
      gateway.abrirDisputa({ ordemId: 1, autor: "0xcliente", motivo: "falha" }),
    ).resolves.toBe("0xdef");

    await expect(gateway.buscarOrdem(1)).resolves.toEqual({
      id: 1,
      estado: 1,
      descricao: "troca de pneu",
      cliente: "0xcliente",
      tecnico: "0xtec",
      valorOrcamento: 120,
    });

    await expect(gateway.buscarDisputa(2)).resolves.toEqual({
      id: 2,
      estado: "janela_votacao",
      ordemId: 2,
      motivo: "falha",
    });

    expect(contractClient.writeContract).toHaveBeenCalledTimes(2);
    expect(contractClient.readContract).toHaveBeenCalledTimes(2);
    expect(contractClient.writeContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        functionName: "submitBudget",
        args: [1, 120],
      }),
    );
    expect(contractClient.writeContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        functionName: "openDispute",
        args: [1, "falha"],
      }),
    );
  });

  it("retorna nulo quando o contrato devolve entidade vazia", async () => {
    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          id: 0,
          client: "0x0000000000000000000000000000000000000000",
          technician: "0x0000000000000000000000000000000000000000",
          amount: 0,
          description: "",
          state: 0,
          createdAt: 0,
          completedAt: 0,
          clientRated: false,
          technicianRated: false,
        })
        .mockResolvedValueOnce({
          orderId: 0,
          openedBy: "0x0000000000000000000000000000000000000000",
          opposingParty: "0x0000000000000000000000000000000000000000",
          votesForOpener: 0,
          votesForOpposing: 0,
          deadline: 0,
          resolved: false,
          reason: "",
        }),
      writeContract: vi.fn(),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.buscarOrdem(99)).resolves.toBeNull();
    await expect(gateway.buscarDisputa(77)).resolves.toBeNull();
  });

  it("aceita aliases do contrato real e deriva estados da disputa", async () => {
    const futureDeadline = Math.floor(Date.now() / 1000) + 3600;
    const pastDeadline = Math.floor(Date.now() / 1000) - 3600;

    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          orderId: 7,
          state: 0,
          description: "servico real",
          client: "0xcliente",
          technician: "0xtec",
          amount: 0,
        })
        .mockResolvedValueOnce({
          orderId: 7,
          openedBy: "0xcliente",
          opposingParty: "0xtec",
          votesForOpener: 0,
          votesForOpposing: 0,
          deadline: futureDeadline,
          resolved: true,
          reason: "ganhou",
        })
        .mockResolvedValueOnce({
          orderId: 8,
          openedBy: "0xcliente",
          opposingParty: "0xtec",
          votesForOpener: 0,
          votesForOpposing: 0,
          deadline: pastDeadline,
          resolved: false,
          reason: "expirada",
        }),
      writeContract: vi.fn(),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.buscarOrdem(7)).resolves.toEqual({
      id: 7,
      estado: 0,
      descricao: "servico real",
      cliente: "0xcliente",
      tecnico: "0xtec",
      valorOrcamento: null,
    });

    await expect(gateway.buscarDisputa(7)).resolves.toEqual({
      id: 7,
      estado: "resolvida",
      ordemId: 7,
      motivo: "ganhou",
    });

    await expect(gateway.buscarDisputa(8)).resolves.toEqual({
      id: 8,
      estado: "encerrada",
      ordemId: 8,
      motivo: "expirada",
    });
  });

  it("lanca erro quando a ordem nao traz descricao valida", async () => {
    const contractClient = {
      readContract: vi.fn().mockResolvedValue({
        id: 9,
        client: "0xcliente",
        technician: "0xtec",
        amount: 10,
        state: 1,
      }),
      writeContract: vi.fn(),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.buscarOrdem(9)).rejects.toThrow(/contrato nao retornou nenhum campo textual/i);
  });

  it("aceita retorno sem id e disputa sem deadline como estados vazios e abertos", async () => {
    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          client: "0xcliente",
          technician: "0xtec",
          amount: 10,
          description: "sem id",
          state: 1,
        })
        .mockResolvedValueOnce({
          orderId: 10,
          openedBy: "0xcliente",
          opposingParty: "0xtec",
          votesForOpener: 0,
          votesForOpposing: 0,
          resolved: false,
          reason: "pendente",
        }),
      writeContract: vi.fn(),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.buscarOrdem(10)).resolves.toBeNull();
    await expect(gateway.buscarDisputa(10)).resolves.toEqual({
      id: 10,
      estado: "janela_votacao",
      ordemId: 10,
      motivo: "pendente",
    });
  });

  it("normaliza tecnico zero e campos opcionais malformados", async () => {
    const contractClient = {
      readContract: vi.fn()
        .mockResolvedValueOnce({
          id: 11,
          client: "0xcliente",
          technician: "0x0000000000000000000000000000000000000000",
          amount: 5,
          description: "com tecnico vazio",
          state: 1,
        })
        .mockResolvedValueOnce({
          openedBy: "0xcliente",
          opposingParty: "0xtec",
          votesForOpener: 0,
          votesForOpposing: 0,
          deadline: Math.floor(Date.now() / 1000) + 3600,
          resolved: false,
          reason: "sem id",
        })
        .mockResolvedValueOnce({
          orderId: 12,
          openedBy: "0xcliente",
          opposingParty: "0xtec",
          votesForOpener: 0,
          votesForOpposing: 0,
          deadline: Math.floor(Date.now() / 1000) + 3600,
          resolved: false,
          reason: 123,
        })
        .mockResolvedValueOnce({
          id: 20,
          client: "0xcliente",
          technician: "0xtec",
          description: "sem campos opcionais",
        }),
      writeContract: vi.fn(),
    };

    const gateway = criarEthersRepairDAOGateway(contractClient);

    await expect(gateway.buscarOrdem(11)).resolves.toEqual({
      id: 11,
      estado: 1,
      descricao: "com tecnico vazio",
      cliente: "0xcliente",
      tecnico: null,
      valorOrcamento: 5,
    });

    await expect(gateway.buscarDisputa(11)).resolves.toBeNull();

    await expect(gateway.buscarDisputa(12)).resolves.toEqual({
      id: 12,
      estado: "janela_votacao",
      ordemId: 12,
      motivo: undefined,
    });

    await expect(gateway.buscarOrdem(20)).resolves.toEqual({
      id: 20,
      estado: 0,
      descricao: "sem campos opcionais",
      cliente: "0xcliente",
      tecnico: "0xtec",
      valorOrcamento: null,
    });
  });

  it("cobre validacoes defensivas de numero, endereco e motivo em branco", async () => {
    const contratoComIdInvalido = {
      readContract: vi.fn().mockResolvedValue({
        id: "abc",
        client: "0xcliente",
        technician: "0xtec",
        amount: 1,
        description: "id invalido",
        state: 1,
      }),
      writeContract: vi.fn(),
    };

    const contratoComEnderecoInvalido = {
      readContract: vi.fn().mockResolvedValue({
        id: 15,
        client: "0xcliente",
        technician: 123,
        amount: 1,
        description: "endereco invalido",
        state: 1,
      }),
      writeContract: vi.fn(),
    };

    const contratoComMotivoEmBranco = {
      readContract: vi.fn().mockResolvedValue({
        orderId: 16,
        openedBy: "0xcliente",
        opposingParty: "0xtec",
        votesForOpener: 0,
        votesForOpposing: 0,
        deadline: Math.floor(Date.now() / 1000) + 3600,
        resolved: false,
        reason: "   ",
      }),
      writeContract: vi.fn(),
    };

    await expect(criarEthersRepairDAOGateway(contratoComIdInvalido).buscarOrdem(13)).rejects.toThrow(/id da ordem/i);
    await expect(criarEthersRepairDAOGateway(contratoComEnderecoInvalido).buscarOrdem(15)).rejects.toThrow(/tecnico da ordem/i);

    await expect(criarEthersRepairDAOGateway(contratoComMotivoEmBranco).buscarDisputa(16)).resolves.toEqual({
      id: 16,
      estado: "janela_votacao",
      ordemId: 16,
      motivo: undefined,
    });
  });

  it("lança erro quando o client de escrita nao existe", async () => {
    const contractClient = {
      readContract: vi.fn(),
      writeContract: undefined,
    };

    const gateway = criarEthersRepairDAOGateway(contractClient as never);

    await expect(
      gateway.criarOrdem({ descricao: "troca de bateria", cliente: "0xcliente" }),
    ).rejects.toThrow(/client de escrita/);
  });
});
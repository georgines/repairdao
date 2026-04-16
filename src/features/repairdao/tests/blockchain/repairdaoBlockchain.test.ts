import { describe, expect, it, vi } from "vitest";
import { criarRepairDAOBlockchain } from "@/features/repairdao/services/blockchain/repairdaoBlockchain";

describe("repairdaoBlockchain", () => {
  it("bloqueia criar ordem quando o contexto nao permite", async () => {
    const gateway = {
      criarOrdem: vi.fn(),
      enviarOrcamento: vi.fn(),
      abrirDisputa: vi.fn(),
      buscarOrdem: vi.fn(),
      buscarDisputa: vi.fn(),
    };

    const blockchain = criarRepairDAOBlockchain(gateway);

    await expect(
      blockchain.criarOrdem({
        contexto: { papel: "tecnico", depositoAtivo: true },
        descricao: "troca de bateria",
        cliente: "0xcliente",
      }),
    ).rejects.toThrow(/nao e permitida/i);

    expect(gateway.criarOrdem).not.toHaveBeenCalled();
  });

  it("bloqueia enviar orcamento e abrir disputa em contextos invalidos", async () => {
    const gateway = {
      criarOrdem: vi.fn(),
      enviarOrcamento: vi.fn(),
      abrirDisputa: vi.fn(),
      buscarOrdem: vi.fn(),
      buscarDisputa: vi.fn(),
    };

    const blockchain = criarRepairDAOBlockchain(gateway);

    await expect(
      blockchain.enviarOrcamento({
        contexto: { papel: "cliente", depositoAtivo: true },
        ordemId: 10,
        tecnico: "0xtecnico",
        valor: 250,
      }),
    ).rejects.toThrow(/nao e permitida/i);

    await expect(
      blockchain.abrirDisputa({
        contexto: { papel: "outsider", depositoAtivo: true },
        ordemId: 10,
        autor: "0xoutsider",
        motivo: "falha",
      }),
    ).rejects.toThrow(/nao e permitida/i);

    expect(gateway.enviarOrcamento).not.toHaveBeenCalled();
    expect(gateway.abrirDisputa).not.toHaveBeenCalled();
  });

  it("cria ordem e envia orcamento depois de validar regras", async () => {
    const gateway = {
      criarOrdem: vi.fn().mockResolvedValue({ hash: "0x1" }),
      enviarOrcamento: vi.fn().mockResolvedValue({ hash: "0x2" }),
      abrirDisputa: vi.fn(),
      buscarOrdem: vi.fn(),
      buscarDisputa: vi.fn(),
    };

    const blockchain = criarRepairDAOBlockchain(gateway);

    await expect(
      blockchain.criarOrdem({
        contexto: { papel: "cliente", depositoAtivo: true },
        descricao: "  troca de freio  ",
        cliente: "0xcliente",
      }),
    ).resolves.toEqual({ hash: "0x1" });

    expect(gateway.criarOrdem).toHaveBeenCalledWith({
      descricao: "troca de freio",
      cliente: "0xcliente",
    });

    await expect(
      blockchain.enviarOrcamento({
        contexto: { papel: "tecnico", depositoAtivo: true },
        ordemId: 10,
        tecnico: "0xtecnico",
        valor: 250,
      }),
    ).resolves.toEqual({ hash: "0x2" });

    expect(gateway.enviarOrcamento).toHaveBeenCalledWith({
      ordemId: 10,
      tecnico: "0xtecnico",
      valor: 250,
    });
  });

  it("abre disputa e retorna nulo quando nao existe entidade no contrato", async () => {
    const gateway = {
      criarOrdem: vi.fn(),
      enviarOrcamento: vi.fn(),
      abrirDisputa: vi.fn().mockResolvedValue({ hash: "0x3" }),
      buscarOrdem: vi.fn().mockResolvedValue(null),
      buscarDisputa: vi.fn().mockResolvedValue(null),
    };

    const blockchain = criarRepairDAOBlockchain(gateway);

    await expect(
      blockchain.abrirDisputa({
        contexto: { papel: "cliente", depositoAtivo: true },
        ordemId: 10,
        autor: "0xcliente",
        motivo: " servico nao entregue ",
      }),
    ).resolves.toEqual({ hash: "0x3" });

    expect(gateway.abrirDisputa).toHaveBeenCalledWith({
      ordemId: 10,
      autor: "0xcliente",
      motivo: "servico nao entregue",
    });

    await expect(blockchain.buscarOrdem(99)).resolves.toBeNull();
    await expect(blockchain.buscarDisputa(77)).resolves.toBeNull();
  });

  it("busca e adapta dados do contrato", async () => {
    const gateway = {
      criarOrdem: vi.fn(),
      enviarOrcamento: vi.fn(),
      abrirDisputa: vi.fn(),
      buscarOrdem: vi.fn().mockResolvedValue({
        id: 4,
        estado: 1,
        descricao: " revisão do motor ",
        cliente: "0xcliente",
        tecnico: null,
        valorOrcamento: 120n,
      }),
      buscarDisputa: vi.fn().mockResolvedValue({
        id: 9,
        estado: 0,
        ordemId: 4,
        motivo: " falha recorrente ",
      }),
    };

    const blockchain = criarRepairDAOBlockchain(gateway);

    await expect(blockchain.buscarOrdem(4)).resolves.toEqual({
      id: "4",
      estado: "em_andamento",
      descricao: "revisão do motor",
      cliente: "0xcliente",
      tecnico: undefined,
      valorOrcamento: 120,
    });

    await expect(blockchain.buscarDisputa(9)).resolves.toEqual({
      id: "9",
      estado: "aberta",
      ordemId: "4",
      motivo: "falha recorrente",
    });
  });
});
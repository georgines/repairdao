import { describe, expect, it, vi } from "vitest";
import { garantirTransicaoEstado, garantirValorPermitido, ehValorPermitido, clamp } from "@/features/repairdao/services/shared";
import { RepairDAODominioError } from "@/features/repairdao/errors";
import {
  criarGatewayContrato,
  garantirEscritaDisponivel,
  normalizarEndereco,
  normalizarNumero,
  normalizarTextoOpcional,
  obterTextoDeContrato,
  obterValorDeContrato,
} from "@/features/repairdao/services/blockchain/gateways/shared";

describe("shared", () => {
  it("verifica valores permitidos", () => {
    expect(ehValorPermitido("cliente", ["cliente", "tecnico"])).toBe(true);
    expect(ehValorPermitido("outsider", ["cliente", "tecnico"])).toBe(false);
  });

  it("garante valor permitido e lança erro quando invalido", () => {
    expect(garantirValorPermitido("cliente", ["cliente", "tecnico"], "erro_valor", "valor invalido")).toBe("cliente");
    expect(() => garantirValorPermitido("outsider", ["cliente", "tecnico"], "erro_valor", "valor invalido")).toThrow(/valor invalido/);
  });

  it("garante transicao de estado e falha em transicao invalida", () => {
    const transicoes = {
      aberta: ["encerrada"],
      encerrada: [],
    } as const;

    expect(garantirTransicaoEstado("aberta", "encerrada", transicoes, "erro_transicao", "a disputa")).toBe("encerrada");
    expect(() => garantirTransicaoEstado("aberta", "aberta", transicoes, "erro_transicao", "a disputa")).toThrow(/Nao e permitido mover a disputa/);
  });

  it("faz clamp dentro dos limites informados", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-1, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it("cobre os helpers do gateway de contratos", async () => {
    expect(normalizarNumero(BigInt(3), "campo")).toBe(3);
    expect(normalizarNumero("4", "campo")).toBe(4);
    expect(() => normalizarNumero("x", "campo")).toThrow(RepairDAODominioError);
    expect(() => normalizarNumero(1.5, "campo")).toThrow(/inteiro valido/);

    expect(normalizarEndereco(undefined, "campo")).toBeNull();
    expect(normalizarEndereco(null, "campo")).toBeNull();
    expect(normalizarEndereco("0x0000000000000000000000000000000000000000", "campo")).toBeNull();
    expect(normalizarEndereco("0x123", "campo")).toBe("0x123");
    expect(() => normalizarEndereco(123, "campo")).toThrow(/endereco valido/);

    expect(normalizarTextoOpcional(undefined)).toBeUndefined();
    expect(normalizarTextoOpcional("   ")).toBeUndefined();
    expect(normalizarTextoOpcional("  texto  ")).toBe("texto");

    expect(obterTextoDeContrato({ nome: "alvo" }, ["nome", "outro"])).toBe("alvo");
    expect(() => obterTextoDeContrato({}, ["nome", "outro"])).toThrow(/nao retornou nenhum campo textual/);

    expect(obterValorDeContrato({ id: 1 }, ["id", "outro"])).toBe(1);
    expect(obterValorDeContrato({}, ["id", "outro"])).toBeUndefined();

    const clientSemEscrita = {
      readContract: vi.fn(),
    };

    expect(() => garantirEscritaDisponivel(clientSemEscrita as never)).toThrow(/escrita do contrato nao foi configurado/);

    const contractClient = {
      readContract: vi.fn().mockResolvedValue("ok"),
      writeContract: vi.fn().mockResolvedValue("tx"),
    };
    const gateway = criarGatewayContrato(contractClient as never, {
      address: "0xabc",
      abi: [],
    });

    await expect(gateway.readContract({ functionName: "foo" })).resolves.toBe("ok");
    await expect(gateway.writeContract({ functionName: "bar" })).resolves.toBe("tx");

    expect(contractClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: "0xabc", functionName: "foo" }),
    );
    expect(contractClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: "0xabc", functionName: "bar" }),
    );
  });
});

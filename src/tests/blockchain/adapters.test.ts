import { describe, expect, it } from "vitest";
import {
  mapearDisputaDoContrato,
  mapearEstadoDisputaDoContrato,
  mapearEstadoOrdemDoContrato,
  mapearEstadoPropostaDoContrato,
  mapearOrdemDoContrato,
  mapearPropostaDoContrato,
  mapearEnumContrato,
} from "@/services/blockchain/adapters";

describe("adapters blockchain", () => {
  it("mapeia estados numericos do contrato para o dominio", () => {
    expect(mapearEstadoOrdemDoContrato(1)).toBe("em_andamento");
    expect(mapearEstadoDisputaDoContrato(2)).toBe("encerrada");
    expect(mapearEstadoPropostaDoContrato(3)).toBe("executada");
  });

  it("aceita estados textualizados quando o contrato ja devolve string", () => {
    expect(mapearEstadoOrdemDoContrato("concluida")).toBe("concluida");
    expect(mapearEstadoDisputaDoContrato("resolvida")).toBe("resolvida");
    expect(mapearEstadoPropostaDoContrato("ativa")).toBe("ativa");
    expect(mapearEnumContrato("ativa", ["rascunho", "ativa"] as const, "erro", "proposta")).toBe("ativa");
  });

  it("falha para valores invalidos do contrato", () => {
    expect(() => mapearEstadoOrdemDoContrato(99)).toThrow(/estado de ordem invalido/i);
    expect(() => mapearEstadoDisputaDoContrato(-1)).toThrow(/estado de disputa invalido/i);
    expect(() => mapearEstadoPropostaDoContrato(8)).toThrow(/estado de proposta invalido/i);
  });

  it("normaliza entidades brutas do contrato", () => {
    expect(
      mapearOrdemDoContrato({
        id: 10,
        estado: 1,
        descricao: "  troca de sensor  ",
        cliente: "0xabc",
        tecnico: null,
        valorOrcamento: 150,
      }),
    ).toEqual({
      id: "10",
      estado: "em_andamento",
      descricao: "troca de sensor",
      cliente: "0xabc",
      tecnico: undefined,
      valorOrcamento: 150,
    });

    expect(
      mapearOrdemDoContrato({
        id: 12,
        estado: 0,
        descricao: "sem orcamento",
        cliente: "0xabc",
        tecnico: undefined,
        valorOrcamento: null,
      }),
    ).toEqual({
      id: "12",
      estado: "criada",
      descricao: "sem orcamento",
      cliente: "0xabc",
      tecnico: undefined,
      valorOrcamento: undefined,
    });

    expect(
      mapearDisputaDoContrato({
        id: 3,
        estado: 0,
        ordemId: 10,
        motivo: " falha comprovada ",
      }),
    ).toEqual({
      id: "3",
      estado: "aberta",
      ordemId: "10",
      motivo: "falha comprovada",
    });

    expect(
      mapearDisputaDoContrato({
        id: 4,
        estado: 1,
        ordemId: 11,
      }),
    ).toEqual({
      id: "4",
      estado: "janela_votacao",
      ordemId: "11",
      motivo: undefined,
    });

    expect(
      mapearPropostaDoContrato({
        id: 7,
        estado: 1,
        descricao: " nova regra ",
        duracaoEmDias: 7,
      }),
    ).toEqual({
      id: "7",
      estado: "ativa",
      descricao: "nova regra",
      duracaoEmDias: 7,
    });

    expect(
      mapearOrdemDoContrato({
        id: BigInt(11),
        estado: 1,
        descricao: "inspecao",
        cliente: "0xabc",
        tecnico: "0xtec",
        valorOrcamento: BigInt(220),
      }),
    ).toEqual({
      id: "11",
      estado: "em_andamento",
      descricao: "inspecao",
      cliente: "0xabc",
      tecnico: "0xtec",
      valorOrcamento: 220,
    });

    expect(
      mapearPropostaDoContrato({
        id: 8,
        estado: 1,
        descricao: "nova regra 2",
        duracaoEmDias: "9" as never,
      }),
    ).toEqual({
      id: "8",
      estado: "ativa",
      descricao: "nova regra 2",
      duracaoEmDias: 9,
    });

    expect(() =>
      mapearPropostaDoContrato({
        id: 8,
        estado: 1,
        descricao: "nova regra",
        duracaoEmDias: 7.5,
      }),
    ).toThrow(/inteiro valido/);
  });
});
import { describe, expect, it } from "vitest";
import {
  mapearDisputaDoContrato,
  mapearEvidenciaDoContrato,
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
        descricao: " nova regra ",
        proposer: "0xabc",
        votesFor: 10,
        votesAgainst: "3",
        deadline: 1710000000,
        executed: false,
        approved: true,
        action: 0,
        actionValue: 1500,
      }),
    ).toEqual({
      id: "7",
      descricao: "nova regra",
      proposer: "0xabc",
      votesFor: 10n,
      votesAgainst: 3n,
      deadline: "2024-03-09T16:00:00.000Z",
      executed: false,
      approved: true,
      action: "tokens_per_eth",
      actionValue: 1500n,
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
        descricao: "nova regra 2",
        proposer: "0xdef",
        action: 1,
        actionValue: "90000000000000000000" as never,
      }),
    ).toEqual({
      id: "8",
      descricao: "nova regra 2",
      proposer: "0xdef",
      action: "min_deposit",
      actionValue: 90000000000000000000n,
    });

    expect(() =>
      mapearPropostaDoContrato({
        id: 8,
        descricao: "nova regra",
        action: 2,
      }),
    ).toThrow(/acao de proposta invalida/i);
  });

  it("cobre ramos opcionais e validacoes de conversao", () => {
    expect(
      mapearDisputaDoContrato({
        id: 5,
        estado: 0,
        ordemId: 12,
        motivo: "  motivo  ",
        openedBy: "0xcliente",
        opposingParty: "0xtec",
        votesForOpener: 2,
        votesForOpposing: "3",
        deadline: 1710000000,
        resolved: true,
      }),
    ).toEqual({
      id: "5",
      estado: "aberta",
      ordemId: "12",
      motivo: "motivo",
      openedBy: "0xcliente",
      opposingParty: "0xtec",
      votesForOpener: 2n,
      votesForOpposing: 3n,
      deadline: "2024-03-09T16:00:00.000Z",
      resolved: true,
    });

    expect(
      mapearDisputaDoContrato({
        id: 6,
        estado: 1,
        ordemId: 13,
        votesForOpener: undefined,
        votesForOpposing: null,
        deadline: null,
        resolved: undefined,
      }),
    ).toEqual({
      id: "6",
      estado: "janela_votacao",
      ordemId: "13",
      motivo: undefined,
      openedBy: undefined,
      opposingParty: undefined,
      votesForOpener: undefined,
      votesForOpposing: undefined,
      deadline: undefined,
      resolved: undefined,
    });

    expect(
      mapearEvidenciaDoContrato({
        submittedBy: " 0xabc ",
        content: " evidencia ",
        timestamp: 1710000000,
      }),
    ).toEqual({
      submittedBy: "0xabc",
      content: "evidencia",
      timestamp: "2024-03-09T16:00:00.000Z",
    });

    expect(() =>
      mapearEvidenciaDoContrato({
        submittedBy: "",
        content: "evidencia",
        timestamp: 1710000000,
      }),
    ).toThrow(/autor da evidencia/);

    expect(() =>
      mapearDisputaDoContrato({
        id: 7,
        estado: 0,
        ordemId: 14,
        votesForOpener: 1.5,
      }),
    ).toThrow(/inteiro valido/);

    expect(() =>
      mapearDisputaDoContrato({
        id: 8,
        estado: 0,
        ordemId: 15,
        votesForOpposing: "abc",
      }),
    ).toThrow(/inteiro valido/);
  });
});

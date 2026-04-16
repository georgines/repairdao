import { describe, expect, it } from "vitest";
import {
  ehEstadoPropostaValido,
  governancaAtingiuQuorum,
  garantirEstadoProposta,
  garantirPodeCriarProposta,
  garantirPodeReceberVoto,
  garantirTransicaoProposta,
  propostaAprovada,
  propostaDuracaoValida,
  propostaPodeSerCriada,
  propostaPodeSerEncerrada,
  propostaPodeSerExecutada,
  propostaPodeIrParaEstado,
  propostaPodeReceberVoto,
} from "@/features/repairdao/services/governanca";

describe("governanca", () => {
  it("reconhece estados validos e invalidos", () => {
    expect(ehEstadoPropostaValido("ativa")).toBe(true);
    expect(ehEstadoPropostaValido("qualquer")).toBe(false);
  });

  it("lança erro para estado invalido", () => {
    expect(() => garantirEstadoProposta("qualquer")).toThrow(/Estado de proposta invalido/);
  });

  it("valida criacao de proposta e duracao", () => {
    expect(propostaPodeSerCriada(true, "Adicionar nova regra", 7)).toBe(true);
    expect(propostaPodeSerCriada(false, "Adicionar nova regra", 7)).toBe(false);
    expect(propostaDuracaoValida(1)).toBe(true);
    expect(propostaDuracaoValida(31)).toBe(false);
    expect(garantirPodeCriarProposta(true, "Adicionar nova regra", 7)).toBe(true);
    expect(() => garantirPodeCriarProposta(false, "", 7)).toThrow(/A proposta exige deposito ativo/);
  });

  it("valida votacao por tokens e janela aberta", () => {
    expect(propostaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false)).toBe(true);
    expect(propostaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 0, false)).toBe(false);
    expect(garantirPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false)).toBe(true);
  });

  it("respeita encerramento, execucao, quorum e transicoes", () => {
    expect(propostaPodeSerEncerrada(new Date("2026-04-02T10:00:00Z"), new Date("2026-04-01T10:00:00Z"))).toBe(true);
    expect(propostaPodeSerExecutada("encerrada", new Date("2026-04-02T10:00:00Z"), new Date("2026-04-01T10:00:00Z"), false)).toBe(true);
    expect(governancaAtingiuQuorum(1000)).toBe(true);
    expect(propostaAprovada(600, 200, 1000)).toBe(true);
    expect(propostaPodeIrParaEstado("rascunho", "ativa")).toBe(true);
    expect(garantirTransicaoProposta("encerrada", "executada")).toBe("executada");
  });
});

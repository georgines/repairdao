import { describe, expect, it } from "vitest";
import {
  ehEstadoPropostaValido,
  governancaAtingiuQuorum,
  garantirEstadoProposta,
  garantirDuracaoProposta,
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
} from "@/services/governanca";

describe("governanca", () => {
  it("reconhece estados validos e invalidos", () => {
    expect(ehEstadoPropostaValido("ativa")).toBe(true);
    expect(ehEstadoPropostaValido("qualquer")).toBe(false);
  });

  it("lança erro para estado invalido", () => {
    expect(() => garantirEstadoProposta("qualquer")).toThrow(/Estado de proposta invalido/);
  });

  it("valida criacao de proposta e duracao", () => {
    expect(propostaPodeSerCriada(true, false, "Adicionar nova regra")).toBe(true);
    expect(propostaPodeSerCriada(false, true, "Adicionar nova regra")).toBe(true);
    expect(propostaPodeSerCriada(false, false, "Adicionar nova regra")).toBe(false);
    expect(propostaDuracaoValida(300)).toBe(true);
    expect(propostaDuracaoValida(301)).toBe(false);
    expect(garantirPodeCriarProposta(true, false, "Adicionar nova regra")).toBe(true);
    expect(garantirPodeCriarProposta(false, true, "Adicionar nova regra")).toBe(true);
    expect(() => garantirPodeCriarProposta(false, false, "")).toThrow(/deposito ativo ou permissao de owner/);
    expect(() => garantirDuracaoProposta(301)).toThrow(/exatamente 300 segundos/);
  });

  it("valida votacao por tokens e janela aberta", () => {
    expect(propostaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false)).toBe(true);
    expect(propostaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 0, false)).toBe(false);
    expect(propostaPodeReceberVoto(new Date("2026-04-01T12:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false)).toBe(false);
    expect(propostaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, true)).toBe(false);
    expect(garantirPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false)).toBe(true);
    expect(() => garantirPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 0, false)).toThrow(/nao e permitido/);
    expect(() => garantirPodeReceberVoto(new Date("2026-04-01T12:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false)).toThrow(/nao e permitido/);
  });

  it("respeita encerramento, execucao, quorum e transicoes", () => {
    expect(propostaPodeSerEncerrada(new Date("2026-04-02T10:00:00Z"), new Date("2026-04-01T10:00:00Z"))).toBe(true);
    expect(propostaPodeSerEncerrada(new Date("2026-04-01T09:00:00Z"), new Date("2026-04-01T10:00:00Z"))).toBe(false);
    expect(propostaPodeSerExecutada("encerrada", new Date("2026-04-02T10:00:00Z"), new Date("2026-04-01T10:00:00Z"), false)).toBe(true);
    expect(propostaPodeSerExecutada("encerrada", new Date("2026-04-01T09:00:00Z"), new Date("2026-04-01T10:00:00Z"), false)).toBe(false);
    expect(propostaPodeSerExecutada("encerrada", new Date("2026-04-02T10:00:00Z"), new Date("2026-04-01T10:00:00Z"), true)).toBe(false);
    expect(governancaAtingiuQuorum(1000)).toBe(true);
    expect(governancaAtingiuQuorum(999)).toBe(false);
    expect(governancaAtingiuQuorum(0)).toBe(false);
    expect(propostaAprovada(600, 200, 1000)).toBe(true);
    expect(propostaAprovada(400, 500, 1000)).toBe(false);
    expect(propostaAprovada(600, 200, 999)).toBe(false);
    expect(propostaPodeIrParaEstado("rascunho", "ativa")).toBe(true);
    expect(garantirTransicaoProposta("encerrada", "executada")).toBe("executada");
    expect(() => garantirTransicaoProposta("rascunho", "executada")).toThrow(/Nao e permitido mover a proposta/);
  });
});

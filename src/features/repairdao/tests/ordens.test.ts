import { describe, expect, it } from "vitest";
import {
  garantirEstadoOrdem,
  garantirOrdemPodeSerCriada,
  garantirTransicaoOrdem,
  ehEstadoOrdemValido,
  ordemPodeEntrarEmDisputa,
  ordemPodeIrParaEstado,
  ordemPodeReceberOrcamento,
  ordemPodeSerAceita,
  ordemPodeSerConfirmada,
  ordemPodeSerConcluida,
  ordemPodeSerCriada,
  ordemPodeSerResolvida,
  orcamentoPodeSerEnviado,
} from "@/features/repairdao/services/ordens";

describe("ordens", () => {
  it("reconhece estados validos e invalidos", () => {
    expect(ehEstadoOrdemValido("criada")).toBe(true);
    expect(ehEstadoOrdemValido("qualquer")).toBe(false);
  });

  it("lança erro para estado invalido", () => {
    expect(() => garantirEstadoOrdem("qualquer")).toThrow(/Estado de ordem invalido/);
  });

  it("valida criacao de ordem e envio de orcamento", () => {
    expect(ordemPodeSerCriada("troca de pneu")).toBe(true);
    expect(ordemPodeSerCriada("   ")).toBe(false);
    expect(garantirOrdemPodeSerCriada("troca de pneu")).toBe("troca de pneu");
    expect(() => garantirOrdemPodeSerCriada("   ")).toThrow(/nao pode ser vazio/);
    expect(orcamentoPodeSerEnviado(1)).toBe(true);
    expect(() => orcamentoPodeSerEnviado(0)).toThrow(/maior que zero/);
  });

  it("respeita as transicoes validas de estado", () => {
    expect(ordemPodeIrParaEstado("criada", "em_andamento")).toBe(true);
    expect(ordemPodeIrParaEstado("em_andamento", "concluida")).toBe(true);
    expect(ordemPodeIrParaEstado("concluida", "resolvida")).toBe(false);
    expect(garantirTransicaoOrdem("disputada", "resolvida")).toBe("resolvida");
  });

  it("libera aceitacao, conclusao, confirmacao, disputa e resolucao nos estados corretos", () => {
    expect(ordemPodeReceberOrcamento("criada")).toBe(true);
    expect(ordemPodeSerAceita("criada")).toBe(true);
    expect(ordemPodeSerConcluida("em_andamento")).toBe(true);
    expect(ordemPodeSerConfirmada("concluida")).toBe(true);
    expect(ordemPodeEntrarEmDisputa("concluida")).toBe(true);
    expect(ordemPodeSerResolvida("disputada")).toBe(true);
  });
});

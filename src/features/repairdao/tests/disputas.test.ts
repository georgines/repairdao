import { describe, expect, it } from "vitest";
import {
  calcularSlashDoPerdedor,
  disputaPodeIrParaEstado,
  disputaPodeReceberEvidencia,
  disputaPodeReceberVoto,
  disputaPodeSerAberta,
  disputaPodeSerResolvida,
  ehEstadoDisputaValido,
  garantirEstadoDisputa,
  garantirPodeReceberVoto,
  garantirTransicaoDisputa,
  motivoDisputaValido,
} from "@/features/repairdao/services/disputas";

describe("disputas", () => {
  it("reconhece estados validos e invalidos", () => {
    expect(ehEstadoDisputaValido("aberta")).toBe(true);
    expect(ehEstadoDisputaValido("qualquer")).toBe(false);
  });

  it("lança erro para estado invalido", () => {
    expect(() => garantirEstadoDisputa("qualquer")).toThrow(/Estado de disputa invalido/);
  });

  it("valida motivo e janela de evidencia", () => {
    expect(motivoDisputaValido("falha no servico")).toBe(true);
    expect(disputaPodeReceberEvidencia(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), "foto do defeito")).toBe(true);
    expect(disputaPodeReceberEvidencia(new Date("2026-04-01T12:00:00Z"), new Date("2026-04-01T11:00:00Z"), "foto do defeito")).toBe(false);
    expect(disputaPodeReceberEvidencia(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), "   ")).toBe(false);
  });

  it("bloqueia voto para parte envolvida, ja votante e sem tokens", () => {
    expect(disputaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false, false)).toBe(true);
    expect(disputaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, true, false)).toBe(false);
    expect(disputaPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false, true)).toBe(false);
    expect(disputaPodeReceberVoto(new Date("2026-04-01T12:00:00Z"), new Date("2026-04-01T11:00:00Z"), 1, false, false)).toBe(false);
    expect(() => garantirPodeReceberVoto(new Date("2026-04-01T10:00:00Z"), new Date("2026-04-01T11:00:00Z"), 0, false, false)).toThrow(/nao e permitido/);
  });

  it("respeita transicoes validas e calculo de slash", () => {
    expect(disputaPodeSerAberta("concluida")).toBe(true);
    expect(disputaPodeSerAberta("em_andamento")).toBe(true);
    expect(disputaPodeIrParaEstado("aberta", "janela_votacao")).toBe(true);
    expect(disputaPodeSerResolvida("encerrada", new Date("2026-04-02T10:00:00Z"), new Date("2026-04-01T10:00:00Z"))).toBe(true);
    expect(disputaPodeSerResolvida("encerrada", new Date("2026-04-01T09:00:00Z"), new Date("2026-04-01T10:00:00Z"))).toBe(false);
    expect(garantirTransicaoDisputa("janela_votacao", "encerrada")).toBe("encerrada");
    expect(() => garantirTransicaoDisputa("aberta", "resolvida")).toThrow(/Nao e permitido mover a disputa/);
    expect(calcularSlashDoPerdedor(100)).toBe(20);
  });
});

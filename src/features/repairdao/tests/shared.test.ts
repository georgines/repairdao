import { describe, expect, it } from "vitest";
import { garantirTransicaoEstado, garantirValorPermitido, ehValorPermitido, clamp } from "@/features/repairdao/services/shared";

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
});

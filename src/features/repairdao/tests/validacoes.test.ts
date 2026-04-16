import { describe, expect, it } from "vitest";
import {
  depositoAtivoValido,
  duracaoPropostaValida,
  inteiroEntre,
  garantirDepositoAtivo,
  garantirDuracaoProposta,
  garantirInteiroEntre,
  garantirNumeroMaiorQueZero,
  garantirNotaEntreUmECinco,
  garantirTextoNaoVazio,
  garantirTokensPositivos,
  numeroMaiorQueZero,
  notaEntreUmECinco,
  textoNaoVazio,
  tokensPositivos,
} from "@/features/repairdao/services/validacoes";

describe("validacoes", () => {
  it("valida texto nao vazio", () => {
    expect(textoNaoVazio("  texto  ")).toBe(true);
    expect(textoNaoVazio("   ")).toBe(false);
    expect(garantirTextoNaoVazio("  texto  ", "descricao")).toBe("texto");
    expect(() => garantirTextoNaoVazio("   ", "descricao")).toThrow(/nao pode ser vazio/);
  });

  it("valida numeros maiores que zero", () => {
    expect(numeroMaiorQueZero(1)).toBe(true);
    expect(numeroMaiorQueZero(0)).toBe(false);
    expect(garantirNumeroMaiorQueZero(1, "valor")).toBe(1);
    expect(() => garantirNumeroMaiorQueZero(0, "valor")).toThrow(/maior que zero/);
  });

  it("valida inteiros em faixa e nota entre um e cinco", () => {
    expect(inteiroEntre(3, 1, 5)).toBe(true);
    expect(garantirInteiroEntre(3, 1, 5, "faixa")).toBe(3);
    expect(notaEntreUmECinco(5)).toBe(true);
    expect(garantirNotaEntreUmECinco(5, "nota")).toBe(5);
    expect(() => garantirInteiroEntre(6, 1, 5, "faixa")).toThrow(/entre 1 e 5/);
  });

  it("valida tokens, deposito e duracao de proposta", () => {
    expect(tokensPositivos(1)).toBe(true);
    expect(depositoAtivoValido(true)).toBe(true);
    expect(duracaoPropostaValida(30)).toBe(true);
    expect(garantirTokensPositivos(1, "voto")).toBe(1);
    expect(garantirDuracaoProposta(30)).toBe(30);
    expect(() => garantirDepositoAtivo(false, "acao")).toThrow(/exige deposito ativo/);
  });
});

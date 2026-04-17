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
} from "@/services/validacoes";

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
    expect(() => garantirInteiroEntre(3.5, 1, 5, "faixa")).toThrow(/entre 1 e 5/);
  });

  it("valida tokens, deposito e duracao de proposta", () => {
    expect(tokensPositivos(1)).toBe(true);
    expect(tokensPositivos(0)).toBe(false);
    expect(tokensPositivos(undefined)).toBe(false);
    expect(depositoAtivoValido(true)).toBe(true);
    expect(depositoAtivoValido(false)).toBe(false);
    expect(duracaoPropostaValida(30)).toBe(true);
    expect(duracaoPropostaValida(31)).toBe(false);
    expect(garantirTokensPositivos(1, "voto")).toBe(1);
    expect(() => garantirTokensPositivos(0, "voto")).toThrow(/maior que zero/);
    expect(() => garantirTokensPositivos(undefined, "voto")).toThrow(/maior que zero/);
    expect(garantirDuracaoProposta(30)).toBe(30);
    expect(() => garantirDuracaoProposta(0)).toThrow(/duracao da proposta/);
    expect(() => garantirDuracaoProposta(31)).toThrow(/duracao da proposta/);
    expect(() => garantirDepositoAtivo(false, "acao")).toThrow(/exige deposito ativo/);
  });
});

import { describe, expect, it } from "vitest";
import {
  aplicarAvaliacaoReputacao,
  badgePodeExistir,
  calcularNivelBadgePorReputacao,
  ehDirecaoAvaliacaoValida,
  garantirDirecaoAvaliacao,
  nivelReputacaoDoTotalDePontos,
  reputacaoPodeCairAbaixoDoNivelUm,
  reputacaoValidaParaAvaliacao,
} from "@/features/repairdao/services/reputacao";

describe("reputacao", () => {
  it("reconhece direcoes validas e invalidas", () => {
    expect(ehDirecaoAvaliacaoValida("positiva")).toBe(true);
    expect(ehDirecaoAvaliacaoValida("neutra")).toBe(false);
  });

  it("lança erro para direcao invalida", () => {
    expect(() => garantirDirecaoAvaliacao("neutra")).toThrow(/Direcao de avaliacao invalida/);
  });

  it("calcula nivel de reputacao por pontos com limite minimo e maximo", () => {
    expect(nivelReputacaoDoTotalDePontos(0)).toBe(1);
    expect(nivelReputacaoDoTotalDePontos(5)).toBe(2);
    expect(nivelReputacaoDoTotalDePontos(25)).toBe(5);
  });

  it("aplica avaliacao positiva e negativa com clamp em zero", () => {
    expect(aplicarAvaliacaoReputacao(3, { direcao: "positiva", nota: 2 })).toBe(5);
    expect(aplicarAvaliacaoReputacao(3, { direcao: "negativa", nota: 4 })).toBe(0);
  });

  it("calcula badge alinhado a reputacao e respeita elegibilidade", () => {
    expect(calcularNivelBadgePorReputacao(1)).toBe(1);
    expect(calcularNivelBadgePorReputacao(5)).toBe(5);
    expect(badgePodeExistir(false, 2)).toBe(true);
    expect(badgePodeExistir(true, 1)).toBe(true);
    expect(badgePodeExistir(false, 1)).toBe(false);
    expect(reputacaoPodeCairAbaixoDoNivelUm(0)).toBe(true);
    expect(reputacaoPodeCairAbaixoDoNivelUm(1)).toBe(false);
    expect(reputacaoValidaParaAvaliacao(5)).toBe(true);
    expect(reputacaoValidaParaAvaliacao(0)).toBe(false);
  });
});

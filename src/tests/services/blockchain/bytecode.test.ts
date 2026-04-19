import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { bytecodeIgualIgnorandoImutaveis, normalizarBytecodeIgnorandoImutaveis } from "@/services/blockchain/bytecode";

function gerarEnderecoHex(seed: string): string {
  return `0x${createHash("sha256").update(seed).digest("hex").slice(0, 40)}`;
}

describe("bytecode", () => {
  it("normaliza enderecos embutidos sem alterar o tamanho do bytecode", () => {
    const enderecoToken = gerarEnderecoHex("RepairToken");
    const enderecoDeposit = gerarEnderecoHex("RepairDeposit");
    const bytecode = `0x6000${enderecoToken.slice(2)}61ff${enderecoDeposit.slice(2)}6001`;

    const normalizado = normalizarBytecodeIgnorandoImutaveis(bytecode, [enderecoToken, enderecoDeposit]);

    expect(normalizado).toContain("0".repeat(40));
    expect(normalizado).not.toContain(enderecoToken.toLowerCase().slice(2));
    expect(normalizado).not.toContain(enderecoDeposit.toLowerCase().slice(2));
    expect(normalizado.length).toBe(bytecode.toLowerCase().length);
  });

  it("considera bytecodes equivalentes quando a diferenca e apenas imutavel embutido", () => {
    const enderecoReputation = gerarEnderecoHex("RepairReputation");
    const bytecodeEsperado = `0x6000${"0".repeat(40)}61ff`;
    const bytecodeObtido = `0x6000${enderecoReputation.slice(2)}61ff`;

    expect(bytecodeIgualIgnorandoImutaveis(bytecodeEsperado, bytecodeObtido, [enderecoReputation])).toBe(true);
  });

  it("continua detectando bytecodes diferentes fora dos trechos imutaveis", () => {
    const enderecoEscrow = gerarEnderecoHex("RepairEscrow");
    const bytecodeEsperado = `0x6000${"0".repeat(40)}61ff`;
    const bytecodeObtido = `0x6001${enderecoEscrow.slice(2)}62ff`;

    expect(bytecodeIgualIgnorandoImutaveis(bytecodeEsperado, bytecodeObtido, [enderecoEscrow])).toBe(false);
  });

  it("ignora enderecos vazios e duplicados na normalizacao", () => {
    expect(normalizarBytecodeIgnorandoImutaveis("0x6000deadbeef", ["", "0xabc", "0xabc"])).toBe("0x6000deadbeef");
  });
});

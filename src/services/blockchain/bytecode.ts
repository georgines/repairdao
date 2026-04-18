const ENDERECO_HEX_LENGTH = 40;

function normalizarEnderecoHex(endereco: string): string {
  return endereco.trim().toLowerCase().replace(/^0x/, "");
}

export function normalizarBytecodeIgnorandoImutaveis(
  bytecode: string,
  enderecos: readonly string[],
): string {
  let normalizado = bytecode.trim().toLowerCase();

  for (const endereco of new Set(enderecos.map(normalizarEnderecoHex))) {
    if (!endereco) {
      continue;
    }

    normalizado = normalizado.replaceAll(endereco, "0".repeat(ENDERECO_HEX_LENGTH));
  }

  return normalizado;
}

export function bytecodeIgualIgnorandoImutaveis(
  bytecodeEsperado: string,
  bytecodeObtido: string,
  enderecos: readonly string[],
): boolean {
  return (
    normalizarBytecodeIgnorandoImutaveis(bytecodeEsperado, enderecos) ===
    normalizarBytecodeIgnorandoImutaveis(bytecodeObtido, enderecos)
  );
}

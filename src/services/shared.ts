import { RepairDAODominioError } from "@/erros/errors";

export function ehValorPermitido<T extends string>(valor: string, valores: readonly T[]): valor is T {
  return valores.includes(valor as T);
}

export function garantirValorPermitido<T extends string>(
  valor: string,
  valores: readonly T[],
  erroCodigo: string,
  mensagem: string,
): T {
  if (!ehValorPermitido(valor, valores)) {
    throw new RepairDAODominioError(erroCodigo, mensagem, { valor });
  }

  return valor as T;
}

export function garantirTransicaoEstado<T extends string>(
  estadoAtual: T,
  proximoEstado: T,
  transicoesValidas: Record<T, readonly T[]>,
  erroCodigo: string,
  entidade: string,
): T {
  if (!transicoesValidas[estadoAtual].includes(proximoEstado)) {
    throw new RepairDAODominioError(
      erroCodigo,
      `Nao e permitido mover ${entidade} de ${estadoAtual} para ${proximoEstado}.`,
      { estadoAtual, proximoEstado },
    );
  }

  return proximoEstado;
}

export function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

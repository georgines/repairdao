import { RepairDAODominioError } from "@/erros/errors";
import type { Contract } from "ethers";

export async function executarFuncaoContrato<T>(
  contract: Contract,
  functionName: string,
  args: readonly unknown[],
): Promise<T> {
  const fn = Reflect.get(contract, functionName);

  if (typeof fn !== "function") {
    throw new RepairDAODominioError("funcao_contrato_invalida", `A funcao ${functionName} nao existe no contrato informado.`, {
      functionName,
    });
  }

  return await fn.apply(contract, args);
}

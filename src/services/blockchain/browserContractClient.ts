import { BrowserProvider, Contract } from "ethers";
import { executarFuncaoContrato } from "@/services/blockchain/contractExecutor";
import type { ContractCallInput, RepairDAOContractClient } from "@/services/blockchain/contractClient";
import type { EthereumProvider } from "@/services/wallet/provider";

export function criarRepairDAOBrowserContractClient(ethereumOuProvider: EthereumProvider | BrowserProvider): RepairDAOContractClient {
  const provider = ethereumOuProvider instanceof BrowserProvider
    ? ethereumOuProvider
    : new BrowserProvider(ethereumOuProvider as never);
  let signerPromise: ReturnType<BrowserProvider["getSigner"]> | null = null;
  const contratosLeitura = new Map<string, Contract>();
  const contratosEscrita = new Map<string, Contract>();

  function criarChaveContrato(call: ContractCallInput, contexto: "read" | "write") {
    return `${contexto}:${call.address}:${JSON.stringify(call.abi)}`;
  }

  return {
    async readContract<T = unknown>(call: ContractCallInput): Promise<T> {
      const chave = criarChaveContrato(call, "read");
      const contract = contratosLeitura.get(chave) ?? new Contract(call.address, call.abi, provider);
      contratosLeitura.set(chave, contract);
      return await executarFuncaoContrato<T>(contract, call.functionName, call.args ?? []);
    },

    async writeContract(call: ContractCallInput): Promise<unknown> {
      const signer = await (signerPromise ??= provider.getSigner());
      const chave = criarChaveContrato(call, "write");
      const contract = contratosEscrita.get(chave) ?? new Contract(call.address, call.abi, signer);
      contratosEscrita.set(chave, contract);
      return await executarFuncaoContrato(contract, call.functionName, call.args ?? []);
    },
  };
}

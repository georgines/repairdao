import { Contract, JsonRpcProvider, Wallet, type InterfaceAbi } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";

export interface ContractCallInput {
  address: string;
  abi: InterfaceAbi;
  functionName: string;
  args?: readonly unknown[];
}

export interface RepairDAOContractClient {
  readContract<T = unknown>(input: ContractCallInput): Promise<T>;
  writeContract(input: ContractCallInput): Promise<unknown>;
}

export interface CriarRepairDAOContractClientInput {
  rpcUrl: string;
  privateKey: string;
}

function garantirConfiguracaoValida(input: CriarRepairDAOContractClientInput): void {
  if (!input.rpcUrl.trim()) {
    throw new RepairDAODominioError("rpc_invalido", "A URL RPC do contrato nao pode ser vazia.");
  }

  if (!input.privateKey.trim()) {
    throw new RepairDAODominioError("chave_privada_invalida", "A chave privada para escrita nao pode ser vazia.");
  }
}

export function criarRepairDAOContractClient(
  input: CriarRepairDAOContractClientInput,
): RepairDAOContractClient {
  garantirConfiguracaoValida(input);

  const provider = new JsonRpcProvider(input.rpcUrl);
  const signer = new Wallet(input.privateKey, provider);

  return {
    async readContract<T = unknown>(call: ContractCallInput): Promise<T> {
      const contract = new Contract(call.address, call.abi, provider);
      const fn = contract.getFunction(call.functionName);
      return await fn.staticCall(...(call.args ?? []));
    },

    async writeContract(call: ContractCallInput): Promise<unknown> {
      const contract = new Contract(call.address, call.abi, signer);
      const fn = contract.getFunction(call.functionName);
      return await fn.send(...(call.args ?? []));
    },
  };
}
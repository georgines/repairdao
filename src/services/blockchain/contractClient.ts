import { Contract, JsonRpcProvider, Wallet, type InterfaceAbi } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { executarFuncaoContrato } from "@/services/blockchain/contractExecutor";

export interface ContractCallInput {
  address: string;
  abi: InterfaceAbi;
  functionName: string;
  args?: readonly unknown[];
}

export interface RepairDAOContractClient {
  readContract<T = unknown>(input: ContractCallInput): Promise<T>;
  writeContract?(input: ContractCallInput): Promise<unknown>;
}

export interface CriarRepairDAOContractClientInput {
  rpcUrl: string;
  privateKey?: string;
}

function criarChaveContrato(call: ContractCallInput, contexto: "read" | "write") {
  return `${contexto}:${call.address}:${JSON.stringify(call.abi)}`;
}

function garantirConfiguracaoValida(input: CriarRepairDAOContractClientInput): void {
  if (!input.rpcUrl.trim()) {
    throw new RepairDAODominioError("rpc_invalido", "A URL RPC do contrato nao pode ser vazia.");
  }

  if (input.privateKey !== undefined && !input.privateKey.trim()) {
    throw new RepairDAODominioError("chave_privada_invalida", "A chave privada para escrita nao pode ser vazia.");
  }
}

export function criarRepairDAOContractClient(
  input: CriarRepairDAOContractClientInput,
): RepairDAOContractClient {
  garantirConfiguracaoValida(input);

  const provider = new JsonRpcProvider(input.rpcUrl);
  const signer = input.privateKey ? new Wallet(input.privateKey, provider) : null;
  const contratosLeitura = new Map<string, Contract>();
  const contratosEscrita = new Map<string, Contract>();

  const client: RepairDAOContractClient = {
    async readContract<T = unknown>(call: ContractCallInput): Promise<T> {
      const chave = criarChaveContrato(call, "read");
      const contract = contratosLeitura.get(chave) ?? new Contract(call.address, call.abi, provider);
      contratosLeitura.set(chave, contract);
      return await executarFuncaoContrato<T>(contract, call.functionName, call.args ?? []);
    },
  };

  if (signer) {
    client.writeContract = async (call: ContractCallInput): Promise<unknown> => {
      const chave = criarChaveContrato(call, "write");
      const contract = contratosEscrita.get(chave) ?? new Contract(call.address, call.abi, signer);
      contratosEscrita.set(chave, contract);
      return await executarFuncaoContrato(contract, call.functionName, call.args ?? []);
    };
  }

  return client;
}

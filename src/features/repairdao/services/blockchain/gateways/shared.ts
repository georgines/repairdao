import { RepairDAODominioError } from "@/features/repairdao/errors";
import type { ContractCallInput, RepairDAOContractClient } from "@/features/repairdao/services/blockchain/contractClient";
import type { InterfaceAbi } from "ethers";

export const ENDERECO_ZERO = "0x0000000000000000000000000000000000000000";

export interface GatewayContratoBase {
  readContract<T = unknown>(input: Omit<ContractCallInput, "address" | "abi">): Promise<T>;
  writeContract(input: Omit<ContractCallInput, "address" | "abi">): Promise<unknown>;
}

export interface GatewayContratoConfig {
  address: string;
  abi: InterfaceAbi;
}

export function garantirEscritaDisponivel(contractClient: RepairDAOContractClient): void {
  if (!contractClient.writeContract) {
    throw new RepairDAODominioError("escrita_indisponivel", "O client de escrita do contrato nao foi configurado.");
  }
}

export function criarGatewayContrato(
  contractClient: RepairDAOContractClient,
  contrato: GatewayContratoConfig,
): GatewayContratoBase {
  return {
    async readContract<T = unknown>(input: Omit<ContractCallInput, "address" | "abi">) {
      return contractClient.readContract<T>({
        ...input,
        address: contrato.address,
        abi: contrato.abi,
      });
    },

    async writeContract(input: Omit<ContractCallInput, "address" | "abi">) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        ...input,
        address: contrato.address,
        abi: contrato.abi,
      });
    },
  };
}

export function normalizarNumero(valor: unknown, campo: string): number {
  const numero = typeof valor === "bigint" ? Number(valor) : typeof valor === "string" ? Number(valor) : valor;

  if (typeof numero !== "number" || !Number.isFinite(numero) || !Number.isInteger(numero)) {
    throw new RepairDAODominioError("valor_contrato_invalido", `O campo ${campo} precisa ser um inteiro valido.`, {
      campo,
      valor,
    });
  }

  return numero;
}

export function normalizarEndereco(valor: unknown, campo: string): string | null {
  if (valor === undefined || valor === null) {
    return null;
  }

  if (typeof valor !== "string") {
    throw new RepairDAODominioError("valor_contrato_invalido", `O campo ${campo} precisa ser um endereco valido.`, {
      campo,
      valor,
    });
  }

  if (!valor || valor === ENDERECO_ZERO) {
    return null;
  }

  return valor;
}

export function normalizarTextoOpcional(valor: unknown): string | undefined {
  if (typeof valor !== "string") {
    return undefined;
  }

  const texto = valor.trim();

  return texto ? texto : undefined;
}

export function obterTextoDeContrato(registro: Record<string, unknown>, nomes: string[]): string {
  for (const nome of nomes) {
    const valor = registro[nome];
    if (typeof valor === "string") {
      return valor;
    }
  }

  throw new RepairDAODominioError("valor_contrato_invalido", `O contrato nao retornou nenhum campo textual entre ${nomes.join(", ")}.`, {
    nomes,
  });
}

export function obterValorDeContrato(registro: Record<string, unknown>, nomes: string[]): unknown {
  for (const nome of nomes) {
    const valor = registro[nome];
    if (valor !== undefined) {
      return valor;
    }
  }

  return undefined;
}

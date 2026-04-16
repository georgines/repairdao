import { RepairDAODominioError } from "@/features/repairdao/errors";
import type { RepairDAOBlockchainGateway } from "@/features/repairdao/services/blockchain/repairdaoBlockchain";
import { contratos } from "@/contracts";
import type { DisputaContratoBruta, OrdemContratoBruta } from "@/features/repairdao/services/blockchain/adapters";
import type { RepairDAOContractClient } from "@/features/repairdao/services/blockchain/contractClient";
import type { InterfaceAbi } from "ethers";

const ENDERECO_ZERO = "0x0000000000000000000000000000000000000000";

const REPAIR_ESCROW_ABI = [
  {
    type: "function",
    name: "createOrder",
    stateMutability: "nonpayable",
    inputs: [{ name: "description", type: "string" }],
    outputs: [{ name: "orderId", type: "uint256" }],
  },
  {
    type: "function",
    name: "submitBudget",
    stateMutability: "nonpayable",
    inputs: [
      { name: "orderId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "openDispute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "orderId", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getOrder",
    stateMutability: "view",
    inputs: [{ name: "ordemId", type: "uint256" }],
    outputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "estado", type: "uint8" },
          { name: "descricao", type: "string" },
          { name: "cliente", type: "address" },
          { name: "tecnico", type: "address" },
          { name: "valorOrcamento", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getDispute",
    stateMutability: "view",
    inputs: [{ name: "disputaId", type: "uint256" }],
    outputs: [
      {
        name: "dispute",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "estado", type: "uint8" },
          { name: "ordemId", type: "uint256" },
          { name: "motivo", type: "string" },
        ],
      },
    ],
  },
] as const satisfies InterfaceAbi;

const REPAIRDAO_CONTRACTOS = {
  escrow: {
    address: contratos.RepairEscrow,
    abi: REPAIR_ESCROW_ABI,
  },
} as const;

function garantirEscritaDisponivel(contractClient: RepairDAOContractClient): void {
  if (!contractClient.writeContract) {
    throw new RepairDAODominioError("escrita_indisponivel", "O client de escrita do contrato nao foi configurado.");
  }
}

function normalizarNumero(valor: unknown, campo: string): number {
  const numero = typeof valor === "bigint" ? Number(valor) : typeof valor === "string" ? Number(valor) : valor;

  if (typeof numero !== "number" || !Number.isFinite(numero) || !Number.isInteger(numero)) {
    throw new RepairDAODominioError("valor_contrato_invalido", `O campo ${campo} precisa ser um inteiro valido.`, {
      campo,
      valor,
    });
  }

  return numero;
}

function normalizarEndereco(valor: unknown, campo: string): string | null {
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

function normalizarTextoOpcional(valor: unknown): string | undefined {
  if (typeof valor !== "string") {
    return undefined;
  }

  const texto = valor.trim();

  return texto ? texto : undefined;
}

function obterTextoDeContrato(registro: Record<string, unknown>, nomes: string[]): string {
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

function registrarOrdemVazia(registro: Record<string, unknown>): boolean {
  const id = registro.id ?? registro.orderId ?? registro.order_id;

  if (id === undefined || id === null) {
    return true;
  }

  return normalizarNumero(id, "id da ordem") === 0;
}

function registrarDisputaVazia(registro: Record<string, unknown>): boolean {
  const ordemId = registro.orderId ?? registro.ordemId ?? registro.order_id;

  if (ordemId === undefined || ordemId === null) {
    return true;
  }

  return normalizarNumero(ordemId, "id da disputa") === 0;
}

function obterValorDeContrato(registro: Record<string, unknown>, nomes: string[]): unknown {
  for (const nome of nomes) {
    const valor = registro[nome];
    if (valor !== undefined) {
      return valor;
    }
  }

  return undefined;
}

function derivarEstadoDaDisputa(registro: Record<string, unknown>): "aberta" | "janela_votacao" | "encerrada" | "resolvida" {
  if (registro.resolved === true) {
    return "resolvida";
  }

  const deadline = registro.deadline;
  if (deadline !== undefined && deadline !== null) {
    const limite = normalizarNumero(deadline, "deadline da disputa");
    if (Math.floor(Date.now() / 1000) >= limite) {
      return "encerrada";
    }
  }

  return "janela_votacao";
}

function normalizarOrdemContrato(registro: Record<string, unknown>): OrdemContratoBruta | null {
  if (registrarOrdemVazia(registro)) {
    return null;
  }

  const id = obterValorDeContrato(registro, ["id", "orderId", "order_id"]);
  const estado = obterValorDeContrato(registro, ["state", "estado"]);
  const valorOrcamento = obterValorDeContrato(registro, ["amount", "valorOrcamento"]);
  const valorOrcamentoNormalizado =
    valorOrcamento === undefined || valorOrcamento === null
      ? null
      : normalizarNumero(valorOrcamento, "valor do orcamento");

  return {
    id: id as OrdemContratoBruta["id"],
    estado: (estado ?? 0) as OrdemContratoBruta["estado"],
    descricao: obterTextoDeContrato(registro, ["description", "descricao"]),
    cliente: obterTextoDeContrato(registro, ["client", "cliente"]),
    tecnico: normalizarEndereco(registro.technician ?? registro.tecnico, "tecnico da ordem"),
    valorOrcamento: valorOrcamentoNormalizado === 0 ? null : (valorOrcamentoNormalizado as OrdemContratoBruta["valorOrcamento"]),
  };
}

function normalizarDisputaContrato(registro: Record<string, unknown>): DisputaContratoBruta | null {
  if (registrarDisputaVazia(registro)) {
    return null;
  }

  const ordemId = obterValorDeContrato(registro, ["orderId", "ordemId", "order_id"]);

  return {
    id: ordemId as DisputaContratoBruta["id"],
    estado: derivarEstadoDaDisputa(registro),
    ordemId: ordemId as DisputaContratoBruta["ordemId"],
    motivo: normalizarTextoOpcional(registro.reason ?? registro.motivo),
  };
}

export function criarEthersRepairDAOGateway(contractClient: RepairDAOContractClient): RepairDAOBlockchainGateway {
  return {
    async criarOrdem(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "createOrder",
        args: [input.descricao],
      });
    },

    async enviarOrcamento(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "submitBudget",
        args: [input.ordemId, input.valor],
      });
    },

    async abrirDisputa(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "openDispute",
        args: [input.ordemId, input.motivo],
      });
    },

    async buscarOrdem(ordemId) {
      const ordem = await contractClient.readContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "getOrder",
        args: [ordemId],
      });

      return ordem ? normalizarOrdemContrato(ordem as Record<string, unknown>) : null;
    },

    async buscarDisputa(disputaId) {
      const disputa = await contractClient.readContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "getDispute",
        args: [disputaId],
      });

      return disputa ? normalizarDisputaContrato(disputa as Record<string, unknown>) : null;
    },
  };
}
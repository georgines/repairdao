import { RepairDAODominioError } from "@/features/repairdao/errors";
import type { RepairDAOBlockchainGateway } from "@/features/repairdao/services/blockchain/repairdaoBlockchain";
import { contratos } from "@/contracts";
import type { DisputaContratoBruta, OrdemContratoBruta } from "@/features/repairdao/services/blockchain/adapters";
import type { ContractCallInput, RepairDAOContractClient } from "@/features/repairdao/services/blockchain/contractClient";
import type { InterfaceAbi } from "ethers";

const ENDERECO_ZERO = "0x0000000000000000000000000000000000000000";

interface GatewayContratoBase {
  readContract<T = unknown>(input: Omit<ContractCallInput, "address" | "abi">): Promise<T>;
  writeContract(input: Omit<ContractCallInput, "address" | "abi">): Promise<unknown>;
}

const REPAIR_TOKEN_ABI = [
  {
    type: "function",
    name: "buy",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setTokensPerEth",
    stateMutability: "nonpayable",
    inputs: [{ name: "newRate", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const satisfies InterfaceAbi;

const REPAIR_BADGE_ABI = [
  {
    type: "function",
    name: "authorizeContract",
    stateMutability: "nonpayable",
    inputs: [{ name: "contractAddress", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "mintBadge",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "burnBadge",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "updateBadge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "newLevel", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getLevelName",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "levelName", type: "string" }],
  },
  {
    type: "function",
    name: "getBadgeLevel",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "level", type: "uint8" }],
  },
] as const satisfies InterfaceAbi;

const REPAIR_DEPOSIT_ABI = [
  {
    type: "function",
    name: "authorizeContract",
    stateMutability: "nonpayable",
    inputs: [{ name: "contractAddress", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setRepairReputation",
    stateMutability: "nonpayable",
    inputs: [{ name: "reputationAddress", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getEthUsdPrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "price", type: "int256" }],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "isTechnician", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getRewards",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "rewards", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdrawRewards",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawDeposit",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "slash",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "percent", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateRate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "newRate", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isActive",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "active", type: "bool" }],
  },
  {
    type: "function",
    name: "setMinDeposit",
    stateMutability: "nonpayable",
    inputs: [{ name: "newMin", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setSlashPercent",
    stateMutability: "nonpayable",
    inputs: [{ name: "percent", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getDeposit",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "deposit",
        type: "tuple",
        components: [
          { name: "amount", type: "uint256" },
          { name: "depositedAt", type: "uint256" },
          { name: "lastClaimedAt", type: "uint256" },
          { name: "customRate", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "isTechnician", type: "bool" },
        ],
      },
    ],
  },
] as const satisfies InterfaceAbi;

const REPAIR_REPUTATION_ABI = [
  {
    type: "function",
    name: "authorizeContract",
    stateMutability: "nonpayable",
    inputs: [{ name: "contractAddress", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "registerUser",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "rate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rated", type: "address" },
      { name: "rating", type: "uint8" },
      { name: "serviceId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "rateFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rater", type: "address" },
      { name: "rated", type: "address" },
      { name: "rating", type: "uint8" },
      { name: "serviceId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "penalize",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "reward",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getLevel",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "level", type: "uint8" }],
  },
  {
    type: "function",
    name: "getAverageRating",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "averageRating", type: "uint256" }],
  },
  {
    type: "function",
    name: "getReputation",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "reputation",
        type: "tuple",
        components: [
          { name: "level", type: "uint8" },
          { name: "totalPoints", type: "uint256" },
          { name: "positiveRatings", type: "uint256" },
          { name: "negativeRatings", type: "uint256" },
          { name: "totalRatings", type: "uint256" },
          { name: "ratingSum", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getUserRate",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "rate", type: "uint256" }],
  },
] as const satisfies InterfaceAbi;

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

const REPAIR_GOVERNANCE_ABI = [
  {
    type: "function",
    name: "createProposal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "description", type: "string" },
      { name: "durationDays", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "vote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "executeProposal",
    stateMutability: "nonpayable",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getProposal",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      {
        name: "proposal",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "proposer", type: "address" },
          { name: "description", type: "string" },
          { name: "votesFor", type: "uint256" },
          { name: "votesAgainst", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "approved", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "setQuorum",
    stateMutability: "nonpayable",
    inputs: [{ name: "newQuorum", type: "uint256" }],
    outputs: [],
  },
] as const satisfies InterfaceAbi;

const REPAIRDAO_CONTRACTOS = {
  token: {
    address: contratos.RepairToken,
    abi: REPAIR_TOKEN_ABI,
  },
  badge: {
    address: contratos.RepairBadge,
    abi: REPAIR_BADGE_ABI,
  },
  deposit: {
    address: contratos.RepairDeposit,
    abi: REPAIR_DEPOSIT_ABI,
  },
  reputation: {
    address: contratos.RepairReputation,
    abi: REPAIR_REPUTATION_ABI,
  },
  escrow: {
    address: contratos.RepairEscrow,
    abi: REPAIR_ESCROW_ABI,
  },
  governance: {
    address: contratos.RepairGovernance,
    abi: REPAIR_GOVERNANCE_ABI,
  },
} as const;

function criarGatewayContrato(
  contractClient: RepairDAOContractClient,
  contrato: (typeof REPAIRDAO_CONTRACTOS)[keyof typeof REPAIRDAO_CONTRACTOS],
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

export function criarRepairTokenGateway(contractClient: RepairDAOContractClient): GatewayContratoBase {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.token);
}

export function criarRepairBadgeGateway(contractClient: RepairDAOContractClient): GatewayContratoBase {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.badge);
}

export function criarRepairDepositGateway(contractClient: RepairDAOContractClient): GatewayContratoBase {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.deposit);
}

export function criarRepairReputationGateway(contractClient: RepairDAOContractClient): GatewayContratoBase {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.reputation);
}

export function criarRepairEscrowGateway(contractClient: RepairDAOContractClient): GatewayContratoBase {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.escrow);
}

export function criarRepairGovernanceGateway(contractClient: RepairDAOContractClient): GatewayContratoBase {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.governance);
}

export function criarGatewaysRepairDAO(contractClient: RepairDAOContractClient) {
  return {
    token: criarRepairTokenGateway(contractClient),
    badge: criarRepairBadgeGateway(contractClient),
    deposit: criarRepairDepositGateway(contractClient),
    reputation: criarRepairReputationGateway(contractClient),
    escrow: criarRepairEscrowGateway(contractClient),
    governance: criarRepairGovernanceGateway(contractClient),
  };
}

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
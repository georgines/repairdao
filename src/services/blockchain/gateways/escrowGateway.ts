import type { RepairDAOContractClient } from "@/services/blockchain/contractClient";
import type { RepairDAOBlockchainGateway } from "@/services/blockchain/repairdaoBlockchain";
import type { DisputaContratoBruta, OrdemContratoBruta } from "@/services/blockchain/adapters";
import { criarGatewayContrato, normalizarEndereco, normalizarNumero, normalizarTextoOpcional, obterTextoDeContrato, obterValorDeContrato, garantirEscritaDisponivel, type GatewayContratoBase } from "@/services/blockchain/gateways/shared";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

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
    clientRated: typeof registro.clientRated === "boolean" ? registro.clientRated : undefined,
    technicianRated: typeof registro.technicianRated === "boolean" ? registro.technicianRated : undefined,
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

export function criarRepairEscrowGateway(contractClient: RepairDAOContractClient): RepairDAOBlockchainGateway & GatewayContratoBase {
  const base = criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.escrow);

  return {
    ...base,
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

    async concluirOrdem(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "completeOrder",
        args: [input.ordemId],
      });
    },

    async avaliarServico(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "rateUser",
        args: [input.ordemId, input.nota],
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
      const ordem = await base.readContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "getOrder",
        args: [ordemId],
      });

      return ordem ? normalizarOrdemContrato(ordem as Record<string, unknown>) : null;
    },

    async buscarDisputa(disputaId) {
      const disputa = await base.readContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "getDispute",
        args: [disputaId],
      });

      return disputa ? normalizarDisputaContrato(disputa as Record<string, unknown>) : null;
    },
  };
}

export const criarEthersRepairDAOGateway = criarRepairEscrowGateway;

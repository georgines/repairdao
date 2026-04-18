import type { RepairDAOContractClient } from "@/services/blockchain/contractClient";
import type { DisputaContratoBruta, EvidenciaContratoBruta, OrdemContratoBruta } from "@/services/blockchain/adapters";
import { criarGatewayContrato, normalizarEndereco, normalizarNumero, normalizarTextoOpcional, obterTextoDeContrato, obterValorDeContrato, garantirEscritaDisponivel, type GatewayContratoBase } from "@/services/blockchain/gateways/shared";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

export interface RepairEscrowGateway extends GatewayContratoBase {
  criarOrdem(input: { descricao: string; cliente: string }): Promise<unknown>;
  enviarOrcamento(input: { ordemId: bigint | number | string; tecnico: string; valor: number }): Promise<unknown>;
  concluirOrdem(input: { ordemId: bigint | number | string; tecnico: string }): Promise<unknown>;
  avaliarServico(input: { ordemId: bigint | number | string; nota: number }): Promise<unknown>;
  abrirDisputa(input: { ordemId: bigint | number | string; autor: string; motivo: string }): Promise<unknown>;
  enviarEvidencia(input: { ordemId: bigint | number | string; autor: string; conteudo: string }): Promise<unknown>;
  votarDisputa(input: { ordemId: bigint | number | string; apoiandoAbertura: boolean; votante: string }): Promise<unknown>;
  resolverDisputa(input: { ordemId: bigint | number | string }): Promise<unknown>;
  buscarOrdem(ordemId: bigint | number | string): Promise<OrdemContratoBruta | null>;
  buscarDisputa(disputaId: bigint | number | string): Promise<DisputaContratoBruta | null>;
  verificarVotoDaDisputa(
    disputaId: bigint | number | string,
    votante: string,
  ): Promise<{ hasVoted: boolean; supportOpener: boolean | null }>;
  buscarEvidencias(ordemId: bigint | number | string): Promise<EvidenciaContratoBruta[]>;
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

function normalizarEvidenciaContrato(registro: Record<string, unknown>): EvidenciaContratoBruta | null {
  const submittedBy = registro.submittedBy ?? registro.author ?? registro.owner;
  const content = registro.content ?? registro.message ?? registro.reason;
  const timestamp = registro.timestamp ?? registro.createdAt ?? registro.created_at;

  if (!submittedBy || !content || timestamp === undefined || timestamp === null) {
    return null;
  }

  return {
    submittedBy: normalizarEndereco(submittedBy, "autor da evidencia") ?? String(submittedBy),
    content: obterTextoDeContrato(registro, ["content", "message", "reason"]),
    timestamp: timestamp as EvidenciaContratoBruta["timestamp"],
  };
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
  const openedBy = normalizarEndereco(registro.openedBy ?? registro.opened_by, "autor da disputa");
  const opposingParty = normalizarEndereco(registro.opposingParty ?? registro.opposing_party, "parte oposta da disputa");
  const votesForOpener = registro.votesForOpener ?? registro.votes_for_opener ?? undefined;
  const votesForOpposing = registro.votesForOpposing ?? registro.votes_for_opposing ?? undefined;
  const deadline = registro.deadline === undefined || registro.deadline === null ? undefined : registro.deadline as DisputaContratoBruta["deadline"];
  const resolved = typeof registro.resolved === "boolean" ? registro.resolved : undefined;

  return {
    id: ordemId as DisputaContratoBruta["id"],
    estado: derivarEstadoDaDisputa(registro),
    ordemId: ordemId as DisputaContratoBruta["ordemId"],
    motivo: normalizarTextoOpcional(registro.reason ?? registro.motivo),
    ...(openedBy ? { openedBy } : {}),
    ...(opposingParty ? { opposingParty } : {}),
    ...(votesForOpener !== undefined && votesForOpener !== null
      ? { votesForOpener: votesForOpener as DisputaContratoBruta["votesForOpener"] }
      : {}),
    ...(votesForOpposing !== undefined && votesForOpposing !== null
      ? { votesForOpposing: votesForOpposing as DisputaContratoBruta["votesForOpposing"] }
      : {}),
    ...(deadline !== undefined ? { deadline } : {}),
    ...(resolved !== undefined ? { resolved } : {}),
  };
}

export function criarRepairEscrowGateway(contractClient: RepairDAOContractClient): RepairEscrowGateway {
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

    async enviarEvidencia(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "submitEvidence",
        args: [input.ordemId, input.conteudo],
      });
    },

    async votarDisputa(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "voteOnDispute",
        args: [input.ordemId, input.apoiandoAbertura],
      });
    },

    async resolverDisputa(input) {
      garantirEscritaDisponivel(contractClient);

      return contractClient.writeContract({
        address: REPAIRDAO_CONTRACTOS.escrow.address,
        abi: REPAIRDAO_CONTRACTOS.escrow.abi,
        functionName: "resolveDispute",
        args: [input.ordemId],
      });
    },

    async buscarOrdem(ordemId) {
      const ordem = await base.readContract({
        functionName: "getOrder",
        args: [ordemId],
      });

      return ordem ? normalizarOrdemContrato(ordem as Record<string, unknown>) : null;
    },

    async buscarDisputa(disputaId) {
      const disputa = await base.readContract({
        functionName: "getDispute",
        args: [disputaId],
      });

      return disputa ? normalizarDisputaContrato(disputa as Record<string, unknown>) : null;
    },

    async verificarVotoDaDisputa(disputaId, votante) {
      const hasVoted = await base.readContract<boolean>({
        functionName: "hasVoted",
        args: [disputaId, votante],
      });

      if (!hasVoted) {
        return { hasVoted: false, supportOpener: null };
      }

      const supportOpener = await base.readContract<boolean>({
        functionName: "voteSide",
        args: [disputaId, votante],
      });

      return { hasVoted: true, supportOpener };
    },

    async buscarEvidencias(ordemId) {
      const evidencias = await base.readContract({
        functionName: "getEvidences",
        args: [ordemId],
      });

      if (!Array.isArray(evidencias)) {
        return [];
      }

      return evidencias
        .map((registro) => normalizarEvidenciaContrato(registro as Record<string, unknown>))
        .filter((evidencia): evidencia is EvidenciaContratoBruta => evidencia !== null);
    },
  };
}

export const criarEthersRepairDAOGateway = criarRepairEscrowGateway;

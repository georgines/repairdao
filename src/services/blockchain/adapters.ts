import { RepairDAODominioError } from "@/erros/errors";
import {
  garantirEstadoOrdem,
} from "@/services/ordens";
import { garantirEstadoDisputa } from "@/services/disputas";
import { garantirEstadoProposta } from "@/services/governanca";
import { garantirTextoNaoVazio } from "@/services/validacoes";
import { normalizarEndereco } from "@/services/blockchain/gateways/shared";
import type {
  EstadoDisputaRepairDAO,
  EstadoOrdemRepairDAO,
  EstadoPropostaRepairDAO,
} from "@/types";

const ESTADOS_ORDEM_CONTRATO: readonly EstadoOrdemRepairDAO[] = [
  "criada",
  "em_andamento",
  "concluida",
  "disputada",
  "resolvida",
];

const ESTADOS_DISPUTA_CONTRATO: readonly EstadoDisputaRepairDAO[] = [
  "aberta",
  "janela_votacao",
  "encerrada",
  "resolvida",
];

const ESTADOS_PROPOSTA_CONTRATO: readonly EstadoPropostaRepairDAO[] = [
  "rascunho",
  "ativa",
  "encerrada",
  "executada",
  "rejeitada",
];

export interface OrdemContratoBruta {
  id: bigint | number | string;
  estado: bigint | number | string;
  descricao: string;
  cliente: string;
  tecnico?: string | null;
  valorOrcamento?: bigint | number | string | null;
  clientRated?: boolean | null;
  technicianRated?: boolean | null;
}

export interface OrdemContratoDominio {
  id: string;
  estado: EstadoOrdemRepairDAO;
  descricao: string;
  cliente: string;
  tecnico?: string;
  valorOrcamento?: number;
  clientRated?: boolean;
  technicianRated?: boolean;
}

export interface DisputaContratoBruta {
  id: bigint | number | string;
  estado: bigint | number | string;
  ordemId: bigint | number | string;
  motivo?: string | null;
  openedBy?: string | null;
  opposingParty?: string | null;
  votesForOpener?: bigint | number | string | null;
  votesForOpposing?: bigint | number | string | null;
  deadline?: bigint | number | string | null;
  resolved?: boolean | null;
}

export interface DisputaContratoDominio {
  id: string;
  estado: EstadoDisputaRepairDAO;
  ordemId: string;
  motivo?: string;
  openedBy?: string;
  opposingParty?: string;
  votesForOpener?: bigint;
  votesForOpposing?: bigint;
  deadline?: string;
  resolved?: boolean;
}

export interface EvidenciaContratoBruta {
  submittedBy: string;
  content: string;
  timestamp: bigint | number | string;
}

export interface EvidenciaContratoDominio {
  submittedBy: string;
  content: string;
  timestamp: string;
}

export interface PropostaContratoBruta {
  id: bigint | number | string;
  proposer?: string | null;
  descricao: string;
  votesFor?: bigint | number | string | null;
  votesAgainst?: bigint | number | string | null;
  deadline?: bigint | number | string | null;
  executed?: boolean | null;
  approved?: boolean | null;
  action?: bigint | number | string | null;
  actionValue?: bigint | number | string | null;
  estado?: bigint | number | string;
  duracaoEmDias?: bigint | number | string;
}

export interface PropostaContratoDominio {
  id: string;
  descricao: string;
  proposer?: string;
  votesFor?: bigint;
  votesAgainst?: bigint;
  deadline?: string;
  executed?: boolean;
  approved?: boolean;
  action?: "tokens_per_eth" | "min_deposit";
  actionValue?: bigint;
  estado?: EstadoPropostaRepairDAO;
  duracaoEmDias?: number;
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

function mapearEnumContrato<T extends string>(
  valor: unknown,
  estados: readonly T[],
  erroCodigo: string,
  entidade: string,
): T {
  if (typeof valor === "string" && estados.includes(valor as T)) {
    return valor as T;
  }

  const indice = normalizarNumero(valor, entidade);

  if (indice < 0 || indice >= estados.length) {
    throw new RepairDAODominioError(erroCodigo, `Estado de ${entidade} invalido no contrato.`, {
      entidade,
      valor,
    });
  }

  return estados[indice];
}

export { mapearEnumContrato };

export function mapearEstadoOrdemDoContrato(valor: unknown): EstadoOrdemRepairDAO {
  if (typeof valor === "string") {
    return garantirEstadoOrdem(valor);
  }

  return mapearEnumContrato(valor, ESTADOS_ORDEM_CONTRATO, "estado_ordem_contrato_invalido", "ordem");
}

export function mapearEstadoDisputaDoContrato(valor: unknown): EstadoDisputaRepairDAO {
  if (typeof valor === "string") {
    return garantirEstadoDisputa(valor);
  }

  return mapearEnumContrato(valor, ESTADOS_DISPUTA_CONTRATO, "estado_disputa_contrato_invalido", "disputa");
}

export function mapearEstadoPropostaDoContrato(valor: unknown): EstadoPropostaRepairDAO {
  if (typeof valor === "string") {
    return garantirEstadoProposta(valor);
  }

  return mapearEnumContrato(valor, ESTADOS_PROPOSTA_CONTRATO, "estado_proposta_contrato_invalido", "proposta");
}

export function mapearOrdemDoContrato(ordem: OrdemContratoBruta): OrdemContratoDominio {
  return {
    id: String(ordem.id),
    estado: mapearEstadoOrdemDoContrato(ordem.estado),
    descricao: garantirTextoNaoVazio(ordem.descricao, "descricao da ordem"),
    cliente: ordem.cliente,
    tecnico: ordem.tecnico ?? undefined,
    valorOrcamento: ordem.valorOrcamento === undefined || ordem.valorOrcamento === null
      ? undefined
      : normalizarNumero(ordem.valorOrcamento, "valor do orcamento"),
    clientRated: ordem.clientRated === undefined || ordem.clientRated === null ? undefined : Boolean(ordem.clientRated),
    technicianRated: ordem.technicianRated === undefined || ordem.technicianRated === null ? undefined : Boolean(ordem.technicianRated),
  };
}

function normalizarBigInt(valor: unknown, campo: string): bigint {
  if (typeof valor === "bigint") {
    return valor;
  }

  if (typeof valor === "number" && Number.isInteger(valor)) {
    return BigInt(valor);
  }

  if (typeof valor === "string" && /^\d+$/.test(valor)) {
    return BigInt(valor);
  }

  throw new RepairDAODominioError("valor_contrato_invalido", `O campo ${campo} precisa ser um inteiro valido.`, {
    campo,
    valor,
  });
}

function mapearAcaoProposta(valor: unknown): "tokens_per_eth" | "min_deposit" {
  const acao = normalizarNumero(valor, "acao da proposta");

  if (acao === 0) {
    return "tokens_per_eth";
  }

  if (acao === 1) {
    return "min_deposit";
  }

  throw new RepairDAODominioError("acao_proposta_contrato_invalida", "Acao de proposta invalida no contrato.", {
    valor,
  });
}

export function mapearDisputaDoContrato(disputa: DisputaContratoBruta): DisputaContratoDominio {
  return {
    id: String(disputa.id),
    estado: mapearEstadoDisputaDoContrato(disputa.estado),
    ordemId: String(disputa.ordemId),
    motivo: disputa.motivo ? garantirTextoNaoVazio(disputa.motivo, "motivo da disputa") : undefined,
    openedBy: disputa.openedBy ?? undefined,
    opposingParty: disputa.opposingParty ?? undefined,
    votesForOpener:
      disputa.votesForOpener === undefined || disputa.votesForOpener === null
        ? undefined
        : normalizarBigInt(disputa.votesForOpener, "votos a favor de quem abriu a disputa"),
    votesForOpposing:
      disputa.votesForOpposing === undefined || disputa.votesForOpposing === null
        ? undefined
        : normalizarBigInt(disputa.votesForOpposing, "votos a favor da outra parte"),
    deadline:
      disputa.deadline === undefined || disputa.deadline === null
        ? undefined
        : new Date(normalizarNumero(disputa.deadline, "deadline da disputa") * 1000).toISOString(),
    resolved: disputa.resolved === undefined || disputa.resolved === null ? undefined : Boolean(disputa.resolved),
  };
}

export function mapearEvidenciaDoContrato(evidencia: EvidenciaContratoBruta): EvidenciaContratoDominio {
  return {
    submittedBy: garantirTextoNaoVazio(evidencia.submittedBy, "autor da evidencia"),
    content: garantirTextoNaoVazio(evidencia.content, "conteudo da evidencia"),
    timestamp: new Date(normalizarNumero(evidencia.timestamp, "timestamp da evidencia") * 1000).toISOString(),
  };
}

export function mapearPropostaDoContrato(proposta: PropostaContratoBruta): PropostaContratoDominio {
  const temFormatoNovo =
    proposta.executed !== undefined ||
    proposta.approved !== undefined ||
    proposta.action !== undefined ||
    proposta.actionValue !== undefined ||
    proposta.votesFor !== undefined ||
    proposta.votesAgainst !== undefined ||
    proposta.deadline !== undefined ||
    proposta.proposer !== undefined;

  if (temFormatoNovo) {
    const actionRaw = proposta.action;
    const action = actionRaw === undefined || actionRaw === null ? undefined : mapearAcaoProposta(actionRaw);

    return {
      id: String(proposta.id),
      descricao: garantirTextoNaoVazio(proposta.descricao, "descricao da proposta"),
      proposer: normalizarEndereco(proposta.proposer ?? undefined, "propositor da proposta") ?? undefined,
      votesFor:
        proposta.votesFor === undefined || proposta.votesFor === null
          ? undefined
          : normalizarBigInt(proposta.votesFor, "votos a favor da proposta"),
      votesAgainst:
        proposta.votesAgainst === undefined || proposta.votesAgainst === null
          ? undefined
          : normalizarBigInt(proposta.votesAgainst, "votos contra a proposta"),
      deadline:
        proposta.deadline === undefined || proposta.deadline === null
          ? undefined
          : new Date(normalizarNumero(proposta.deadline, "deadline da proposta") * 1000).toISOString(),
      executed: proposta.executed === undefined || proposta.executed === null ? undefined : Boolean(proposta.executed),
      approved: proposta.approved === undefined || proposta.approved === null ? undefined : Boolean(proposta.approved),
      action,
      actionValue:
        proposta.actionValue === undefined || proposta.actionValue === null
          ? undefined
          : normalizarBigInt(proposta.actionValue, "valor da acao da proposta"),
    };
  }

  return {
    id: String(proposta.id),
    descricao: garantirTextoNaoVazio(proposta.descricao, "descricao da proposta"),
    estado: proposta.estado === undefined ? undefined : mapearEstadoPropostaDoContrato(proposta.estado),
    duracaoEmDias:
      proposta.duracaoEmDias === undefined || proposta.duracaoEmDias === null
        ? undefined
        : normalizarNumero(proposta.duracaoEmDias, "duracao da proposta"),
  };
}

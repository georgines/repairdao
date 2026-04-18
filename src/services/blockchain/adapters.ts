import { RepairDAODominioError } from "@/erros/errors";
import {
  garantirEstadoOrdem,
} from "@/services/ordens";
import { garantirEstadoDisputa } from "@/services/disputas";
import { garantirEstadoProposta } from "@/services/governanca";
import { garantirTextoNaoVazio } from "@/services/validacoes";
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
}

export interface DisputaContratoDominio {
  id: string;
  estado: EstadoDisputaRepairDAO;
  ordemId: string;
  motivo?: string;
}

export interface PropostaContratoBruta {
  id: bigint | number | string;
  estado: bigint | number | string;
  descricao: string;
  duracaoEmDias: bigint | number | string;
}

export interface PropostaContratoDominio {
  id: string;
  estado: EstadoPropostaRepairDAO;
  descricao: string;
  duracaoEmDias: number;
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

export function mapearDisputaDoContrato(disputa: DisputaContratoBruta): DisputaContratoDominio {
  return {
    id: String(disputa.id),
    estado: mapearEstadoDisputaDoContrato(disputa.estado),
    ordemId: String(disputa.ordemId),
    motivo: disputa.motivo ? garantirTextoNaoVazio(disputa.motivo, "motivo da disputa") : undefined,
  };
}

export function mapearPropostaDoContrato(proposta: PropostaContratoBruta): PropostaContratoDominio {
  return {
    id: String(proposta.id),
    estado: mapearEstadoPropostaDoContrato(proposta.estado),
    descricao: garantirTextoNaoVazio(proposta.descricao, "descricao da proposta"),
    duracaoEmDias: normalizarNumero(proposta.duracaoEmDias, "duracao da proposta"),
  };
}

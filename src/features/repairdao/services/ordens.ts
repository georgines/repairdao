import { RepairDAODominioError } from "@/features/repairdao/errors";
import { ESTADOS_ORDEM_REPAIRDAO, type EstadoOrdemRepairDAO } from "@/features/repairdao/types";
import { garantirNumeroMaiorQueZero, garantirTextoNaoVazio, textoNaoVazio } from "@/features/repairdao/services/validacoes";

const TRANSICOES_VALIDAS: Record<EstadoOrdemRepairDAO, readonly EstadoOrdemRepairDAO[]> = {
  criada: ["em_andamento"],
  em_andamento: ["concluida", "disputada"],
  concluida: ["disputada"],
  disputada: ["resolvida"],
  resolvida: [],
};

export function ehEstadoOrdemValido(valor: string): valor is EstadoOrdemRepairDAO {
  return ESTADOS_ORDEM_REPAIRDAO.includes(valor as EstadoOrdemRepairDAO);
}

export function garantirEstadoOrdem(valor: string): EstadoOrdemRepairDAO {
  if (!ehEstadoOrdemValido(valor)) {
    throw new RepairDAODominioError("estado_ordem_invalido", `Estado de ordem invalido: ${valor}`, { valor });
  }

  return valor;
}

export function ordemPodeIrParaEstado(
  estadoAtual: EstadoOrdemRepairDAO,
  proximoEstado: EstadoOrdemRepairDAO,
): boolean {
  return TRANSICOES_VALIDAS[estadoAtual].includes(proximoEstado);
}

export function garantirTransicaoOrdem(
  estadoAtual: EstadoOrdemRepairDAO,
  proximoEstado: EstadoOrdemRepairDAO,
): EstadoOrdemRepairDAO {
  if (!ordemPodeIrParaEstado(estadoAtual, proximoEstado)) {
    throw new RepairDAODominioError(
      "transicao_ordem_invalida",
      `Nao e permitido mover a ordem de ${estadoAtual} para ${proximoEstado}.`,
      { estadoAtual, proximoEstado },
    );
  }

  return proximoEstado;
}

export function ordemPodeSerCriada(descricao: string): boolean {
  return textoNaoVazio(descricao);
}

export function garantirOrdemPodeSerCriada(descricao: string): string {
  return garantirTextoNaoVazio(descricao, "descricao da ordem");
}

export function ordemPodeReceberOrcamento(estado: EstadoOrdemRepairDAO): boolean {
  return estado === "criada";
}

export function orcamentoPodeSerEnviado(valor: number): boolean {
  return garantirNumeroMaiorQueZero(valor, "valor do orcamento") > 0;
}

export function ordemPodeSerAceita(estado: EstadoOrdemRepairDAO): boolean {
  return estado === "criada";
}

export function ordemPodeSerConcluida(estado: EstadoOrdemRepairDAO): boolean {
  return estado === "em_andamento";
}

export function ordemPodeSerConfirmada(estado: EstadoOrdemRepairDAO): boolean {
  return estado === "concluida";
}

export function ordemPodeEntrarEmDisputa(estado: EstadoOrdemRepairDAO): boolean {
  return estado === "em_andamento" || estado === "concluida";
}

export function ordemPodeSerResolvida(estado: EstadoOrdemRepairDAO): boolean {
  return estado === "disputada";
}

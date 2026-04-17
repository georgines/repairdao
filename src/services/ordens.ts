import { ESTADOS_ORDEM_REPAIRDAO, type EstadoOrdemRepairDAO } from "@/types";
import { garantirTransicaoEstado, garantirValorPermitido } from "@/services/shared";
import { garantirNumeroMaiorQueZero, garantirTextoNaoVazio, textoNaoVazio } from "@/services/validacoes";

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
  return garantirValorPermitido(valor, ESTADOS_ORDEM_REPAIRDAO, "estado_ordem_invalido", `Estado de ordem invalido: ${valor}`);
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
  return garantirTransicaoEstado(estadoAtual, proximoEstado, TRANSICOES_VALIDAS, "transicao_ordem_invalida", "a ordem");
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

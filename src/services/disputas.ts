import { REPAIRDAO_LIMITES } from "@/constants/constants";
import { RepairDAODominioError } from "@/erros/errors";
import { ESTADOS_DISPUTA_REPAIRDAO, type EstadoDisputaRepairDAO } from "@/types";
import { garantirTransicaoEstado, garantirValorPermitido, clamp } from "@/services/shared";
import { garantirNumeroMaiorQueZero, garantirTokensPositivos, textoNaoVazio, tokensPositivos } from "@/services/validacoes";

const TRANSICOES_VALIDAS: Record<EstadoDisputaRepairDAO, readonly EstadoDisputaRepairDAO[]> = {
  aberta: ["janela_votacao"],
  janela_votacao: ["encerrada"],
  encerrada: ["resolvida"],
  resolvida: [],
};

export function ehEstadoDisputaValido(valor: string): valor is EstadoDisputaRepairDAO {
  return ESTADOS_DISPUTA_REPAIRDAO.includes(valor as EstadoDisputaRepairDAO);
}

export function garantirEstadoDisputa(valor: string): EstadoDisputaRepairDAO {
  return garantirValorPermitido(valor, ESTADOS_DISPUTA_REPAIRDAO, "estado_disputa_invalido", `Estado de disputa invalido: ${valor}`);
}

export function motivoDisputaValido(motivo: string): boolean {
  return textoNaoVazio(motivo);
}

export function disputaPodeSerAberta(estadoDaOrdem: "em_andamento" | "concluida"): boolean {
  return estadoDaOrdem === "em_andamento" || estadoDaOrdem === "concluida";
}

export function disputaPodeReceberEvidencia(
  agora: Date,
  terminaEm: Date,
  evidencia: string,
): boolean {
  return agora.getTime() <= terminaEm.getTime() && motivoDisputaValido(evidencia);
}

export function disputaPodeReceberVoto(
  agora: Date,
  terminaEm: Date,
  tokens: number | undefined,
  jaVotou: boolean,
  envolvidoNaDisputa: boolean,
): boolean {
  return agora.getTime() <= terminaEm.getTime()
    && !jaVotou
    && !envolvidoNaDisputa
    && tokensPositivos(tokens);
}

export function garantirPodeReceberVoto(
  agora: Date,
  terminaEm: Date,
  tokens: number | undefined,
  jaVotou: boolean,
  envolvidoNaDisputa: boolean,
): true {
  if (!disputaPodeReceberVoto(agora, terminaEm, tokens, jaVotou, envolvidoNaDisputa)) {
    throw new RepairDAODominioError(
      "voto_disputa_invalido",
      "O voto na disputa nao e permitido para este contexto.",
      { agora, terminaEm, tokens, jaVotou, envolvidoNaDisputa },
    );
  }

  garantirTokensPositivos(tokens, "votar em disputa");
  return true;
}

export function disputaPodeSerResolvida(
  estado: EstadoDisputaRepairDAO,
  agora: Date,
  terminaEm: Date,
): boolean {
  return estado === "encerrada" && agora.getTime() > terminaEm.getTime();
}

export function disputaPodeIrParaEstado(
  estadoAtual: EstadoDisputaRepairDAO,
  proximoEstado: EstadoDisputaRepairDAO,
): boolean {
  return TRANSICOES_VALIDAS[estadoAtual].includes(proximoEstado);
}

export function garantirTransicaoDisputa(
  estadoAtual: EstadoDisputaRepairDAO,
  proximoEstado: EstadoDisputaRepairDAO,
): EstadoDisputaRepairDAO {
  return garantirTransicaoEstado(estadoAtual, proximoEstado, TRANSICOES_VALIDAS, "transicao_disputa_invalida", "a disputa");
}

export function calcularSlashDoPerdedor(depositoAtual: number): number {
  const depositoValido = garantirNumeroMaiorQueZero(depositoAtual, "deposito atual");
  const slash = Math.floor(depositoValido * REPAIRDAO_LIMITES.slashPerdedorDisputaPercentual);

  return clamp(slash, 0, depositoValido);
}

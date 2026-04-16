import { REPAIRDAO_LIMITES } from "@/features/repairdao/constants";
import { RepairDAODominioError } from "@/features/repairdao/errors";
import { ESTADOS_PROPOSTA_REPAIRDAO, type EstadoPropostaRepairDAO } from "@/features/repairdao/types";
import { duracaoPropostaValida, garantirDuracaoProposta, garantirNumeroMaiorQueZero, textoNaoVazio, tokensPositivos, garantirTokensPositivos } from "@/features/repairdao/services/validacoes";

const TRANSICOES_VALIDAS: Record<EstadoPropostaRepairDAO, readonly EstadoPropostaRepairDAO[]> = {
  rascunho: ["ativa"],
  ativa: ["encerrada"],
  encerrada: ["executada", "rejeitada"],
  executada: [],
  rejeitada: [],
};

export function ehEstadoPropostaValido(valor: string): valor is EstadoPropostaRepairDAO {
  return ESTADOS_PROPOSTA_REPAIRDAO.includes(valor as EstadoPropostaRepairDAO);
}

export function garantirEstadoProposta(valor: string): EstadoPropostaRepairDAO {
  if (!ehEstadoPropostaValido(valor)) {
    throw new RepairDAODominioError(
      "estado_proposta_invalido",
      `Estado de proposta invalido: ${valor}`,
      { valor },
    );
  }

  return valor;
}

export function propostaPodeSerCriada(
  depositoAtivo: boolean,
  descricao: string,
  duracaoEmDias: number,
): boolean {
  return depositoAtivo && textoNaoVazio(descricao) && duracaoPropostaValida(duracaoEmDias);
}

export function garantirPodeCriarProposta(
  depositoAtivo: boolean,
  descricao: string,
  duracaoEmDias: number,
): true {
  if (!propostaPodeSerCriada(depositoAtivo, descricao, duracaoEmDias)) {
    throw new RepairDAODominioError(
      "proposta_invalida",
      "A proposta exige deposito ativo, descricao valida e duracao entre 1 e 30 dias.",
      { depositoAtivo, descricao, duracaoEmDias },
    );
  }

  garantirDuracaoProposta(duracaoEmDias);
  return true;
}

export function propostaDuracaoValida(duracaoEmDias: number): boolean {
  return duracaoPropostaValida(duracaoEmDias);
}

export function propostaPodeReceberVoto(
  agora: Date,
  terminaEm: Date,
  tokens: number | undefined,
  jaVotou: boolean,
): boolean {
  return agora.getTime() <= terminaEm.getTime() && !jaVotou && tokensPositivos(tokens);
}

export function garantirPodeReceberVoto(
  agora: Date,
  terminaEm: Date,
  tokens: number | undefined,
  jaVotou: boolean,
): true {
  if (!propostaPodeReceberVoto(agora, terminaEm, tokens, jaVotou)) {
    throw new RepairDAODominioError(
      "voto_proposta_invalido",
      "O voto na proposta nao e permitido para este contexto.",
      { agora, terminaEm, tokens, jaVotou },
    );
  }

  garantirTokensPositivos(tokens, "votar em proposta");
  return true;
}

export function propostaPodeSerEncerrada(agora: Date, terminaEm: Date): boolean {
  return agora.getTime() > terminaEm.getTime();
}

export function propostaPodeSerExecutada(
  estado: EstadoPropostaRepairDAO,
  agora: Date,
  terminaEm: Date,
  executada: boolean,
): boolean {
  return estado === "encerrada" && !executada && propostaPodeSerEncerrada(agora, terminaEm);
}

export function governancaAtingiuQuorum(totalTokensVotados: number): boolean {
  return garantirNumeroMaiorQueZero(totalTokensVotados, "total de tokens votados") >= REPAIRDAO_LIMITES.quorumGovernancaInicial;
}

export function propostaAprovada(
  votosFavor: number,
  votosContra: number,
  totalTokensVotados: number,
): boolean {
  return governancaAtingiuQuorum(totalTokensVotados) && votosFavor > votosContra;
}

export function propostaPodeIrParaEstado(
  estadoAtual: EstadoPropostaRepairDAO,
  proximoEstado: EstadoPropostaRepairDAO,
): boolean {
  return TRANSICOES_VALIDAS[estadoAtual].includes(proximoEstado);
}

export function garantirTransicaoProposta(
  estadoAtual: EstadoPropostaRepairDAO,
  proximoEstado: EstadoPropostaRepairDAO,
): EstadoPropostaRepairDAO {
  if (!propostaPodeIrParaEstado(estadoAtual, proximoEstado)) {
    throw new RepairDAODominioError(
      "transicao_proposta_invalida",
      `Nao e permitido mover a proposta de ${estadoAtual} para ${proximoEstado}.`,
      { estadoAtual, proximoEstado },
    );
  }

  return proximoEstado;
}

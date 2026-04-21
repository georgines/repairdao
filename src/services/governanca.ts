import { RepairDAODominioError } from "@/erros/errors";
import { ESTADOS_PROPOSTA_REPAIRDAO, type EstadoPropostaRepairDAO } from "@/types";
import { garantirTransicaoEstado, garantirValorPermitido } from "@/services/shared";
import { textoNaoVazio, tokensPositivos, garantirTokensPositivos } from "@/services/validacoes";

export const DURACAO_FIXA_PROPOSTA_GOVERNANCA_SEGUNDOS = 5 * 60;

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
  return garantirValorPermitido(valor, ESTADOS_PROPOSTA_REPAIRDAO, "estado_proposta_invalido", `Estado de proposta invalido: ${valor}`);
}

export function propostaPodeSerCriada(
  depositoAtivo: boolean,
  ehOwner: boolean,
  descricao: string,
): boolean {
  return (depositoAtivo || ehOwner) && textoNaoVazio(descricao);
}

export function garantirPodeCriarProposta(
  depositoAtivo: boolean,
  ehOwner: boolean,
  descricao: string,
): true {
  if (!propostaPodeSerCriada(depositoAtivo, ehOwner, descricao)) {
    throw new RepairDAODominioError(
      "proposta_invalida",
      "A proposta exige deposito ativo ou permissao de owner, e descricao valida.",
      { depositoAtivo, ehOwner, descricao },
    );
  }

  return true;
}

export function propostaDuracaoValida(duracaoEmSegundos: number): boolean {
  return duracaoEmSegundos === DURACAO_FIXA_PROPOSTA_GOVERNANCA_SEGUNDOS;
}

export function garantirDuracaoProposta(duracaoEmSegundos: number): number {
  if (!propostaDuracaoValida(duracaoEmSegundos)) {
    throw new RepairDAODominioError(
      "duracao_proposta_invalida",
      `A duracao da proposta precisa ser exatamente ${DURACAO_FIXA_PROPOSTA_GOVERNANCA_SEGUNDOS} segundos.`,
      { duracaoEmSegundos },
    );
  }

  return duracaoEmSegundos;
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
  return Number.isFinite(totalTokensVotados) && totalTokensVotados >= 1000;
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
  return garantirTransicaoEstado(estadoAtual, proximoEstado, TRANSICOES_VALIDAS, "transicao_proposta_invalida", "a proposta");
}

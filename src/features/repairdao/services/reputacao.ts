import { REPAIRDAO_LIMITES } from "@/features/repairdao/constants";
import { RepairDAODominioError } from "@/features/repairdao/errors";
import { type AvaliacaoReputacaoRepairDAO, type DirecaoAvaliacaoRepairDAO, type NivelReputacaoRepairDAO, DIRECOES_AVALIACAO_REPAIRDAO } from "@/features/repairdao/types";
import { garantirNotaEntreUmECinco, notaEntreUmECinco } from "@/features/repairdao/services/validacoes";

export function ehDirecaoAvaliacaoValida(valor: string): valor is DirecaoAvaliacaoRepairDAO {
  return DIRECOES_AVALIACAO_REPAIRDAO.includes(valor as DirecaoAvaliacaoRepairDAO);
}

export function garantirDirecaoAvaliacao(valor: string): DirecaoAvaliacaoRepairDAO {
  if (!ehDirecaoAvaliacaoValida(valor)) {
    throw new RepairDAODominioError(
      "direcao_avaliacao_invalida",
      `Direcao de avaliacao invalida: ${valor}`,
      { valor },
    );
  }

  return valor;
}

export function nivelReputacaoDoTotalDePontos(pontos: number): NivelReputacaoRepairDAO {
  const nivelCalculado = Math.floor(pontos / REPAIRDAO_LIMITES.pontosParaSubirNivel) + 1;

  return Math.min(
    REPAIRDAO_LIMITES.reputacaoMaxima,
    Math.max(REPAIRDAO_LIMITES.reputacaoMinima, nivelCalculado),
  ) as NivelReputacaoRepairDAO;
}

export function aplicarAvaliacaoReputacao(
  pontosAtuais: number,
  avaliacao: AvaliacaoReputacaoRepairDAO,
): number {
  const nota = garantirNotaEntreUmECinco(avaliacao.nota, "nota da avaliacao");
  const pontosAtualizados = avaliacao.direcao === "positiva"
    ? pontosAtuais + nota
    : pontosAtuais - nota;

  return Math.max(0, pontosAtualizados);
}

export function calcularNivelBadgePorReputacao(
  nivelReputacao: NivelReputacaoRepairDAO,
): NivelReputacaoRepairDAO {
  return Math.min(
    REPAIRDAO_LIMITES.badgeMaximo,
    Math.max(REPAIRDAO_LIMITES.badgeMinimo, nivelReputacao),
  ) as NivelReputacaoRepairDAO;
}

export function badgePodeExistir(
  depositoAtivo: boolean,
  nivelReputacao: NivelReputacaoRepairDAO,
): boolean {
  return depositoAtivo || nivelReputacao > REPAIRDAO_LIMITES.reputacaoMinima;
}

export function reputacaoPodeCairAbaixoDoNivelUm(pontosAtuais: number): boolean {
  return pontosAtuais <= 0;
}

export function reputacaoValidaParaAvaliacao(nota: number): boolean {
  return notaEntreUmECinco(nota);
}

import { REPAIRDAO_LIMITES } from "@/constants/constants";
import { type AvaliacaoReputacaoRepairDAO, type DirecaoAvaliacaoRepairDAO, type NivelReputacaoRepairDAO, DIRECOES_AVALIACAO_REPAIRDAO } from "@/types";
import { garantirValorPermitido, clamp } from "@/services/shared";
import { garantirNotaEntreUmECinco, notaEntreUmECinco } from "@/services/validacoes";

export function ehDirecaoAvaliacaoValida(valor: string): valor is DirecaoAvaliacaoRepairDAO {
  return DIRECOES_AVALIACAO_REPAIRDAO.includes(valor as DirecaoAvaliacaoRepairDAO);
}

export function garantirDirecaoAvaliacao(valor: string): DirecaoAvaliacaoRepairDAO {
  return garantirValorPermitido(valor, DIRECOES_AVALIACAO_REPAIRDAO, "direcao_avaliacao_invalida", `Direcao de avaliacao invalida: ${valor}`);
}

export function nivelReputacaoDoTotalDePontos(pontos: number): NivelReputacaoRepairDAO {
  const nivelCalculado = Math.floor(pontos / REPAIRDAO_LIMITES.pontosParaSubirNivel) + 1;

  return clamp(nivelCalculado, REPAIRDAO_LIMITES.reputacaoMinima, REPAIRDAO_LIMITES.reputacaoMaxima) as NivelReputacaoRepairDAO;
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
  return clamp(nivelReputacao, REPAIRDAO_LIMITES.badgeMinimo, REPAIRDAO_LIMITES.badgeMaximo) as NivelReputacaoRepairDAO;
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

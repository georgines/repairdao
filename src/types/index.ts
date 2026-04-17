export const PAPEIS_REPAIRDAO = ["cliente", "tecnico", "votante", "outsider"] as const;
export type PapelRepairDAO = (typeof PAPEIS_REPAIRDAO)[number];

export const ESTADOS_ORDEM_REPAIRDAO = [
  "criada",
  "em_andamento",
  "concluida",
  "disputada",
  "resolvida",
] as const;
export type EstadoOrdemRepairDAO = (typeof ESTADOS_ORDEM_REPAIRDAO)[number];

export const ESTADOS_DISPUTA_REPAIRDAO = [
  "aberta",
  "janela_votacao",
  "encerrada",
  "resolvida",
] as const;
export type EstadoDisputaRepairDAO = (typeof ESTADOS_DISPUTA_REPAIRDAO)[number];

export const ESTADOS_PROPOSTA_REPAIRDAO = [
  "rascunho",
  "ativa",
  "encerrada",
  "executada",
  "rejeitada",
] as const;
export type EstadoPropostaRepairDAO = (typeof ESTADOS_PROPOSTA_REPAIRDAO)[number];

export const DIRECOES_AVALIACAO_REPAIRDAO = ["positiva", "negativa"] as const;
export type DirecaoAvaliacaoRepairDAO = (typeof DIRECOES_AVALIACAO_REPAIRDAO)[number];

export type NivelReputacaoRepairDAO = 1 | 2 | 3 | 4 | 5;

export interface ContextoPapelRepairDAO {
  papel: PapelRepairDAO;
  depositoAtivo: boolean;
  tokens?: number;
  envolvidoEmDisputa?: boolean;
}

export interface AvaliacaoReputacaoRepairDAO {
  direcao: DirecaoAvaliacaoRepairDAO;
  nota: number;
}

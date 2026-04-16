import { RepairDAODominioError } from "@/features/repairdao/errors";
import { PAPEIS_REPAIRDAO, type ContextoPapelRepairDAO, type PapelRepairDAO } from "@/features/repairdao/types";
import {
  depositoAtivoValido,
  garantirDepositoAtivo,
  garantirTokensPositivos,
  tokensPositivos,
} from "@/features/repairdao/services/validacoes";

export function ehPapelValido(valor: string): valor is PapelRepairDAO {
  return PAPEIS_REPAIRDAO.includes(valor as PapelRepairDAO);
}

export function garantirPapelValido(valor: string): PapelRepairDAO {
  if (!ehPapelValido(valor)) {
    throw new RepairDAODominioError("papel_invalido", `Papel invalido: ${valor}`, { valor });
  }

  return valor;
}

export function clientePodeCriarOrdem(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "cliente" && depositoAtivoValido(contexto.depositoAtivo);
}

export function tecnicoPodeEnviarOrcamento(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "tecnico" && depositoAtivoValido(contexto.depositoAtivo);
}

export function clientePodeAceitarOrcamento(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "cliente";
}

export function tecnicoPodeConcluirOrdem(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "tecnico";
}

export function clientePodeConfirmarConclusao(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "cliente";
}

export function papelPodeCriarProposta(contexto: ContextoPapelRepairDAO): boolean {
  return depositoAtivoValido(contexto.depositoAtivo);
}

export function papelPodeAvaliarServico(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "cliente" || contexto.papel === "tecnico";
}

export function papelPodeSacarRecompensa(contexto: ContextoPapelRepairDAO): boolean {
  return depositoAtivoValido(contexto.depositoAtivo);
}

export function papelPodeVotarEmGovernanca(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "votante" && tokensPositivos(contexto.tokens);
}

export function papelPodeVotarEmDisputa(contexto: ContextoPapelRepairDAO): boolean {
  return contexto.papel === "votante"
    && tokensPositivos(contexto.tokens)
    && contexto.envolvidoEmDisputa !== true;
}

export function papelPodeAbrirDisputa(contexto: ContextoPapelRepairDAO): boolean {
  return (contexto.papel === "cliente" || contexto.papel === "tecnico")
    && depositoAtivoValido(contexto.depositoAtivo);
}

export function garantirPodeVotarEmGovernanca(contexto: ContextoPapelRepairDAO): true {
  if (!papelPodeVotarEmGovernanca(contexto)) {
    throw new RepairDAODominioError("voto_governanca_invalido", "O votante precisa ter tokens e papel valido.", contexto);
  }

  garantirTokensPositivos(contexto.tokens, "votar em governanca");
  return true;
}

export function garantirPodeVotarEmDisputa(contexto: ContextoPapelRepairDAO): true {
  if (!papelPodeVotarEmDisputa(contexto)) {
    throw new RepairDAODominioError("voto_disputa_invalido", "O voto na disputa nao e permitido para este contexto.", contexto);
  }

  garantirTokensPositivos(contexto.tokens, "votar em disputa");
  return true;
}

export function garantirPodeAbrirDisputa(contexto: ContextoPapelRepairDAO): true {
  if (!papelPodeAbrirDisputa(contexto)) {
    throw new RepairDAODominioError("abertura_disputa_invalida", "A disputa so pode ser aberta por cliente ou tecnico com deposito ativo.", contexto);
  }

  garantirDepositoAtivo(contexto.depositoAtivo, "abrir disputa");
  return true;
}

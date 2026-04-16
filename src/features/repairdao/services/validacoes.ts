import { REPAIRDAO_LIMITES } from "@/features/repairdao/constants";
import { RepairDAODominioError } from "@/features/repairdao/errors";

export function textoNaoVazio(valor: string): boolean {
  return valor.trim().length > 0;
}

export function garantirTextoNaoVazio(valor: string, campo = "valor"): string {
  const texto = valor.trim();

  if (!textoNaoVazio(valor)) {
    throw new RepairDAODominioError("texto_vazio", `O campo ${campo} nao pode ser vazio.`, {
      campo,
      valor,
    });
  }

  return texto;
}

export function numeroMaiorQueZero(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

export function garantirNumeroMaiorQueZero(valor: number, campo = "valor"): number {
  if (!numeroMaiorQueZero(valor)) {
    throw new RepairDAODominioError(
      "numero_invalido",
      `O campo ${campo} precisa ser maior que zero.`,
      { campo, valor },
    );
  }

  return valor;
}

export function inteiroEntre(valor: number, minimo: number, maximo: number): boolean {
  return Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

export function garantirInteiroEntre(
  valor: number,
  minimo: number,
  maximo: number,
  campo = "valor",
): number {
  if (!inteiroEntre(valor, minimo, maximo)) {
    throw new RepairDAODominioError(
      "inteiro_fora_da_faixa",
      `O campo ${campo} precisa ficar entre ${minimo} e ${maximo}.`,
      { campo, valor, minimo, maximo },
    );
  }

  return valor;
}

export function notaEntreUmECinco(valor: number): boolean {
  return inteiroEntre(valor, 1, 5);
}

export function garantirNotaEntreUmECinco(valor: number, campo = "nota"): number {
  return garantirInteiroEntre(valor, 1, 5, campo);
}

export function tokensPositivos(valor?: number): boolean {
  return typeof valor === "number" && numeroMaiorQueZero(valor);
}

export function garantirTokensPositivos(valor?: number, campo = "tokens"): number {
  if (!tokensPositivos(valor)) {
    throw new RepairDAODominioError(
      "tokens_invalidos",
      `O campo ${campo} precisa ser maior que zero.`,
      { campo, valor },
    );
  }

  return valor;
}

export function depositoAtivoValido(depositoAtivo: boolean): boolean {
  return depositoAtivo === true;
}

export function garantirDepositoAtivo(depositoAtivo: boolean, acao = "acao"): true {
  if (!depositoAtivoValido(depositoAtivo)) {
    throw new RepairDAODominioError(
      "deposito_inativo",
      `A acao ${acao} exige deposito ativo.`,
      { acao, depositoAtivo },
    );
  }

  return true;
}

export function duracaoPropostaValida(dias: number): boolean {
  return inteiroEntre(dias, REPAIRDAO_LIMITES.duracaoPropostaMinimaDias, REPAIRDAO_LIMITES.duracaoPropostaMaximaDias);
}

export function garantirDuracaoProposta(dias: number): number {
  return garantirInteiroEntre(
    dias,
    REPAIRDAO_LIMITES.duracaoPropostaMinimaDias,
    REPAIRDAO_LIMITES.duracaoPropostaMaximaDias,
    "duracao da proposta",
  );
}

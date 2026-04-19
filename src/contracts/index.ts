import {
  obterContratosDaRede,
  obterRedeSelecionadaNoCliente,
  obterRedePadrao,
  type ContratosRepairDAO,
  type RedeBlockchain,
} from "@/services/blockchain/rpcConfig";

function obterRedeAtivaParaContratos(): RedeBlockchain {
  if (typeof window === "undefined") {
    return obterRedePadrao();
  }

  return obterRedeSelecionadaNoCliente();
}

export function obterContratos() {
  return obterContratosDaRede(obterRedeAtivaParaContratos());
}

export const contratos = new Proxy({} as ContratosRepairDAO, {
  get(_target, propriedade: string) {
    return obterContratos()[propriedade as keyof ContratosRepairDAO];
  },
}) as ContratosRepairDAO;

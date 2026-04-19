import { cookies } from "next/headers";
import {
  CHAVE_REDE_RPC,
  normalizarRedeBlockchain,
  obterConfiguracaoRpc,
  type ConfiguracaoRpc,
  type RedeBlockchain,
} from "@/services/blockchain/rpcConfig";

export async function obterRedeSelecionadaNoServidor(): Promise<RedeBlockchain> {
  try {
    const cookieStore = await cookies();
    return normalizarRedeBlockchain(cookieStore.get(CHAVE_REDE_RPC)?.value ?? process.env.NEXT_PUBLIC_NETWORK);
  } catch {
    return normalizarRedeBlockchain(process.env.NEXT_PUBLIC_NETWORK);
  }
}

export async function obterConfiguracaoRpcNoServidor(): Promise<ConfiguracaoRpc> {
  return obterConfiguracaoRpc(await obterRedeSelecionadaNoServidor(), process.env);
}

export async function obterRpcUrlNoServidor() {
  return (await obterConfiguracaoRpcNoServidor()).rpcUrl;
}

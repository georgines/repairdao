import localDeployment from "@/contracts/deploy/local.json";
import sepoliaDeployment from "@/contracts/deploy/sepolia.json";

export type RedeBlockchain = "local" | "sepolia";

export type ContratosRepairDAO = typeof localDeployment.contracts;

export type ConfiguracaoRpc = {
  rede: RedeBlockchain;
  nome: string;
  chainId: number;
  contratos: ContratosRepairDAO;
  rpcUrl: string;
};

export const CHAVE_REDE_RPC = "repairdao.network";
export const EVENTO_REDE_RPC_ALTERADA = "repairdao:network-changed";

const CONFIGURACOES_REDE = {
  local: {
    nome: "Local",
    chainId: 31337,
    deployment: localDeployment,
    rpcUrlEnvKeys: ["HARDHAT_RPC_URL", "RPC_URL", "NEXT_PUBLIC_RPC_URL"],
  },
  sepolia: {
    nome: "Sepolia",
    chainId: 11155111,
    deployment: sepoliaDeployment,
    rpcUrlEnvKeys: ["SEPOLIA_RPC_URL", "RPC_URL", "NEXT_PUBLIC_RPC_URL"],
  },
} satisfies Record<
  RedeBlockchain,
  {
    nome: string;
    chainId: number;
    deployment: { contracts: ContratosRepairDAO };
    rpcUrlEnvKeys: readonly string[];
  }
>;

function normalizarValorAmbiente(valor: string | undefined): string | null {
  const texto = valor?.trim();

  return texto ? texto : null;
}

function lerPrimeiraVariavelAmbiente(chaves: readonly string[], ambiente: NodeJS.ProcessEnv = process.env) {
  for (const chave of chaves) {
    const valor = normalizarValorAmbiente(ambiente[chave]);

    if (valor) {
      return valor;
    }
  }

  return null;
}

function lerRedeDoCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefixo = `${CHAVE_REDE_RPC}=`;

  for (const entrada of document.cookie.split(";")) {
    const cookie = entrada.trim();

    if (cookie.startsWith(prefixo)) {
      return decodeURIComponent(cookie.slice(prefixo.length));
    }
  }

  return null;
}

function lerRedeDoStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CHAVE_REDE_RPC);
}

export function ehRedeBlockchain(valor: string | null | undefined): valor is RedeBlockchain {
  return valor === "local" || valor === "sepolia";
}

export function normalizarRedeBlockchain(valor: string | null | undefined): RedeBlockchain {
  return valor?.trim().toLowerCase() === "sepolia" ? "sepolia" : "local";
}

export function obterRedePadrao(): RedeBlockchain {
  return normalizarRedeBlockchain(process.env.NEXT_PUBLIC_NETWORK);
}

export function obterRedeSelecionadaNoCliente(): RedeBlockchain {
  if (typeof window === "undefined") {
    return obterRedePadrao();
  }

  return normalizarRedeBlockchain(lerRedeDoStorage() ?? lerRedeDoCookie() ?? process.env.NEXT_PUBLIC_NETWORK);
}

export function definirRedeSelecionadaNoCliente(rede: RedeBlockchain) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAVE_REDE_RPC, rede);
  document.cookie = `${CHAVE_REDE_RPC}=${encodeURIComponent(rede)}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(
    new CustomEvent(EVENTO_REDE_RPC_ALTERADA, {
      detail: { rede },
    }),
  );
}

export function assinarMudancaDeRedeNoCliente(
  listener: (rede: RedeBlockchain) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const detalhe = (event as CustomEvent<{ rede?: string }>).detail;
    listener(normalizarRedeBlockchain(detalhe?.rede ?? null));
  };

  window.addEventListener(EVENTO_REDE_RPC_ALTERADA, handler);

  return () => {
    window.removeEventListener(EVENTO_REDE_RPC_ALTERADA, handler);
  };
}

export function obterRpcUrlDaRede(
  rede: RedeBlockchain,
  ambiente: NodeJS.ProcessEnv = process.env,
) {
  const configuracao = CONFIGURACOES_REDE[rede];
  const rpcUrl = lerPrimeiraVariavelAmbiente(configuracao.rpcUrlEnvKeys, ambiente);

  return rpcUrl ?? lerPrimeiraVariavelAmbiente(["RPC_URL", "NEXT_PUBLIC_RPC_URL"], ambiente) ?? "http://127.0.0.1:8545";
}

export function obterConfiguracaoRpc(
  rede: RedeBlockchain = obterRedePadrao(),
  ambiente: NodeJS.ProcessEnv = process.env,
): ConfiguracaoRpc {
  const configuracao = CONFIGURACOES_REDE[rede];

  return {
    rede,
    nome: configuracao.nome,
    chainId: configuracao.chainId,
    contratos: configuracao.deployment.contracts,
    rpcUrl: obterRpcUrlDaRede(rede, ambiente),
  };
}

export function obterContratosDaRede(
  rede: RedeBlockchain = obterRedePadrao(),
  ambiente: NodeJS.ProcessEnv = process.env,
) {
  return obterConfiguracaoRpc(rede, ambiente).contratos;
}

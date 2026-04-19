import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { bytecodeIgualIgnorandoImutaveis } from "@/services/blockchain/bytecode";

type DeploymentFile = {
  network: string;
  contracts: Record<string, string>;
};

type ContratoBytecode = {
  name: "RepairToken" | "RepairBadge" | "RepairDeposit" | "RepairReputation" | "RepairEscrow" | "RepairGovernance";
  ignores: readonly ("RepairToken" | "RepairBadge" | "PriceFeed" | "RepairDeposit" | "RepairReputation")[];
};

const artifactRoot = path.resolve(process.cwd(), "..", "repairdao-contracts", "artifacts", "contracts");
const redeSelecionada = process.env.NEXT_PUBLIC_NETWORK?.trim().toLowerCase();
const networkName = redeSelecionada === "sepolia" ? "sepolia" : "local";
const executarBytecodeLocal = redeSelecionada === "local";
const deploymentPath = path.resolve(process.cwd(), "src", "contracts", "deploy", `${networkName}.json`);
const rpcUrl =
  process.env.REPAIRDAO_RPC_URL?.trim() ||
  (networkName === "sepolia"
    ? process.env.SEPOLIA_RPC_URL?.trim()
    : process.env.HARDHAT_RPC_URL?.trim()) ||
  "http://127.0.0.1:8545";
const expectedChainId = networkName === "sepolia" ? 11155111n : 31337n;

function normalizarNomeDaRede(valor: string): "local" | "sepolia" {
  return valor.trim().toLowerCase() === "sepolia" ? "sepolia" : "local";
}

const contratos: readonly ContratoBytecode[] = [
  {
    name: "RepairToken",
    ignores: [],
  },
  {
    name: "RepairBadge",
    ignores: [],
  },
  {
    name: "RepairDeposit",
    ignores: ["RepairToken", "RepairBadge", "PriceFeed"],
  },
  {
    name: "RepairReputation",
    ignores: ["RepairBadge", "RepairDeposit"],
  },
  {
    name: "RepairEscrow",
    ignores: ["RepairToken", "RepairDeposit", "RepairReputation"],
  },
  {
    name: "RepairGovernance",
    ignores: ["RepairToken", "RepairDeposit"],
  },
] as const;

async function obterBytecodeContrato(address: string): Promise<string> {
  const resposta = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getCode",
      params: [address, "latest"],
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao consultar o RPC em ${rpcUrl}.`);
  }

  const payload = (await resposta.json()) as { result?: string };

  if (!payload.result) {
    throw new Error(`O RPC nao retornou bytecode para ${address}.`);
  }

  return payload.result;
}

async function obterChainId(): Promise<bigint> {
  const resposta = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_chainId",
      params: [],
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao consultar o chainId no RPC em ${rpcUrl}.`);
  }

  const payload = (await resposta.json()) as { result?: string };

  if (!payload.result) {
    throw new Error(`O RPC nao retornou chainId em ${rpcUrl}.`);
  }

  return BigInt(payload.result);
}

const describeBytecodeLocal = executarBytecodeLocal ? describe : describe.skip;

describeBytecodeLocal(`bytecode dos contratos locais (${networkName})`, () => {
  let deployment: DeploymentFile;

  beforeAll(() => {
    deployment = JSON.parse(readFileSync(deploymentPath, "utf8")) as DeploymentFile;
  });

  it("usa o deployment correspondente a rede selecionada", () => {
    expect(
      normalizarNomeDaRede(deployment.network),
      `O arquivo ${deploymentPath} descreve a rede ${deployment.network}, mas o teste foi configurado para ${networkName}.`,
    ).toBe(networkName);
  });

  it("usa a chain esperada para o deployment selecionado", async () => {
    const chainId = await obterChainId();

    expect(
      chainId,
      `O RPC em ${rpcUrl} esta na chain ${chainId}, mas o teste foi configurado para ${networkName} (chain ${expectedChainId}).`,
    ).toBe(expectedChainId);
  });

  it.each(contratos)("bate com o artifact compilado para $name", async ({ name, ignores }) => {
    const address = deployment.contracts[name];
    const artifactPath = path.join(artifactRoot, `${name}.sol`, `${name}.json`);
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as { deployedBytecode: string };
    const runtimeBytecode = await obterBytecodeContrato(address);
    const enderecosImutaveis = ignores.map((key) => deployment.contracts[key]);

    expect(
      bytecodeIgualIgnorandoImutaveis(artifact.deployedBytecode, runtimeBytecode, enderecosImutaveis),
      `${name} nao bate com o artifact depois de ignorar imutaveis.`,
    ).toBe(true);
  });
});

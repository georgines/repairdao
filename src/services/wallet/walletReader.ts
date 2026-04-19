import { BrowserProvider, formatEther } from "ethers";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarRepairDepositGateway } from "@/services/blockchain/gateways/depositGateway";
import { obterRedeSelecionadaNoCliente } from "@/services/blockchain/rpcConfig";
import { formatarBlockchain, normalizarPrecoEthUsd } from "@/services/wallet/formatters";
import { ESTADO_INICIAL_CARTEIRA, type WalletSnapshot } from "@/services/wallet/walletSnapshot";
import type { EthereumProvider } from "@/services/wallet/provider";

export async function obterRedeAtual(ethereum: EthereumProvider) {
	const provider = new BrowserProvider(ethereum as never);
	const network = await provider.getNetwork();
	return formatarBlockchain(network.chainId);
}

export async function carregarCarteira(ethereum: EthereumProvider, solicitarPermissao: boolean): Promise<WalletSnapshot> {
	const provider = new BrowserProvider(ethereum as never);
	const [contas, network] = await Promise.all([
		provider.send(solicitarPermissao ? "eth_requestAccounts" : "eth_accounts", []),
		provider.getNetwork(),
	]);
	const address = (contas as string[])[0];

	if (!address) {
		return {
			...ESTADO_INICIAL_CARTEIRA,
			chainLabel: formatarBlockchain(network.chainId),
		};
	}

	const depositContract = criarRepairDepositGateway(criarRepairDAOBrowserContractClient(provider), obterRedeSelecionadaNoCliente());

	const [balanceWei, ethUsdPriceRaw] = await Promise.all([
		provider.getBalance(address),
		depositContract.readContract<bigint>({ functionName: "getEthUsdPrice" }).catch(() => 0n),
	]);

	const ethBalance = formatEther(balanceWei);
	const ethUsdPrice = normalizarPrecoEthUsd(ethUsdPriceRaw);
	const usdBalance = Number(ethBalance) * ethUsdPrice;

	return {
		connected: true,
		address,
		chainLabel: formatarBlockchain(network.chainId),
		ethBalance,
		usdBalance: usdBalance.toFixed(2),
		ethUsdPrice: ethUsdPrice.toFixed(2),
	};
}

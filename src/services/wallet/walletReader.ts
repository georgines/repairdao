import { BrowserProvider, Contract, formatEther, formatUnits } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import { formatarBlockchain, normalizarPrecoEthUsd } from "@/services/wallet/formatters";
import { ESTADO_INICIAL_CARTEIRA, type WalletSnapshot } from "@/services/wallet/walletSnapshot";
import type { EthereumProvider } from "@/services/wallet/provider";

const TOKEN_READ_ABI = [
	{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "balance", type: "uint256" }] },
	{ type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "decimals", type: "uint8" }] },
] as const;

const ETH_USD_ABI = [
	{ type: "function", name: "getEthUsdPrice", stateMutability: "view", inputs: [], outputs: [{ name: "price", type: "int256" }] },
] as const;

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

	const tokenContract = new Contract(REPAIRDAO_CONTRACTOS.token.address, TOKEN_READ_ABI, provider);
	const depositContract = new Contract(REPAIRDAO_CONTRACTOS.deposit.address, ETH_USD_ABI, provider);

	const [balanceWei, tokenBalanceRaw, decimalsRaw, ethUsdPriceRaw] = await Promise.all([
		provider.getBalance(address),
		tokenContract.balanceOf(address),
		tokenContract.decimals().catch(() => 18),
		depositContract.getEthUsdPrice().catch(() => 0),
	]);

	const decimals = Number(decimalsRaw);
	const tokenBalance = formatUnits(tokenBalanceRaw, Number.isFinite(decimals) ? decimals : 18);
	const ethBalance = formatEther(balanceWei);
	const ethUsdPrice = normalizarPrecoEthUsd(ethUsdPriceRaw);
	const usdBalance = Number.isFinite(ethUsdPrice) ? Number(ethBalance) * ethUsdPrice : 0;

	return {
		connected: true,
		address,
		chainLabel: formatarBlockchain(network.chainId),
		tokenBalance,
		ethBalance,
		usdBalance: usdBalance.toFixed(2),
	};
}

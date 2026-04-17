import { BrowserProvider, Contract, formatEther, formatUnits } from "ethers";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

const TOKEN_READ_ABI = [
	{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "balance", type: "uint256" }] },
	{ type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "decimals", type: "uint8" }] },
] as const;

const ETH_USD_ABI = [
	{ type: "function", name: "getEthUsdPrice", stateMutability: "view", inputs: [], outputs: [{ name: "price", type: "int256" }] },
] as const;

const CHAIN_NAMES: Record<string, string> = {
	"1": "Ethereum",
	"5": "Goerli",
	"10": "Optimism",
	"137": "Polygon",
	"31337": "Local",
	"42161": "Arbitrum",
	"8453": "Base",
	"11155111": "Sepolia",
};

const AUTO_CONNECT_STORAGE_KEY = "repairdao.wallet.autoconnect";

export type EthereumProvider = {
	request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
	on?: (event: string, handler: (...args: unknown[]) => void) => void;
	removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export type WalletSnapshot = {
	connected: boolean;
	address: string | null;
	chainLabel: string;
	tokenBalance: string;
	ethBalance: string;
	usdBalance: string;
};

export const ESTADO_INICIAL_CARTEIRA: WalletSnapshot = {
	connected: false,
	address: null,
	chainLabel: "Sem conexao",
	tokenBalance: "0",
	ethBalance: "0",
	usdBalance: "$0.00",
};

export function obterEthereumProvider() {
	if (typeof window === "undefined") {
		return undefined;
	}

	return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function formatarEnderecoCurto(address?: string | null) {
	if (!address) {
		return "Carteira desconectada";
	}

	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatarBlockchain(chainId?: bigint | number | null) {
	if (chainId === undefined || chainId === null) {
		return "Sem rede";
	}

	const chave = String(chainId);
	return CHAIN_NAMES[chave] ?? `Chain ${chave}`;
}

export function formatarNumero(valor: string, casasDecimais = 2) {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return new Intl.NumberFormat("pt-BR", {
			minimumFractionDigits: casasDecimais,
			maximumFractionDigits: casasDecimais,
		}).format(0);
	}

	const abs = Math.abs(numero);

	if (abs >= 1_000_000) {
		return new Intl.NumberFormat("pt-BR", {
			notation: "compact",
			maximumFractionDigits: casasDecimais,
		}).format(numero);
	}

	return new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: casasDecimais,
		maximumFractionDigits: casasDecimais,
	}).format(numero);
}

export function formatarUSD(valor: string) {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return "$0.00";
	}

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numero);
}

export function normalizarPrecoEthUsd(valor: bigint | number | string) {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return 0;
	}

	return Math.abs(numero) >= 1_000_000 ? numero / 100_000_000 : numero;
}

export function reconexaoAutomaticaHabilitada() {
	if (typeof window === "undefined") {
		return true;
	}

	return window.localStorage.getItem(AUTO_CONNECT_STORAGE_KEY) !== "false";
}

export function definirReconexaoAutomatica(habilitada: boolean) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(AUTO_CONNECT_STORAGE_KEY, habilitada ? "true" : "false");
}

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

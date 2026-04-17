export {
	formatarBlockchain,
	formatarEnderecoCurto,
	formatarNumero,
	formatarNumeroCompleto,
	formatarUSD,
	normalizarPrecoEthUsd,
} from "@/services/wallet/formatters";
export { definirReconexaoAutomatica, reconexaoAutomaticaHabilitada } from "@/services/wallet/preferences";
export { obterEthereumProvider } from "@/services/wallet/provider";
export { carregarCarteira, obterRedeAtual } from "@/services/wallet/walletReader";
export { comprarToken } from "@/services/wallet/tokenPurchase";
export { ESTADO_INICIAL_CARTEIRA } from "@/services/wallet/walletSnapshot";
export type { EthereumProvider } from "@/services/wallet/provider";
export type { WalletSnapshot } from "@/services/wallet/walletSnapshot";

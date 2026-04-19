import type { RedeBlockchain } from "@/services/blockchain/rpcConfig";

export type SystemConfigurationSnapshot = {
	network: RedeBlockchain;
	depositContractAddress: string;
	depositOwnerAddress: string;
	minDepositRaw: bigint;
	minDeposit: string;
	tokenContractAddress: string;
	tokenOwnerAddress: string;
	tokensPerEthRaw: bigint;
	tokensPerEth: string;
	syncedAt: string;
};

export type SystemConfigurationPersisted = {
	network: RedeBlockchain;
	depositContractAddress: string;
	depositOwnerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	tokenContractAddress: string;
	tokenOwnerAddress: string;
	tokensPerEthRaw: string;
	tokensPerEth: string;
	syncedAt: string;
	updatedAt: string;
};

export type SystemConfigurationSerialized = Omit<SystemConfigurationSnapshot, "minDepositRaw" | "tokensPerEthRaw"> & {
	minDepositRaw: string;
	tokensPerEthRaw: string;
};

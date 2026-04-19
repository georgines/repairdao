import type { RedeBlockchain } from "@/services/blockchain/rpcConfig";

export type DepositConfigurationSnapshot = {
	network: RedeBlockchain;
	contractAddress: string;
	ownerAddress: string;
	minDepositRaw: bigint;
	minDeposit: string;
	syncedAt: string;
};

export type DepositConfigurationPersisted = {
	network: RedeBlockchain;
	contractAddress: string;
	ownerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	syncedAt: string;
	updatedAt: string;
};

export type DepositConfigurationSerialized = Omit<DepositConfigurationSnapshot, "minDepositRaw"> & {
	minDepositRaw: string;
};


import { prisma } from "@/lib/prisma";
import type { RedeBlockchain } from "@/services/blockchain/rpcConfig";
import type {
	SystemConfigurationPersisted,
	SystemConfigurationSnapshot,
} from "@/services/system/systemConfigurationTypes";

export interface SystemConfigurationUpsertInput {
	network: RedeBlockchain;
	depositContractAddress: string;
	depositOwnerAddress: string;
	minDepositRaw: bigint;
	minDeposit: string;
	tokenContractAddress: string;
	tokenOwnerAddress: string;
	tokensPerEthRaw: bigint;
	tokensPerEth: string;
}

function toSystemConfigurationSnapshot(record: {
	network: string;
	depositContractAddress: string;
	depositOwnerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	tokenContractAddress: string;
	tokenOwnerAddress: string;
	tokensPerEthRaw: string;
	tokensPerEth: string;
	syncedAt: Date;
}): SystemConfigurationSnapshot {
	return {
		network: record.network as RedeBlockchain,
		depositContractAddress: record.depositContractAddress,
		depositOwnerAddress: record.depositOwnerAddress,
		minDepositRaw: BigInt(record.minDepositRaw),
		minDeposit: record.minDeposit,
		tokenContractAddress: record.tokenContractAddress,
		tokenOwnerAddress: record.tokenOwnerAddress,
		tokensPerEthRaw: BigInt(record.tokensPerEthRaw || "0"),
		tokensPerEth: record.tokensPerEth,
		syncedAt: record.syncedAt.toISOString(),
	};
}

function toSystemConfigurationPersisted(record: {
	network: string;
	depositContractAddress: string;
	depositOwnerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	tokenContractAddress: string;
	tokenOwnerAddress: string;
	tokensPerEthRaw: string;
	tokensPerEth: string;
	syncedAt: Date;
	updatedAt: Date;
}): SystemConfigurationPersisted {
	return {
		network: record.network as RedeBlockchain,
		depositContractAddress: record.depositContractAddress,
		depositOwnerAddress: record.depositOwnerAddress,
		minDepositRaw: record.minDepositRaw,
		minDeposit: record.minDeposit,
		tokenContractAddress: record.tokenContractAddress,
		tokenOwnerAddress: record.tokenOwnerAddress,
		tokensPerEthRaw: record.tokensPerEthRaw,
		tokensPerEth: record.tokensPerEth,
		syncedAt: record.syncedAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export async function upsertSystemConfiguration(input: SystemConfigurationUpsertInput): Promise<SystemConfigurationPersisted> {
	const record = await prisma.depositConfiguration.upsert({
		where: { network: input.network },
		create: {
			network: input.network,
			contractAddress: input.depositContractAddress,
			ownerAddress: input.depositOwnerAddress,
			minDepositRaw: input.minDepositRaw.toString(),
			minDeposit: input.minDeposit,
			tokenContractAddress: input.tokenContractAddress,
			tokenOwnerAddress: input.tokenOwnerAddress,
			tokensPerEthRaw: input.tokensPerEthRaw.toString(),
			tokensPerEth: input.tokensPerEth,
			syncedAt: new Date(),
		},
		update: {
			contractAddress: input.depositContractAddress,
			ownerAddress: input.depositOwnerAddress,
			minDepositRaw: input.minDepositRaw.toString(),
			minDeposit: input.minDeposit,
			tokenContractAddress: input.tokenContractAddress,
			tokenOwnerAddress: input.tokenOwnerAddress,
			tokensPerEthRaw: input.tokensPerEthRaw.toString(),
			tokensPerEth: input.tokensPerEth,
			syncedAt: new Date(),
		},
	});

	return toSystemConfigurationPersisted({
		network: record.network,
		depositContractAddress: record.contractAddress,
		depositOwnerAddress: record.ownerAddress,
		minDepositRaw: record.minDepositRaw,
		minDeposit: record.minDeposit,
		tokenContractAddress: record.tokenContractAddress,
		tokenOwnerAddress: record.tokenOwnerAddress,
		tokensPerEthRaw: record.tokensPerEthRaw,
		tokensPerEth: record.tokensPerEth,
		syncedAt: record.syncedAt,
		updatedAt: record.updatedAt,
	});
}

export async function loadSystemConfiguration(network: RedeBlockchain): Promise<SystemConfigurationSnapshot | null> {
	const record = await prisma.depositConfiguration.findUnique({
		where: { network },
	});

	if (!record) {
		return null;
	}

	return toSystemConfigurationSnapshot({
		network: record.network,
		depositContractAddress: record.contractAddress,
		depositOwnerAddress: record.ownerAddress,
		minDepositRaw: record.minDepositRaw,
		minDeposit: record.minDeposit,
		tokenContractAddress: record.tokenContractAddress,
		tokenOwnerAddress: record.tokenOwnerAddress,
		tokensPerEthRaw: record.tokensPerEthRaw,
		tokensPerEth: record.tokensPerEth,
		syncedAt: record.syncedAt,
	});
}

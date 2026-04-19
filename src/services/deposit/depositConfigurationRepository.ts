import { prisma } from "@/lib/prisma";
import type { DepositConfigurationPersisted, DepositConfigurationSnapshot } from "@/services/deposit/depositConfigurationTypes";
import type { RedeBlockchain } from "@/services/blockchain/rpcConfig";

export interface DepositConfigurationUpsertInput {
	network: RedeBlockchain;
	contractAddress: string;
	ownerAddress: string;
	minDepositRaw: bigint;
	minDeposit: string;
}

function toDepositConfigurationSnapshot(record: {
	network: string;
	contractAddress: string;
	ownerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	syncedAt: Date;
}): DepositConfigurationSnapshot {
	return {
		network: record.network as RedeBlockchain,
		contractAddress: record.contractAddress,
		ownerAddress: record.ownerAddress,
		minDepositRaw: BigInt(record.minDepositRaw),
		minDeposit: record.minDeposit,
		syncedAt: record.syncedAt.toISOString(),
	};
}

function toDepositConfigurationPersisted(record: {
	network: string;
	contractAddress: string;
	ownerAddress: string;
	minDepositRaw: string;
	minDeposit: string;
	syncedAt: Date;
	updatedAt: Date;
}): DepositConfigurationPersisted {
	return {
		network: record.network as RedeBlockchain,
		contractAddress: record.contractAddress,
		ownerAddress: record.ownerAddress,
		minDepositRaw: record.minDepositRaw,
		minDeposit: record.minDeposit,
		syncedAt: record.syncedAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export async function upsertDepositConfiguration(input: DepositConfigurationUpsertInput): Promise<DepositConfigurationPersisted> {
	const record = await prisma.depositConfiguration.upsert({
		where: { network: input.network },
		create: {
			network: input.network,
			contractAddress: input.contractAddress,
			ownerAddress: input.ownerAddress,
			minDepositRaw: input.minDepositRaw.toString(),
			minDeposit: input.minDeposit,
			syncedAt: new Date(),
		},
		update: {
			contractAddress: input.contractAddress,
			ownerAddress: input.ownerAddress,
			minDepositRaw: input.minDepositRaw.toString(),
			minDeposit: input.minDeposit,
			syncedAt: new Date(),
		},
	});

	return toDepositConfigurationPersisted(record);
}

export async function loadDepositConfiguration(network: RedeBlockchain): Promise<DepositConfigurationSnapshot | null> {
	const record = await prisma.depositConfiguration.findUnique({
		where: { network },
	});

	if (!record) {
		return null;
	}

	return toDepositConfigurationSnapshot(record);
}


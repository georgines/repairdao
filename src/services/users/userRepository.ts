import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { UserAuditInput, UserDetails, UserRole, UserSummary, UserSyncInput } from "@/services/users/userTypes";
import { validateUserProfileInput, validateUserWithdrawalInput } from "@/services/users/userValidation";

type PrismaRole = "CLIENTE" | "TECNICO";
type PrismaEventType = "REGISTERED" | "UPDATED" | "WITHDRAWN" | "ROLE_CHANGED";

function toPrismaRole(role: UserRole): PrismaRole {
	return role === "tecnico" ? "TECNICO" : "CLIENTE";
}

function toDomainRole(role: PrismaRole): UserRole {
	return role === "TECNICO" ? "tecnico" : "cliente";
}

function toPrismaEventType(eventType: UserAuditInput["eventType"]): PrismaEventType {
	return eventType === "role_changed"
		? "ROLE_CHANGED"
		: eventType === "withdrawn"
			? "WITHDRAWN"
			: eventType.toUpperCase() as PrismaEventType;
}

function toUserDetails(user: {
	address: string;
	name: string;
	expertiseArea: string | null;
	role: PrismaRole;
	badgeLevel: string;
	reputation: number;
	depositLevel: number;
	isActive: boolean;
	isEligible: boolean;
	updatedAt: Date;
	syncedAt: Date;
}): UserDetails {
	return {
		address: user.address,
		name: user.name,
		expertiseArea: user.expertiseArea,
		role: toDomainRole(user.role),
		badgeLevel: user.badgeLevel,
		reputation: user.reputation,
		depositLevel: user.depositLevel,
		isActive: user.isActive,
		isEligible: user.isEligible,
		updatedAt: user.updatedAt.toISOString(),
		syncedAt: user.syncedAt.toISOString(),
	};
}

function toUserSummary(user: UserDetails): UserSummary {
	return {
		address: user.address,
		name: user.name,
		expertiseArea: user.expertiseArea,
		role: user.role,
		badgeLevel: user.badgeLevel,
		reputation: user.reputation,
		depositLevel: user.depositLevel,
		isActive: user.isActive,
		isEligible: user.isEligible,
		updatedAt: user.updatedAt,
	};
}

async function recordAuditEvent(tx: Prisma.TransactionClient, audit: UserAuditInput) {
	await tx.userAuditEvent.create({
		data: {
			address: validateUserWithdrawalInput(audit.address),
			eventType: toPrismaEventType(audit.eventType),
			details: audit.details,
		},
	});
}

export async function saveOrUpdateUser(user: UserSyncInput): Promise<UserDetails> {
	const dados = validateUserProfileInput(user);

	const record = await prisma.userProfile.upsert({
		where: { address: dados.address },
		create: {
			address: dados.address,
			searchName: dados.name.toLowerCase(),
			name: dados.name,
			expertiseArea: dados.expertiseArea,
			role: toPrismaRole(dados.role),
			badgeLevel: dados.badgeLevel,
			reputation: dados.reputation,
			depositLevel: dados.depositLevel,
			isActive: dados.isActive,
			isEligible: dados.isEligible,
			syncedAt: new Date(),
		},
		update: {
			searchName: dados.name.toLowerCase(),
			name: dados.name,
			expertiseArea: dados.expertiseArea,
			role: toPrismaRole(dados.role),
			badgeLevel: dados.badgeLevel,
			reputation: dados.reputation,
			depositLevel: dados.depositLevel,
			isActive: dados.isActive,
			isEligible: dados.isEligible,
			syncedAt: new Date(),
		},
	});

	return toUserDetails(record);
}

async function upsertUserProfileWithAudit(
	user: UserSyncInput,
	eventType: UserAuditInput["eventType"],
	details: string,
): Promise<UserDetails> {
	return prisma.$transaction(async (tx) => {
		const dados = validateUserProfileInput(user);

		const record = await tx.userProfile.upsert({
			where: { address: dados.address },
			create: {
				address: dados.address,
				searchName: dados.name.toLowerCase(),
				name: dados.name,
				expertiseArea: dados.expertiseArea,
				role: toPrismaRole(dados.role),
				badgeLevel: dados.badgeLevel,
				reputation: dados.reputation,
				depositLevel: dados.depositLevel,
				isActive: dados.isActive,
				isEligible: dados.isEligible,
				syncedAt: new Date(),
			},
			update: {
				searchName: dados.name.toLowerCase(),
				name: dados.name,
				expertiseArea: dados.expertiseArea,
				role: toPrismaRole(dados.role),
				badgeLevel: dados.badgeLevel,
				reputation: dados.reputation,
				depositLevel: dados.depositLevel,
				isActive: dados.isActive,
				isEligible: dados.isEligible,
				syncedAt: new Date(),
			},
		});

		await recordAuditEvent(tx, {
			address: dados.address,
			eventType,
			details,
		});

		return toUserDetails(record);
	});
}

export async function registerUser(user: UserSyncInput): Promise<UserDetails> {
	return upsertUserProfileWithAudit(user, "registered", "User registered in the local projection.");
}

export async function updateUserProfile(user: UserSyncInput): Promise<UserDetails> {
	return upsertUserProfileWithAudit(user, "updated", "User profile updated in the local projection.");
}

export async function updateUserRole(address: string, role: UserRole): Promise<UserDetails | null> {
	const normalizedAddress = validateUserWithdrawalInput(address);
	const user = await prisma.userProfile.findUnique({ where: { address: normalizedAddress } });

	if (!user) {
		return null;
	}

	const updated = await prisma.userProfile.update({
		where: { address: normalizedAddress },
		data: {
			role: toPrismaRole(role),
			isEligible: role === "tecnico",
			expertiseArea: role === "tecnico" ? user.expertiseArea : null,
		},
	});

	await prisma.userAuditEvent.create({
		data: {
			address: normalizedAddress,
			eventType: "ROLE_CHANGED",
			details: `Role changed to ${role}.`,
		},
	});

	return toUserDetails(updated);
}

export async function withdrawUser(address: string): Promise<boolean> {
	const normalizedAddress = validateUserWithdrawalInput(address);
	const user = await prisma.userProfile.findUnique({ where: { address: normalizedAddress } });

	if (!user) {
		return false;
	}

	await prisma.$transaction([
		prisma.userAuditEvent.deleteMany({
			where: { address: normalizedAddress },
		}),
		prisma.userProfile.delete({ where: { address: normalizedAddress } }),
	]);

	return true;
}

export async function listEligibleTechnicians(): Promise<UserSummary[]> {
	const users = await prisma.userProfile.findMany({
		where: {
			role: "TECNICO",
			isActive: true,
			isEligible: true,
		},
		orderBy: [{ reputation: "desc" }, { name: "asc" }],
	});

	return users.map((user) => toUserSummary(toUserDetails(user)));
}

export async function listUsers(): Promise<UserSummary[]> {
	const users = await prisma.userProfile.findMany({
		orderBy: [{ name: "asc" }, { updatedAt: "desc" }],
	});

	return users.map((user) => toUserSummary(toUserDetails(user)));
}

export async function getUserDetails(address: string): Promise<UserDetails | null> {
	const user = await prisma.userProfile.findUnique({
		where: {
			address: validateUserWithdrawalInput(address),
		},
	});

	if (!user) {
		return null;
	}

	return toUserDetails(user);
}

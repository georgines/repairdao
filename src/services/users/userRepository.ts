import { prisma } from "@/lib/prisma";
import type { UserAuditInput, UserDetails, UserRole, UserSummary, UserSyncInput } from "@/services/users/userTypes";

type PrismaRole = "CLIENTE" | "TECNICO";
type PrismaEventType = "REGISTERED" | "UPDATED" | "WITHDRAWN" | "ROLE_CHANGED";

function normalizeAddress(address: string) {
	return address.trim().toLowerCase();
}

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
		role: user.role,
		badgeLevel: user.badgeLevel,
		reputation: user.reputation,
		depositLevel: user.depositLevel,
		isActive: user.isActive,
		isEligible: user.isEligible,
		updatedAt: user.updatedAt,
	};
}

async function recordAuditEvent(audit: UserAuditInput) {
	await prisma.userAuditEvent.create({
		data: {
			address: normalizeAddress(audit.address),
			eventType: toPrismaEventType(audit.eventType),
			details: audit.details,
		},
	});
}

export async function saveOrUpdateUser(user: UserSyncInput): Promise<UserDetails> {
	const address = normalizeAddress(user.address);
	const record = await prisma.userProfile.upsert({
		where: { address },
		create: {
			address,
			searchName: normalizeAddress(user.name),
			name: user.name.trim(),
			role: toPrismaRole(user.role),
			badgeLevel: user.badgeLevel.trim(),
			reputation: Math.trunc(user.reputation),
			depositLevel: Math.trunc(user.depositLevel),
			isActive: user.isActive,
			isEligible: user.isEligible,
			syncedAt: new Date(),
		},
		update: {
			searchName: normalizeAddress(user.name),
			name: user.name.trim(),
			role: toPrismaRole(user.role),
			badgeLevel: user.badgeLevel.trim(),
			reputation: Math.trunc(user.reputation),
			depositLevel: Math.trunc(user.depositLevel),
			isActive: user.isActive,
			isEligible: user.isEligible,
			syncedAt: new Date(),
		},
	});

	return toUserDetails(record);
}

export async function registerUser(user: UserSyncInput): Promise<UserDetails> {
	const record = await saveOrUpdateUser(user);

	await recordAuditEvent({
		address: user.address,
		eventType: "registered",
		details: "User registered in the local projection.",
	});

	return record;
}

export async function updateUserRole(address: string, role: UserRole): Promise<UserDetails | null> {
	const normalizedAddress = normalizeAddress(address);
	const user = await prisma.userProfile.findUnique({ where: { address: normalizedAddress } });

	if (!user) {
		return null;
	}

	const updated = await prisma.userProfile.update({
		where: { address: normalizedAddress },
		data: {
			role: toPrismaRole(role),
			isEligible: role === "tecnico",
		},
	});

	await recordAuditEvent({
		address: normalizedAddress,
		eventType: "role_changed",
		details: `Role changed to ${role}.`,
	});

	return toUserDetails(updated);
}

export async function withdrawUser(address: string): Promise<boolean> {
	const normalizedAddress = normalizeAddress(address);
	const user = await prisma.userProfile.findUnique({ where: { address: normalizedAddress } });

	if (!user) {
		return false;
	}

	await prisma.userProfile.delete({ where: { address: normalizedAddress } });

	await recordAuditEvent({
		address: normalizedAddress,
		eventType: "withdrawn",
		details: "User removed from the local projection after withdrawal.",
	});

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

export async function getUserDetails(address: string): Promise<UserDetails | null> {
	const user = await prisma.userProfile.findUnique({
		where: {
			address: normalizeAddress(address),
		},
	});

	if (!user) {
		return null;
	}

	return toUserDetails(user);
}

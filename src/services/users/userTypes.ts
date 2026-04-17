export type UserRole = "cliente" | "tecnico";

export type UserEventType = "registered" | "updated" | "withdrawn" | "role_changed";

export type UserSummary = {
	address: string;
	name: string;
	role: UserRole;
	badgeLevel: string;
	reputation: number;
	depositLevel: number;
	isActive: boolean;
	isEligible: boolean;
	updatedAt: string;
};

export type UserDetails = UserSummary & {
	syncedAt: string;
};

export type UserSyncInput = {
	address: string;
	name: string;
	role: UserRole;
	badgeLevel: string;
	reputation: number;
	depositLevel: number;
	isActive: boolean;
	isEligible: boolean;
};

export type UserAuditInput = {
	address: string;
	eventType: UserEventType;
	details: string;
};

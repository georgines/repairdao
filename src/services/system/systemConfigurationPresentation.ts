export type SystemConfigurationStatusColor = "teal" | "gray";

export function getSystemConfigurationStatusLabel(isDepositOwner: boolean, isTokenOwner: boolean, canCreateProposal: boolean) {
	if (isDepositOwner && isTokenOwner) {
		return "Dono autenticado";
	}

	if (canCreateProposal) {
		return "Acesso a propostas";
	}

	if (isDepositOwner || isTokenOwner) {
		return "Acesso parcial";
	}

	return "Apenas leitura";
}

export function getSystemConfigurationStatusColor(isDepositOwner: boolean, isTokenOwner: boolean, canCreateProposal: boolean): SystemConfigurationStatusColor {
	if (isDepositOwner || isTokenOwner || canCreateProposal) {
		return "teal";
	}

	return "gray";
}

export function getSystemConfigurationWalletNotice(walletAddress: string | null) {
	if (walletAddress) {
		return walletAddress;
	}

	return "Carteira desconectada";
}

export function getSystemConfigurationDisconnectedNotice() {
	return {
		heading: "Configuracoes do sistema",
		title: "Carteira desconectada",
		message: "Conecte a carteira autorizada para visualizar esta tela.",
		color: "yellow" as const,
	};
}

export function getSystemConfigurationRestrictedNotice() {
	return {
		heading: null,
		title: "Acesso restrito",
		message: "A carteira conectada nao pode criar propostas de configuracao.",
		color: "gray" as const,
	};
}

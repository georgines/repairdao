export function getDepositConfigurationStatusLabel(isOwner: boolean, canCreateProposal: boolean) {
	if (isOwner) {
		return "Dono autenticado";
	}

	return canCreateProposal ? "Acesso a propostas" : "Apenas leitura";
}

export function getDepositConfigurationStatusColor(isOwner: boolean, canCreateProposal: boolean) {
	return isOwner || canCreateProposal ? ("teal" as const) : ("gray" as const);
}

export function getDepositConfigurationWalletNotice(walletAddress: string | null) {
	return walletAddress ?? "Carteira desconectada";
}

export function getDepositConfigurationFooterNotice(connected: boolean) {
	return connected
		? "A mudanca sera enviada como proposta de governanca."
		: "Conecte a carteira para criar propostas.";
}

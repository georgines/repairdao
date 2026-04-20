export function getDepositConfigurationStatusLabel(isOwner: boolean) {
	return isOwner ? "Dono autenticado" : "Apenas leitura";
}

export function getDepositConfigurationStatusColor(isOwner: boolean) {
	return isOwner ? ("teal" as const) : ("gray" as const);
}

export function getDepositConfigurationWalletNotice(walletAddress: string | null) {
	return walletAddress ?? "Carteira desconectada";
}

export function getDepositConfigurationFooterNotice(connected: boolean) {
	return connected
		? "Alteracao sera enviada ao contrato e espelhada no banco."
		: "Conecte a carteira para alterar.";
}

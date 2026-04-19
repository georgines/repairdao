"use client";

import { Alert, Paper, Stack, Text } from "@mantine/core";
import { useDepositConfiguration } from "@/hooks/useDepositConfiguration";
import { DepositConfigurationPanelView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelView";

export function DepositConfigurationPanel() {
	const panel = useDepositConfiguration();

	if (!panel.connected) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Stack gap="sm">
					<Text fw={700}>Deposito minimo para ativacao</Text>
					<Alert color="yellow" title="Carteira desconectada">
						Conecte a carteira do dono do contrato para visualizar esta tela.
					</Alert>
				</Stack>
			</Paper>
		);
	}

	if (!panel.isOwner) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Alert color="gray" title="Acesso restrito">
					A carteira conectada nao e o dono do contrato.
				</Alert>
			</Paper>
		);
	}

	return (
		<DepositConfigurationPanelView
			loading={panel.loading}
			error={panel.error}
			formError={panel.formError}
			connected={panel.connected}
			isOwner={panel.isOwner}
			walletAddress={panel.walletAddress}
			donoAtualCurto={panel.donoAtualCurto}
			minDeposit={panel.minDeposit}
			editingMinDeposit={panel.editingMinDeposit}
			saving={panel.saving}
			onEditingMinDepositChange={panel.setEditingMinDeposit}
			onSubmit={panel.submit}
		/>
	);
}


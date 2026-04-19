"use client";

import { Alert, Paper, Stack, Text } from "@mantine/core";
import { useSystemConfiguration } from "@/hooks/useSystemConfiguration";
import { SystemConfigurationPanelView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelView";

export function SystemConfigurationPanel() {
	const panel = useSystemConfiguration();

	if (!panel.connected) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Stack gap="sm">
					<Text fw={700}>Configuracoes do sistema</Text>
					<Alert color="yellow" title="Carteira desconectada">
						Conecte a carteira autorizada para visualizar esta tela.
					</Alert>
				</Stack>
			</Paper>
		);
	}

	if (!panel.isOwner) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Alert color="gray" title="Acesso restrito">
					A carteira conectada nao e dona de nenhuma configuracao do sistema.
				</Alert>
			</Paper>
		);
	}

	return (
		<SystemConfigurationPanelView
			loading={panel.loading}
			error={panel.error}
			minDepositError={panel.minDepositError}
			tokensPerEthError={panel.tokensPerEthError}
			connected={panel.connected}
			isDepositOwner={panel.isDepositOwner}
			isTokenOwner={panel.isTokenOwner}
			walletAddress={panel.walletAddress}
			donoDepositoAtualCurto={panel.donoDepositoAtualCurto}
			donoTokenAtualCurto={panel.donoTokenAtualCurto}
			minDeposit={panel.minDeposit}
			editingMinDeposit={panel.editingMinDeposit}
			savingMinDeposit={panel.savingMinDeposit}
			tokensPerEth={panel.tokensPerEth}
			editingTokensPerEth={panel.editingTokensPerEth}
			savingTokensPerEth={panel.savingTokensPerEth}
			onEditingMinDepositChange={panel.setEditingMinDeposit}
			onEditingTokensPerEthChange={panel.setEditingTokensPerEth}
			onSubmitMinDeposit={panel.submitMinDeposit}
			onSubmitTokensPerEth={panel.submitTokensPerEth}
		/>
	);
}

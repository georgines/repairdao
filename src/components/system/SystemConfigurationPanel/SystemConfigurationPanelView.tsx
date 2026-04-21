"use client";

import { Paper, Stack } from "@mantine/core";
import styles from "./SystemConfigurationPanelView.module.css";
import { SystemConfigurationPanelLoading } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelLoading/SystemConfigurationPanelLoading";
import { SystemConfigurationPanelHeader } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelHeader/SystemConfigurationPanelHeader";
import { SystemConfigurationPanelOverview } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelOverview/SystemConfigurationPanelOverview";
import { SystemConfigurationPanelAlert } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAlert/SystemConfigurationPanelAlert";
import { SystemConfigurationPanelSetting } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelSetting/SystemConfigurationPanelSetting";
import {
	getSystemConfigurationStatusColor,
	getSystemConfigurationStatusLabel,
	getSystemConfigurationWalletNotice,
} from "@/services/system/systemConfigurationPresentation";

export type SystemConfigurationPanelStatusProps = {
	loading: boolean;
	connected: boolean;
	isDepositOwner: boolean;
	isTokenOwner: boolean;
	canCreateProposal: boolean;
	walletAddress: string | null;
};

export type SystemConfigurationPanelOverviewProps = {
	donoDepositoAtualCurto: string;
	donoTokenAtualCurto: string;
	minDeposit: string;
	tokensPerEth: string;
};

export type SystemConfigurationPanelAlertsProps = {
	error: string | null;
	minDepositError: string | null;
	tokensPerEthError: string | null;
};

export type SystemConfigurationPanelSettingsProps = {
	editingMinDeposit: string;
	editingTokensPerEth: string;
	savingMinDeposit: boolean;
	savingTokensPerEth: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onEditingTokensPerEthChange: (value: string) => void;
	onSubmitMinDeposit: () => Promise<void>;
	onSubmitTokensPerEth: () => Promise<void>;
};

export type SystemConfigurationPanelViewProps = {
	status: SystemConfigurationPanelStatusProps;
	overview: SystemConfigurationPanelOverviewProps;
	alerts: SystemConfigurationPanelAlertsProps;
	settings: SystemConfigurationPanelSettingsProps;
};

export function SystemConfigurationPanelView({ status, overview, alerts, settings }: SystemConfigurationPanelViewProps) {
	if (status.loading) {
		return <SystemConfigurationPanelLoading />;
	}

	const statusLabel = getSystemConfigurationStatusLabel(status.isDepositOwner, status.isTokenOwner, status.canCreateProposal);
	const statusColor = getSystemConfigurationStatusColor(status.isDepositOwner, status.isTokenOwner, status.canCreateProposal);
	const walletNotice = getSystemConfigurationWalletNotice(status.walletAddress);

	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Stack gap="lg" className={styles.root}>
				<SystemConfigurationPanelHeader statusLabel={statusLabel} statusColor={statusColor} />

				<SystemConfigurationPanelOverview
					minDeposit={overview.minDeposit}
					tokensPerEth={overview.tokensPerEth}
					donoDepositoAtualCurto={overview.donoDepositoAtualCurto}
					donoTokenAtualCurto={overview.donoTokenAtualCurto}
					walletNotice={walletNotice}
				/>

				<SystemConfigurationPanelAlert title="Falha ao carregar" message={alerts.error} />

				<SystemConfigurationPanelSetting
					title="Deposito minimo"
					description="A mudanca cria uma proposta de governanca para o deposito minimo."
					errorTitle="Nao foi possivel criar proposta"
					errorMessage={alerts.minDepositError}
					value={settings.editingMinDeposit}
					disabled={!status.connected || !status.canCreateProposal}
					saving={settings.savingMinDeposit}
					unitLabel="RPT"
					submitLabel="Criar proposta do deposito"
					onChange={settings.onEditingMinDepositChange}
					onSubmit={settings.onSubmitMinDeposit}
				/>

				<SystemConfigurationPanelSetting
					title="Taxa de cambio ETH para RPT"
					description="A mudanca cria uma proposta de governanca para a taxa de cambio."
					errorTitle="Nao foi possivel criar proposta"
					errorMessage={alerts.tokensPerEthError}
					value={settings.editingTokensPerEth}
					disabled={!status.connected || !status.canCreateProposal}
					saving={settings.savingTokensPerEth}
					unitLabel="RPT"
					submitLabel="Criar proposta da taxa"
					onChange={settings.onEditingTokensPerEthChange}
					onSubmit={settings.onSubmitTokensPerEth}
				/>
			</Stack>
		</Paper>
	);
}

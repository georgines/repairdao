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

type SystemConfigurationPanelViewProps = {
	loading: boolean;
	error: string | null;
	minDepositError: string | null;
	tokensPerEthError: string | null;
	connected: boolean;
	isDepositOwner: boolean;
	isTokenOwner: boolean;
	walletAddress: string | null;
	donoDepositoAtualCurto: string;
	donoTokenAtualCurto: string;
	minDeposit: string;
	editingMinDeposit: string;
	savingMinDeposit: boolean;
	tokensPerEth: string;
	editingTokensPerEth: string;
	savingTokensPerEth: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onEditingTokensPerEthChange: (value: string) => void;
	onSubmitMinDeposit: () => Promise<void>;
	onSubmitTokensPerEth: () => Promise<void>;
};

export function SystemConfigurationPanelView({
	loading,
	error,
	minDepositError,
	tokensPerEthError,
	connected,
	isDepositOwner,
	isTokenOwner,
	walletAddress,
	donoDepositoAtualCurto,
	donoTokenAtualCurto,
	minDeposit,
	editingMinDeposit,
	savingMinDeposit,
	tokensPerEth,
	editingTokensPerEth,
	savingTokensPerEth,
	onEditingMinDepositChange,
	onEditingTokensPerEthChange,
	onSubmitMinDeposit,
	onSubmitTokensPerEth,
}: SystemConfigurationPanelViewProps) {
	if (loading) {
		return <SystemConfigurationPanelLoading />;
	}

	const statusLabel = getSystemConfigurationStatusLabel(isDepositOwner, isTokenOwner);
	const statusColor = getSystemConfigurationStatusColor(isDepositOwner, isTokenOwner);
	const walletNotice = getSystemConfigurationWalletNotice(walletAddress);

	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Stack gap="lg" className={styles.root}>
				<SystemConfigurationPanelHeader statusLabel={statusLabel} statusColor={statusColor} />

				<SystemConfigurationPanelOverview
					minDeposit={minDeposit}
					tokensPerEth={tokensPerEth}
					donoDepositoAtualCurto={donoDepositoAtualCurto}
					donoTokenAtualCurto={donoTokenAtualCurto}
					walletNotice={walletNotice}
				/>

				<SystemConfigurationPanelAlert title="Falha ao carregar" message={error} />

				<SystemConfigurationPanelSetting
					title="Deposito minimo"
					description="Valor exigido para ativacao da conta."
					errorTitle="Nao foi possivel salvar"
					errorMessage={minDepositError}
					value={editingMinDeposit}
					disabled={!connected || !isDepositOwner}
					saving={savingMinDeposit}
					unitLabel="RPT"
					submitLabel="Salvar deposito minimo"
					onChange={onEditingMinDepositChange}
					onSubmit={onSubmitMinDeposit}
				/>

				<SystemConfigurationPanelSetting
					title="Taxa de cambio ETH para RPT"
					description="Quantidade de RPT emitida para cada 1 ETH."
					errorTitle="Nao foi possivel salvar"
					errorMessage={tokensPerEthError}
					value={editingTokensPerEth}
					disabled={!connected || !isTokenOwner}
					saving={savingTokensPerEth}
					unitLabel="RPT"
					submitLabel="Salvar taxa de cambio"
					onChange={onEditingTokensPerEthChange}
					onSubmit={onSubmitTokensPerEth}
				/>
			</Stack>
		</Paper>
	);
}

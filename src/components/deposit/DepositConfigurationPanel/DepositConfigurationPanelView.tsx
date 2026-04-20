"use client";

import { Paper, Stack } from "@mantine/core";
import styles from "./DepositConfigurationPanelView.module.css";
import { DepositConfigurationPanelLoading } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelLoading/DepositConfigurationPanelLoading";
import { DepositConfigurationPanelHeader } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeader/DepositConfigurationPanelHeader";
import { DepositConfigurationPanelAlerts } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAlerts/DepositConfigurationPanelAlerts";
import { DepositConfigurationPanelForm } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelForm/DepositConfigurationPanelForm";
import {
	getDepositConfigurationStatusColor,
	getDepositConfigurationStatusLabel,
	getDepositConfigurationWalletNotice,
} from "@/services/deposit/depositConfigurationPresentation";

type DepositConfigurationPanelViewProps = {
	loading: boolean;
	error: string | null;
	formError: string | null;
	connected: boolean;
	isOwner: boolean;
	walletAddress: string | null;
	donoAtualCurto: string;
	minDeposit: string;
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onSubmit: () => Promise<void>;
};

export function DepositConfigurationPanelView({
	loading,
	error,
	formError,
	connected,
	isOwner,
	walletAddress,
	donoAtualCurto,
	minDeposit,
	editingMinDeposit,
	saving,
	onEditingMinDepositChange,
	onSubmit,
}: DepositConfigurationPanelViewProps) {
	if (loading) {
		return <DepositConfigurationPanelLoading />;
	}

	const statusLabel = getDepositConfigurationStatusLabel(isOwner);
	const statusColor = getDepositConfigurationStatusColor(isOwner);
	const walletNotice = getDepositConfigurationWalletNotice(walletAddress);

	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Stack gap="md" className={styles.root}>
				<DepositConfigurationPanelHeader
					statusLabel={statusLabel}
					statusColor={statusColor}
					minDeposit={minDeposit}
					donoAtualCurto={donoAtualCurto}
					walletNotice={walletNotice}
				/>

				<DepositConfigurationPanelAlerts error={error} formError={formError} />

				<DepositConfigurationPanelForm
					connected={connected}
					isOwner={isOwner}
					editingMinDeposit={editingMinDeposit}
					saving={saving}
					onEditingMinDepositChange={onEditingMinDepositChange}
					onSubmit={onSubmit}
				/>
			</Stack>
		</Paper>
	);
}

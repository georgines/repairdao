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

export type DepositConfigurationPanelStatusProps = {
	loading: boolean;
	connected: boolean;
	isOwner: boolean;
	canCreateProposal: boolean;
	walletAddress: string | null;
	donoAtualCurto: string;
	minDeposit: string;
};

export type DepositConfigurationPanelAlertsProps = {
	error: string | null;
	formError: string | null;
};

export type DepositConfigurationPanelFormProps = {
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onSubmit: () => Promise<void>;
};

export type DepositConfigurationPanelViewProps = {
	status: DepositConfigurationPanelStatusProps;
	alerts: DepositConfigurationPanelAlertsProps;
	form: DepositConfigurationPanelFormProps;
};

export function DepositConfigurationPanelView({ status, alerts, form }: DepositConfigurationPanelViewProps) {
	if (status.loading) {
		return <DepositConfigurationPanelLoading />;
	}

	const statusLabel = getDepositConfigurationStatusLabel(status.isOwner, status.canCreateProposal);
	const statusColor = getDepositConfigurationStatusColor(status.isOwner, status.canCreateProposal);
	const walletNotice = getDepositConfigurationWalletNotice(status.walletAddress);

	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Stack gap="md" className={styles.root}>
				<DepositConfigurationPanelHeader
					statusLabel={statusLabel}
					statusColor={statusColor}
					minDeposit={status.minDeposit}
					donoAtualCurto={status.donoAtualCurto}
					walletNotice={walletNotice}
				/>

				<DepositConfigurationPanelAlerts error={alerts.error} formError={alerts.formError} />

				<DepositConfigurationPanelForm
					connected={status.connected}
					isOwner={status.isOwner}
					editingMinDeposit={form.editingMinDeposit}
					saving={form.saving}
					onEditingMinDepositChange={form.onEditingMinDepositChange}
					onSubmit={form.onSubmit}
				/>
			</Stack>
		</Paper>
	);
}

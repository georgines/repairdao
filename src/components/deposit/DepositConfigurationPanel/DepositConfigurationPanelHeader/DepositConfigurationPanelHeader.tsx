"use client";

import { DepositConfigurationPanelHeaderView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeader/DepositConfigurationPanelHeaderView";

type DepositConfigurationPanelHeaderProps = {
	statusLabel: string;
	statusColor: "teal" | "gray";
	minDeposit: string;
	donoAtualCurto: string;
	walletNotice: string;
};

export function DepositConfigurationPanelHeader(props: DepositConfigurationPanelHeaderProps) {
	return <DepositConfigurationPanelHeaderView {...props} />;
}

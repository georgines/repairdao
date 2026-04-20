"use client";

import { DepositConfigurationPanelHeaderTopView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeaderTop/DepositConfigurationPanelHeaderTopView";

type DepositConfigurationPanelHeaderTopProps = {
	statusLabel: string;
	statusColor: "teal" | "gray";
};

export function DepositConfigurationPanelHeaderTop(props: DepositConfigurationPanelHeaderTopProps) {
	return <DepositConfigurationPanelHeaderTopView {...props} />;
}

"use client";

import { DepositConfigurationPanelHeaderDetailsView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeaderDetails/DepositConfigurationPanelHeaderDetailsView";

type DepositConfigurationPanelHeaderDetailsProps = {
	minDeposit: string;
	donoAtualCurto: string;
	walletNotice: string;
};

export function DepositConfigurationPanelHeaderDetails(props: DepositConfigurationPanelHeaderDetailsProps) {
	return <DepositConfigurationPanelHeaderDetailsView {...props} />;
}

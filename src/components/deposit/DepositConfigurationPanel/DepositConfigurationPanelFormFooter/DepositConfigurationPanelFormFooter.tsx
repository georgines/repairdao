"use client";

import { DepositConfigurationPanelFormFooterView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormFooter/DepositConfigurationPanelFormFooterView";

type DepositConfigurationPanelFormFooterProps = {
	connected: boolean;
	isOwner: boolean;
	saving: boolean;
	onSubmit: () => Promise<void>;
};

export function DepositConfigurationPanelFormFooter(props: DepositConfigurationPanelFormFooterProps) {
	return <DepositConfigurationPanelFormFooterView {...props} />;
}

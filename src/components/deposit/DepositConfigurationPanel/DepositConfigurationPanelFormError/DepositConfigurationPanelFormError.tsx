"use client";

import { DepositConfigurationPanelFormErrorView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormError/DepositConfigurationPanelFormErrorView";

type DepositConfigurationPanelFormErrorProps = {
	message: string;
};

export function DepositConfigurationPanelFormError(props: DepositConfigurationPanelFormErrorProps) {
	return <DepositConfigurationPanelFormErrorView {...props} />;
}

"use client";

import { DepositConfigurationPanelLoadErrorView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelLoadError/DepositConfigurationPanelLoadErrorView";

type DepositConfigurationPanelLoadErrorProps = {
	message: string;
};

export function DepositConfigurationPanelLoadError(props: DepositConfigurationPanelLoadErrorProps) {
	return <DepositConfigurationPanelLoadErrorView {...props} />;
}

"use client";

import { DepositConfigurationPanelAlertsView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAlerts/DepositConfigurationPanelAlertsView";

type DepositConfigurationPanelAlertsProps = {
	error: string | null;
	formError: string | null;
};

export function DepositConfigurationPanelAlerts(props: DepositConfigurationPanelAlertsProps) {
	return <DepositConfigurationPanelAlertsView {...props} />;
}

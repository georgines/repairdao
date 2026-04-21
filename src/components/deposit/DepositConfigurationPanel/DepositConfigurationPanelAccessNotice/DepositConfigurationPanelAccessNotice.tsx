"use client";

import { DepositConfigurationPanelAccessNoticeView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAccessNotice/DepositConfigurationPanelAccessNoticeView";

type DepositConfigurationPanelAccessNoticeProps = {
	connected: boolean;
	canCreateProposal: boolean;
};

export function DepositConfigurationPanelAccessNotice(props: DepositConfigurationPanelAccessNoticeProps) {
	return <DepositConfigurationPanelAccessNoticeView {...props} />;
}

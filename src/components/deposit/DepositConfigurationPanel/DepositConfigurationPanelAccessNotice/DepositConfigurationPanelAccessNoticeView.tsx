import { DepositConfigurationPanelDisconnectedNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelDisconnectedNotice/DepositConfigurationPanelDisconnectedNotice";
import { DepositConfigurationPanelRestrictedNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelRestrictedNotice/DepositConfigurationPanelRestrictedNotice";

type DepositConfigurationPanelAccessNoticeViewProps = {
	connected: boolean;
	canCreateProposal: boolean;
};

export function DepositConfigurationPanelAccessNoticeView({
	connected,
	canCreateProposal,
}: DepositConfigurationPanelAccessNoticeViewProps) {
	if (!connected) {
		return <DepositConfigurationPanelDisconnectedNotice />;
	}

	if (!canCreateProposal) {
		return <DepositConfigurationPanelRestrictedNotice />;
	}

	return null;
}

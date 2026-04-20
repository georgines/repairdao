import { DepositConfigurationPanelDisconnectedNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelDisconnectedNotice/DepositConfigurationPanelDisconnectedNotice";
import { DepositConfigurationPanelRestrictedNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelRestrictedNotice/DepositConfigurationPanelRestrictedNotice";

type DepositConfigurationPanelAccessNoticeViewProps = {
	connected: boolean;
	isOwner: boolean;
};

export function DepositConfigurationPanelAccessNoticeView({
	connected,
	isOwner,
}: DepositConfigurationPanelAccessNoticeViewProps) {
	if (!connected) {
		return <DepositConfigurationPanelDisconnectedNotice />;
	}

	if (!isOwner) {
		return <DepositConfigurationPanelRestrictedNotice />;
	}

	return null;
}

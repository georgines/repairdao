"use client";

import { useDepositConfiguration } from "@/hooks/useDepositConfiguration";
import { DepositConfigurationPanelAccessNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAccessNotice/DepositConfigurationPanelAccessNotice";
import { DepositConfigurationPanelView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelView";

export function DepositConfigurationPanel() {
	const panel = useDepositConfiguration();

	if (!panel.connected || !panel.isOwner) {
		return <DepositConfigurationPanelAccessNotice connected={panel.connected} isOwner={panel.isOwner} />;
	}

	return (
		<DepositConfigurationPanelView
			loading={panel.loading}
			error={panel.error}
			formError={panel.formError}
			connected={panel.connected}
			isOwner={panel.isOwner}
			walletAddress={panel.walletAddress}
			donoAtualCurto={panel.donoAtualCurto}
			minDeposit={panel.minDeposit}
			editingMinDeposit={panel.editingMinDeposit}
			saving={panel.saving}
			onEditingMinDepositChange={panel.setEditingMinDeposit}
			onSubmit={panel.submit}
		/>
	);
}

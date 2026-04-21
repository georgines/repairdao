"use client";

import { useDepositConfiguration } from "@/hooks/useDepositConfiguration";
import { DepositConfigurationPanelAccessNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAccessNotice/DepositConfigurationPanelAccessNotice";
import { DepositConfigurationPanelView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelView";

export function DepositConfigurationPanel() {
	const panel = useDepositConfiguration();

	if (!panel.connected || !panel.canCreateProposal) {
		return <DepositConfigurationPanelAccessNotice connected={panel.connected} canCreateProposal={panel.canCreateProposal} />;
	}

	return (
		<DepositConfigurationPanelView
			status={{
				loading: panel.loading,
				connected: panel.connected,
				isOwner: panel.isOwner,
				canCreateProposal: panel.canCreateProposal,
				walletAddress: panel.walletAddress,
				donoAtualCurto: panel.donoAtualCurto,
				minDeposit: panel.minDeposit,
			}}
			alerts={{
				error: panel.error,
				formError: panel.formError,
			}}
			form={{
				editingMinDeposit: panel.editingMinDeposit,
				saving: panel.saving,
				onEditingMinDepositChange: panel.setEditingMinDeposit,
				onSubmit: panel.submit,
			}}
		/>
	);
}

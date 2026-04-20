"use client";

import { useSystemConfiguration } from "@/hooks/useSystemConfiguration";
import { SystemConfigurationPanelView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelView";
import { SystemConfigurationPanelAccessNotice } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAccessNotice/SystemConfigurationPanelAccessNotice";
import {
	getSystemConfigurationRestrictedNotice,
	getSystemConfigurationDisconnectedNotice,
} from "@/services/system/systemConfigurationPresentation";

export function SystemConfigurationPanel() {
	const panel = useSystemConfiguration();

	if (!panel.connected) {
		const notice = getSystemConfigurationDisconnectedNotice();

		return (
			<SystemConfigurationPanelAccessNotice
				heading={notice.heading}
				title={notice.title}
				message={notice.message}
				color={notice.color}
			/>
		);
	}

	if (!panel.isOwner) {
		const notice = getSystemConfigurationRestrictedNotice();

		return (
			<SystemConfigurationPanelAccessNotice
				heading={notice.heading}
				title={notice.title}
				message={notice.message}
				color={notice.color}
			/>
		);
	}

	return (
		<SystemConfigurationPanelView
			loading={panel.loading}
			error={panel.error}
			minDepositError={panel.minDepositError}
			tokensPerEthError={panel.tokensPerEthError}
			connected={panel.connected}
			isDepositOwner={panel.isDepositOwner}
			isTokenOwner={panel.isTokenOwner}
			walletAddress={panel.walletAddress}
			donoDepositoAtualCurto={panel.donoDepositoAtualCurto}
			donoTokenAtualCurto={panel.donoTokenAtualCurto}
			minDeposit={panel.minDeposit}
			editingMinDeposit={panel.editingMinDeposit}
			savingMinDeposit={panel.savingMinDeposit}
			tokensPerEth={panel.tokensPerEth}
			editingTokensPerEth={panel.editingTokensPerEth}
			savingTokensPerEth={panel.savingTokensPerEth}
			onEditingMinDepositChange={panel.setEditingMinDeposit}
			onEditingTokensPerEthChange={panel.setEditingTokensPerEth}
			onSubmitMinDeposit={panel.submitMinDeposit}
			onSubmitTokensPerEth={panel.submitTokensPerEth}
		/>
	);
}

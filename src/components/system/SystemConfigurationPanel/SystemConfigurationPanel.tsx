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

	if (!panel.canCreateProposal) {
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
			status={{
				loading: panel.loading,
				connected: panel.connected,
				isDepositOwner: panel.isDepositOwner,
				isTokenOwner: panel.isTokenOwner,
				canCreateProposal: panel.canCreateProposal,
				walletAddress: panel.walletAddress,
			}}
			overview={{
				donoDepositoAtualCurto: panel.donoDepositoAtualCurto,
				donoTokenAtualCurto: panel.donoTokenAtualCurto,
				minDeposit: panel.minDeposit,
				tokensPerEth: panel.tokensPerEth,
			}}
			alerts={{
				error: panel.error,
				minDepositError: panel.minDepositError,
				tokensPerEthError: panel.tokensPerEthError,
			}}
			settings={{
				editingMinDeposit: panel.editingMinDeposit,
				editingTokensPerEth: panel.editingTokensPerEth,
				savingMinDeposit: panel.savingMinDeposit,
				savingTokensPerEth: panel.savingTokensPerEth,
				onEditingMinDepositChange: panel.setEditingMinDeposit,
				onEditingTokensPerEthChange: panel.setEditingTokensPerEth,
				onSubmitMinDeposit: panel.submitMinDeposit,
				onSubmitTokensPerEth: panel.submitTokensPerEth,
			}}
		/>
	);
}

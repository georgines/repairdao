"use client";

import { SystemConfigurationPanelOverviewView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelOverview/SystemConfigurationPanelOverviewView";

type SystemConfigurationPanelOverviewProps = {
	minDeposit: string;
	tokensPerEth: string;
	donoDepositoAtualCurto: string;
	donoTokenAtualCurto: string;
	walletNotice: string;
};

export function SystemConfigurationPanelOverview({
	minDeposit,
	tokensPerEth,
	donoDepositoAtualCurto,
	donoTokenAtualCurto,
	walletNotice,
}: SystemConfigurationPanelOverviewProps) {
	return (
		<SystemConfigurationPanelOverviewView
			minDeposit={minDeposit}
			tokensPerEth={tokensPerEth}
			donoDepositoAtualCurto={donoDepositoAtualCurto}
			donoTokenAtualCurto={donoTokenAtualCurto}
			walletNotice={walletNotice}
		/>
	);
}


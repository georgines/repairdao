"use client";

import { AccountPanelView } from "@/components/account/AccountPanel/AccountPanelView";
import { useAccountPanel } from "@/hooks/useAccountPanel";

export function AccountPanel() {
	const panel = useAccountPanel();

	return (
		<AccountPanelView
			walletAddress={panel.walletAddress}
			walletNotice={panel.walletNotice}
			ethBalance={panel.ethBalance}
			usdBalance={panel.usdBalance}
			ethUsdPrice={panel.ethUsdPrice}
			tokensPerEth={panel.tokensPerEth}
			rptBalance={panel.rptBalance}
			deposit={panel.deposit}
			rewards={panel.rewards}
			badgeLevel={panel.badgeLevel}
			reputationLevelName={panel.reputationLevelName}
			perfilAtivo={panel.perfilAtivo}
			isActive={panel.isActive}
			totalPoints={panel.totalPoints}
			positiveRatings={panel.positiveRatings}
			negativeRatings={panel.negativeRatings}
			totalRatings={panel.totalRatings}
			ratingSum={panel.ratingSum}
			averageRating={panel.averageRating}
			withdrawingDeposit={panel.withdrawingDeposit}
			withdrawingRewards={panel.withdrawingRewards}
			error={panel.error}
			canWithdrawDeposit={panel.canWithdrawDeposit}
			canWithdrawRewards={panel.canWithdrawRewards}
			onWithdrawDeposit={panel.handleWithdrawDeposit}
			onWithdrawRewards={panel.handleWithdrawRewards}
			connected={panel.connected}
		/>
	);
}

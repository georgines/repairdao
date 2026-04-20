import { Card, Stack } from "@mantine/core";
import { AccountBalanceCard } from "@/components/account/AccountPanel/AccountBalanceCard/AccountBalanceCard";
import { AccountActionsCard } from "@/components/account/AccountPanel/AccountActionsCard/AccountActionsCard";
import { AccountRatingsCard } from "@/components/account/AccountPanel/AccountRatingsCard/AccountRatingsCard";
import { AccountPanelHeader } from "@/components/account/AccountPanel/AccountPanelHeader/AccountPanelHeader";
import { AccountMetricsGrid } from "@/components/account/AccountPanel/AccountMetricsGrid/AccountMetricsGrid";
import styles from "./AccountPanelView.module.css";

export type AccountPanelWalletProps = {
	walletAddress: string | null;
	walletNotice: string | null;
	connected: boolean;
};

export type AccountPanelBalanceProps = {
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
};

export type AccountPanelReputationProps = {
	deposit: string;
	rewards: string;
	badgeLevel: string;
	reputationLevelName: string;
	perfilAtivo: "cliente" | "tecnico" | null;
	isActive: boolean;
	totalPoints: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
	ratingSum: string;
	averageRating: string;
};

export type AccountPanelWithdrawalProps = {
	withdrawingDeposit: boolean;
	withdrawingRewards: boolean;
	error: string | null;
	canWithdrawDeposit: boolean;
	canWithdrawRewards: boolean;
	onWithdrawDeposit: () => void;
	onWithdrawRewards: () => void;
};

export type AccountPanelViewProps = {
	wallet: AccountPanelWalletProps;
	balance: AccountPanelBalanceProps;
	reputation: AccountPanelReputationProps;
	withdrawal: AccountPanelWithdrawalProps;
};

export function AccountPanelView({ wallet, balance, reputation, withdrawal }: AccountPanelViewProps) {
	return (
		<Card
			radius="sm"
			withBorder
			shadow="none"
			padding="lg"
			className={styles.card}
		>
			<Stack gap="lg">
				<AccountPanelHeader
					badgeLevel={reputation.badgeLevel}
					isActive={reputation.isActive}
					perfilAtivo={reputation.perfilAtivo}
				/>

				<AccountBalanceCard
					rptBalance={balance.rptBalance}
					tokensPerEth={balance.tokensPerEth}
					ethUsdPrice={balance.ethUsdPrice}
					ethBalance={balance.ethBalance}
					usdBalance={balance.usdBalance}
					walletNotice={wallet.walletNotice}
				/>

				<AccountMetricsGrid
					deposit={reputation.deposit}
					rewards={reputation.rewards}
					reputationLevelName={reputation.reputationLevelName}
					totalPoints={reputation.totalPoints}
					averageRating={reputation.averageRating}
					positiveRatings={reputation.positiveRatings}
					negativeRatings={reputation.negativeRatings}
					totalRatings={reputation.totalRatings}
				/>

				<AccountRatingsCard
					walletAddress={wallet.walletAddress}
					averageRating={reputation.averageRating}
					positiveRatings={reputation.positiveRatings}
					negativeRatings={reputation.negativeRatings}
					totalRatings={reputation.totalRatings}
					ratingSum={reputation.ratingSum}
				/>

				<AccountActionsCard
					walletNotice={wallet.walletNotice}
					withdrawingDeposit={withdrawal.withdrawingDeposit}
					withdrawingRewards={withdrawal.withdrawingRewards}
					error={withdrawal.error}
					canWithdrawDeposit={withdrawal.canWithdrawDeposit}
					canWithdrawRewards={withdrawal.canWithdrawRewards}
					onWithdrawDeposit={withdrawal.onWithdrawDeposit}
					onWithdrawRewards={withdrawal.onWithdrawRewards}
					connected={wallet.connected}
				/>
			</Stack>
		</Card>
	);
}

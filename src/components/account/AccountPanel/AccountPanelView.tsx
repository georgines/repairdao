import { Card, Stack } from "@mantine/core";
import { AccountBalanceCard } from "@/components/account/AccountPanel/AccountBalanceCard/AccountBalanceCard";
import { AccountActionsCard } from "@/components/account/AccountPanel/AccountActionsCard/AccountActionsCard";
import { AccountRatingsCard } from "@/components/account/AccountPanel/AccountRatingsCard/AccountRatingsCard";
import { AccountPanelHeader } from "@/components/account/AccountPanel/AccountPanelHeader/AccountPanelHeader";
import { AccountMetricsGrid } from "@/components/account/AccountPanel/AccountMetricsGrid/AccountMetricsGrid";
import styles from "./AccountPanelView.module.css";

export type AccountPanelViewProps = {
	walletAddress: string | null;
	walletNotice: string | null;
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
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
	withdrawingDeposit: boolean;
	withdrawingRewards: boolean;
	error: string | null;
	canWithdrawDeposit: boolean;
	canWithdrawRewards: boolean;
	onWithdrawDeposit: () => void;
	onWithdrawRewards: () => void;
	connected: boolean;
};

export function AccountPanelView({
	walletAddress,
	walletNotice,
	ethBalance,
	usdBalance,
	ethUsdPrice,
	tokensPerEth,
	rptBalance,
	deposit,
	rewards,
	badgeLevel,
	reputationLevelName,
	perfilAtivo,
	isActive,
	totalPoints,
	positiveRatings,
	negativeRatings,
	totalRatings,
	ratingSum,
	averageRating,
	withdrawingDeposit,
	withdrawingRewards,
	error,
	canWithdrawDeposit,
	canWithdrawRewards,
	onWithdrawDeposit,
	onWithdrawRewards,
	connected,
}: AccountPanelViewProps) {
	return (
		<Card
			radius="sm"
			withBorder
			shadow="none"
			padding="lg"
			className={styles.card}
		>
			<Stack gap="lg">
				<AccountPanelHeader badgeLevel={badgeLevel} isActive={isActive} perfilAtivo={perfilAtivo} />

				<AccountBalanceCard
					rptBalance={rptBalance}
					tokensPerEth={tokensPerEth}
					ethUsdPrice={ethUsdPrice}
					ethBalance={ethBalance}
					usdBalance={usdBalance}
					walletNotice={walletNotice}
				/>

				<AccountMetricsGrid
					deposit={deposit}
					rewards={rewards}
					reputationLevelName={reputationLevelName}
					totalPoints={totalPoints}
					averageRating={averageRating}
					positiveRatings={positiveRatings}
					negativeRatings={negativeRatings}
					totalRatings={totalRatings}
				/>

				<AccountRatingsCard
					walletAddress={walletAddress}
					averageRating={averageRating}
					positiveRatings={positiveRatings}
					negativeRatings={negativeRatings}
					totalRatings={totalRatings}
					ratingSum={ratingSum}
				/>

				<AccountActionsCard
					walletNotice={walletNotice}
					withdrawingDeposit={withdrawingDeposit}
					withdrawingRewards={withdrawingRewards}
					error={error}
					canWithdrawDeposit={canWithdrawDeposit}
					canWithdrawRewards={canWithdrawRewards}
					onWithdrawDeposit={onWithdrawDeposit}
					onWithdrawRewards={onWithdrawRewards}
					connected={connected}
				/>
			</Stack>
		</Card>
	);
}

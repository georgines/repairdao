import { Card } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import styles from "./AccountBalanceCardView.module.css";

type AccountBalanceCardViewProps = {
	rptBalance: string;
	tokensPerEth: string;
	ethUsdPrice: string;
	ethBalance: string;
	usdBalance: string;
	walletNotice: string | null;
};

export function AccountBalanceCardView({
	rptBalance,
	tokensPerEth,
	ethUsdPrice,
	ethBalance,
	usdBalance,
	walletNotice,
}: AccountBalanceCardViewProps) {
	return (
		<Card withBorder shadow="none" radius="md" padding="md" className={styles.card}>
			<BalanceSummary
				rptBalance={rptBalance}
				tokensPerEth={tokensPerEth}
				ethUsdPrice={ethUsdPrice}
				ethBalance={ethBalance}
				usdBalance={usdBalance}
				note={walletNotice}
			/>
		</Card>
	);
}

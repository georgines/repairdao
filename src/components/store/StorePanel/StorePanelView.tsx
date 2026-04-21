import { Card, Divider, Stack } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import { StorePanelHeader } from "@/components/store/StorePanel/StorePanelHeader/StorePanelHeader";
import { StorePanelPurchaseForm } from "@/components/store/StorePanel/StorePanelPurchaseForm/StorePanelPurchaseForm";
import styles from "./StorePanelView.module.css";

export type StorePanelBalanceProps = {
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	rptBalance: string;
	tokensPerEth: string;
	walletNotice: string | null;
};

export type StorePanelPurchaseProps = {
	rptPreview: string;
	quantityEth: string;
	buying: boolean;
	error: string | null;
	connected: boolean;
	onQuantityEthChange: (value: string) => void;
	onBuy: () => void;
};

export type StorePanelViewProps = {
	balance: StorePanelBalanceProps;
	purchase: StorePanelPurchaseProps;
};

export function StorePanelView({ balance, purchase }: StorePanelViewProps) {
	return (
		<Card radius="sm" withBorder shadow="none" padding="lg" className={styles.card}>
			<Stack gap="lg" className={styles.content}>
				<StorePanelHeader tokensPerEth={balance.tokensPerEth} />

				<BalanceSummary
					rptBalance={balance.rptBalance}
					tokensPerEth={balance.tokensPerEth}
					ethUsdPrice={balance.ethUsdPrice}
					ethBalance={balance.ethBalance}
					usdBalance={balance.usdBalance}
					note={balance.walletNotice}
				/>

				<Divider className={styles.divider} />

				<StorePanelPurchaseForm
					rptPreview={purchase.rptPreview}
					quantityEth={purchase.quantityEth}
					buying={purchase.buying}
					error={purchase.error}
					onQuantityEthChange={purchase.onQuantityEthChange}
					onBuy={purchase.onBuy}
					connected={purchase.connected}
				/>
			</Stack>
		</Card>
	);
}

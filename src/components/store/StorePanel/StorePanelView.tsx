import { Card, Divider, Stack } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import { StorePanelHeader } from "@/components/store/StorePanel/StorePanelHeader/StorePanelHeader";
import { StorePanelPurchaseForm } from "@/components/store/StorePanel/StorePanelPurchaseForm/StorePanelPurchaseForm";
import styles from "./StorePanelView.module.css";

export type StorePanelViewProps = {
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	rptBalance: string;
	tokensPerEth: string;
	rptPreview: string;
	walletNotice: string | null;
	quantityEth: string;
	buying: boolean;
	error: string | null;
	onQuantityEthChange: (value: string) => void;
	onBuy: () => void;
	connected: boolean;
};

export function StorePanelView({
	ethBalance,
	usdBalance,
	ethUsdPrice,
	rptBalance,
	tokensPerEth,
	rptPreview,
	walletNotice,
	quantityEth,
	buying,
	error,
	onQuantityEthChange,
	onBuy,
	connected,
}: StorePanelViewProps) {
	return (
		<Card radius="sm" withBorder shadow="none" padding="lg" className={styles.card}>
			<Stack gap="lg" className={styles.content}>
				<StorePanelHeader tokensPerEth={tokensPerEth} />

				<BalanceSummary
					rptBalance={rptBalance}
					tokensPerEth={tokensPerEth}
					ethUsdPrice={ethUsdPrice}
					ethBalance={ethBalance}
					usdBalance={usdBalance}
					note={walletNotice}
				/>

				<Divider className={styles.divider} />

				<StorePanelPurchaseForm
					rptPreview={rptPreview}
					quantityEth={quantityEth}
					buying={buying}
					error={error}
					onQuantityEthChange={onQuantityEthChange}
					onBuy={onBuy}
					connected={connected}
				/>
			</Stack>
		</Card>
	);
}

"use client";

import { useState } from "react";
import { useStorePanel } from "@/hooks/useStorePanel";
import { StorePanelView } from "@/components/store/StorePanel/StorePanelView";

type StorePanelContainerProps = {
	onPurchased: () => void;
};

function StorePanelContainer({ onPurchased }: StorePanelContainerProps) {
	const panel = useStorePanel(onPurchased);

	return (
		<StorePanelView
			balance={{
				ethBalance: panel.ethBalance,
				usdBalance: panel.usdBalance,
				ethUsdPrice: panel.ethUsdPrice,
				rptBalance: panel.rptBalance,
				tokensPerEth: panel.tokensPerEth,
				walletNotice: panel.walletNotice,
			}}
			purchase={{
				rptPreview: panel.rptPreview,
				quantityEth: panel.quantityEth,
				buying: panel.buying,
				error: panel.error,
				connected: panel.connected,
				onQuantityEthChange: panel.handleQuantityEthChange,
				onBuy: panel.handleBuy,
			}}
		/>
	);
}

export function StorePanel() {
	const [reloadKey, setReloadKey] = useState(0);

	return <StorePanelContainer key={reloadKey} onPurchased={() => setReloadKey((current) => current + 1)} />;
}

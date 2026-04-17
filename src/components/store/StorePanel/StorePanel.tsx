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
			ethBalance={panel.ethBalance}
			rptBalance={panel.rptBalance}
			tokensPerEth={panel.tokensPerEth}
			rptPreview={panel.rptPreview}
			walletNotice={panel.walletNotice}
			quantityEth={panel.quantityEth}
			buying={panel.buying}
			error={panel.error}
			onQuantityEthChange={panel.handleQuantityEthChange}
			onBuy={panel.handleBuy}
			connected={panel.connected}
		/>
	);
}

export function StorePanel() {
	const [reloadKey, setReloadKey] = useState(0);

	return <StorePanelContainer key={reloadKey} onPurchased={() => setReloadKey((current) => current + 1)} />;
}

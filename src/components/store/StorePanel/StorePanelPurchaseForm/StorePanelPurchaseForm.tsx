"use client";

import { StorePanelPurchaseFormView } from "@/components/store/StorePanel/StorePanelPurchaseForm/StorePanelPurchaseFormView";

type StorePanelPurchaseFormProps = {
	rptPreview: string;
	quantityEth: string;
	buying: boolean;
	error: string | null;
	onQuantityEthChange: (value: string) => void;
	onBuy: () => void;
	connected: boolean;
};

export function StorePanelPurchaseForm(props: StorePanelPurchaseFormProps) {
	return <StorePanelPurchaseFormView {...props} />;
}

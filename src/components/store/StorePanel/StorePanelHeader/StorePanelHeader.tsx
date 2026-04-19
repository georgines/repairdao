"use client";

import { StorePanelHeaderView } from "@/components/store/StorePanel/StorePanelHeader/StorePanelHeaderView";

type StorePanelHeaderProps = {
	tokensPerEth: string;
};

export function StorePanelHeader({ tokensPerEth }: StorePanelHeaderProps) {
	return <StorePanelHeaderView tokensPerEth={tokensPerEth} />;
}

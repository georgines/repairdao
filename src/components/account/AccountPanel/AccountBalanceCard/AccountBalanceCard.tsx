import { AccountBalanceCardView } from "@/components/account/AccountPanel/AccountBalanceCard/AccountBalanceCardView";

type AccountBalanceCardProps = {
	rptBalance: string;
	tokensPerEth: string;
	ethUsdPrice: string;
	ethBalance: string;
	usdBalance: string;
	walletNotice: string | null;
};

export function AccountBalanceCard(props: AccountBalanceCardProps) {
	return <AccountBalanceCardView {...props} />;
}

import { AccountActionsCardView } from "@/components/account/AccountPanel/AccountActionsCard/AccountActionsCardView";

type AccountActionsCardProps = {
	walletNotice: string | null;
	withdrawingDeposit: boolean;
	withdrawingRewards: boolean;
	error: string | null;
	canWithdrawDeposit: boolean;
	canWithdrawRewards: boolean;
	onWithdrawDeposit: () => void;
	onWithdrawRewards: () => void;
	connected: boolean;
};

export function AccountActionsCard(props: AccountActionsCardProps) {
	return <AccountActionsCardView {...props} />;
}

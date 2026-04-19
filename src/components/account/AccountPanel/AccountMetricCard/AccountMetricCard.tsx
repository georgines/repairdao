import { AccountMetricCardView, type AccountMetricCardViewProps } from "@/components/account/AccountPanel/AccountMetricCard/AccountMetricCardView";

export type AccountMetricCardProps = AccountMetricCardViewProps;

export function AccountMetricCard(props: AccountMetricCardProps) {
	return <AccountMetricCardView {...props} />;
}

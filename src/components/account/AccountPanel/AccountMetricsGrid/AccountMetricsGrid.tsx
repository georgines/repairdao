import { AccountMetricsGridView } from "@/components/account/AccountPanel/AccountMetricsGrid/AccountMetricsGridView";

type AccountMetricsGridProps = {
	deposit: string;
	rewards: string;
	reputationLevelName: string;
	totalPoints: string;
	averageRating: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
};

export function AccountMetricsGrid(props: AccountMetricsGridProps) {
	return <AccountMetricsGridView {...props} />;
}

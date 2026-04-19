import { AccountRatingsCardView } from "@/components/account/AccountPanel/AccountRatingsCard/AccountRatingsCardView";

type AccountRatingsCardProps = {
	walletAddress: string | null;
	averageRating: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
	ratingSum: string;
};

export function AccountRatingsCard(props: AccountRatingsCardProps) {
	return <AccountRatingsCardView {...props} />;
}

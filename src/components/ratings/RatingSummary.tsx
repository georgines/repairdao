"use client";

import { RatingSummaryView } from "@/components/ratings/RatingSummaryView";
import { useRatingSummary } from "@/hooks/useRatingSummary";

export type RatingSummaryProps = {
	address?: string | null;
	source?: "account" | "technician";
	averageRating?: string | number;
	totalRatings?: string | number;
	loading?: boolean;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
};

export function RatingSummary({
	address,
	source = "technician",
	averageRating,
	totalRatings,
	loading = false,
	size = "sm",
}: RatingSummaryProps) {
	const summary = useRatingSummary(address, source);
	const hasDirectValues = averageRating !== undefined || totalRatings !== undefined;

	return (
		<RatingSummaryView
			averageRating={hasDirectValues ? averageRating ?? 0 : summary.averageRating}
			totalRatings={hasDirectValues ? totalRatings ?? 0 : summary.totalRatings}
			loading={hasDirectValues ? loading : summary.loading}
			size={size}
		/>
	);
}

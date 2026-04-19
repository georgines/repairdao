import { Card, Group, Progress, RingProgress, Stack, Text } from "@mantine/core";
import { RatingSummary } from "@/components/ratings/RatingSummary";
import styles from "./AccountRatingsCardView.module.css";

export type AccountRatingsCardViewProps = {
	walletAddress: string | null;
	averageRating: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
	ratingSum: string;
};

function calcularTaxaPositiva(positiveRatings: string, totalRatings: string) {
	const total = Number(totalRatings);

	if (!Number.isFinite(total) || total <= 0) {
		return 0;
	}

	const positivas = Number(positiveRatings);

	if (!Number.isFinite(positivas) || positivas <= 0) {
		return 0;
	}

	return Math.round((positivas / total) * 100);
}

export function AccountRatingsCardView({
	walletAddress,
	averageRating,
	positiveRatings,
	negativeRatings,
	totalRatings,
	ratingSum,
}: AccountRatingsCardViewProps) {
	const positiveRate = calcularTaxaPositiva(positiveRatings, totalRatings);
	const ringSections =
		positiveRate > 0
			? [
					{ value: positiveRate, color: "teal" },
					{ value: 100 - positiveRate, color: "gray" },
				]
			: [{ value: 100, color: "gray" }];

	return (
		<Card withBorder shadow="none" padding="md" radius="md" className={styles.card}>
			<Stack gap="md">
				<Group justify="space-between" align="flex-start" wrap="wrap">
					<Stack gap={2}>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Minhas avaliacoes
						</Text>
						<Text size="sm" c="dimmed">
							Acompanhe a qualidade da conta e a proporcao de feedbacks positivos.
						</Text>
					</Stack>

					<RatingSummary address={walletAddress} source="account" />
				</Group>

				<Group align="center" justify="space-between" wrap="wrap">
					<Stack gap={0} className={styles.summary}>
						<Text size="xl" fw={800}>
							{averageRating}/5
						</Text>
						<Text size="sm" c="dimmed">
							{positiveRatings} positivas, {negativeRatings} negativas, {totalRatings} total.
						</Text>
					</Stack>

					<RingProgress
						size={130}
						thickness={14}
						roundCaps
						sections={ringSections}
						label={
							<Stack gap={0} align="center" justify="center">
								<Text size="lg" fw={800}>
									{positiveRate}%
								</Text>
								<Text size="xs" c="dimmed">
									positivas
								</Text>
							</Stack>
						}
					/>
				</Group>

				<Stack gap={4}>
					<Progress value={positiveRate} color="teal" size="sm" radius="xl" />
					<Group justify="space-between" wrap="wrap" gap="xs">
						<Text size="xs" c="dimmed">
							Taxa positiva
						</Text>
						<Text size="xs" fw={700}>
							{positiveRate}%
						</Text>
					</Group>
					<Text size="xs" c="dimmed">
						Soma das notas: {ratingSum}
					</Text>
				</Stack>
			</Stack>
		</Card>
	);
}

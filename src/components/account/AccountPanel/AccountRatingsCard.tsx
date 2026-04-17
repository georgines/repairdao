import { Card, Group, Progress, RingProgress, Stack, Text } from "@mantine/core";

export type AccountRatingsCardProps = {
	averageRating: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
	ratingSum: string;
};

const cardStyle = {
	background: "rgba(255,255,255,0.92)",
	borderColor: "rgba(15, 23, 42, 0.08)",
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

export function AccountRatingsCard({
	averageRating,
	positiveRatings,
	negativeRatings,
	totalRatings,
	ratingSum,
}: AccountRatingsCardProps) {
	const positiveRate = calcularTaxaPositiva(positiveRatings, totalRatings);
	const ringSections =
		positiveRate > 0
			? [
					{ value: positiveRate, color: "teal" },
					{ value: 100 - positiveRate, color: "gray" },
				]
			: [{ value: 100, color: "gray" }];

	return (
		<Card withBorder shadow="none" padding="md" radius="md" style={cardStyle}>
			<Stack gap="md">
				<Stack gap={2}>
					<Text size="xs" tt="uppercase" fw={700} c="dimmed">
						Avaliacoes
					</Text>
					<Text size="sm" c="dimmed">
						Acompanhe a qualidade da conta e a proporcao de feedbacks positivos.
					</Text>
				</Stack>

				<Group align="center" justify="space-between" wrap="wrap">
					<Stack gap={0} style={{ flex: "1 1 180px" }}>
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

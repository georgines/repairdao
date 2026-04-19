import { Card, Stack, Text } from "@mantine/core";
import styles from "./AccountMetricCardView.module.css";

export type AccountMetricCardViewProps = {
	label: string;
	value: string;
	description: string;
};

export function AccountMetricCardView({ label, value, description }: AccountMetricCardViewProps) {
	return (
		<Card withBorder shadow="none" padding="md" radius="md" className={styles.card}>
			<Stack gap={4} className={styles.content}>
				<Text size="xs" tt="uppercase" fw={700} c="dimmed">
					{label}
				</Text>
				<Text size="xl" fw={800}>
					{value}
				</Text>
				<Text size="sm" c="dimmed" lineClamp={2}>
					{description}
				</Text>
			</Stack>
		</Card>
	);
}

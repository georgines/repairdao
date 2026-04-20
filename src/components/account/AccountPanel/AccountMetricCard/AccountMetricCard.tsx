import { Card, Stack, Text } from "@mantine/core";
import styles from "./AccountMetricCard.module.css";

export type AccountMetricCardProps = {
	label: string;
	value: string;
	description: string;
};

export function AccountMetricCard({ label, value, description }: AccountMetricCardProps) {
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

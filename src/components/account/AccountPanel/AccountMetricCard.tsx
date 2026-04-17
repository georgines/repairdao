import { Card, Stack, Text } from "@mantine/core";

export type AccountMetricCardProps = {
	label: string;
	value: string;
	description: string;
};

const cardStyle = {
	background: "rgba(255,255,255,0.92)",
	borderColor: "rgba(15, 23, 42, 0.08)",
	height: "100%",
	minHeight: 140,
	display: "flex",
};

export function AccountMetricCard({ label, value, description }: AccountMetricCardProps) {
	return (
		<Card withBorder shadow="none" padding="md" radius="md" style={cardStyle}>
			<Stack gap={4} style={{ width: "100%", flex: 1 }}>
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

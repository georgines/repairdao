import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";

function Indicador({ label, value }: { label: string; value: string }) {
	return (
		<Card
			withBorder
			radius="sm"
			padding="md"
			style={{ background: "rgba(15, 23, 42, 0.03)", borderColor: "rgba(15, 23, 42, 0.08)" }}
		>
			<Stack gap={4}>
				<Text size="xs" tt="uppercase" fw={700} c="dimmed">
					{label}
				</Text>
				<Text fw={700}>{value}</Text>
			</Stack>
		</Card>
	);
}

export default function StorePage() {
	return (
		<Card
			radius="sm"
			withBorder
			shadow="none"
			padding="lg"
			style={{
				background: "rgba(255, 255, 255, 0.94)",
				borderColor: "rgba(15, 23, 42, 0.08)",
			}}
		>
			<Stack gap="lg">
				<Title order={1}>Comprar tokens</Title>

				<Group grow align="stretch">
					<Indicador label="Saldo atual" value="0 tokens" />
					<Indicador label="Saldo mínimo" value="100 tokens" />
				</Group>

				<Group justify="space-between" align="center">
					<Button size="md" radius="sm">
						Comprar tokens
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

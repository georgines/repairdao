import { Stack, Text, Title } from "@mantine/core";

export function EligibilityPanelHeaderView() {
	return (
		<Stack gap={6}>
			<Text size="xs" tt="uppercase" fw={700} c="dimmed">
				Elegibilidade
			</Text>
			<Title order={1}>Depositar RPT e ativar conta</Title>
		</Stack>
	);
}

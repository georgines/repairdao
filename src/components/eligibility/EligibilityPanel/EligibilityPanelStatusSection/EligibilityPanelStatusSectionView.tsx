import { Stack, Text } from "@mantine/core";

type EligibilityPanelStatusSectionViewProps = {
	badgeLevel: string;
	isActive: boolean;
	perfilExibido: "cliente" | "tecnico";
};

export function EligibilityPanelStatusSectionView({
	badgeLevel,
	isActive,
	perfilExibido,
}: EligibilityPanelStatusSectionViewProps) {
	return (
		<Stack gap={6} justify="center">
			<Text size="xs" tt="uppercase" fw={700} c="dimmed">
				Nivel do {perfilExibido}
			</Text>
			<Text size="xl" fw={800}>
				{badgeLevel}
			</Text>
			<Text size="xs" c="dimmed">
				{isActive ? "Conta ativa" : "Aguardando deposito"}
			</Text>
			<Text size="sm" c="dimmed">
				Este e o nivel que sera usado para o {perfilExibido}.
			</Text>
		</Stack>
	);
}

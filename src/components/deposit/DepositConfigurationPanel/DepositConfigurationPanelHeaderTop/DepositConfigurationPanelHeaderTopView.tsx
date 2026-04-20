import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./DepositConfigurationPanelHeaderTopView.module.css";

type DepositConfigurationPanelHeaderTopViewProps = {
	statusLabel: string;
	statusColor: "teal" | "gray";
};

export function DepositConfigurationPanelHeaderTopView({
	statusLabel,
	statusColor,
}: DepositConfigurationPanelHeaderTopViewProps) {
	return (
		<Group justify="space-between" align="flex-start" className={styles.root}>
			<Stack gap={2}>
				<Title order={3}>Deposito minimo para ativacao</Title>
				<Text size="sm" c="dimmed" className={styles.description}>
					Somente o dono do contrato pode alterar este valor.
				</Text>
			</Stack>

			<Badge variant="light" color={statusColor}>
				{statusLabel}
			</Badge>
		</Group>
	);
}

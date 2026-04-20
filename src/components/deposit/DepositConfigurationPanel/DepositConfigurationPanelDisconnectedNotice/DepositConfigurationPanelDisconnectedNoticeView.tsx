import { Alert, Paper, Stack, Text } from "@mantine/core";
import styles from "./DepositConfigurationPanelDisconnectedNoticeView.module.css";

export function DepositConfigurationPanelDisconnectedNoticeView() {
	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Stack gap="sm">
				<Text fw={700}>Deposito minimo para ativacao</Text>
				<Alert color="yellow" title="Carteira desconectada">
					Conecte a carteira do dono do contrato para visualizar esta tela.
				</Alert>
			</Stack>
		</Paper>
	);
}

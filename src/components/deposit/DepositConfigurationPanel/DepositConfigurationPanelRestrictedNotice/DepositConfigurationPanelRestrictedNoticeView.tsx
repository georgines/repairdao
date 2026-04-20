import { Alert, Paper } from "@mantine/core";
import styles from "./DepositConfigurationPanelRestrictedNoticeView.module.css";

export function DepositConfigurationPanelRestrictedNoticeView() {
	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Alert color="gray" title="Acesso restrito">
				A carteira conectada nao e o dono do contrato.
			</Alert>
		</Paper>
	);
}

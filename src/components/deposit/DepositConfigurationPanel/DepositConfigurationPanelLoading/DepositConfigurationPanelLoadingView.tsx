import { Group, Loader, Paper, Text } from "@mantine/core";
import styles from "./DepositConfigurationPanelLoadingView.module.css";

export function DepositConfigurationPanelLoadingView() {
	return (
		<Paper p="lg" withBorder radius="md" className={styles.card}>
			<Group gap="sm" align="center" className={styles.loadingRow}>
				<Loader size="sm" />
				<Text size="sm">Carregando configuracao do deposito...</Text>
			</Group>
		</Paper>
	);
}

import { Text } from "@mantine/core";
import styles from "./DisputesPanelTableEmptyView.module.css";

export function DisputesPanelTableEmptyView() {
	return (
		<Text size="sm" c="dimmed" className={styles.root}>
			Sem disputas para exibir.
		</Text>
	);
}


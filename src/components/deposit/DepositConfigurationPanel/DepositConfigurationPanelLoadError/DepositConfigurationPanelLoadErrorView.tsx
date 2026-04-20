import { Alert } from "@mantine/core";
import styles from "./DepositConfigurationPanelLoadErrorView.module.css";

type DepositConfigurationPanelLoadErrorViewProps = {
	message: string;
};

export function DepositConfigurationPanelLoadErrorView({ message }: DepositConfigurationPanelLoadErrorViewProps) {
	return (
		<Alert color="red" title="Falha ao carregar" className={styles.root}>
			{message}
		</Alert>
	);
}

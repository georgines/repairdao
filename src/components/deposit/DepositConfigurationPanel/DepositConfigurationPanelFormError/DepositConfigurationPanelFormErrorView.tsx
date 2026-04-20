import { Alert } from "@mantine/core";
import styles from "./DepositConfigurationPanelFormErrorView.module.css";

type DepositConfigurationPanelFormErrorViewProps = {
	message: string;
};

export function DepositConfigurationPanelFormErrorView({ message }: DepositConfigurationPanelFormErrorViewProps) {
	return (
		<Alert color="red" title="Nao foi possivel salvar" className={styles.root}>
			{message}
		</Alert>
	);
}
